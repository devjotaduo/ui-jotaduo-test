import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

export const STANDALONE_RECORD_PAGE_AVAILABILITY_SUFFIX =
  ' and not isStandaloneRecordPage';

// Paging through the list and one-click (un)pinning make no sense on a record opened as a page of its own
export const ENGINE_COMPONENT_KEYS_HIDDEN_ON_STANDALONE_RECORD_PAGE = [
  EngineComponentKey.NAVIGATE_TO_NEXT_RECORD,
  EngineComponentKey.NAVIGATE_TO_PREVIOUS_RECORD,
  EngineComponentKey.ADD_TO_FAVORITES,
  EngineComponentKey.REMOVE_FROM_FAVORITES,
] as const;

export const buildHideListCommandsOnStandaloneRecordPageUpdates = ({
  flatCommandMenuItemMaps,
  now,
}: {
  flatCommandMenuItemMaps: Pick<
    FlatEntityMaps<FlatCommandMenuItem>,
    'byUniversalIdentifier'
  >;
  now: string;
}): FlatCommandMenuItem[] =>
  ENGINE_COMPONENT_KEYS_HIDDEN_ON_STANDALONE_RECORD_PAGE.flatMap(
    (engineComponentKey) => {
      const standardCommandMenuItem = Object.values(
        STANDARD_COMMAND_MENU_ITEMS,
      ).find((item) => item.engineComponentKey === engineComponentKey);

      const nextExpression =
        standardCommandMenuItem?.conditionalAvailabilityExpression;

      if (
        !isDefined(standardCommandMenuItem) ||
        !isDefined(nextExpression) ||
        !nextExpression.endsWith(STANDALONE_RECORD_PAGE_AVAILABILITY_SUFFIX)
      ) {
        return [];
      }

      const previousExpression = nextExpression.slice(
        0,
        -STANDALONE_RECORD_PAGE_AVAILABILITY_SUFFIX.length,
      );

      const commandMenuItem =
        flatCommandMenuItemMaps.byUniversalIdentifier[
          standardCommandMenuItem.universalIdentifier
        ];

      // Leave customized or already migrated commands alone
      if (
        !isDefined(commandMenuItem) ||
        commandMenuItem.applicationUniversalIdentifier !==
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER ||
        commandMenuItem.conditionalAvailabilityExpression !== previousExpression
      ) {
        return [];
      }

      return [
        {
          ...commandMenuItem,
          conditionalAvailabilityExpression: nextExpression,
          updatedAt: now,
        },
      ];
    },
  );
