'use client';

import { formatDistanceToNow } from 'date-fns';

type OrderMessageData = App.Data.Chat.OrderMessageData;

interface ChatMessageProps {
  message: OrderMessageData;
  isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isOwn
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        }`}
      >
        {!isOwn && message.user && (
          <p className="text-xs font-semibold mb-1 opacity-70">
            {message.user.name}
          </p>
        )}
        {message.body && (
          <p className="text-sm whitespace-pre-wrap">{message.body}</p>
        )}
        {message.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.imageUrl}
            alt="attachment"
            className="mt-2 max-w-full rounded-lg max-h-60 object-cover"
          />
        )}
        <p
          className={`text-[10px] mt-1 ${isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}
        >
          {formatDistanceToNow(new Date(message.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
    </div>
  );
}
