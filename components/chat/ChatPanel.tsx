'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChatMessages } from '@/hooks/chat/useChatMessages';
import { useSendMessage } from '@/hooks/chat/useSendMessage';
import { useMarkRead } from '@/hooks/chat/useMarkRead';
import { useChatBroadcast } from '@/hooks/chat/useChatBroadcast';
import { useAuthStore } from '@/stores/useAuthStore';
import { Loader2 } from 'lucide-react';

type OrderMessageData = App.Data.Chat.OrderMessageData;

interface ChatPanelProps {
  orderPublicId: string;
  orderId: number;
  channel: string;
  isReadOnly?: boolean;
}

export function ChatPanel({ orderPublicId, orderId, channel, isReadOnly }: ChatPanelProps) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useChatMessages(
    orderPublicId,
    channel
  );
  const sendMessage = useSendMessage(orderPublicId, channel);
  const markRead = useMarkRead(orderPublicId, channel);

  useChatBroadcast(orderId, channel);

  // Flatten and reverse messages (API returns newest first, we display oldest first)
  const messages: OrderMessageData[] = (data?.pages ?? []).flat().reverse();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Mark read on mount and when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.userId !== user?.id) {
        markRead.mutate(lastMessage.id);
      }
    }
  }, [messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback(
    (data: { body?: string; image?: File }) => {
      sendMessage.mutate(data);
    },
    [sendMessage]
  );

  return (
    <div className="flex h-[400px] flex-col">
      <ScrollArea viewportRef={scrollRef} className="flex-1 p-4">
        {hasNextPage && (
          <div className="mb-4 flex justify-center">
            <button
              type="button"
              className="text-muted-foreground text-xs hover:underline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage
                ? t('common:loading', { defaultValue: 'Loading...' })
                : t('common:load_more', { defaultValue: 'Load more' })}
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground text-sm">
              {t('chat:no_messages', { defaultValue: 'No messages yet' })}
            </p>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} isOwn={message.userId === user?.id} />
        ))}
      </ScrollArea>

      {!isReadOnly && <ChatInput onSend={handleSend} disabled={sendMessage.isPending} />}

      {isReadOnly && (
        <div className="border-t p-3 text-center">
          <p className="text-muted-foreground text-xs">
            {t('chat:admin_read_only', {
              defaultValue: 'Read-only for admins',
            })}
          </p>
        </div>
      )}
    </div>
  );
}
