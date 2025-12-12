import { inject, injectable } from 'tsyringe'
import { type AppConfig, ConfigSymbols } from '@/config'
import type { UserLoginAttemptsCache } from './user-login-attempts.cache'
import type { IUserLoginAttemptsService } from './user-login-attempts.interface'
import { UserLoginAttemptsSymbols } from './user-login-attempts.symbols'
import type { TUserLoginAttempts, TUserLoginAttemptsBlockPeriod } from './user-login-attempts.types'
import type { UserLoginPasscodeCache } from './user-login-passcode.cache'
@injectable()
export class UserLoginAttemptsService implements IUserLoginAttemptsService {
  private readonly USER_ATTEMPTS_CACHE_1_WEEK_IN_SECONDS = 7 * 24 * 60 * 60
  constructor(
    @inject(ConfigSymbols.AppConfig)
    private readonly appConfig: AppConfig,
    @inject(UserLoginAttemptsSymbols.UserLoginAttemptsCache)
    private readonly userLoginAttemptsCache: UserLoginAttemptsCache,
    @inject(UserLoginAttemptsSymbols.UserLoginPasscodeCache)
    private readonly userLoginPasscodeCache: UserLoginPasscodeCache,
  ) {}

  getBlockPeriodAndEpochByAttempts(tries: number): [TUserLoginAttemptsBlockPeriod, number] {
    if (tries < this.appConfig.minAttemptsToBlockUserLogin || Math.floor(tries) !== tries)
      throw new Error('Tries should be integer and >= minAttemptsToBlockUserLogin')

    const timeToBlock = new Map<number, [TUserLoginAttemptsBlockPeriod, number]>([
      [0, ['1m', 60]],
      [3, ['5m', 300]],
      [6, ['15m', 900]],
      [10, ['30m', 1800]],
    ])
    const thresholds = Array.from(timeToBlock.keys()).sort((a, b) => a - b)
    const relativeTries = tries - this.appConfig.minAttemptsToBlockUserLogin
    let selectedKey = -1
    for (const key of thresholds) {
      if (relativeTries >= key) {
        selectedKey = key
      } else {
        break
      }
    }
    const blockPeriodAndEpoch = timeToBlock.get(selectedKey)
    if (!blockPeriodAndEpoch) throw new Error('Invalid tries')
    return blockPeriodAndEpoch
  }

  getAttemptsError(
    userId: string,
    operation: 'login' | 'validatePasscode',
    attempts: TUserLoginAttempts,
  ): {
    key: string
    params: Record<string, any>
  } {
    if (attempts.attempts >= this.appConfig.minAttemptsToBlockUserLogin) {
      const [blockPeriod, newBlockUntil] = this.getBlockPeriodAndEpochByAttempts(attempts.attempts)
      attempts.attemptsBlockPeriod = blockPeriod
      this.setUserAttempts(userId, attempts, newBlockUntil)
      return {
        key: 'exceededAttempts',
        params: { time: blockPeriod },
      }
    }
    this.setUserAttempts(userId, attempts)
    return {
      key: operation === 'login' ? 'invalidCredentials' : 'invalidPasscode',
      params: {},
    }
  }

  async getUserAttempts(userId: string): Promise<TUserLoginAttempts> {
    const attempts = await this.userLoginAttemptsCache.cache.get(userId)
    const emptyAttempts: TUserLoginAttempts = {
      attempts: 0,
      attemptsBlockPeriod: undefined,
    }
    if (!attempts) return emptyAttempts
    return attempts
  }

  async getUserPasscode(userId: string): Promise<string | undefined> {
    return await this.userLoginPasscodeCache.cache.get(userId)
  }

  async delAttempts(userId: string): Promise<void> {
    await this.userLoginAttemptsCache.cache.del(userId)
  }

  async setUserPasscode(userId: string, passcode: string, ttl: number): Promise<void> {
    await this.userLoginPasscodeCache.cache.del(userId)
    await this.userLoginPasscodeCache.cache.set(userId, passcode, ttl)
  }

  async setUserAttempts(userId: string, attempts: TUserLoginAttempts, ttl?: number): Promise<void> {
    await this.userLoginAttemptsCache.cache.set(
      userId,
      attempts,
      ttl || this.USER_ATTEMPTS_CACHE_1_WEEK_IN_SECONDS,
    )
  }

  async delUserPasscode(userId: string): Promise<void> {
    await this.userLoginPasscodeCache.cache.del(userId)
  }
}
