import { formatWhatsappCodeCountdown } from '@/page-layout/widgets/whatsapp-connection/utils/formatWhatsappCodeCountdown';

describe('formatWhatsappCodeCountdown', () => {
  it('should format seconds as minutes and padded seconds', () => {
    expect(formatWhatsappCodeCountdown(65)).toBe('1:05');
  });

  it('should round partial seconds up so 0:00 only shows once expired', () => {
    expect(formatWhatsappCodeCountdown(0.2)).toBe('0:01');
  });

  it('should never show a negative countdown', () => {
    expect(formatWhatsappCodeCountdown(-3)).toBe('0:00');
  });
});
