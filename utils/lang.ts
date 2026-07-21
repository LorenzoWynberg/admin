import i18next from '@/config/i18next';

/**
 * Get the grammatical gender context for a model in the current locale.
 * Returns 'feminine' for feminine nouns, undefined for masculine (default).
 */
export const getModelGender = (model: string): string | undefined => {
  const gender = i18next.t(`models:_gender.${model}`);
  return gender === 'f' ? 'feminine' : undefined;
};

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
  const context = getModelGender(resourceKey);

  return i18next.t(`resource:${key}`, {
    count,
    context,
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
 * Get translated action label (e.g., 'created', 'updated', 'deleted').
 * @param action - The action key
 * @returns Translated action label
 */
export const actionLabel = (action: string, model?: string, toUpper = true): string => {
  const context = model ? getModelGender(model) : undefined;
  const label = i18next.t(`common:actions.${action}`, { context, defaultValue: action });
  return toUpper ? capitalize(label) : label;
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

/**
 * Get translated vehicle type label (e.g., 'motorcycle', 'pickup_van').
 * @param vehicleType - The vehicle type key
 * @returns Translated vehicle type label
 */
export const vehicleTypeLabel = (vehicleType: string | null | undefined): string => {
  if (!vehicleType) return i18next.t('common:none', { defaultValue: 'None' });
  return i18next.t(`orders:vehicle_types.${vehicleType}`, { defaultValue: vehicleType });
};

/**
 * Get translated dispatch policy label (e.g., 'auto', 'manual_only').
 * @param dispatchPolicy - The dispatch policy key
 * @returns Translated dispatch policy label
 */
export const dispatchPolicyLabel = (dispatchPolicy: string | null | undefined): string => {
  if (!dispatchPolicy) return i18next.t('common:none', { defaultValue: 'None' });
  return i18next.t(`drivers:dispatch_policies.${dispatchPolicy}`, { defaultValue: dispatchPolicy });
};
