import { I18nContext } from 'nestjs-i18n';

export const StringErrorMessage = () => {
  const i18n = I18nContext.current();
  return i18n.t('errors.field-invalid.should-be-string');
};

export const StrongPasswordErrorMessage = () => {
  const i18n = I18nContext.current();
  return i18n.t('errors.field-invalid.should-be-strong-password');
};

export const EmailErrorMessage = () => {
  const i18n = I18nContext.current();
  return i18n.t('errors.field-invalid.should-be-email');
};

export const UuidErrorMessage = () => {
  const i18n = I18nContext.current();
  return i18n.t('errors.field-invalid.should-be-uuid');
};

export const EnumErrorMessage = () => {
  const i18n = I18nContext.current();
  return i18n.t('errors.field-invalid.should-be-enum');
};

export const NumberErrorMessage = () => {
  const i18n = I18nContext.current();
  return i18n.t('errors.field-invalid.should-be-number');
};
