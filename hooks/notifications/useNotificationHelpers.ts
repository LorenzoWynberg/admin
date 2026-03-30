import { useTranslation } from 'react-i18next';
import { modelLabel, actionLabel } from '@/utils/lang';
import { buildUrl } from '@/utils/http';

type NotificationData = App.Data.NotificationData;

export interface NotifData {
  action?: string;
  model?: string;
  modelId?: number | null;
  modelPublicId?: string | null;
  modelName?: string | null;
  catalogId?: number | null;
  translationKey?: string;
  translationParams?: Record<string, string>;
  /** @deprecated Pre-translated message from old notifications */
  message?: string;
}

/**
 * Route config for each notification model type.
 * Add new models here to define their navigation behavior.
 */
export const notificationRoutes: Record<string, (data: NotifData) => string | null> = {
  catalog: (data) => (data.modelId ? `/catalogs/${data.modelId}` : null),
  element: (data) =>
    data.catalogId ? buildUrl(`/catalogs/${data.catalogId}`, { element: data.modelId }) : null,
  order: (data) =>
    (data.modelPublicId ?? data.modelName)
      ? `/orders/${data.modelPublicId ?? data.modelName}`
      : null,
  user: (data) => (data.modelPublicId ? `/users/${data.modelPublicId}` : null),
  business: (data) => (data.modelPublicId ? `/businesses/${data.modelPublicId}` : null),
  driver: (data) => (data.modelPublicId ? `/drivers/${data.modelPublicId}` : null),
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

  // Title: use translationKey if available, fall back to CRUD pattern
  const getTitle = (data: NotifData): string => {
    if (data.translationKey) {
      return t(data.translationKey, {
        ...data.translationParams,
        defaultValue: data.translationKey,
      });
    }

    // Backward compat: old records with pre-translated message
    if (data.message) {
      return data.message;
    }

    // CRUD pattern: "Catalog was updated"
    const model = data.model || 'catalog';
    const action = data.action || 'updated';
    return t('resource:success.was_actioned', {
      resource: modelLabel(model),
      action: actionLabel(action),
      defaultValue: `${modelLabel(model)} was ${actionLabel(action)}`,
    });
  };

  // Message: model context for business notifications, CRUD pattern for others
  const getMessage = (data: NotifData): string => {
    if (data.translationKey) {
      // For business notifications with translationKey, show model context
      if (data.modelName) {
        return data.modelName;
      }
      return '';
    }

    // Backward compat: old records with pre-translated message
    if (data.message) {
      return data.message;
    }

    // CRUD pattern: "My Catalog was updated"
    const action = data.action || 'updated';
    const resource = data.modelName || t('common:unknown', { defaultValue: 'Unknown' });
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
