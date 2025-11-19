import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('security', () => {
  const envVarsSchema = Joi.object({
    RT_SECRET: Joi.string().required(),
    AT_SECRET: Joi.string().required(),
    RT_EXPIRES: Joi.string().required(),
    AT_EXPIRES: Joi.string().required(),
  }).unknown();

  const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    rtSecret: envVars.RT_SECRET,
    atSecret: envVars.AT_SECRET,
    atExpiresIn: envVars.AT_EXPIRES,
    rtExpiresIn: envVars.RT_EXPIRES,
  };
});
