import { gql } from '@apollo/client';

export const GENERATE_WHATSAPP_LOGIN_QR_CODE = gql`
  mutation GenerateWhatsappLoginQrCode {
    generateWhatsappLoginQrCode {
      qrCodeDataUrl
      expiresInSeconds
    }
  }
`;
