import ms from 'ms'
import type { RedisClientType, SetOptions } from 'redis'
import type { BaseCache } from '../base-cache.interface'

export type RedisSerializeFn<T> = (value: T) => string

export type RedisDeserializeFn<T> = (s: string) => T

export const redisSerializeToString: RedisSerializeFn<string> = (v: string) => v

export const redisSerializeToNonString: RedisSerializeFn<
  Exclude<any, string>
> = (v) => JSON.stringify(v)

export const redisUnSerializeToString: RedisDeserializeFn<string> = (
  v: string,
) => v

export const redisDeserializeToNonString: RedisDeserializeFn<
  Exclude<any, string>
> = (v: string) => JSON.parse(v)

export class RedisCache<Entity> implements BaseCache<Entity> {
  constructor(
    private readonly client: RedisClientType,
    private readonly keyPrefix: string,
  ) {}

  protected serialize: RedisSerializeFn<Entity> = redisSerializeToNonString
  protected deserialize: RedisDeserializeFn<Entity> =
    redisDeserializeToNonString

  private fullKey(identifier: string): string {
    return `${this.keyPrefix}:${identifier}`
  }

  async del(identifier?: string | string[]): Promise<number> {
    return this.client.del(
      typeof identifier === 'object'
        ? identifier.map((id) => this.fullKey(id))
        : this.fullKey(identifier ?? ''),
    )
  }

  async get(identifier?: string): Promise<Entity | undefined> {
    const result = await this.client.get(this.fullKey(identifier ?? ''))

    return result === null ? undefined : this.deserialize(result)
  }

  async set(
    identifierOrData: string | Entity,
    data?: Entity | string | number,
    ttl?: string | number,
  ): Promise<boolean> {
    let result: string | null = null

    if (typeof identifierOrData === 'string') {
      const key = this.fullKey(identifierOrData)
      const serialized = this.serialize(data as Entity)

      const timeInSeconds =
        typeof ttl === 'string' ? ms(ttl as ms.StringValue) / 1000 : ttl

      const options: SetOptions = {
        EX: timeInSeconds,
      }

      result = await this.client.set(key, serialized, options)
    } else {
      const key = this.fullKey('')
      const serialized = this.serialize(identifierOrData)

      result = await this.client.set(key, serialized)
    }

    return result !== null
  }

  async take(identifier?: string): Promise<Entity | undefined> {
    const result = await this.client.getDel(this.fullKey(identifier ?? ''))

    return result === null ? undefined : this.deserialize(result)
  }
}
