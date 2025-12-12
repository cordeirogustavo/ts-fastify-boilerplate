import { inject, injectable } from 'tsyringe'
import type { CacheFactory } from '@/shared/providers/cache-provider'
import type { BaseCache } from '@/shared/providers/cache-provider/base-cache.interface'
import { ProvidersSymbols } from '@/shared/providers/providers.symbols'

@injectable()
export class UserLoginPasscodeCache {
  public readonly cache: BaseCache<string>

  constructor(
    @inject(ProvidersSymbols.CacheFactory)
    private readonly cacheFactory: CacheFactory,
  ) {
    this.cache = this.cacheFactory.create<string>('user-login-passcode')
  }
}
