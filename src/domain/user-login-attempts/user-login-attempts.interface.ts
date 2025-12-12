import type { TUserLoginAttempts, TUserLoginAttemptsBlockPeriod } from './user-login-attempts.types'

export interface IUserLoginAttemptsService {
  getBlockPeriodAndEpochByAttempts(tries: number): [TUserLoginAttemptsBlockPeriod, number]
  getUserAttempts(userId: string): Promise<TUserLoginAttempts>
  setUserAttempts(userId: string, attempts: TUserLoginAttempts, ttl?: number): Promise<void>
  delAttempts(userId: string): Promise<void>
  getAttemptsError(
    userId: string,
    operation: 'login' | 'validatePasscode',
    attempts: TUserLoginAttempts,
  ): {
    key: string
    params: Record<string, any>
  }
  getUserPasscode(userId: string): Promise<string | undefined>
  setUserPasscode(userId: string, passcode: string, ttl: number): Promise<void>
  delUserPasscode(userId: string): Promise<void>
}
