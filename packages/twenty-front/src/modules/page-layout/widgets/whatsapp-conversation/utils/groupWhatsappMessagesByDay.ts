type WhatsappMessageWithTimestamp = { timestamp: string };

export type WhatsappMessageDay<TMessage> = {
  dayKey: string;
  date: Date;
  messages: TMessage[];
};

export const groupWhatsappMessagesByDay = <
  TMessage extends WhatsappMessageWithTimestamp,
>(
  messages: TMessage[],
): WhatsappMessageDay<TMessage>[] => {
  const days: WhatsappMessageDay<TMessage>[] = [];

  for (const message of messages) {
    const date = new Date(message.timestamp);
    const dayKey = Number.isNaN(date.getTime())
      ? 'unknown'
      : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const lastDay = days.at(-1);

    if (lastDay?.dayKey === dayKey) {
      lastDay.messages.push(message);
    } else {
      days.push({ dayKey, date, messages: [message] });
    }
  }

  return days;
};
