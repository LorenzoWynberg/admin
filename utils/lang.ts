import i18next from '@/config/i18next';

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const validationAttribute = (key: string, toUpper = false) => {
  const translation = i18next.t(`validation:attributes.${key}`);
  return toUpper ? capitalize(translation) : translation;
};

export const validationMessage = (
  key: string,
  attributeKey?: string,
  extra?: Record<string, unknown>
) =>
  i18next.t(`validation:${key}`, {
    ...(attributeKey ? { attribute: validationAttribute(attributeKey) } : {}),
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
