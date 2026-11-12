import { gql } from '@apollo/client';

export const SEND_WHATSAPP_MESSAGE = gql`
  mutation SendWhatsappMessage($phoneNumber: String!, $message: String!) {
    sendWhatsappMessage(phoneNumber: $phoneNumber, message: $message)
  }
`;
