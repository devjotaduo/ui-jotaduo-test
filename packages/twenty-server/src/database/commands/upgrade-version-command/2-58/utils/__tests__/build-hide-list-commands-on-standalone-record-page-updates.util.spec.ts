import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';

import {
  buildHideListCommandsOnStandaloneRecordPageUpdates,
  STANDALONE_RECORD_PAGE_AVAILABILITY_SUFFIX,
} from 'src/database/commands/upgrade-version-command/2-58/utils/build-hide-list-commands-on-standalone-record-page-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NOW = '2026-11-12T12:00:00.000Z';
const CREATED_AT = '2026-01-01T00:00:00.000Z';

const HIDDEN_STANDARD_ITEMS = [
  STANDARD_COMMAND_MENU_ITEMS.navigateToNextRecord,
  STANDARD_COMMAND_MENU_ITEMS.navigateToPreviousRecord,
  STANDARD_COMMAND_MENU_ITEMS.addToFavorites,
  STANDARD_COMMAND_MENU_ITEMS.removeFromFavorites,
];

const removeSuffix = (expression: string) =>
  expression.slice(0, -STANDALONE_RECORD_PAGE_AVAILABILITY_SUFFIX.length);

// Stored rows as they were before this change
const buildStoredCommandMenuItem = (
  standardItem: (typeof HIDDEN_STANDARD_ITEMS)[number],
): FlatCommandMenuItem => ({
  workspaceId: '20202020-1111-4111-8111-111111111111',
  applicationId: '20202020-2222-4222-8222-222222222222',
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  id: `${standardItem.universalIdentifier}-id`,
  universalIdentifier: standardItem.universalIdentifier,
  label: 'Label',
  shortLabel: null,
  icon: standardItem.icon,
  position: standardItem.position,
  isPinned: standardItem.isPinned,
  isActive: true,
  isSystemSideEffect: false,
  engineComponentKey: standardItem.engineComponentKey,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  conditionalAvailabilityExpression: removeSuffix(
    standardItem.conditionalAvailabilityExpression ?? '',
  ),
  conditionalPinnedExpression: null,
  availabilityCoreObjectName: null,
  availabilityObjectMetadataId: null,
  availabilityObjectMetadataUniversalIdentifier: null,
  navigationTargetObjectMetadataId: null,
  navigationTargetObjectMetadataUniversalIdentifier: null,
  frontComponentId: null,
  frontComponentUniversalIdentifier: null,
  pageLayoutId: null,
  pageLayoutUniversalIdentifier: null,
  workflowVersionId: null,
  coreWorkflowVersionId: null,
  hotKeys: null,
  payload: null,
  overrides: null,
  universalOverrides: null,
});

const buildMaps = (
  commandMenuItems: FlatCommandMenuItem[],
): FlatEntityMaps<FlatCommandMenuItem> => ({
  ...createEmptyFlatEntityMaps(),
  byUniversalIdentifier: Object.fromEntries(
    commandMenuItems.map((item) => [item.universalIdentifier, item]),
  ),
});

describe('buildHideListCommandsOnStandaloneRecordPageUpdates', () => {
  it('should hide the four list commands in the standard definitions', () => {
    for (const standardItem of HIDDEN_STANDARD_ITEMS) {
      expect(standardItem.conditionalAvailabilityExpression).toMatch(
        new RegExp(`${STANDALONE_RECORD_PAGE_AVAILABILITY_SUFFIX}$`),
      );
    }
  });

  it('should append the standalone condition to stored commands', () => {
    const storedItems = HIDDEN_STANDARD_ITEMS.map(buildStoredCommandMenuItem);

    expect(
      buildHideListCommandsOnStandaloneRecordPageUpdates({
        flatCommandMenuItemMaps: buildMaps(storedItems),
        now: NOW,
      }),
    ).toEqual(
      storedItems.map((item, index) => ({
        ...item,
        conditionalAvailabilityExpression:
          HIDDEN_STANDARD_ITEMS[index].conditionalAvailabilityExpression,
        updatedAt: NOW,
      })),
    );
  });

  it('should skip commands already updated', () => {
    const storedItems = HIDDEN_STANDARD_ITEMS.map((standardItem) => ({
      ...buildStoredCommandMenuItem(standardItem),
      conditionalAvailabilityExpression:
        standardItem.conditionalAvailabilityExpression,
    }));

    expect(
      buildHideListCommandsOnStandaloneRecordPageUpdates({
        flatCommandMenuItemMaps: buildMaps(storedItems),
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('should skip customized commands and commands from other applications', () => {
    const [nextRecord, previousRecord] = HIDDEN_STANDARD_ITEMS;

    expect(
      buildHideListCommandsOnStandaloneRecordPageUpdates({
        flatCommandMenuItemMaps: buildMaps([
          {
            ...buildStoredCommandMenuItem(nextRecord),
            conditionalAvailabilityExpression: 'pageType == "RECORD_PAGE"',
          },
          {
            ...buildStoredCommandMenuItem(previousRecord),
            applicationUniversalIdentifier:
              '20202020-3333-4333-8333-333333333333',
          },
        ]),
        now: NOW,
      }),
    ).toEqual([]);
  });
});
