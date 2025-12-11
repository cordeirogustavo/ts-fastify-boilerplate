import type { DependencyContainer } from 'tsyringe'
import { type AppConfig, ConfigSymbols } from '@/config'
import type { IContainer } from '@/shared/interfaces'
import { CacheFactory, NodeCacheFactory, RedisClientFactory } from './cache-provider'
import { DatabaseProvider } from './database-provider'
import { FacebookAuthProvider, type IFacebookAuthProvider } from './facebook-auth-provider'
import { GoogleAuthProvider, type IGoogleAuthProvider } from './google-auth-provider'
import { ProvidersSymbols } from './providers.symbols'

export class ProvidersContainer implements Partial<IContainer> {
  static register(container: DependencyContainer): void {
    container.register<IGoogleAuthProvider>(ProvidersSymbols.GoogleAuthProvider, GoogleAuthProvider)
    container.register<IFacebookAuthProvider>(
      ProvidersSymbols.FacebookAuthProvider,
      FacebookAuthProvider,
    )
    container.registerSingleton<RedisClientFactory>(
      ProvidersSymbols.RedisFactory,
      RedisClientFactory,
    )
    container.registerSingleton<NodeCacheFactory>(
      ProvidersSymbols.NodeCacheFactory,
      NodeCacheFactory,
    )
    container.register<CacheFactory>(ProvidersSymbols.CacheFactory, {
      useFactory: (container) => {
        const appConfig = container.resolve<AppConfig>(ConfigSymbols.AppConfig)
        const redisFactory = container.resolve<RedisClientFactory>(ProvidersSymbols.RedisFactory)
        const nodeCacheFactory = container.resolve<NodeCacheFactory>(
          ProvidersSymbols.NodeCacheFactory,
        )
        return new CacheFactory(
          appConfig,
          () => redisFactory.create(appConfig.cache.redis),
          nodeCacheFactory.create,
        )
      },
    })
    container.register<DatabaseProvider>(ProvidersSymbols.DatabaseProvider, {
      useValue: new DatabaseProvider(container.resolve(ConfigSymbols.AppConfig)),
    })
  }
}
