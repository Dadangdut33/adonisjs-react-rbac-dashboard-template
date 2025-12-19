import env from '#start/env'

import { defineConfig, drivers, store } from '@adonisjs/cache'

const l1Layer = drivers.memory({ maxSize: '500mb' })
const cacheConfig = defineConfig({
  default: env.get('CACHE_DRIVER'),

  stores: {
    memory: store().useL1Layer(l1Layer),

    database: store()
      .useL1Layer(l1Layer)
      .useL2Layer(drivers.database({ connectionName: 'postgres' })),

    redis:
      env.get('CACHE_DRIVER') === 'redis'
        ? store()
            .useL1Layer(l1Layer)
            .useL2Layer(drivers.redis({ connectionName: 'main' }))
            .useBus(drivers.redisBus({ connectionName: 'main' }))
        : store().useL1Layer(l1Layer),
  },
})

export default cacheConfig

declare module '@adonisjs/cache/types' {
  interface CacheStores extends InferStores<typeof cacheConfig> {}
}
