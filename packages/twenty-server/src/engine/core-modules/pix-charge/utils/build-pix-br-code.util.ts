// Static Pix "copia e cola" following the Banco Central BR Code spec (EMV QRCPS-MPM)
const PIX_GUI = 'br.gov.bcb.pix';
const MERCHANT_NAME_MAX_LENGTH = 25;
const MERCHANT_CITY_MAX_LENGTH = 15;
const TXID_MAX_LENGTH = 25;
const DESCRIPTION_MAX_LENGTH = 40;

const emvField = (id: string, value: string) =>
  `${id}${value.length.toString().padStart(2, '0')}${value}`;

// BR Code readers reject accents and lowercase in name and city
const toEmvText = (value: string, maxLength: number) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .toUpperCase()
    .slice(0, maxLength);

export const computePixCrc16 = (payload: string) => {
  let crc = 0xffff;

  for (let index = 0; index < payload.length; index++) {
    crc ^= payload.charCodeAt(index) << 8;

    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
};

export const buildPixBrCode = ({
  pixKey,
  merchantName,
  merchantCity,
  amount,
  txid,
  description,
}: {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: number | null;
  txid?: string | null;
  description?: string | null;
}) => {
  const cleanTxid = (txid ?? '')
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(0, TXID_MAX_LENGTH);
  const cleanDescription = (description ?? '')
    .trim()
    .slice(0, DESCRIPTION_MAX_LENGTH);

  const merchantAccount =
    emvField('00', PIX_GUI) +
    emvField('01', pixKey.trim()) +
    (cleanDescription.length > 0 ? emvField('02', cleanDescription) : '');

  const payloadWithoutCrc =
    emvField('00', '01') +
    emvField('26', merchantAccount) +
    emvField('52', '0000') +
    emvField('53', '986') +
    (amount !== null && amount !== undefined && amount > 0
      ? emvField('54', amount.toFixed(2))
      : '') +
    emvField('58', 'BR') +
    emvField('59', toEmvText(merchantName, MERCHANT_NAME_MAX_LENGTH)) +
    emvField('60', toEmvText(merchantCity, MERCHANT_CITY_MAX_LENGTH)) +
    emvField('62', emvField('05', cleanTxid.length > 0 ? cleanTxid : '***')) +
    '6304';

  return `${payloadWithoutCrc}${computePixCrc16(payloadWithoutCrc)}`;
};
