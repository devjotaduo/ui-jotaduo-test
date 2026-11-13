import { splitWhatsappPairingCode } from '@/page-layout/widgets/whatsapp-connection/utils/splitWhatsappPairingCode';

describe('splitWhatsappPairingCode', () => {
  it('should split the code into its two halves of characters', () => {
    expect(splitWhatsappPairingCode('ab12-CD34')).toEqual([
      ['A', 'B', '1', '2'],
      ['C', 'D', '3', '4'],
    ]);
  });

  it('should keep a code without a dash as one group', () => {
    expect(splitWhatsappPairingCode('ABCD')).toEqual([['A', 'B', 'C', 'D']]);
  });
});
