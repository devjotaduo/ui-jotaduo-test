import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';

// The value stays as is: renaming an option must not orphan records that already use it
export const getFieldWidgetSelectTilesUpdatedOptions = ({
  options,
  optionId,
  patch,
}: {
  options: FieldMetadataItemOption[];
  optionId: string;
  patch: Partial<Pick<FieldMetadataItemOption, 'label' | 'color'>>;
}): FieldMetadataItemOption[] =>
  options.map(({ id, label, value, color, position }) => ({
    id,
    label,
    value,
    color,
    position,
    ...(id === optionId ? patch : {}),
  }));
