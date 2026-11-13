// A WhatsApp JID looks like "5511999990000:12@s.whatsapp.net": the number comes before the device suffix
export const getWhatsappDevicePhoneNumber = (jid: string) => {
  const phoneNumber = jid.split('@')[0]?.split(':')[0] ?? '';

  return phoneNumber.length > 0 ? `+${phoneNumber}` : jid;
};
