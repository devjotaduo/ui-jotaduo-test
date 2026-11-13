import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { FieldWidgetSelectTileContent } from '@/page-layout/widgets/field/components/FieldWidgetSelectTileContent';
import { ThemeColorPickerMenu } from '@/ui/input/components/ThemeColorPickerMenu';
import { useColorLabels } from '@/ui/input/hooks/useColorLabels';
import { isKeyboardEventComposing } from '@/ui/utilities/hotkey/utils/isKeyboardEventComposing';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconColorSwatch } from 'twenty-ui/icon';
import { ColorSample } from 'twenty-ui/primitives/data-display';
import { Input } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledNameRow = styled.div`
  padding: ${themeCssVariables.spacing[1]};
`;

type FieldWidgetSelectTilesCustomizeProps = {
  option: FieldMetadataItemOption;
  onChange: (
    patch: Partial<Pick<FieldMetadataItemOption, 'label' | 'color'>>,
  ) => void;
};

export const FieldWidgetSelectTilesCustomize = ({
  option,
  onChange,
}: FieldWidgetSelectTilesCustomizeProps) => {
  const { t } = useLingui();
  const colorLabels = useColorLabels();
  const [draftLabel, setDraftLabel] = useState(option.label);

  const commitLabel = () => {
    const trimmedLabel = draftLabel.trim();

    if (trimmedLabel.length > 0 && trimmedLabel !== option.label) {
      onChange({ label: trimmedLabel });
    }
  };

  return (
    <Dropdown.Root type="panel">
      <Dropdown.Trigger
        aria-label={t`Customize option`}
        render={
          <Card.Root
            render={<button type="button" />}
            borderStyle="dashed"
            fullWidth
          >
            <Card.Content>
              <FieldWidgetSelectTileContent
                color={option.color}
                title={t`Customize`}
                description={t`Name, color`}
                isCustomize
              />
            </Card.Content>
          </Card.Root>
        }
      />
      <Dropdown.Content
        aria-label={t`Customize option`}
        width={240}
        align="end"
        sideOffset={4}
      >
        <Dropdown.Page id="root">
          <Dropdown.Section>
            <StyledNameRow>
              <Input
                key={option.id}
                aria-label={t`Option name`}
                size="sm"
                value={draftLabel}
                onValueChange={setDraftLabel}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !isKeyboardEventComposing(event.nativeEvent)
                  ) {
                    event.currentTarget.blur();
                  }
                }}
                onBlur={commitLabel}
              />
            </StyledNameRow>
          </Dropdown.Section>
          <Dropdown.Separator />
          <Dropdown.Section>
            <Dropdown.ActionItem
              page="color"
              startIcon={<IconColorSwatch />}
              description={colorLabels[option.color]}
              descriptionPlacement="end"
            >
              {t`Color`}
            </Dropdown.ActionItem>
          </Dropdown.Section>
        </Dropdown.Page>
        <Dropdown.Page id="color" type="menu">
          <Dropdown.Back aria-label={t`Back to customization`}>
            <ColorSample colorName={option.color} variant="circle" />
            {t`Color`}
          </Dropdown.Back>
          <ThemeColorPickerMenu
            selectedColor={option.color}
            onSelectColor={(color) => onChange({ color })}
          />
        </Dropdown.Page>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
