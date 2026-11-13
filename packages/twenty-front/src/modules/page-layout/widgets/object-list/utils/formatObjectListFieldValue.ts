import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isNonEmptyString, isNumber, isObject, isString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  convertCurrencyMicrosToCurrencyAmount,
  isDefined,
} from 'twenty-shared/utils';
import { type ThemeColor } from 'twenty-ui/theme';

export type ObjectListFieldDisplay =
  | { kind: 'text'; text: string }
  | { kind: 'tags'; tags: { label: string; color: ThemeColor }[] };

const EMPTY: ObjectListFieldDisplay = { kind: 'text', text: '' };

const text = (value: string): ObjectListFieldDisplay => ({
  kind: 'text',
  text: value,
});

const readString = (value: unknown, key: string) =>
  isObject(value) && key in value && isString(value[key as keyof typeof value])
    ? (value[key as keyof typeof value] as string)
    : '';

const getRelationLabel = (value: unknown) => {
  if (!isObject(value)) {
    return '';
  }

  const name = 'name' in value ? value.name : undefined;

  if (isString(name)) {
    return name;
  }

  if (isObject(name)) {
    return `${readString(name, 'firstName')} ${readString(name, 'lastName')}`.trim();
  }

  for (const key of ['title', 'label', 'subject']) {
    const candidate = readString(value, key);

    if (isNonEmptyString(candidate)) {
      return candidate;
    }
  }

  return '';
};

export const formatObjectListFieldValue = ({
  field,
  value,
  locale,
  booleanLabels,
}: {
  field: Pick<FieldMetadataItem, 'type' | 'options'>;
  value: unknown;
  locale: string;
  booleanLabels: { yes: string; no: string };
}): ObjectListFieldDisplay => {
  if (!isDefined(value) || value === '') {
    return EMPTY;
  }

  switch (field.type) {
    case FieldMetadataType.SELECT: {
      const option = field.options?.find((option) => option.value === value);

      return isDefined(option)
        ? { kind: 'tags', tags: [{ label: option.label, color: option.color }] }
        : text(String(value));
    }
    case FieldMetadataType.MULTI_SELECT: {
      const values = Array.isArray(value) ? value : [];

      return {
        kind: 'tags',
        tags: values.flatMap((optionValue) => {
          const option = field.options?.find(
            (option) => option.value === optionValue,
          );

          return isDefined(option)
            ? [{ label: option.label, color: option.color }]
            : [];
        }),
      };
    }
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
      return isNumber(value) || isString(value)
        ? text(new Intl.NumberFormat(locale).format(Number(value)))
        : EMPTY;
    case FieldMetadataType.CURRENCY: {
      const amountMicros =
        isObject(value) && 'amountMicros' in value ? value.amountMicros : null;
      const currencyCode = readString(value, 'currencyCode');

      if (!isNumber(amountMicros)) {
        return EMPTY;
      }

      const amount = convertCurrencyMicrosToCurrencyAmount(amountMicros);

      return text(
        isNonEmptyString(currencyCode)
          ? new Intl.NumberFormat(locale, {
              style: 'currency',
              currency: currencyCode,
              notation: 'compact',
            }).format(amount)
          : new Intl.NumberFormat(locale).format(amount),
      );
    }
    case FieldMetadataType.DATE:
    case FieldMetadataType.DATE_TIME: {
      const date = new Date(String(value));

      return Number.isNaN(date.getTime())
        ? EMPTY
        : text(
            new Intl.DateTimeFormat(locale, {
              dateStyle: 'medium',
              ...(field.type === FieldMetadataType.DATE_TIME
                ? { timeStyle: 'short' }
                : {}),
            }).format(date),
          );
    }
    case FieldMetadataType.BOOLEAN:
      return text(value === true ? booleanLabels.yes : booleanLabels.no);
    case FieldMetadataType.FULL_NAME:
      return text(
        `${readString(value, 'firstName')} ${readString(value, 'lastName')}`.trim(),
      );
    case FieldMetadataType.EMAILS:
      return text(readString(value, 'primaryEmail'));
    case FieldMetadataType.PHONES: {
      const number = readString(value, 'primaryPhoneNumber');

      return isNonEmptyString(number)
        ? text(
            `${readString(value, 'primaryPhoneCallingCode')} ${number}`.trim(),
          )
        : EMPTY;
    }
    case FieldMetadataType.LINKS: {
      const label = readString(value, 'primaryLinkLabel');

      return text(
        isNonEmptyString(label) ? label : readString(value, 'primaryLinkUrl'),
      );
    }
    case FieldMetadataType.ADDRESS:
      return text(
        [readString(value, 'addressCity'), readString(value, 'addressCountry')]
          .filter(isNonEmptyString)
          .join(', '),
      );
    case FieldMetadataType.RATING: {
      const rating = String(value).replace('RATING_', '');

      return text(`${rating}/5`);
    }
    case FieldMetadataType.ACTOR:
      return text(readString(value, 'name'));
    case FieldMetadataType.RELATION:
      return text(getRelationLabel(value));
    case FieldMetadataType.ARRAY:
      return text(Array.isArray(value) ? value.join(', ') : '');
    default:
      return isObject(value) ? EMPTY : text(String(value));
  }
};
