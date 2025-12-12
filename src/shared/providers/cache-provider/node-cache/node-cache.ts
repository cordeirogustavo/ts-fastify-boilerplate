import ms from 'ms'
import type NodeCacheJs from 'node-cache'
import { injectable } from 'tsyringe'
import type { BaseCache } from '../base-cache.interface'

@injectable()
export class NodeCache<Entity> implements BaseCache<Entity> {
  constructor(
    private readonly cache: NodeCacheJs,
    private readonly keyPrefix: string,
  ) {}

  private fullKey(identifier: string): string {
    return `${this.keyPrefix}:${identifier}`
  }

  private async execAGettingMethod<T = Entity>(
    fn: NodeCacheJs['get'] | NodeCacheJs['take'],
    identifier?: string,
  ): Promise<T | undefined> {
    const obj = fn<T>(this.fullKey(identifier ?? ''))

    return obj
  }

  async del(identifier?: string | string[]): Promise<number> {
    return this.cache.del(
      typeof identifier === 'object'
        ? identifier.map((id) => this.fullKey(id))
        : this.fullKey(identifier ?? ''),
    )
  }

  async get<T = Entity>(identifier?: string): Promise<T | undefined> {
    return this.execAGettingMethod(this.cache.get, identifier)
  }

  async set<T = Entity>(
    identifierOrData: string | T,
    data?: T,
    ttl?: string | number,
  ): Promise<boolean> {
    const timeInSeconds = typeof ttl === 'string' ? ms(ttl as ms.StringValue) / 1000 : (ttl ?? 0)

    if (typeof identifierOrData === 'string') {
      return this.cache.set<T>(this.fullKey(identifierOrData), data!, timeInSeconds)
    } else {
      return this.cache.set<T>(
        this.fullKey(''),
        identifierOrData,
        typeof data === 'string' || typeof data === 'number' ? data : 0,
      )
    }
  }

  take<T = Entity>(identifier?: string): Promise<T | undefined> {
    return this.execAGettingMethod(this.cache.take, identifier)
  }
}
