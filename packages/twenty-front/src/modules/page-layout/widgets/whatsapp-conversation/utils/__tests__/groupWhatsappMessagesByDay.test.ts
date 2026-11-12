import { groupWhatsappMessagesByDay } from '@/page-layout/widgets/whatsapp-conversation/utils/groupWhatsappMessagesByDay';

describe('groupWhatsappMessagesByDay', () => {
  it('should group consecutive messages of the same day', () => {
    const days = groupWhatsappMessagesByDay([
      { id: '1', timestamp: '2026-11-11T10:00:00' },
      { id: '2', timestamp: '2026-11-11T18:00:00' },
      { id: '3', timestamp: '2026-11-12T09:00:00' },
    ]);

    expect(
      days.map((day) => day.messages.map((message) => message.id)),
    ).toEqual([['1', '2'], ['3']]);
  });
});
