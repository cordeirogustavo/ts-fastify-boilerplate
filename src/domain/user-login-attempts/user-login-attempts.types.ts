export type TUserLoginAttemptsBlockPeriod = '1m' | '5m' | '15m' | '30m'

export type TUserLoginAttempts = {
  attempts: number
  attemptsBlockPeriod?: TUserLoginAttemptsBlockPeriod
}
