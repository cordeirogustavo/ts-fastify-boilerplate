import type NodeCacheJs from 'node-cache'
import type { RedisClientType } from 'redis'
import { inject, injectable } from 'tsyringe'
import { type AppConfig, ConfigSymbols } from '@/config'
import { ProvidersSymbols } from '../providers.symbols'
import type { BaseCache } from './base-cache.interface'
import { NodeCache } from './node-cache'
import { RedisCache } from './redis/redis'

interface ICacheFactory {
  getClient(): RedisClientType | NodeCacheJs
  create<T>(keyPrefix: string): BaseCache<T>
}

@injectable()
export class CacheFactory implements ICacheFactory {
  private redisClient: RedisClientType | null = null
  private nodeCacheClient: NodeCacheJs | null = null

  constructor(
    @inject(ConfigSymbols.AppConfig) private readonly config: AppConfig,
    @inject(ProvidersSymbols.RedisFactory)
    private readonly redisFactory: (
      redisConfig: AppConfig['cache']['redis'],
    ) => RedisClientType,
    @inject(ProvidersSymbols.NodeCacheFactory)
    private readonly nodeCacheFactory: () => NodeCacheJs,
  ) {}

  getClient(): RedisClientType | NodeCacheJs {
    if (this.config.cache.provider === 'Redis') {
      if (!this.redisClient) {
        this.redisClient = this.redisFactory(this.config.cache.redis)
      }
      return this.redisClient
    }

    if (this.config.cache.provider === 'NodeCache') {
      if (!this.nodeCacheClient) {
        this.nodeCacheClient = this.nodeCacheFactory()
        this.nodeCacheClient.on('error', (err) => {
          console.error('NodeCache client error', err)
        })
      }
      return this.nodeCacheClient
    }

    throw new Error('Invalid cache provider')
  }

  create<T>(keyPrefix: string): BaseCache<T> {
    const cache = this.getClient()
    if (this.config.cache.provider === 'Redis')
      return new RedisCache<T>(cache as RedisClientType, keyPrefix)
    return new NodeCache<T>(cache as NodeCacheJs, keyPrefix)
  }
}
