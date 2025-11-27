import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('storage', () => {
  const envVarsSchema = Joi.object({
    STORAGE_DRIVER: Joi.string().valid('minio', 's3').default('minio'),
    STORAGE_ENDPOINT: Joi.string().uri({ allowRelative: false }).required(),
    STORAGE_REGION: Joi.string().allow('').default('us-east-1'),
    STORAGE_ACCESS_KEY: Joi.string().required(),
    STORAGE_SECRET_KEY: Joi.string().required(),
    STORAGE_BUCKET: Joi.string().required(),
    STORAGE_USE_SSL: Joi.boolean().default(true),
    STORAGE_FORCE_PATH_STYLE: Joi.boolean().default(true),
    STORAGE_PUBLIC_BASE_URL: Joi.string().uri().allow(''),
  }).unknown();

  const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    driver: envVars.STORAGE_DRIVER as 'minio' | 's3',
    endpoint: envVars.STORAGE_ENDPOINT,
    region: envVars.STORAGE_REGION,
    accessKeyId: envVars.STORAGE_ACCESS_KEY,
    secretAccessKey: envVars.STORAGE_SECRET_KEY,
    bucket: envVars.STORAGE_BUCKET,
    useSsl: envVars.STORAGE_USE_SSL,
    forcePathStyle: envVars.STORAGE_FORCE_PATH_STYLE,
    publicBaseUrl: envVars.STORAGE_PUBLIC_BASE_URL || null,
  };
});
