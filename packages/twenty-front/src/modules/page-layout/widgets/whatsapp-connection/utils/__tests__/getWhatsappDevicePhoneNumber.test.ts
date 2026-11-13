import { getWhatsappDevicePhoneNumber } from '@/page-layout/widgets/whatsapp-connection/utils/getWhatsappDevicePhoneNumber';

describe('getWhatsappDevicePhoneNumber', () => {
  it('should read the phone number from a device JID', () => {
    expect(
      getWhatsappDevicePhoneNumber('5511999990000:12@s.whatsapp.net'),
    ).toBe('+5511999990000');
  });

  it('should read the phone number from a JID without device suffix', () => {
    expect(getWhatsappDevicePhoneNumber('5511999990000@s.whatsapp.net')).toBe(
      '+5511999990000',
    );
  });
});
