import { formatWhatsappCodeCountdown } from '@/page-layout/widgets/whatsapp-connection/utils/formatWhatsappCodeCountdown';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledTimerRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCountdown = styled.span`
  font-variant-numeric: tabular-nums;
`;

type WhatsappConnectionCodeTimerProps = {
  remainingSeconds: number;
  isExpired: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
};

export const WhatsappConnectionCodeTimer = ({
  remainingSeconds,
  isExpired,
  isRefreshing,
  onRefresh,
}: WhatsappConnectionCodeTimerProps) => {
  const { t } = useLingui();
  const countdown = formatWhatsappCodeCountdown(remainingSeconds);

  return (
    <StyledTimerRow role="timer" aria-live="off">
      <StyledCountdown>
        {isExpired ? t`Code expired` : t`Expires in ${countdown}`}
      </StyledCountdown>
      <Button
        variant="link"
        size="sm"
        startIcon={<IconRefresh />}
        loading={isRefreshing}
        loadingPosition="start"
        onClick={onRefresh}
      >
        {t`Refresh`}
      </Button>
    </StyledTimerRow>
  );
};
