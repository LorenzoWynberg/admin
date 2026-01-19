import { useTranslation } from 'react-i18next';
import { modelLabel, actionLabel } from '@/utils/lang';
import { buildUrl } from '@/utils/http';

type NotificationData = App.Data.NotificationData;

export interface NotifData {
  action?: string;
  model?: string;
  model_id?: number | null;
  model_name?: string | null;
  catalog_id?: number | null;
}

/**
 * Route config for each notification model type.
 * Add new models here to define their navigation behavior.
 */
export const notificationRoutes: Record<string, (data: NotifData) => string | null> = {
  catalog: (data) => (data.model_id ? `/catalogs/${data.model_id}` : null),
  element: (data) =>
    data.catalog_id ? buildUrl(`/catalogs/${data.catalog_id}`, { element: data.model_id }) : null,
  order: (data) => (data.model_name ? `/orders/${data.model_name}` : null),
  user: (data) => (data.model_id ? `/users/${data.model_id}` : null),
  business: (data) => (data.model_id ? `/businesses/${data.model_id}` : null),
  driver: (data) => (data.model_id ? `/drivers/${data.model_id}` : null),
};

/**
 * Get the navigation URL for a notification.
 */
export function getNotificationUrl(data: NotifData): string | null {
  return notificationRoutes[data.model || '']?.(data) ?? null;
}

/**
 * Extract notification data from the notification object.
 */
export function getNotificationData(notification: NotificationData): NotifData {
  const data = Array.isArray(notification.data) ? notification.data[0] : notification.data;
  return data as NotifData;
}

/**
 * Hook providing notification translation helpers.
 */
export function useNotificationHelpers() {
  const { t } = useTranslation();

  // Title: "Catalog was updated" using resource:success.was_actioned
  const getTitle = (data: NotifData): string => {
    const model = data.model || 'catalog';
    const action = data.action || 'updated';
    return t('resource:success.was_actioned', {
      resource: modelLabel(model),
      action: actionLabel(action),
      defaultValue: `${modelLabel(model)} was ${actionLabel(action)}`,
    });
  };

  // Message: 'Name was created' = resource:success.was_actioned with interpolation
  const getMessage = (data: NotifData): string => {
    const action = data.action || 'updated';
    const resource = data.model_name || t('common:unknown', { defaultValue: 'Unknown' });
    const actionText = actionLabel(action).toLowerCase();
    return t('resource:success.was_actioned', {
      resource,
      action: actionText,
      defaultValue: `${resource} was ${actionText}`,
    });
  };

  return {
    getTitle,
    getMessage,
    getModelLabel: modelLabel,
    getActionLabel: actionLabel,
  };
}
