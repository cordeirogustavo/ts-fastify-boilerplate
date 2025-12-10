import { createClient, type RedisClientType } from 'redis'
import { inject, injectable } from 'tsyringe'
import { type AppConfig, ConfigSymbols } from '@/config'

@injectable()
export class RedisClientFactory {
  private redisConnections: Record<string, RedisClientType> = {};

  constructor(
    @inject(ConfigSymbols.AppConfig) private readonly config: AppConfig
  ) {}

  create(
    redisConfig: AppConfig['cache']['redis'] = this.config.cache.redis,
  ): RedisClientType {
    const redisUrl = `redis://${redisConfig.username}:${
      redisConfig.password ? `${redisConfig.password}@` : ''
    }${redisConfig.host}:${redisConfig.port}/${redisConfig.dbName}`
    console.log(redisUrl)

    if (this.redisConnections[redisUrl]) {
      console.log(`Reutilizando conexão existente para: ${redisUrl}`)
      return this.redisConnections[redisUrl]
    }

    const client: RedisClientType = createClient({
      url: redisUrl,
      socket: redisConfig.tls ? {
        tls: redisConfig.tls,
      } : undefined,
      database: Number(redisConfig.dbName),
    })

    client.on('error', (err) => {
      console.error(`Redis connection error: ${redisUrl}`, err)
    })

    client.on('connect', () => {
      console.log(`Redis connected: ${redisUrl}`)
    })

    client.connect()

    this.redisConnections[redisUrl] = client

    return client
  }
}
