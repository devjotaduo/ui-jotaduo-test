import { gql } from '@apollo/client';

export const GET_WHATSAPP_MESSAGES = gql`
  query GetWhatsappMessages($phoneNumber: String!, $limit: Int) {
    whatsappMessages(phoneNumber: $phoneNumber, limit: $limit) {
      id
      content
      timestamp
      isFromMe
      mediaType
    }
  }
`;
