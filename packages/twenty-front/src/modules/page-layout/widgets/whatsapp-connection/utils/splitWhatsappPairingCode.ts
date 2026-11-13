// GOWA returns codes like "ABCD-EFGH"; the slots render each half separately
export const splitWhatsappPairingCode = (pairingCode: string): string[][] =>
  pairingCode
    .toUpperCase()
    .split('-')
    .map((group) => group.replace(/[^A-Z0-9]/g, '').split(''))
    .filter((group) => group.length > 0);
