# Notifications System - Admin Plan

Real-time notification bell with dropdown showing persistent notifications from the API.

## Overview

- **Display**: Bell icon in header with unread badge
- **Dropdown**: List of recent notifications with mark as read
- **Real-time**: Listen to private channel for instant updates
- **Toast**: Show Sonner toast when new notification arrives

---

## Components

### NotificationBell

Bell icon with unread count badge, triggers dropdown.

```tsx
// components/notifications/NotificationBell.tsx
export function NotificationBell() {
  const unreadCount = useUnreadCount();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationDropdown onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
```

### NotificationDropdown

List of notifications with actions.

```tsx
// components/notifications/NotificationDropdown.tsx
export function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const { data, isLoading } = useNotifications();
  const { markAsRead, markAllAsRead } = useNotificationMutations();

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <h4 className="font-semibold">Notifications</h4>
        <Button variant="ghost" size="sm" onClick={() => markAllAsRead.mutate()}>
          Mark all read
        </Button>
      </div>

      <ScrollArea className="h-80">
        {data?.data.length === 0 ? (
          <div className="text-muted-foreground p-4 text-center">No notifications</div>
        ) : (
          data?.data.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={() => markAsRead.mutate(notification.id)}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}
```

### NotificationItem

Single notification row.

```tsx
// components/notifications/NotificationItem.tsx
export function NotificationItem({ notification, onMarkRead }) {
  return (
    <div
      className={cn(
        'hover:bg-muted/50 cursor-pointer border-b p-4',
        !notification.read_at && 'bg-blue-50 dark:bg-blue-950/20'
      )}
      onClick={onMarkRead}
    >
      <div className="flex items-start gap-3">
        <NotificationIcon type={notification.data.model} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{notification.data.title}</p>
          <p className="text-muted-foreground truncate text-sm">{notification.data.message}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {formatRelativeTime(notification.created_at)}
          </p>
        </div>
        {!notification.read_at && <div className="h-2 w-2 rounded-full bg-blue-500" />}
      </div>
    </div>
  );
}
```

---

## Service

```typescript
// services/notificationService.ts
export const Notifications = {
  async list(params?: { unread_only?: boolean; per_page?: number }) {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  async markAsRead(id: string) {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};
```

---

## Hooks

### useNotifications

```typescript
// hooks/notifications/useNotifications.ts
export function useNotifications(params?: { unread_only?: boolean }) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => Notifications.list(params),
    refetchInterval: 30000, // Refetch every 30s as fallback
  });
}

export function useUnreadCount() {
  const { data } = useNotifications();
  return data?.meta?.unread_count ?? 0;
}
```

### useNotificationMutations

```typescript
// hooks/notifications/useNotificationMutations.ts
export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const markAsRead = useMutation({
    mutationFn: Notifications.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: Notifications.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return { markAsRead, markAllAsRead };
}
```

---

## Real-time Updates

### useNotificationBroadcast

Listen to private user channel for new notifications:

```typescript
// hooks/notifications/useNotificationBroadcast.ts
export function useNotificationBroadcast() {
  const echo = useEcho();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!echo || !user) return;

    const channel = echo.private(`App.Models.User.${user.id}`);

    channel.notification((notification: NotificationData) => {
      // Show toast
      toast(notification.data.title, {
        description: notification.data.message,
      });

      // Refresh notifications list
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => {
      echo.leave(`App.Models.User.${user.id}`);
    };
  }, [echo, user, queryClient]);
}
```

---

## Header Integration

Add NotificationBell to Header, before the user avatar:

```tsx
// components/layout/Header.tsx
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function Header() {
  // ... existing code

  return (
    <header className="...">
      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <NotificationBell /> {/* Add this */}
        <DropdownMenu>{/* ... existing user menu */}</DropdownMenu>
      </div>
    </header>
  );
}
```

---

## Types

```typescript
// types/notification.d.ts
interface NotificationData {
  id: string;
  type: string;
  data: {
    action: string;
    model: string;
    model_id: number | null;
    model_name: string | null;
    title: string;
    message: string;
  };
  read_at: string | null;
  created_at: string;
}

interface NotificationsResponse {
  data: NotificationData[];
  meta: {
    unread_count: number;
  };
}
```

---

## Files to Create

- [ ] Create: `services/notificationService.ts`
- [ ] Create: `hooks/notifications/index.ts`
- [ ] Create: `hooks/notifications/useNotifications.ts`
- [ ] Create: `hooks/notifications/useNotificationMutations.ts`
- [ ] Create: `hooks/notifications/useNotificationBroadcast.ts`
- [ ] Create: `components/notifications/NotificationBell.tsx`
- [ ] Create: `components/notifications/NotificationDropdown.tsx`
- [ ] Create: `components/notifications/NotificationItem.tsx`
- [ ] Modify: `components/layout/Header.tsx` - add NotificationBell
- [ ] Modify: `providers/EchoProvider.tsx` - add useNotificationBroadcast

---

## UI Components Needed

From shadcn/ui:

- `Popover` - for dropdown
- `ScrollArea` - for scrollable notification list
- `Button` - already have

```bash
npx shadcn@latest add popover scroll-area
```

---

## Future Enhancements

- Notification preferences/settings
- Filter by type (orders, catalogs, etc.)
- Sound on new notification
- Desktop push notifications (via Service Worker)
