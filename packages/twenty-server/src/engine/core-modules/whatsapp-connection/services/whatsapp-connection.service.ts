import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import {
  ForbiddenError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  type WhatsappConnectionStatusDTO,
  type WhatsappLoginQrCodeDTO,
  type WhatsappPairingCodeDTO,
} from 'src/engine/core-modules/whatsapp-connection/dtos/whatsapp-connection.dto';
import {
  type GowaChat,
  type GowaMessage,
  getPhoneNumberFromWhatsappJid,
  parseGowaChats,
  parseGowaDevices,
  parseGowaLoginQr,
  parseGowaMessages,
  parseGowaPairingCode,
  toWhatsappChatJid,
} from 'src/engine/core-modules/whatsapp-connection/utils/parse-gowa-response.util';

const GOWA_REQUEST_TIMEOUT_MS = 15_000;
// WhatsApp does not report how long a linking code lives; past this the widget asks for a fresh one
const PAIRING_CODE_LIFETIME_SECONDS = 60;
const LAST_MESSAGE_CACHE_MAX_SIZE = 500;

@Injectable()
export class WhatsappConnectionService {
  private readonly lastMessageByChatJid = new Map<
    string,
    { lastMessageAt: string | null; message: GowaMessage | undefined }
  >();

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  isConfigured() {
    return isNonEmptyString(this.twentyConfigService.get('WHATSAPP_GOWA_URL'));
  }

  // The GOWA account is one per server, so only one workspace may own it once several share the instance
  canWorkspaceUseWhatsapp(workspaceId: string) {
    const ownerWorkspaceId = this.twentyConfigService.get(
      'WHATSAPP_GOWA_WORKSPACE_ID',
    );

    if (isNonEmptyString(ownerWorkspaceId)) {
      return ownerWorkspaceId === workspaceId;
    }

    return !this.twentyConfigService.get('IS_MULTIWORKSPACE_ENABLED');
  }

  assertWorkspaceCanUseWhatsapp(workspaceId: string) {
    if (!this.canWorkspaceUseWhatsapp(workspaceId)) {
      throw new ForbiddenError('WhatsApp belongs to another workspace', {
        userFriendlyMessage: msg`WhatsApp is not available in this workspace.`,
      });
    }
  }

  async getStatus(
    workspaceId: string,
    deviceId?: string,
  ): Promise<WhatsappConnectionStatusDTO> {
    if (!this.isConfigured() || !this.canWorkspaceUseWhatsapp(workspaceId)) {
      return { isConfigured: false, isConnected: false, devices: [] };
    }

    const devices = parseGowaDevices(
      await this.requestJson('/app/devices', deviceId),
    );

    return { isConfigured: true, isConnected: devices.length > 0, devices };
  }

  async getLoginQrCode(deviceId?: string): Promise<WhatsappLoginQrCodeDTO> {
    const loginQr = parseGowaLoginQr(
      await this.requestJson('/app/login', deviceId),
    );

    if (loginQr === null) {
      throw new UserInputError('WhatsApp did not return a QR code', {
        userFriendlyMessage: msg`This WhatsApp number may already be connected.`,
      });
    }

    const qrImage = await this.request(loginQr.qrPath, deviceId);
    const contentType = qrImage.headers.get('content-type') ?? 'image/png';
    const qrBase64 = Buffer.from(await qrImage.arrayBuffer()).toString(
      'base64',
    );

    return {
      qrCodeDataUrl: `data:${contentType};base64,${qrBase64}`,
      expiresInSeconds: loginQr.qrDurationSeconds,
    };
  }

  async getPairingCode(
    phoneNumber: string,
    deviceId?: string,
  ): Promise<WhatsappPairingCodeDTO> {
    const digits = phoneNumber.replace(/\D/g, '');

    if (digits.length < 8) {
      throw new UserInputError('Invalid phone number', {
        userFriendlyMessage: msg`Enter the full number with country code, digits only.`,
      });
    }

    const pairingCode = parseGowaPairingCode(
      await this.requestJson(
        `/app/login-with-code?phone=${encodeURIComponent(digits)}`,
        deviceId,
      ),
    );

    if (pairingCode === null) {
      throw new UserInputError('WhatsApp did not return a pairing code', {
        userFriendlyMessage: msg`Could not generate a pairing code. Try again.`,
      });
    }

    return { pairingCode, expiresInSeconds: PAIRING_CODE_LIFETIME_SECONDS };
  }

  async getChats(limit: number) {
    const chats = parseGowaChats(
      await this.requestJson(`/chats?limit=${limit}`),
    ).slice(0, limit);

    return Promise.all(
      chats.map(async (chat) => {
        const lastMessage = await this.getCachedLastMessage(chat);

        return {
          jid: chat.jid,
          name: chat.name,
          phoneNumber: getPhoneNumberFromWhatsappJid(chat.jid),
          lastMessageAt: lastMessage?.timestamp ?? chat.lastMessageAt,
          lastMessageContent: lastMessage?.content ?? null,
          lastMessageMediaType: lastMessage?.mediaType ?? null,
          lastMessageIsFromMe: lastMessage?.isFromMe ?? false,
        };
      }),
    );
  }

  // GOWA lists chats without their content; refetching only when last_message_time moves keeps polling to one call
  private async getCachedLastMessage(
    chat: GowaChat,
  ): Promise<GowaMessage | undefined> {
    const cached = this.lastMessageByChatJid.get(chat.jid);

    if (isDefined(cached) && cached.lastMessageAt === chat.lastMessageAt) {
      return cached.message;
    }

    const [message] = await this.getChatMessages(chat.jid, 1).catch(() => []);

    if (this.lastMessageByChatJid.size >= LAST_MESSAGE_CACHE_MAX_SIZE) {
      this.lastMessageByChatJid.clear();
    }

    this.lastMessageByChatJid.set(chat.jid, {
      lastMessageAt: chat.lastMessageAt,
      message,
    });

    return message;
  }

  async getMessages(
    phoneNumber: string,
    limit: number,
  ): Promise<GowaMessage[]> {
    return this.getChatMessages(toWhatsappChatJid(phoneNumber), limit);
  }

  private async getChatMessages(
    chatJid: string,
    limit: number,
  ): Promise<GowaMessage[]> {
    const messages = parseGowaMessages(
      await this.requestJson(
        `/chat/${encodeURIComponent(chatJid)}/messages?limit=${limit}`,
      ),
    );

    return [...messages].sort(
      (messageA, messageB) =>
        Date.parse(messageA.timestamp) - Date.parse(messageB.timestamp),
    );
  }

  async sendMessage(phoneNumber: string, message: string) {
    const trimmedMessage = message.trim();

    if (trimmedMessage.length === 0) {
      throw new UserInputError('Message is empty', {
        userFriendlyMessage: msg`Type a message before sending.`,
      });
    }

    await this.requestJson('/send/message', undefined, {
      method: 'POST',
      body: JSON.stringify({
        phone: toWhatsappChatJid(phoneNumber),
        message: trimmedMessage,
      }),
    });

    return true;
  }

  async logout(deviceId?: string) {
    await this.requestJson('/app/logout', deviceId);

    return true;
  }

  private async requestJson(
    path: string,
    deviceId?: string,
    init?: Pick<RequestInit, 'method' | 'body'>,
  ) {
    const response = await this.request(path, deviceId, init);

    return response.json();
  }

  // The GOWA URL comes from server env, never from users, so it may point at a private host
  private async request(
    path: string,
    deviceId?: string,
    init?: Pick<RequestInit, 'method' | 'body'>,
  ) {
    const baseUrl = this.twentyConfigService.get('WHATSAPP_GOWA_URL');

    if (!isNonEmptyString(baseUrl)) {
      throw new UserInputError('WhatsApp connection is not configured', {
        userFriendlyMessage: msg`Ask an admin to set WHATSAPP_GOWA_URL on the server.`,
      });
    }

    const headers = new Headers();
    const username = this.twentyConfigService.get('WHATSAPP_GOWA_USERNAME');
    const password = this.twentyConfigService.get('WHATSAPP_GOWA_PASSWORD');

    if (isNonEmptyString(username)) {
      headers.set(
        'Authorization',
        `Basic ${Buffer.from(`${username}:${password ?? ''}`).toString('base64')}`,
      );
    }

    if (isDefined(init?.body)) {
      headers.set('Content-Type', 'application/json');
    }

    if (isNonEmptyString(deviceId)) {
      headers.set('X-Device-Id', deviceId);
    }

    let response: Response;

    try {
      response = await fetch(new URL(path, baseUrl), {
        ...init,
        headers,
        signal: AbortSignal.timeout(GOWA_REQUEST_TIMEOUT_MS),
      });
    } catch {
      throw new UserInputError('WhatsApp server is unreachable', {
        userFriendlyMessage: msg`Could not reach the WhatsApp server.`,
      });
    }

    if (!response.ok) {
      throw new UserInputError(`WhatsApp server answered ${response.status}`, {
        userFriendlyMessage: msg`The WhatsApp server refused the request.`,
      });
    }

    return response;
  }
}
