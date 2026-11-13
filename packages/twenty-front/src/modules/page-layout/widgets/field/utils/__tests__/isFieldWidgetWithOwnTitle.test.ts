import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isFieldWidgetWithOwnTitle } from '@/page-layout/widgets/field/utils/isFieldWidgetWithOwnTitle';
import { WidgetType } from '~/generated-metadata/graphql';

const buildWidget = (
  type: WidgetType,
  fieldDisplayMode?: string,
): Pick<PageLayoutWidget, 'type' | 'configuration'> =>
  ({
    type,
    configuration: { configurationType: type, fieldDisplayMode },
  }) as unknown as Pick<PageLayoutWidget, 'type' | 'configuration'>;

describe('isFieldWidgetWithOwnTitle', () => {
  it('should be true for Row and Link field widgets', () => {
    expect(
      isFieldWidgetWithOwnTitle(buildWidget(WidgetType.FIELD, 'ROW')),
    ).toBe(true);
    expect(
      isFieldWidgetWithOwnTitle(buildWidget(WidgetType.FIELD, 'LINK')),
    ).toBe(true);
  });

  it('should be false for other field display modes', () => {
    expect(
      isFieldWidgetWithOwnTitle(buildWidget(WidgetType.FIELD, 'TILES')),
    ).toBe(false);
  });

  it('should be false for other widget types', () => {
    expect(
      isFieldWidgetWithOwnTitle(buildWidget(WidgetType.FIELDS, 'ROW')),
    ).toBe(false);
  });
});
