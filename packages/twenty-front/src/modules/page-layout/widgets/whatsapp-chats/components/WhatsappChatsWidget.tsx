import { ActivityList } from '@/activities/components/ActivityList';
import { ActivityRow } from '@/activities/components/ActivityRow';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { WhatsappConversationMessages } from '@/page-layout/widgets/whatsapp-conversation/components/WhatsappConversationMessages';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowLeft, IconBrandWhatsapp } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  GetWhatsappChatsDocument,
  type GetWhatsappChatsQuery,
} from '~/generated-metadata/graphql';
import { formatToHumanReadableDate } from '~/utils/date-utils';

// New chats reach GOWA through its webhook, never the browser, so the list polls
const CHATS_POLL_INTERVAL_MS = 10_000;
const CHATS_LIMIT = 20;

type WhatsappChat = GetWhatsappChatsQuery['whatsappChats'][number];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledList = styled.div`
  container-type: inline-size;
  max-height: 480px;
  overflow-y: auto;
`;

// One line like the email card when there is room; name and date over the message in a narrow column
const StyledChatRow = styled.div`
  align-items: center;
  column-gap: ${themeCssVariables.spacing[2]};
  display: grid;
  flex: 1;
  grid-template-areas: 'avatar name body date logo';
  grid-template-columns: auto minmax(0, max-content) minmax(0, 1fr) auto auto;
  min-width: 0;

  @container (max-width: 460px) {
    grid-template-areas:
      'avatar name date'
      'avatar body logo';
    grid-template-columns: auto minmax(0, 1fr) auto;
    row-gap: 2px;
  }
`;

const StyledAvatar = styled.div`
  display: flex;
  grid-area: avatar;
`;

const StyledName = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  grid-area: name;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @container (max-width: 460px) {
    color: ${themeCssVariables.font.color.primary};
    max-width: none;
  }
`;

const StyledBody = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  grid-area: body;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledBodySender = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

const StyledReceivedAt = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  grid-area: date;
  justify-self: end;
  white-space: nowrap;
`;

const StyledChannelLogo = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  grid-area: logo;
  justify-self: end;
`;

const StyledChatHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledChatTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledChatPhone = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

const getChatDisplayName = (chat: WhatsappChat) =>
  isNonEmptyString(chat.name) ? chat.name : `+${chat.phoneNumber}`;

export const WhatsappChatsWidget = () => {
  const { t } = useLingui();
  const [openChat, setOpenChat] = useState<WhatsappChat | null>(null);

  const { data, loading, error } = useQuery(GetWhatsappChatsDocument, {
    variables: { limit: CHATS_LIMIT },
    pollInterval: CHATS_POLL_INTERVAL_MS,
    skip: isDefined(openChat),
  });

  if (isDefined(openChat)) {
    return (
      <StyledContainer>
        <StyledChatHeader>
          <Button
            variant="ghost"
            size="sm"
            startIcon={<IconArrowLeft />}
            onClick={() => setOpenChat(null)}
          >
            {t`All chats`}
          </Button>
          <div>
            <StyledChatTitle>{getChatDisplayName(openChat)}</StyledChatTitle>
            <StyledChatPhone>{`+${openChat.phoneNumber}`}</StyledChatPhone>
          </div>
        </StyledChatHeader>
        <WhatsappConversationMessages phoneNumber={openChat.phoneNumber} />
      </StyledContainer>
    );
  }

  if (loading && !isDefined(data)) {
    return <SkeletonLoader />;
  }

  const chats = data?.whatsappChats ?? [];

  return (
    <StyledContainer>
      {isDefined(error) && (
        <StyledError role="alert">{error.message}</StyledError>
      )}
      {isDefined(data) && chats.length === 0 && (
        <StyledEmpty>{t`No WhatsApp conversations yet.`}</StyledEmpty>
      )}
      {chats.length > 0 && (
        <StyledList>
          <ActivityList>
            {chats.map((chat, index) => {
              const displayName = getChatDisplayName(chat);

              return (
                <ActivityRow
                  key={chat.jid}
                  label={displayName}
                  divider={index < chats.length - 1}
                  onClick={() => setOpenChat(chat)}
                >
                  <StyledChatRow>
                    <StyledAvatar>
                      <Avatar
                        name={
                          isNonEmptyString(chat.name)
                            ? chat.name
                            : chat.phoneNumber
                        }
                        colorSeed={chat.jid}
                        shape="circle"
                      />
                    </StyledAvatar>
                    <StyledName>{displayName}</StyledName>
                    <StyledBody>
                      {chat.lastMessageIsFromMe && (
                        <StyledBodySender>{t`You:`} </StyledBodySender>
                      )}
                      {isNonEmptyString(chat.lastMessageContent)
                        ? chat.lastMessageContent
                        : isNonEmptyString(chat.lastMessageMediaType)
                          ? t`${chat.lastMessageMediaType} message`
                          : ''}
                    </StyledBody>
                    {isNonEmptyString(chat.lastMessageAt) && (
                      <StyledReceivedAt>
                        {formatToHumanReadableDate(chat.lastMessageAt)}
                      </StyledReceivedAt>
                    )}
                    <StyledChannelLogo>
                      <IconBrandWhatsapp size={16} />
                    </StyledChannelLogo>
                  </StyledChatRow>
                </ActivityRow>
              );
            })}
          </ActivityList>
        </StyledList>
      )}
    </StyledContainer>
  );
};
