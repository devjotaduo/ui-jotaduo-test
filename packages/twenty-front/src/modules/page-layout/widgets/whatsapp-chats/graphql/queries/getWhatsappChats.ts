import { gql } from '@apollo/client';

export const GET_WHATSAPP_CHATS = gql`
  query GetWhatsappChats($limit: Int) {
    whatsappChats(limit: $limit) {
      jid
      name
      phoneNumber
      lastMessageAt
      lastMessageContent
      lastMessageMediaType
      lastMessageIsFromMe
    }
  }
`;
