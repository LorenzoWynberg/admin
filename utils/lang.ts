import i18next from '@/config/i18next';

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const validationAttribute = (key: string, toUpper = true) => {
  const translation = i18next.t(`validation:attributes.${key}`);
  return toUpper ? capitalize(translation) : translation;
};

export const validationMessage = (
  key: string,
  attributeKey?: string,
  extra?: Record<string, unknown>
) =>
  i18next.t(`validation:${key}`, {
    ...(attributeKey ? { attribute: validationAttribute(attributeKey, false) } : {}),
    ...(extra ?? {}),
  });

export const resourceMessage = (
  key: string,
  resourceKey: string,
  count = 1,
  extra?: Record<string, unknown>
) => {
  const translatedResourceKey = i18next.t(`models:${resourceKey}`, { count });

  return i18next.t(`resource:${key}`, {
    count,
    resource: translatedResourceKey,
    ...(extra ?? {}),
  });
};

export const crudSuccessMessage = (
  action: string,
  resourceKey: string,
  count = 1,
  extra?: Record<string, unknown>
) => {
  const key = `success.${action}`;
  return resourceMessage(key, resourceKey, count, extra);
};

export const crudErrorMessage = (
  action: string,
  resourceKey: string,
  count = 1,
  extra?: Record<string, unknown>
) => {
  const key = `error.${action}`;
  return resourceMessage(key, resourceKey, count, extra);
};

/**
 * Get translated status label with optional model interpolation.
 * @param status - The status key (e.g., 'pending', 'estimated')
 * @param modelKey - Optional model key for interpolation (e.g., 'quote', 'driver')
 * @returns Translated status label
 */
export const statusLabel = (status: string | undefined, modelKey?: string): string => {
  if (!status) return i18next.t('statuses:unknown', { defaultValue: 'Unknown' });

  if (modelKey) {
    const Model = i18next.t(`models:${modelKey}`, { defaultValue: modelKey });
    return i18next.t(`statuses:model.${status}`, { Model, defaultValue: status });
  }

  return i18next.t(`statuses:${status}`, { defaultValue: status });
};

// Status-specific model keys for order context
const orderStatusModels: Record<string, string> = {
  estimated: 'quote',
  assigned: 'driver',
};

/**
 * Get translated order status label with appropriate model interpolation.
 * Handles estimated → "Quote Ready", assigned → "Driver Assigned" automatically.
 * @param status - The order status
 * @returns Translated status label
 */
export const orderStatusLabel = (status: string | undefined): string => {
  const modelKey = status ? orderStatusModels[status] : undefined;
  return statusLabel(status, modelKey);
};
