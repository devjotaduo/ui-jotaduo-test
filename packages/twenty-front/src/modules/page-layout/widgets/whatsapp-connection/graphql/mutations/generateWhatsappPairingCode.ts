import { gql } from '@apollo/client';

export const GENERATE_WHATSAPP_PAIRING_CODE = gql`
  mutation GenerateWhatsappPairingCode($phoneNumber: String!) {
    generateWhatsappPairingCode(phoneNumber: $phoneNumber) {
      pairingCode
      expiresInSeconds
    }
  }
`;
