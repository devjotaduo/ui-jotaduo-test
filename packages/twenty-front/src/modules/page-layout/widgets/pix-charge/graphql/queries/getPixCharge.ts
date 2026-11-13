import { gql } from '@apollo/client';

export const GET_PIX_CHARGE = gql`
  query GetPixCharge($amount: Float!, $txid: String, $description: String) {
    pixCharge(amount: $amount, txid: $txid, description: $description) {
      isConfigured
      brCode
      merchantName
    }
  }
`;
