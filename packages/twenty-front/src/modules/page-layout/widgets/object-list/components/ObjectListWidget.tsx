import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useIsSideColumnContext } from '@/page-layout/hooks/useIsSideColumnContext';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { ObjectListItems } from '@/page-layout/widgets/object-list/components/ObjectListItems';
import { ObjectListTable } from '@/page-layout/widgets/object-list/components/ObjectListTable';
import { useSaveObjectListConfiguration } from '@/page-layout/widgets/object-list/hooks/useSaveObjectListConfiguration';
import { getObjectListEligibleFields } from '@/page-layout/widgets/object-list/utils/getObjectListEligibleFields';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import {
  type ObjectListConfiguration,
  type ObjectListDisplayMode,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { SegmentedControl } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconChevronDown,
  IconColumns,
  IconList,
  IconTable,
} from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const RECORDS_LIMIT = 20;
// Titles still at these defaults follow the chosen object; a renamed widget keeps its name
const DEFAULT_WIDGET_TITLE = 'Records';
const DEFAULT_DETAIL_FIELD_COUNT = 3;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]} 0;
  width: 100%;
`;

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-left: auto;
`;

const StyledFooter = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  justify-content: space-between;
`;

const StyledEmpty = styled.div`
  border: 1px dashed ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[6]};
  text-align: center;
`;

type ObjectListWidgetProps = {
  widget: PageLayoutWidget;
};

export const ObjectListWidget = ({ widget }: ObjectListWidgetProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const canEditLayout = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const { isSideColumnContext } = useIsSideColumnContext();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { saveObjectListConfiguration } = useSaveObjectListConfiguration(
    widget.id,
  );

  const [configuration, setConfiguration] = useState<ObjectListConfiguration>(
    () => ({
      configurationType: 'OBJECT_LIST',
      ...(widget.configuration as Partial<ObjectListConfiguration>),
    }),
  );

  const selectableObjects = objectMetadataItems
    .filter((item) => item.isActive && !item.isSystem)
    .sort((itemA, itemB) => itemA.labelPlural.localeCompare(itemB.labelPlural));

  const objectMetadataItem =
    selectableObjects.find(
      (item) => item.id === configuration.objectMetadataId,
    ) ?? selectableObjects[0];

  const eligibleFields = isDefined(objectMetadataItem)
    ? getObjectListEligibleFields(objectMetadataItem.fields)
    : [];
  const labelIdentifierField = isDefined(objectMetadataItem)
    ? getLabelIdentifierFieldMetadataItem(objectMetadataItem)
    : undefined;

  const defaultFieldIds = [
    ...(isDefined(labelIdentifierField) ? [labelIdentifierField.id] : []),
    ...eligibleFields
      .filter((field) => field.id !== labelIdentifierField?.id)
      .slice(0, DEFAULT_DETAIL_FIELD_COUNT)
      .map((field) => field.id),
  ];
  const selectedFieldIds = configuration.fieldMetadataIds ?? defaultFieldIds;
  const selectedFields = selectedFieldIds.flatMap((fieldId) => {
    const field = eligibleFields.find(({ id }) => id === fieldId);

    return isDefined(field) ? [field] : [];
  });

  // A table needs width the side column does not have
  const displayMode: ObjectListDisplayMode =
    configuration.displayMode ?? (isSideColumnContext ? 'LIST' : 'TABLE');

  const queriedFields = isDefined(labelIdentifierField)
    ? [
        labelIdentifierField,
        ...selectedFields.filter(({ id }) => id !== labelIdentifierField.id),
      ]
    : selectedFields;

  const { records, loading, totalCount, hasNextPage, fetchMoreRecords } =
    useFindManyRecords({
      objectNameSingular: objectMetadataItem?.nameSingular ?? '',
      recordGqlFields: {
        id: true,
        ...generateDepthRecordGqlFieldsFromFields({
          objectMetadataItems,
          sourceObjectMetadataItem: objectMetadataItem,
          fields: queriedFields,
          depth: 1,
        }),
      },
      limit: RECORDS_LIMIT,
      skip: !isDefined(objectMetadataItem),
    });

  const updateConfiguration = (
    patch: Partial<ObjectListConfiguration>,
    title?: string,
  ) => {
    const nextConfiguration = { ...configuration, ...patch };

    setConfiguration(nextConfiguration);

    if (canEditLayout) {
      saveObjectListConfiguration(nextConfiguration, title);
    }
  };

  const selectObject = (nextObjectMetadataId: string) => {
    const nextObject = selectableObjects.find(
      ({ id }) => id === nextObjectMetadataId,
    );
    const titleFollowsObject =
      !isNonEmptyString(widget.title) ||
      widget.title === DEFAULT_WIDGET_TITLE ||
      widget.title === t`Records` ||
      widget.title === objectMetadataItem?.labelPlural;

    updateConfiguration(
      { objectMetadataId: nextObjectMetadataId, fieldMetadataIds: null },
      titleFollowsObject ? nextObject?.labelPlural : undefined,
    );
  };

  const loadMoreRecords = async () => {
    setIsLoadingMore(true);
    await fetchMoreRecords().catch(() => null);
    setIsLoadingMore(false);
  };

  const toggleField = (fieldId: string) =>
    updateConfiguration({
      fieldMetadataIds: selectedFieldIds.includes(fieldId)
        ? selectedFieldIds.filter((selectedId) => selectedId !== fieldId)
        : eligibleFields
            .map(({ id }) => id)
            .filter((id) => selectedFieldIds.includes(id) || id === fieldId),
    });

  const openRecord = (recordId: string) => {
    if (isDefined(objectMetadataItem)) {
      openRecordInSidePanel({
        recordId,
        objectNameSingular: objectMetadataItem.nameSingular,
      });
    }
  };

  if (!isDefined(objectMetadataItem)) {
    return <StyledEmpty>{t`No object to list.`}</StyledEmpty>;
  }

  const ObjectIcon = getIcon(objectMetadataItem.icon);
  const titleField = selectedFields[0] ?? labelIdentifierField;
  const recordCount = totalCount ?? records.length;
  const shownCount = records.length;

  return (
    <StyledContainer>
      <StyledToolbar>
        <Dropdown.Root type="menu">
          <Dropdown.Trigger
            render={
              <Button
                variant="outline"
                size="sm"
                startIcon={<ObjectIcon />}
                endIcon={<IconChevronDown />}
              />
            }
          >
            {objectMetadataItem.labelPlural}
          </Dropdown.Trigger>
          <Dropdown.Content aria-label={t`Object`} align="start">
            <Dropdown.Section scrollable>
              {selectableObjects.map((item) => {
                const ItemIcon = getIcon(item.icon);

                return (
                  <Dropdown.OptionItem
                    key={item.id}
                    selected={item.id === objectMetadataItem.id}
                    startIcon={<ItemIcon />}
                    onSelect={() => selectObject(item.id)}
                  >
                    {item.labelPlural}
                  </Dropdown.OptionItem>
                );
              })}
            </Dropdown.Section>
          </Dropdown.Content>
        </Dropdown.Root>

        <Dropdown.Root type="menu" multiple>
          <Dropdown.Trigger
            render={
              <Button
                variant="outline"
                size="sm"
                startIcon={<IconColumns />}
                endIcon={<IconChevronDown />}
              />
            }
          >
            {t`Fields`}
          </Dropdown.Trigger>
          <Dropdown.Content aria-label={t`Fields`} align="start">
            <Dropdown.Section scrollable>
              {eligibleFields.map((field) => {
                const FieldIcon = getIcon(field.icon);

                return (
                  <Dropdown.OptionItem
                    key={field.id}
                    selected={selectedFieldIds.includes(field.id)}
                    startIcon={<FieldIcon />}
                    onSelect={() => toggleField(field.id)}
                  >
                    {field.label}
                  </Dropdown.OptionItem>
                );
              })}
            </Dropdown.Section>
          </Dropdown.Content>
        </Dropdown.Root>

        <SegmentedControl<ObjectListDisplayMode>
          aria-label={t`Display`}
          size="sm"
          value={displayMode}
          onValueChange={(nextDisplayMode) =>
            updateConfiguration({ displayMode: nextDisplayMode })
          }
          options={[
            {
              value: 'LIST',
              startIcon: <IconList />,
              'aria-label': t`List`,
            },
            {
              value: 'TABLE',
              startIcon: <IconTable />,
              'aria-label': t`Table`,
            },
          ]}
        />

        <StyledCount>
          {t`${recordCount} ${objectMetadataItem.labelPlural}`}
        </StyledCount>
      </StyledToolbar>

      {loading && records.length === 0 ? (
        <Loader />
      ) : records.length === 0 ? (
        <StyledEmpty>{t`No records yet.`}</StyledEmpty>
      ) : selectedFields.length === 0 || !isDefined(titleField) ? (
        <StyledEmpty>{t`Pick at least one field.`}</StyledEmpty>
      ) : displayMode === 'TABLE' ? (
        <ObjectListTable
          fields={selectedFields}
          records={records}
          onOpenRecord={openRecord}
        />
      ) : (
        <ObjectListItems
          titleField={titleField}
          detailFields={selectedFields.filter(({ id }) => id !== titleField.id)}
          records={records}
          onOpenRecord={openRecord}
        />
      )}
      {records.length > 0 && (
        <StyledFooter>
          <span>{t`Showing ${shownCount} of ${recordCount}`}</span>
          {hasNextPage && (
            <Button
              variant="outline"
              size="sm"
              loading={isLoadingMore}
              onClick={loadMoreRecords}
            >
              {t`Load more`}
            </Button>
          )}
        </StyledFooter>
      )}
    </StyledContainer>
  );
};
