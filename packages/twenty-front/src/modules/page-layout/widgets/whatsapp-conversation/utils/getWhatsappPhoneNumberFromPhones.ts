import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

// WhatsApp needs the full international number; the calling code lives apart from the number in a Phones field
export const getWhatsappPhoneNumberFromPhones = (
  phones: FieldPhonesValue | null | undefined,
): string | null => {
  if (!isDefined(phones) || !isNonEmptyString(phones.primaryPhoneNumber)) {
    return null;
  }

  const digits =
    `${phones.primaryPhoneCallingCode ?? ''}${phones.primaryPhoneNumber}`.replace(
      /\D/g,
      '',
    );

  return digits.length > 0 ? digits : null;
};
