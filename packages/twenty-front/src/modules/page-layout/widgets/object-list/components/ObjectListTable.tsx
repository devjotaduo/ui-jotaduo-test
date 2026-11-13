import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectListFieldValue } from '@/page-layout/widgets/object-list/components/ObjectListFieldValue';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledWrapper = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  max-height: 480px;
  overflow: auto;
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  font-size: ${themeCssVariables.font.size.md};
  width: 100%;
`;

const StyledHeaderCell = styled.th`
  background: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: 40px;
  min-width: 120px;
  padding: 0 ${themeCssVariables.spacing[3]};
  position: sticky;
  text-align: left;
  top: 0;
  white-space: nowrap;
  z-index: 1;

  &:first-child {
    left: 0;
    z-index: 2;
  }
`;

const StyledRow = styled.tr`
  cursor: pointer;

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }

  &:not(:last-child) > td {
    border-bottom: 1px solid ${themeCssVariables.border.color.light};
  }

  &:focus-visible {
    outline: 1px solid ${themeCssVariables.color.blue};
    outline-offset: -1px;
  }
`;

// The name column stays in view while a narrow widget scrolls sideways
const StyledCell = styled.td<{ isPrimary: boolean }>`
  color: ${({ isPrimary }) =>
    isPrimary
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.secondary};
  font-weight: ${({ isPrimary }) =>
    isPrimary
      ? themeCssVariables.font.weight.medium
      : themeCssVariables.font.weight.regular};
  max-width: 240px;
  min-width: 120px;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  text-overflow: ellipsis;
  white-space: nowrap;

  &:first-child {
    background: ${themeCssVariables.background.primary};
    left: 0;
    position: sticky;
  }
`;

type ObjectListTableProps = {
  fields: FieldMetadataItem[];
  records: ObjectRecord[];
  onOpenRecord: (recordId: string) => void;
};

export const ObjectListTable = ({
  fields,
  records,
  onOpenRecord,
}: ObjectListTableProps) => (
  <StyledWrapper>
    <StyledTable>
      <thead>
        <tr>
          {fields.map((field) => (
            <StyledHeaderCell key={field.id} scope="col">
              {field.label}
            </StyledHeaderCell>
          ))}
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <StyledRow
            key={record.id}
            tabIndex={0}
            onClick={() => onOpenRecord(record.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onOpenRecord(record.id);
              }
            }}
          >
            {fields.map((field, index) => (
              <StyledCell key={field.id} isPrimary={index === 0}>
                <ObjectListFieldValue
                  field={field}
                  value={record[field.name]}
                />
              </StyledCell>
            ))}
          </StyledRow>
        ))}
      </tbody>
    </StyledTable>
  </StyledWrapper>
);
