import {
  getPhoneNumberFromWhatsappJid,
  parseGowaChats,
  parseGowaDevices,
  parseGowaLoginQr,
  parseGowaMessages,
  parseGowaPairingCode,
  toWhatsappChatJid,
} from 'src/engine/core-modules/whatsapp-connection/utils/parse-gowa-response.util';

describe('parseGowaResponse', () => {
  it('should read connected devices', () => {
    expect(
      parseGowaDevices({
        code: 'SUCCESS',
        results: [{ name: 'Phone', device: '5511999999999@s.whatsapp.net' }],
      }),
    ).toEqual([{ name: 'Phone', jid: '5511999999999@s.whatsapp.net' }]);
  });

  it('should read the JID of v8+ devices and skip sessions not linked yet', () => {
    expect(
      parseGowaDevices({
        results: [
          {
            name: 'Phone',
            device: 'session-1',
            jid: '5511999999999@s.whatsapp.net',
          },
          { name: '', device: 'session-2', jid: '' },
        ],
      }),
    ).toEqual([{ name: 'Phone', jid: '5511999999999@s.whatsapp.net' }]);
  });

  it('should return no devices when results are missing', () => {
    expect(parseGowaDevices({ code: 'SUCCESS', results: null })).toEqual([]);
  });

  it('should keep only the path of the QR link', () => {
    expect(
      parseGowaLoginQr({
        results: {
          qr_duration: 45,
          qr_link: 'http://public-host:3000/statics/qrcode/scan-qr-1.png',
        },
      }),
    ).toEqual({
      qrPath: '/statics/qrcode/scan-qr-1.png',
      qrDurationSeconds: 45,
    });
  });

  it('should fall back to a 30 second QR when GOWA omits the duration', () => {
    expect(
      parseGowaLoginQr({ results: { qr_link: '/statics/qrcode/a.png' } })
        ?.qrDurationSeconds,
    ).toBe(30);
  });

  it('should read the pairing code', () => {
    expect(parseGowaPairingCode({ results: { pair_code: 'ABCD-EFGH' } })).toBe(
      'ABCD-EFGH',
    );
  });

  it('should read chat messages', () => {
    expect(
      parseGowaMessages({
        results: {
          data: [
            {
              id: 'msg-1',
              content: 'Hi',
              timestamp: '2026-11-12T10:00:00Z',
              is_from_me: true,
              media_type: '',
            },
          ],
        },
      }),
    ).toEqual([
      {
        id: 'msg-1',
        content: 'Hi',
        timestamp: '2026-11-12T10:00:00Z',
        isFromMe: true,
        mediaType: null,
      },
    ]);
  });

  it('should build a chat JID from a formatted phone number', () => {
    expect(toWhatsappChatJid('+55 (11) 99999-0000')).toBe(
      '5511999990000@s.whatsapp.net',
    );
  });

  it('should keep only unarchived person chats', () => {
    expect(
      parseGowaChats({
        results: {
          data: [
            {
              jid: '5511999990000@s.whatsapp.net',
              name: 'Ana',
              last_message_time: '2026-11-12T10:00:00Z',
            },
            { jid: '123-456@g.us', name: 'Group' },
            { jid: '5511888880000@s.whatsapp.net', archived: true },
          ],
        },
      }),
    ).toEqual([
      {
        jid: '5511999990000@s.whatsapp.net',
        name: 'Ana',
        lastMessageAt: '2026-11-12T10:00:00Z',
      },
    ]);
  });

  it('should read the phone number of a JID', () => {
    expect(
      getPhoneNumberFromWhatsappJid('5511999990000:3@s.whatsapp.net'),
    ).toBe('5511999990000');
  });
});
