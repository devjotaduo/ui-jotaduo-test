import { groupWhatsappMessagesByDay } from '@/page-layout/widgets/whatsapp-conversation/utils/groupWhatsappMessagesByDay';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconSend } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Button, Input } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  GetWhatsappMessagesDocument,
  SendWhatsappMessageDocument,
} from '~/generated-metadata/graphql';

// GOWA pushes incoming messages to a webhook, not to the browser, so the widget polls
const MESSAGES_POLL_INTERVAL_MS = 5000;
const MESSAGES_LIMIT = 50;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledMessages = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  max-height: 480px;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledDay = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing[2]} 0;
  text-align: center;
`;

const StyledBubble = styled.div<{ isFromMe: boolean }>`
  align-self: ${({ isFromMe }) => (isFromMe ? 'flex-end' : 'flex-start')};
  background: ${({ isFromMe }) =>
    isFromMe
      ? themeCssVariables.accent.accent3
      : themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  max-width: 80%;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledDayMessages = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledMedia = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-style: italic;
`;

const StyledTime = styled.span`
  align-self: flex-end;
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  margin: auto;
  text-align: center;
`;

const StyledComposer = styled.form`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledComposerInput = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

type WhatsappConversationMessagesProps = {
  phoneNumber: string;
};

export const WhatsappConversationMessages = ({
  phoneNumber,
}: WhatsappConversationMessagesProps) => {
  const { t, i18n } = useLingui();
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, loading, error, refetch } = useQuery(
    GetWhatsappMessagesDocument,
    {
      variables: { phoneNumber, limit: MESSAGES_LIMIT },
      pollInterval: MESSAGES_POLL_INTERVAL_MS,
    },
  );

  const [sendMessage, { loading: isSending, error: sendError }] = useMutation(
    SendWhatsappMessageDocument,
  );

  const messages = data?.whatsappMessages ?? [];
  const lastMessageId = messages.at(-1)?.id;

  // Scrolling the list is DOM work that has to follow the render that added the message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [lastMessageId]);

  const handleSend = async () => {
    if (!isNonEmptyString(draft.trim())) {
      return;
    }

    const submittedDraft = draft;
    const result = await sendMessage({
      variables: { phoneNumber, message: submittedDraft },
    }).catch(() => null);

    if (result?.data?.sendWhatsappMessage === true) {
      // Text typed while the request was pending is the next message, not the one just sent
      setDraft((currentDraft) =>
        currentDraft === submittedDraft ? '' : currentDraft,
      );
      await refetch();
    }
  };

  const timeFormat = new Intl.DateTimeFormat(i18n.locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dayFormat = new Intl.DateTimeFormat(i18n.locale, {
    dateStyle: 'medium',
  });

  return (
    <StyledContainer>
      <StyledMessages aria-label={t`WhatsApp messages`} role="log">
        {loading && !isDefined(data) && <Loader />}
        {isDefined(data) && messages.length === 0 && (
          <StyledEmpty>{t`No messages with this number yet.`}</StyledEmpty>
        )}
        {groupWhatsappMessagesByDay(messages).map((day) => (
          <StyledDayMessages key={day.dayKey}>
            <StyledDay>
              {Number.isNaN(day.date.getTime())
                ? ''
                : dayFormat.format(day.date)}
            </StyledDay>
            {day.messages.map((message) => (
              <StyledBubble key={message.id} isFromMe={message.isFromMe}>
                {isNonEmptyString(message.content) ? (
                  message.content
                ) : (
                  <StyledMedia>
                    {isNonEmptyString(message.mediaType)
                      ? t`${message.mediaType} message`
                      : t`Unsupported message`}
                  </StyledMedia>
                )}
                {!Number.isNaN(Date.parse(message.timestamp)) && (
                  <StyledTime>
                    {timeFormat.format(new Date(message.timestamp))}
                  </StyledTime>
                )}
              </StyledBubble>
            ))}
          </StyledDayMessages>
        ))}
        <div ref={messagesEndRef} />
      </StyledMessages>
      {isDefined(error) && (
        <StyledError role="alert">{error.message}</StyledError>
      )}
      {isDefined(sendError) && (
        <StyledError role="alert">{sendError.message}</StyledError>
      )}
      <StyledComposer
        onSubmit={(event) => {
          event.preventDefault();
          handleSend();
        }}
      >
        <StyledComposerInput>
          <Input
            aria-label={t`Message`}
            placeholder={t`Write a message`}
            size="sm"
            value={draft}
            onValueChange={setDraft}
          />
        </StyledComposerInput>
        <Button
          type="submit"
          variant="solid"
          color="accent"
          size="sm"
          startIcon={<IconSend />}
          loading={isSending}
          loadingPosition="start"
          disabled={!isNonEmptyString(draft.trim())}
        >
          {t`Send`}
        </Button>
      </StyledComposer>
    </StyledContainer>
  );
};
