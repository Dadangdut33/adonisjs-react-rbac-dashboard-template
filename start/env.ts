/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/
import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  APP_URL: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  VITE_APP_NAME: Env.schema.string.optional(),
  LOG_LEVEL: Env.schema.string(),

  // Some auth feature that can be disabled
  ENABLE_REGISTRATION: Env.schema.boolean.optional(),
  HIDE_REGISTRATION: Env.schema.boolean.optional(),

  ENABLE_FORGOT_PASSWORD: Env.schema.boolean.optional(),
  HIDE_FORGOT_PASSWORD: Env.schema.boolean.optional(),

  ENABLE_ACTIVITY_LOG: Env.schema.boolean.optional(),

  /*
  |----------------------------------------------------------
  | Analytics
  |----------------------------------------------------------
  */
  UMAMI_ID: Env.schema.string.optional(),
  UMAMI_PUBLIC_URL: Env.schema.string.optional(),
  UMAMI_SHARE_URL: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Cloudflare
  |----------------------------------------------------------
  */
  TURNSTILE_SECRET: Env.schema.string.optional(),
  TURNSTILE_SITE: Env.schema.string.optional(),
  BYPASS_CF_TURNSTILE: Env.schema.boolean.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring drivers
  |----------------------------------------------------------
  */
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory'] as const),
  CACHE_DRIVER: Env.schema.enum(['redis', 'database', 'memory'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring database connection
  |----------------------------------------------------------
  */
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the drive package
  |----------------------------------------------------------
  */
  DRIVE_DISK: Env.schema.enum(['fs', 's3'] as const),
  S3_KEY: Env.schema.string.optional(),
  S3_SECRET: Env.schema.string.optional(),
  S3_BUCKET: Env.schema.string.optional(),
  S3_ENDPOINT: Env.schema.string.optional(),
  S3_REGION: Env.schema.string.optional(),
  S3_VISIBILITY: Env.schema.enum(['public', 'private'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring the mail package
  |----------------------------------------------------------
  */
  SUPPORT_EMAIL: Env.schema.string.optional(),

  SMTP_HOST: Env.schema.string.optional(),
  SMTP_PORT: Env.schema.string.optional(),
  SMTP_USERNAME: Env.schema.string.optional(),
  SMTP_PASSWORD: Env.schema.string.optional(),
  SMTP_FROM: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring redis package
  |----------------------------------------------------------
  */
  REDIS_HOST: Env.schema.string.optional({ format: 'host' }),
  REDIS_PORT: Env.schema.number.optional(),
  REDIS_PASSWORD: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the limiter package
  |----------------------------------------------------------
  */
  LIMITER_STORE: Env.schema.enum(['database', 'memory', 'redis'] as const),
})
