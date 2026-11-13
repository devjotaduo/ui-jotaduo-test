import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WhatsappConnectionService } from 'src/engine/core-modules/whatsapp-connection/services/whatsapp-connection.service';

const CONFIG: Record<string, string> = {
  WHATSAPP_GOWA_URL: 'http://gowa.test',
  WHATSAPP_GOWA_USERNAME: 'user',
  WHATSAPP_GOWA_PASSWORD: 'password',
};

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
  });

describe('WhatsappConnectionService.getChats', () => {
  let lastMessageTime = '2026-11-12T10:00:00Z';
  const requestedPaths: string[] = [];

  beforeEach(() => {
    requestedPaths.length = 0;
    jest.spyOn(global, 'fetch').mockImplementation(async (input) => {
      const url = new URL(String(input));

      requestedPaths.push(url.pathname);

      if (url.pathname === '/chats') {
        return jsonResponse({
          results: {
            data: [
              {
                jid: '5511999990000@s.whatsapp.net',
                name: 'Ana',
                last_message_time: lastMessageTime,
              },
            ],
          },
        });
      }

      return jsonResponse({
        results: {
          data: [
            {
              id: lastMessageTime,
              content: 'Hi',
              timestamp: lastMessageTime,
              is_from_me: false,
            },
          ],
        },
      });
    });
  });

  afterEach(() => jest.restoreAllMocks());

  const buildService = () =>
    new WhatsappConnectionService({
      get: (key: string) => CONFIG[key],
    } as unknown as TwentyConfigService);

  it('should fetch a chat last message only when it changed', async () => {
    const service = buildService();
    const messagesPath = `/chat/${encodeURIComponent('5511999990000@s.whatsapp.net')}/messages`;

    await service.getChats(20);
    await service.getChats(20);

    expect(requestedPaths.filter((path) => path === messagesPath)).toHaveLength(
      1,
    );

    lastMessageTime = '2026-11-12T11:00:00Z';
    const chats = await service.getChats(20);

    expect(requestedPaths.filter((path) => path === messagesPath)).toHaveLength(
      2,
    );
    expect(chats[0].lastMessageAt).toBe('2026-11-12T11:00:00Z');
  });
});

describe('WhatsappConnectionService.canWorkspaceUseWhatsapp', () => {
  const buildService = (config: Record<string, string | boolean>) =>
    new WhatsappConnectionService({
      get: (key: string) => config[key],
    } as unknown as TwentyConfigService);

  it('should allow the only workspace of a single-workspace server', () => {
    const service = buildService({ IS_MULTIWORKSPACE_ENABLED: false });

    expect(service.canWorkspaceUseWhatsapp('workspace-1')).toBe(true);
  });

  it('should refuse every workspace of a multi-workspace server without an owner', () => {
    const service = buildService({ IS_MULTIWORKSPACE_ENABLED: true });

    expect(service.canWorkspaceUseWhatsapp('workspace-1')).toBe(false);
    expect(() => service.assertWorkspaceCanUseWhatsapp('workspace-1')).toThrow(
      'WhatsApp belongs to another workspace',
    );
  });

  it('should allow only the owner workspace', async () => {
    const service = buildService({
      ...CONFIG,
      IS_MULTIWORKSPACE_ENABLED: true,
      WHATSAPP_GOWA_WORKSPACE_ID: 'workspace-1',
    });

    expect(service.canWorkspaceUseWhatsapp('workspace-1')).toBe(true);
    expect(service.canWorkspaceUseWhatsapp('workspace-2')).toBe(false);
    expect(await service.getStatus('workspace-2')).toEqual({
      isConfigured: false,
      isConnected: false,
      devices: [],
    });
  });
});
