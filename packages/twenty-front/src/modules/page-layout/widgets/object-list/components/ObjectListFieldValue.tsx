import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectListRelationLabelField } from '@/page-layout/widgets/object-list/utils/getObjectListRelationLabelField';
import { formatObjectListFieldValue } from '@/page-layout/widgets/object-list/utils/formatObjectListFieldValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Tag } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledTags = styled.span`
  display: inline-flex;
  flex-wrap: nowrap;
  gap: ${themeCssVariables.spacing[1]};
  overflow: hidden;
  vertical-align: middle;
`;

type ObjectListFieldValueProps = {
  field: Pick<FieldMetadataItem, 'type' | 'options' | 'relation'>;
  value: unknown;
};

export const ObjectListFieldValue = ({
  field,
  value,
}: ObjectListFieldValueProps) => {
  const { t, i18n } = useLingui();
  const { objectMetadataItems } = useObjectMetadataItems();

  const display = formatObjectListFieldValue({
    field,
    value,
    locale: i18n.locale,
    booleanLabels: { yes: t`Yes`, no: t`No` },
    relationLabelField: getObjectListRelationLabelField({
      field,
      objectMetadataItems,
    }),
  });

  if (display.kind === 'tags') {
    return (
      <StyledTags>
        {display.tags.map((tag) => (
          <Tag key={tag.label} color={tag.color}>
            {tag.label}
          </Tag>
        ))}
      </StyledTags>
    );
  }

  return <>{display.text}</>;
};
