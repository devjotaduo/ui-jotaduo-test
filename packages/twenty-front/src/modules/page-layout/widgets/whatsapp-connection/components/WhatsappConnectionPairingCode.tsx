import { WhatsappConnectionCodeTimer } from '@/page-layout/widgets/whatsapp-connection/components/WhatsappConnectionCodeTimer';
import { useWhatsappCodeCountdown } from '@/page-layout/widgets/whatsapp-connection/hooks/useWhatsappCodeCountdown';
import { splitWhatsappPairingCode } from '@/page-layout/widgets/whatsapp-connection/utils/splitWhatsappPairingCode';
import { TwoFactorAuthenticationVerificationCodeDash } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationVerificationCodeDash';
import { TwoFactorAuthenticationVerificationCodeSlot } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationVerificationCodeSlot';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Fragment, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCopy } from 'twenty-ui/icon';
import { Button, Input } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { GenerateWhatsappPairingCodeDocument } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledPhoneForm = styled.form`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledPhoneInput = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledCodeRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSlots = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
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

export const WhatsappConnectionPairingCode = () => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pairingCode, setPairingCode] = useState<{
    code: string;
    expiresAt: number;
  } | null>(null);

  const [generatePairingCode, { loading, error }] = useMutation(
    GenerateWhatsappPairingCodeDocument,
  );

  const { remainingSeconds, isExpired } = useWhatsappCodeCountdown(
    pairingCode?.expiresAt ?? null,
  );

  const requestPairingCode = async () => {
    if (!isNonEmptyString(phoneNumber.trim())) {
      return;
    }

    const result = await generatePairingCode({
      variables: { phoneNumber },
    }).catch(() => null);
    const generated = result?.data?.generateWhatsappPairingCode;

    if (isDefined(generated)) {
      setPairingCode({
        code: generated.pairingCode,
        expiresAt: Date.now() + generated.expiresInSeconds * 1000,
      });
    }
  };

  const codeGroups = isDefined(pairingCode)
    ? splitWhatsappPairingCode(pairingCode.code)
    : [];

  return (
    <StyledContainer>
      <StyledPhoneForm
        onSubmit={(event) => {
          event.preventDefault();
          requestPairingCode();
        }}
      >
        <StyledPhoneInput>
          <Input
            aria-label={t`Phone number`}
            placeholder={t`Phone with country code, e.g. 5511999999999`}
            inputMode="tel"
            size="sm"
            value={phoneNumber}
            onValueChange={setPhoneNumber}
          />
        </StyledPhoneInput>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          loading={loading}
          disabled={!isNonEmptyString(phoneNumber.trim())}
        >
          {t`Get code`}
        </Button>
      </StyledPhoneForm>

      {isDefined(pairingCode) && (
        <>
          <StyledCodeRow>
            <StyledSlots
              aria-label={t`Pairing code ${pairingCode.code}`}
              role="group"
            >
              {codeGroups.map((group, groupIndex) => (
                <Fragment key={groupIndex}>
                  {groupIndex > 0 && (
                    <TwoFactorAuthenticationVerificationCodeDash />
                  )}
                  {group.map((char, charIndex) => (
                    <TwoFactorAuthenticationVerificationCodeSlot
                      key={charIndex}
                      char={isExpired ? null : char}
                      placeholderChar={null}
                      isActive={false}
                      hasFakeCaret={false}
                    />
                  ))}
                </Fragment>
              ))}
            </StyledSlots>
            <Button
              variant="ghost"
              size="sm"
              startIcon={<IconCopy />}
              disabled={isExpired}
              onClick={() =>
                copyToClipboard(pairingCode.code, t`Pairing code copied`)
              }
            >
              {t`Copy`}
            </Button>
          </StyledCodeRow>
          <WhatsappConnectionCodeTimer
            remainingSeconds={remainingSeconds}
            isExpired={isExpired}
            isRefreshing={loading}
            onRefresh={requestPairingCode}
          />
        </>
      )}
      {isDefined(error) && (
        <StyledError role="alert">{error.message}</StyledError>
      )}
      <StyledHint>
        {t`On your phone, open WhatsApp > Linked devices > Link a device > Link with phone number instead, then type this code.`}
      </StyledHint>
    </StyledContainer>
  );
};
