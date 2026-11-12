import { styled } from '@linaria/react';
import { IconPencil } from 'twenty-ui/icon';
import { Text } from 'twenty-ui/primitives/typography';
import { type ThemeColor, themeCssVariables } from 'twenty-ui/theme';

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-width: 0;
  width: 100%;
`;

const StyledSwatch = styled.div<{ backgroundColor: string; dotColor: string }>`
  align-items: center;
  background: ${({ backgroundColor }) => backgroundColor};
  border-radius: ${themeCssVariables.border.radius.rounded};
  corner-shape: round;
  display: flex;
  height: 40px;
  justify-content: center;
  position: relative;
  width: 40px;

  &::after {
    background: ${({ dotColor }) => dotColor};
    border-radius: ${themeCssVariables.border.radius.rounded};
    content: '';
    corner-shape: round;
    height: 14px;
    width: 14px;
  }
`;

const StyledEditBadge = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.rounded};
  bottom: calc(-1 * ${themeCssVariables.spacing[1]});
  color: ${themeCssVariables.font.color.secondary};
  corner-shape: round;
  display: flex;
  height: 18px;
  justify-content: center;
  position: absolute;
  right: calc(-1 * ${themeCssVariables.spacing[1]});
  width: 18px;
`;

const StyledLabels = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  max-width: 100%;
  text-align: center;
`;

const StyledTextLine = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type FieldWidgetSelectTileContentProps = {
  color: ThemeColor;
  title: string;
  description: string;
  isCustomize?: boolean;
};

export const FieldWidgetSelectTileContent = ({
  color,
  title,
  description,
  isCustomize = false,
}: FieldWidgetSelectTileContentProps) => (
  <StyledContent>
    <StyledSwatch
      aria-hidden
      backgroundColor={
        themeCssVariables.tag.background[color] ??
        themeCssVariables.tag.background.gray
      }
      dotColor={
        themeCssVariables.tag.text[color] ?? themeCssVariables.tag.text.gray
      }
    >
      {isCustomize && (
        <StyledEditBadge>
          <IconPencil size={12} />
        </StyledEditBadge>
      )}
    </StyledSwatch>
    <StyledLabels>
      <Text
        render={<StyledTextLine />}
        size="md"
        color="primary"
        weight="medium"
      >
        {title}
      </Text>
      <Text render={<StyledTextLine />} size="sm" color="tertiary">
        {description}
      </Text>
    </StyledLabels>
  </StyledContent>
);
