import { getWhatsappPhoneNumberFromPhones } from '@/page-layout/widgets/whatsapp-conversation/utils/getWhatsappPhoneNumberFromPhones';

describe('getWhatsappPhoneNumberFromPhones', () => {
  it('should join the calling code and the number as digits', () => {
    expect(
      getWhatsappPhoneNumberFromPhones({
        primaryPhoneNumber: '(11) 99999-0000',
        primaryPhoneCountryCode: 'BR',
        primaryPhoneCallingCode: '+55',
      }),
    ).toBe('5511999990000');
  });

  it('should return null without a primary phone number', () => {
    expect(
      getWhatsappPhoneNumberFromPhones({
        primaryPhoneNumber: null,
        primaryPhoneCountryCode: null,
      }),
    ).toBeNull();
  });
});
