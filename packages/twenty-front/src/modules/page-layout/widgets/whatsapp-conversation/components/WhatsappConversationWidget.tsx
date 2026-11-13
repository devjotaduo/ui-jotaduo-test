import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { WhatsappConversationMessages } from '@/page-layout/widgets/whatsapp-conversation/components/WhatsappConversationMessages';
import { getWhatsappPhoneNumberFromPhones } from '@/page-layout/widgets/whatsapp-conversation/utils/getWhatsappPhoneNumberFromPhones';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

export const WhatsappConversationWidget = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const phonesField = objectMetadataItem.fields.find(
    (field) => field.type === FieldMetadataType.PHONES && field.isActive,
  );

  const phones = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId: targetRecord.id,
    fieldName: phonesField?.name ?? '',
  }) as FieldPhonesValue | null | undefined;

  if (!isDefined(phonesField)) {
    return (
      <StyledEmpty>{t`This object has no phone field to message.`}</StyledEmpty>
    );
  }

  const phoneNumber = getWhatsappPhoneNumberFromPhones(phones);

  if (!isDefined(phoneNumber)) {
    return (
      <StyledEmpty>
        {t`Add a phone number to start a WhatsApp conversation.`}
      </StyledEmpty>
    );
  }

  // Keyed by number so a draft typed for one recipient is never sent to another
  return (
    <WhatsappConversationMessages key={phoneNumber} phoneNumber={phoneNumber} />
  );
};
