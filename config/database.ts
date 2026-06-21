import env from '#start/env'

import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: env.get('DB_CONNECTION'),
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        // if got ssl error, remove ?sslmode=require
        connectionString: env.get('DB_POSTGRES_URL') ?? '',
        ssl: env.get('DB_POSTGRES_CA')
          ? {
              ca: env.get('DB_POSTGRES_CA'),
            }
          : undefined,
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },

    // if you use turso, you must setup redis or set the limiter to memory only
    turso: {
      client: 'libsql',
      connection: {
        filename: env.get('DB_TURSO_URL') ?? '', // e.g.: https://mydb-myusername.aws-eu-west-3.turso.io?authToken=12345
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
  prettyPrintDebugQueries: true,
})

export default dbConfig
