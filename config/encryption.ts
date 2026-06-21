import env from '#start/env'

import { defineConfig, drivers } from '@adonisjs/core/encryption'

const encryptionConfig = defineConfig({
  /**
   * Encryption driver used by the application.
   * Use legacy if you are upgrading from v6
   */
  default: env.get('APP_ENCRYPTOR'),

  list: {
    gcm: drivers.aes256gcm({
      /**
       * Keys used for encryption/decryption.
       * First key encrypts, all keys are tried for decryption.
       */
      keys: [env.get('APP_KEY').release()],

      /**
       * Stable identifier for this driver.
       */
      id: 'gcm',
    }),

    legacy: drivers.legacy({
      keys: [env.get('APP_KEY')],
    }),
  },
})

export default encryptionConfig

/**
 * Inferring types for the list of encryptors you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
  export interface EncryptorsList extends InferEncryptors<typeof encryptionConfig> {}
}
