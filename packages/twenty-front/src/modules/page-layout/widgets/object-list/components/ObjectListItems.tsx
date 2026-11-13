import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectListFieldValue } from '@/page-layout/widgets/object-list/components/ObjectListFieldValue';
import { formatObjectListFieldValue } from '@/page-layout/widgets/object-list/utils/formatObjectListFieldValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Fragment } from 'react';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledList = styled.ul`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  list-style: none;
  margin: 0;
  max-height: 480px;
  overflow: auto;
  padding: 0;
`;

const StyledItem = styled.li`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${themeCssVariables.border.color.light};
  }

  &:focus-visible {
    outline: 1px solid ${themeCssVariables.color.blue};
    outline-offset: -1px;
  }
`;

const StyledText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDetails = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledSeparator = styled.span`
  padding: 0 ${themeCssVariables.spacing[1]};
`;

type ObjectListItemsProps = {
  titleField: FieldMetadataItem;
  detailFields: FieldMetadataItem[];
  records: ObjectRecord[];
  onOpenRecord: (recordId: string) => void;
};

export const ObjectListItems = ({
  titleField,
  detailFields,
  records,
  onOpenRecord,
}: ObjectListItemsProps) => {
  const { t, i18n } = useLingui();

  return (
    <StyledList>
      {records.map((record) => {
        const titleDisplay = formatObjectListFieldValue({
          field: titleField,
          value: record[titleField.name],
          locale: i18n.locale,
          booleanLabels: { yes: t`Yes`, no: t`No` },
        });
        const title =
          titleDisplay.kind === 'text' && titleDisplay.text.length > 0
            ? titleDisplay.text
            : t`Untitled`;
        const filledDetailFields = detailFields.filter((field) => {
          const value = record[field.name];

          return value !== null && value !== undefined && value !== '';
        });

        return (
          <StyledItem
            key={record.id}
            tabIndex={0}
            onClick={() => onOpenRecord(record.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onOpenRecord(record.id);
              }
            }}
          >
            <Avatar name={title} colorSeed={record.id} shape="rounded-square" />
            <StyledText>
              <StyledTitle>{title}</StyledTitle>
              {filledDetailFields.length > 0 && (
                <StyledDetails>
                  {filledDetailFields.map((field, index) => (
                    <Fragment key={field.id}>
                      {index > 0 && <StyledSeparator>·</StyledSeparator>}
                      <ObjectListFieldValue
                        field={field}
                        value={record[field.name]}
                      />
                    </Fragment>
                  ))}
                </StyledDetails>
              )}
            </StyledText>
          </StyledItem>
        );
      })}
    </StyledList>
  );
};
