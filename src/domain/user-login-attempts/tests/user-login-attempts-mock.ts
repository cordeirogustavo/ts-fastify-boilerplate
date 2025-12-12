import { generateInstanceMock } from '@/mocks/instance-mocks'
import type { TUserLoginAttempts } from '../user-login-attempts.types'

export const generateUserLoginAttemptsMock = () => {
  const { appConfig, userLoginAttemptsCache, userLoginPasscodeCache, userLoginAttemptsService } =
    generateInstanceMock()

  const userId = 'test-user-id'
  const passcode = '123456'
  const ttl = 300 // 5 minutes in seconds

  if (!appConfig.otp) {
    appConfig.otp = {
      globalEnabled: true,
      issuer: 'Test Issuer',
      emailTimeoutInMinutes: 5,
    }
  }

  const emptyAttempts: TUserLoginAttempts = {
    attempts: 0,
    attemptsBlockPeriod: undefined,
  }

  const attemptsWithOneFailure: TUserLoginAttempts = {
    attempts: 1,
    attemptsBlockPeriod: undefined,
  }

  const attemptsNearBlock: TUserLoginAttempts = {
    attempts: appConfig.minAttemptsToBlockUserLogin - 1,
    attemptsBlockPeriod: undefined,
  }

  const attemptsBlockedLevel1: TUserLoginAttempts = {
    attempts: appConfig.minAttemptsToBlockUserLogin,
    attemptsBlockPeriod: '1m',
  }

  const attemptsBlockedLevel2: TUserLoginAttempts = {
    attempts: appConfig.minAttemptsToBlockUserLogin + 3,
    attemptsBlockPeriod: '5m',
  }

  const attemptsBlockedLevel3: TUserLoginAttempts = {
    attempts: appConfig.minAttemptsToBlockUserLogin + 6,
    attemptsBlockPeriod: '15m',
  }

  const attemptsBlockedLevel4: TUserLoginAttempts = {
    attempts: appConfig.minAttemptsToBlockUserLogin + 10,
    attemptsBlockPeriod: '30m',
  }

  const user = {
    userId,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed-password',
    mfaEnabled: 1,
    mfaMethod: 'EMAIL',
    mfaKey: {
      secret: 'mfa-secret',
      url: 'mfa-url',
    },
  }

  return {
    appConfig,
    userLoginAttemptsCache,
    userLoginPasscodeCache,
    userLoginAttemptsService,
    userId,
    passcode,
    ttl,
    emptyAttempts,
    attemptsWithOneFailure,
    attemptsNearBlock,
    attemptsBlockedLevel1,
    attemptsBlockedLevel2,
    attemptsBlockedLevel3,
    attemptsBlockedLevel4,
    user,
  }
}
