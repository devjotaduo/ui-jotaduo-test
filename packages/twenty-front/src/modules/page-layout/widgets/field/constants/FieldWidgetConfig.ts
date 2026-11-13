import { FieldMetadataType } from 'twenty-shared/types';
import { FieldDisplayMode } from '~/generated-metadata/graphql';

type FieldWidgetFieldTypeConfig = {
  availableDisplayModes: FieldDisplayMode[];
  defaultDisplayMode: FieldDisplayMode;
};

export const FIELD_WIDGET_CONFIG: Partial<
  Record<FieldMetadataType, FieldWidgetFieldTypeConfig>
> = {
  [FieldMetadataType.TEXT]: {
    availableDisplayModes: [
      FieldDisplayMode.FIELD,
      FieldDisplayMode.EDITOR,
      FieldDisplayMode.ROW,
    ],
    defaultDisplayMode: FieldDisplayMode.FIELD,
  },
  [FieldMetadataType.RELATION]: {
    availableDisplayModes: [
      FieldDisplayMode.FIELD,
      FieldDisplayMode.CARD,
      FieldDisplayMode.TABLE,
      FieldDisplayMode.LINK,
    ],
    defaultDisplayMode: FieldDisplayMode.CARD,
  },
  [FieldMetadataType.MORPH_RELATION]: {
    availableDisplayModes: [FieldDisplayMode.FIELD, FieldDisplayMode.CARD],
    defaultDisplayMode: FieldDisplayMode.CARD,
  },
  [FieldMetadataType.FILES]: {
    availableDisplayModes: [FieldDisplayMode.FIELD, FieldDisplayMode.CARD],
    defaultDisplayMode: FieldDisplayMode.FIELD,
  },
  // Options: one card per option. Stepper: options as ordered stages. Tiles: a grid of option cards
  [FieldMetadataType.SELECT]: {
    availableDisplayModes: [
      FieldDisplayMode.FIELD,
      FieldDisplayMode.OPTIONS,
      FieldDisplayMode.STEPPER,
      FieldDisplayMode.TILES,
      FieldDisplayMode.ROW,
    ],
    defaultDisplayMode: FieldDisplayMode.FIELD,
  },
  [FieldMetadataType.MULTI_SELECT]: {
    availableDisplayModes: [
      FieldDisplayMode.FIELD,
      FieldDisplayMode.OPTIONS,
      FieldDisplayMode.ROW,
    ],
    defaultDisplayMode: FieldDisplayMode.FIELD,
  },
  // Row: a settings-style card with the field's icon, name and description beside its value
  [FieldMetadataType.NUMBER]: {
    availableDisplayModes: [FieldDisplayMode.FIELD, FieldDisplayMode.ROW],
    defaultDisplayMode: FieldDisplayMode.FIELD,
  },
  [FieldMetadataType.CURRENCY]: {
    availableDisplayModes: [FieldDisplayMode.FIELD, FieldDisplayMode.ROW],
    defaultDisplayMode: FieldDisplayMode.FIELD,
  },
  [FieldMetadataType.DATE]: {
    availableDisplayModes: [FieldDisplayMode.FIELD, FieldDisplayMode.ROW],
    defaultDisplayMode: FieldDisplayMode.FIELD,
  },
  [FieldMetadataType.DATE_TIME]: {
    availableDisplayModes: [FieldDisplayMode.FIELD, FieldDisplayMode.ROW],
    defaultDisplayMode: FieldDisplayMode.FIELD,
  },
  [FieldMetadataType.BOOLEAN]: {
    availableDisplayModes: [FieldDisplayMode.FIELD, FieldDisplayMode.ROW],
    defaultDisplayMode: FieldDisplayMode.FIELD,
  },
  [FieldMetadataType.RATING]: {
    availableDisplayModes: [FieldDisplayMode.FIELD, FieldDisplayMode.ROW],
    defaultDisplayMode: FieldDisplayMode.FIELD,
  },
  [FieldMetadataType.EMAILS]: {
    availableDisplayModes: [FieldDisplayMode.FIELD, FieldDisplayMode.ROW],
    defaultDisplayMode: FieldDisplayMode.FIELD,
  },
  [FieldMetadataType.PHONES]: {
    availableDisplayModes: [FieldDisplayMode.FIELD, FieldDisplayMode.ROW],
    defaultDisplayMode: FieldDisplayMode.FIELD,
  },
  [FieldMetadataType.LINKS]: {
    availableDisplayModes: [FieldDisplayMode.FIELD, FieldDisplayMode.ROW],
    defaultDisplayMode: FieldDisplayMode.FIELD,
  },
  [FieldMetadataType.RICH_TEXT]: {
    availableDisplayModes: [FieldDisplayMode.FIELD, FieldDisplayMode.EDITOR],
    defaultDisplayMode: FieldDisplayMode.EDITOR,
  },
};
