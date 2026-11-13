import { isNonEmptyString, isObject } from '@sniptt/guards';

export type GowaDevice = {
  name: string;
  jid: string;
};

export type GowaLoginQr = {
  qrPath: string;
  qrDurationSeconds: number;
};

const DEFAULT_QR_DURATION_SECONDS = 30;

const getResults = (body: unknown): unknown =>
  isObject(body) && 'results' in body ? body.results : undefined;

export const parseGowaDevices = (body: unknown): GowaDevice[] => {
  const results = getResults(body);

  if (!Array.isArray(results)) {
    return [];
  }

  // Since v8 "device" is the session id and "jid" stays empty until a phone links; older servers only send "device" as the JID
  return results.flatMap((device: unknown) => {
    if (!isObject(device)) {
      return [];
    }

    const sessionOrJid = 'device' in device ? String(device.device ?? '') : '';
    const jid =
      'jid' in device
        ? String(device.jid ?? '')
        : sessionOrJid.includes('@')
          ? sessionOrJid
          : '';
    const name = 'name' in device ? String(device.name ?? '') : '';

    return isNonEmptyString(jid) ? [{ jid, name }] : [];
  });
};

// GOWA builds qr_link from its own public host; keeping only the path lets the server fetch it through the configured URL
export const parseGowaLoginQr = (body: unknown): GowaLoginQr | null => {
  const results = getResults(body);

  if (!isObject(results) || !('qr_link' in results)) {
    return null;
  }

  const qrLink = String(results.qr_link);

  if (!isNonEmptyString(qrLink)) {
    return null;
  }

  const qrDuration =
    'qr_duration' in results ? Number(results.qr_duration) : NaN;

  return {
    qrPath: new URL(qrLink, 'http://gowa.local').pathname,
    qrDurationSeconds:
      Number.isFinite(qrDuration) && qrDuration > 0
        ? qrDuration
        : DEFAULT_QR_DURATION_SECONDS,
  };
};

export const parseGowaPairingCode = (body: unknown): string | null => {
  const results = getResults(body);

  if (!isObject(results) || !('pair_code' in results)) {
    return null;
  }

  const pairingCode = String(results.pair_code);

  return isNonEmptyString(pairingCode) ? pairingCode : null;
};

export type GowaMessage = {
  id: string;
  content: string;
  timestamp: string;
  isFromMe: boolean;
  mediaType: string | null;
};

export const parseGowaMessages = (body: unknown): GowaMessage[] => {
  const results = getResults(body);
  const data = isObject(results) && 'data' in results ? results.data : results;

  if (!Array.isArray(data)) {
    return [];
  }

  return data.flatMap((message: unknown) => {
    if (!isObject(message) || !('id' in message)) {
      return [];
    }

    const mediaType =
      'media_type' in message && isNonEmptyString(message.media_type)
        ? message.media_type
        : null;

    return [
      {
        id: String(message.id),
        content: 'content' in message ? String(message.content ?? '') : '',
        timestamp: 'timestamp' in message ? String(message.timestamp) : '',
        isFromMe: 'is_from_me' in message && message.is_from_me === true,
        mediaType,
      },
    ];
  });
};

// WhatsApp addresses a person by "<digits>@s.whatsapp.net"
export const toWhatsappChatJid = (phoneNumber: string) =>
  `${phoneNumber.replace(/\D/g, '')}@s.whatsapp.net`;

export type GowaChat = {
  jid: string;
  name: string;
  lastMessageAt: string | null;
};

const WHATSAPP_PERSON_JID_SUFFIX = '@s.whatsapp.net';

// Only person-to-person chats: groups and broadcasts have no phone number to reply to
export const parseGowaChats = (body: unknown): GowaChat[] => {
  const results = getResults(body);
  const data = isObject(results) && 'data' in results ? results.data : results;

  if (!Array.isArray(data)) {
    return [];
  }

  return data.flatMap((chat: unknown) => {
    if (!isObject(chat) || !('jid' in chat)) {
      return [];
    }

    const jid = String(chat.jid);

    if (!jid.endsWith(WHATSAPP_PERSON_JID_SUFFIX)) {
      return [];
    }

    if ('archived' in chat && chat.archived === true) {
      return [];
    }

    return [
      {
        jid,
        name: 'name' in chat && isNonEmptyString(chat.name) ? chat.name : '',
        lastMessageAt:
          'last_message_time' in chat &&
          isNonEmptyString(chat.last_message_time)
            ? chat.last_message_time
            : null,
      },
    ];
  });
};

export const getPhoneNumberFromWhatsappJid = (jid: string) =>
  jid.split('@')[0]?.split(':')[0] ?? '';
