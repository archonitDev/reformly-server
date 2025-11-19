import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('i18n', () => {
  const envVarsSchema = Joi.object()
    .keys({
      APP_LANGUAGE: Joi.string().valid('en', 'ru').default('en').required(),
    })
    .unknown();
  const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    appLanguage: envVars.APP_LANGUAGE,
    fallbackLanguage: 'en',
    fallbacks: {
      'en-*': 'en',
      en: 'en',
    },
    loaderOptions: {
      path: 'resources/i18n',
    },
  };
});
