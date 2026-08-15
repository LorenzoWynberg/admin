'use client';

import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChatPanel } from './ChatPanel';
import { useChatUnread } from '@/hooks/chat/useChatUnread';
import { Enums } from '@/data/app-enums';

interface ChatTabsProps {
  orderPublicId: string;
  orderId: number;
  /** Delivery and dispatch only exist once the order has a driver assigned. */
  showDelivery?: boolean;
}

export function ChatTabs({ orderPublicId, orderId, showDelivery }: ChatTabsProps) {
  const { t } = useTranslation();
  const { data: unread } = useChatUnread(orderPublicId);

  const channels = [
    {
      value: Enums.ChatChannel.Support,
      label: t('chat:support', { defaultValue: 'Support' }),
      isReadOnly: false,
      show: true,
    },
    {
      value: Enums.ChatChannel.Dispatch,
      label: t('chat:dispatch', { defaultValue: 'Dispatch' }),
      isReadOnly: false,
      show: !!showDelivery,
    },
    {
      // The customer's conversation with their driver: admins observe it but
      // reply to the driver on the dispatch channel instead.
      value: Enums.ChatChannel.Delivery,
      label: t('chat:delivery', { defaultValue: 'Delivery' }),
      isReadOnly: true,
      show: !!showDelivery,
    },
  ].filter((channel) => channel.show);

  return (
    <Tabs defaultValue={Enums.ChatChannel.Support}>
      <TabsList className="w-full">
        {channels.map((channel) => (
          <TabsTrigger key={channel.value} value={channel.value} className="flex-1 gap-2">
            {channel.label}
            {(unread?.[channel.value] ?? 0) > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 px-1 text-xs">
                {unread?.[channel.value]}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {channels.map((channel) => (
        <TabsContent key={channel.value} value={channel.value}>
          <ChatPanel
            orderPublicId={orderPublicId}
            orderId={orderId}
            channel={channel.value}
            isReadOnly={channel.isReadOnly}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
