import {
  buildPixBrCode,
  computePixCrc16,
} from 'src/engine/core-modules/pix-charge/utils/build-pix-br-code.util';

describe('buildPixBrCode', () => {
  it('should compute the CRC16-CCITT check value', () => {
    expect(computePixCrc16('123456789')).toBe('29B1');
  });

  it('should build a static BR Code with amount and txid', () => {
    const brCode = buildPixBrCode({
      pixKey: '12345678000199',
      merchantName: 'Clínica São João',
      merchantCity: 'São Paulo',
      amount: 150,
      txid: 'opp-0001',
    });

    expect(brCode.slice(0, -4)).toBe(
      '000201' +
        '26360014br.gov.bcb.pix011412345678000199' +
        '52040000' +
        '5303986' +
        '5406150.00' +
        '5802BR' +
        '5916CLINICA SAO JOAO' +
        '6009SAO PAULO' +
        '62110507opp0001' +
        '6304',
    );
    expect(brCode.slice(-4)).toBe(computePixCrc16(brCode.slice(0, -4)));
  });

  it('should fall back to *** when there is no txid', () => {
    expect(
      buildPixBrCode({
        pixKey: 'pix@example.com',
        merchantName: 'Loja',
        merchantCity: 'Rio',
      }),
    ).toContain('62070503***6304');
  });
});
