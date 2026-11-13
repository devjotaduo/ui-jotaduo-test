import { WhatsappConnectionPairingCode } from '@/page-layout/widgets/whatsapp-connection/components/WhatsappConnectionPairingCode';
import { WhatsappConnectionQrCode } from '@/page-layout/widgets/whatsapp-connection/components/WhatsappConnectionQrCode';
import { getWhatsappDevicePhoneNumber } from '@/page-layout/widgets/whatsapp-connection/utils/getWhatsappDevicePhoneNumber';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SegmentedControl } from 'twenty-ui/components/input';
import { IconBrandWhatsapp, IconLogout } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Status } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  DisconnectWhatsappDocument,
  GetWhatsappConnectionStatusDocument,
} from '~/generated-metadata/graphql';

// Scanning happens on the phone, so polling is how the widget learns the link succeeded
const STATUS_POLL_INTERVAL_MS = 3000;

type WhatsappConnectionMethod = 'qr-code' | 'pairing-code';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[2]} 0;
  width: 100%;
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  line-height: 1.5;
`;

const StyledConnectedRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledDevice = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledDeviceName = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledDevicePhone = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledIcon = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
`;

export const WhatsappConnectionWidget = () => {
  const { t } = useLingui();
  const [method, setMethod] = useState<WhatsappConnectionMethod>('qr-code');

  const { data, loading, refetch } = useQuery(
    GetWhatsappConnectionStatusDocument,
    { pollInterval: STATUS_POLL_INTERVAL_MS },
  );

  const [disconnectWhatsapp, { loading: isDisconnecting }] = useMutation(
    DisconnectWhatsappDocument,
  );

  const status = data?.whatsappConnectionStatus;

  if (loading && status === undefined) {
    return <Loader />;
  }

  if (status?.isConfigured !== true) {
    return (
      <StyledDescription>
        {t`WhatsApp is not set up on this server. An admin needs to set WHATSAPP_GOWA_URL.`}
      </StyledDescription>
    );
  }

  if (status.isConnected) {
    return (
      <StyledContainer>
        {status.devices.map((device) => (
          <StyledConnectedRow key={device.jid}>
            <StyledIcon>
              <IconBrandWhatsapp size={20} />
            </StyledIcon>
            <StyledDevice>
              <StyledDeviceName>
                {device.name.length > 0 ? device.name : t`WhatsApp`}
              </StyledDeviceName>
              <StyledDevicePhone>
                {getWhatsappDevicePhoneNumber(device.jid)}
              </StyledDevicePhone>
            </StyledDevice>
            <Status color="green">{t`Connected`}</Status>
          </StyledConnectedRow>
        ))}
        <div>
          <Button
            variant="outline"
            size="sm"
            startIcon={<IconLogout />}
            loading={isDisconnecting}
            onClick={async () => {
              await disconnectWhatsapp().catch(() => null);
              await refetch();
            }}
          >
            {t`Disconnect`}
          </Button>
        </div>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledDescription>
        {t`Link a WhatsApp number to send and receive messages from Twenty.`}
      </StyledDescription>
      <SegmentedControl<WhatsappConnectionMethod>
        aria-label={t`Connection method`}
        size="sm"
        value={method}
        onValueChange={setMethod}
        options={[
          { value: 'qr-code', label: t`QR code` },
          { value: 'pairing-code', label: t`Pairing code` },
        ]}
      />
      {method === 'qr-code' ? (
        <WhatsappConnectionQrCode />
      ) : (
        <WhatsappConnectionPairingCode />
      )}
    </StyledContainer>
  );
};
