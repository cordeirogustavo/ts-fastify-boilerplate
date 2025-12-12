import { inject, singleton } from 'tsyringe'
import type { CacheFactory } from '@/shared/providers/cache-provider'
import type { BaseCache } from '@/shared/providers/cache-provider/base-cache.interface'
import { ProvidersSymbols } from '@/shared/providers/providers.symbols'
import type { TUserLoginAttempts } from './user-login-attempts.types'

@singleton()
export class UserLoginAttemptsCache {
  public readonly cache: BaseCache<TUserLoginAttempts>

  constructor(
    @inject(ProvidersSymbols.CacheFactory)
    private readonly cacheFactory: CacheFactory,
  ) {
    this.cache = this.cacheFactory.create<TUserLoginAttempts>('user-login-attempts')
  }
}
