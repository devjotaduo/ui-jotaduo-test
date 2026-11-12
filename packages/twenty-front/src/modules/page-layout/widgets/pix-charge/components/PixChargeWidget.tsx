import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldCurrencyValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import QRCodeModule from 'react-qr-code';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  convertCurrencyMicrosToCurrencyAmount,
  isDefined,
} from 'twenty-shared/utils';
import { IconCopy } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { GetPixChargeDocument } from '~/generated-metadata/graphql';
import { resolveCjsModuleDefaultExport } from '~/utils/resolveCjsModuleDefaultExport';

const QRCode = resolveCjsModuleDefaultExport(QRCodeModule);

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]} 0;
  width: 100%;
`;

const StyledAmount = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledReceiver = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledQrCodeWrapper = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[4]};
`;

// The BR Code must be scanned black on white whatever the theme
const StyledQrCodeCanvas = styled.div`
  background: white;
  height: 160px;
  padding: ${themeCssVariables.spacing[2]};
  width: 160px;

  & > svg {
    height: 100%;
    width: 100%;
  }
`;

const StyledCopyRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledBrCode = styled.code`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.xs};
  min-width: 0;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledMessage = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

export const PixChargeWidget = () => {
  const { t, i18n } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const targetRecord = useTargetRecord();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const currencyField = objectMetadataItem.fields.find(
    (field) => field.type === FieldMetadataType.CURRENCY && field.isActive,
  );

  const currencyValue = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId: targetRecord.id,
    fieldName: currencyField?.name ?? '',
  }) as FieldCurrencyValue | null | undefined;

  const amount = isDefined(currencyValue?.amountMicros)
    ? convertCurrencyMicrosToCurrencyAmount(currencyValue.amountMicros)
    : 0;
  const isBrl = currencyValue?.currencyCode === 'BRL';

  const { data, loading } = useQuery(GetPixChargeDocument, {
    variables: { amount, txid: targetRecord.id },
    skip: !isBrl || amount <= 0,
  });

  if (!isDefined(currencyField)) {
    return <StyledMessage>{t`This object has no amount field.`}</StyledMessage>;
  }

  if (!isBrl) {
    return (
      <StyledMessage>
        {t`Pix only works with amounts in Brazilian real (BRL).`}
      </StyledMessage>
    );
  }

  if (amount <= 0) {
    return (
      <StyledMessage>{t`Set an amount to create the Pix charge.`}</StyledMessage>
    );
  }

  if (loading && !isDefined(data)) {
    return <Loader />;
  }

  const pixCharge = data?.pixCharge;

  if (pixCharge?.isConfigured !== true || !isNonEmptyString(pixCharge.brCode)) {
    return (
      <StyledMessage>
        {t`Pix is not set up on this server. An admin needs to set PIX_KEY, PIX_MERCHANT_NAME and PIX_MERCHANT_CITY.`}
      </StyledMessage>
    );
  }

  const brCode = pixCharge.brCode;
  const formattedAmount = new Intl.NumberFormat(i18n.locale, {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
  const merchantName = pixCharge.merchantName ?? '';

  return (
    <StyledContainer>
      <div>
        <StyledAmount>{formattedAmount}</StyledAmount>
        <StyledReceiver>{t`To ${merchantName}`}</StyledReceiver>
      </div>
      <StyledQrCodeWrapper>
        <StyledQrCodeCanvas aria-label={t`Pix QR code`} role="img">
          <QRCode value={brCode} />
        </StyledQrCodeCanvas>
      </StyledQrCodeWrapper>
      <StyledCopyRow>
        <StyledBrCode title={brCode}>{brCode}</StyledBrCode>
        <Button
          variant="outline"
          size="sm"
          startIcon={<IconCopy />}
          onClick={() => copyToClipboard(brCode, t`Pix code copied`)}
        >
          {t`Copy`}
        </Button>
      </StyledCopyRow>
    </StyledContainer>
  );
};
