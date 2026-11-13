import { WhatsappConnectionCodeTimer } from '@/page-layout/widgets/whatsapp-connection/components/WhatsappConnectionCodeTimer';
import { useWhatsappCodeCountdown } from '@/page-layout/widgets/whatsapp-connection/hooks/useWhatsappCodeCountdown';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconRefresh } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { GenerateWhatsappLoginQrCodeDocument } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledQrCodeWrapper = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[4]};
  position: relative;
`;

const StyledQrCodeImage = styled.img<{ isExpired: boolean }>`
  display: block;
  filter: ${({ isExpired }) => (isExpired ? 'blur(3px)' : 'none')};
  height: 160px;
  opacity: ${({ isExpired }) => (isExpired ? 0.3 : 1)};
  width: 160px;
`;

const StyledQrCodePlaceholder = styled.div`
  align-items: center;
  display: flex;
  height: 160px;
  justify-content: center;
  width: 160px;
`;

const StyledExpiredOverlay = styled.div`
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  position: absolute;
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

export const WhatsappConnectionQrCode = () => {
  const { t } = useLingui();
  const [qrCode, setQrCode] = useState<{
    dataUrl: string;
    expiresAt: number;
  } | null>(null);

  const [generateQrCode, { loading, error }] = useMutation(
    GenerateWhatsappLoginQrCodeDocument,
  );

  const { remainingSeconds, isExpired } = useWhatsappCodeCountdown(
    qrCode?.expiresAt ?? null,
  );

  const refreshQrCode = async () => {
    const result = await generateQrCode().catch(() => null);
    const generated = result?.data?.generateWhatsappLoginQrCode;

    if (isDefined(generated)) {
      setQrCode({
        dataUrl: generated.qrCodeDataUrl,
        expiresAt: Date.now() + generated.expiresInSeconds * 1000,
      });
    }
  };

  // The QR comes from a mutation, so the first one has to be requested once the widget shows
  useEffect(() => {
    refreshQrCode();
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledContainer>
      <StyledQrCodeWrapper>
        {isDefined(qrCode) ? (
          <StyledQrCodeImage
            src={qrCode.dataUrl}
            alt={t`WhatsApp QR code`}
            isExpired={isExpired}
          />
        ) : (
          <StyledQrCodePlaceholder>
            <Loader />
          </StyledQrCodePlaceholder>
        )}
        {isExpired && (
          <StyledExpiredOverlay>
            <Button
              variant="outline"
              size="sm"
              startIcon={<IconRefresh />}
              loading={loading}
              loadingPosition="start"
              onClick={refreshQrCode}
            >
              {t`New QR code`}
            </Button>
          </StyledExpiredOverlay>
        )}
      </StyledQrCodeWrapper>
      {isDefined(qrCode) && (
        <WhatsappConnectionCodeTimer
          remainingSeconds={remainingSeconds}
          isExpired={isExpired}
          isRefreshing={loading}
          onRefresh={refreshQrCode}
        />
      )}
      {isDefined(error) && (
        <StyledError role="alert">{error.message}</StyledError>
      )}
      <StyledHint>
        {t`On your phone, open WhatsApp > Linked devices > Link a device, then scan this code.`}
      </StyledHint>
    </StyledContainer>
  );
};
