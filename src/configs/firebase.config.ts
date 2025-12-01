import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('firebase', () => {
  const envVarsSchema = Joi.object({
    FIREBASE_PROJECT_ID: Joi.string().required(),
    FIREBASE_PRIVATE_KEY: Joi.string().required(),
    FIREBASE_CLIENT_EMAIL: Joi.string().email().required(),
    FIREBASE_DATABASE_URL: Joi.string().uri().required(),
    FIREBASE_CREDENTIAL_JSON: Joi.string().required(),
  }).unknown();

  const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    projectId: envVars.FIREBASE_PROJECT_ID,
    privateKey: envVars.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: envVars.FIREBASE_CLIENT_EMAIL,
    databaseURL: envVars.FIREBASE_DATABASE_URL,
    credential: JSON.parse(envVars.FIREBASE_CREDENTIAL_JSON),
  };
});
