import { gql } from '@apollo/client';

export const DISCONNECT_WHATSAPP = gql`
  mutation DisconnectWhatsapp {
    disconnectWhatsapp
  }
`;
