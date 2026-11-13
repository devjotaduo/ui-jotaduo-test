import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

const TICK_INTERVAL_MS = 250;

// A ticking clock is the one state that has to come from an effect: nothing else fires every second
export const useWhatsappCodeCountdown = (expiresAt: number | null) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isDefined(expiresAt)) {
      return;
    }

    const interval = window.setInterval(
      () => setNow(Date.now()),
      TICK_INTERVAL_MS,
    );

    return () => window.clearInterval(interval);
  }, [expiresAt]);

  const remainingSeconds = isDefined(expiresAt)
    ? Math.max(0, (expiresAt - now) / 1000)
    : 0;

  return {
    remainingSeconds,
    isExpired: isDefined(expiresAt) && remainingSeconds <= 0,
  };
};
