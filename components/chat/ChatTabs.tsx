'use client';

import { useTranslation } from 'react-i18next';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChatPanel } from './ChatPanel';
import { useChatUnread } from '@/hooks/chat/useChatUnread';

interface ChatTabsProps {
  orderPublicId: string;
  orderId: number;
  showDelivery?: boolean;
}

export function ChatTabs({
  orderPublicId,
  orderId,
  showDelivery,
}: ChatTabsProps) {
  const { t } = useTranslation();
  const { data: unread } = useChatUnread(orderPublicId);

  return (
    <Tabs defaultValue="support">
      <TabsList className="w-full">
        <TabsTrigger value="support" className="flex-1 gap-2">
          {t('chat:support', { defaultValue: 'Support' })}
          {(unread?.support ?? 0) > 0 && (
            <Badge
              variant="destructive"
              className="h-5 min-w-5 px-1 text-xs"
            >
              {unread?.support}
            </Badge>
          )}
        </TabsTrigger>
        {showDelivery && (
          <TabsTrigger value="delivery" className="flex-1 gap-2">
            {t('chat:delivery', { defaultValue: 'Delivery' })}
            {(unread?.delivery ?? 0) > 0 && (
              <Badge
                variant="destructive"
                className="h-5 min-w-5 px-1 text-xs"
              >
                {unread?.delivery}
              </Badge>
            )}
          </TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="support">
        <ChatPanel
          orderPublicId={orderPublicId}
          orderId={orderId}
          channel="support"
        />
      </TabsContent>
      {showDelivery && (
        <TabsContent value="delivery">
          <ChatPanel
            orderPublicId={orderPublicId}
            orderId={orderId}
            channel="delivery"
            isReadOnly
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
