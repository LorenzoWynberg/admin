import i18next from '@/config/i18next';

export const capitalize = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

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
 * Get translated status label.
 * @param status - The status key (e.g., 'pending', 'estimated')
 * @returns Translated status label
 */
export const statusLabel = (status: string | undefined): string => {
  if (!status) return i18next.t('statuses:unknown', { defaultValue: 'Unknown' });
  return i18next.t(`statuses:${status}`, { defaultValue: status });
};

/**
 * Get translated order status label.
 * @param status - The order status
 * @returns Translated status label
 */
export const orderStatusLabel = (status: string | undefined): string => {
  return statusLabel(status);
};

/**
 * Get translated action label (e.g., 'created', 'updated', 'deleted').
 * @param action - The action key
 * @returns Translated action label
 */
export const actionLabel = (action: string): string => {
  return i18next.t(`common:${action}`, { defaultValue: action });
};

/**
 * Get translated model label (e.g., 'catalog', 'catalog_element').
 * @param model - The model key
 * @param count - For pluralization (1 = singular, >1 = plural)
 * @returns Translated model label
 */
export const modelLabel = (model: string, count = 1): string => {
  return i18next.t(`models:${model}`, { count, defaultValue: model });
};
