import { beforeEach, describe, expect, it, vi } from 'vitest'
import { generateUserLoginAttemptsMock } from './user-login-attempts-mock'

describe('UserLoginAttemptsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBlockPeriodAndEpochByAttempts', () => {
    it('should throw an error if tries is less than minAttemptsToBlockUserLogin', () => {
      const { userLoginAttemptsService, appConfig } = generateUserLoginAttemptsMock()

      expect(() => {
        userLoginAttemptsService.getBlockPeriodAndEpochByAttempts(
          appConfig.minAttemptsToBlockUserLogin - 1,
        )
      }).toThrow('Tries should be integer and >= minAttemptsToBlockUserLogin')
    })

    it('should throw an error if tries is not an integer', () => {
      const { userLoginAttemptsService, appConfig } = generateUserLoginAttemptsMock()
      expect(() => {
        userLoginAttemptsService.getBlockPeriodAndEpochByAttempts(
          appConfig.minAttemptsToBlockUserLogin + 0.5,
        )
      }).toThrow('Tries should be integer and >= minAttemptsToBlockUserLogin')
    })

    it('should return 1 minute block for minimum attempts', () => {
      const { userLoginAttemptsService, appConfig } = generateUserLoginAttemptsMock()

      const [blockPeriod, epoch] = userLoginAttemptsService.getBlockPeriodAndEpochByAttempts(
        appConfig.minAttemptsToBlockUserLogin,
      )

      expect(blockPeriod).toBe('1m')
      expect(epoch).toBe(60)
    })

    it('should return 5 minute block for base + 3 attempts', () => {
      const { userLoginAttemptsService, appConfig } = generateUserLoginAttemptsMock()

      const [blockPeriod, epoch] = userLoginAttemptsService.getBlockPeriodAndEpochByAttempts(
        appConfig.minAttemptsToBlockUserLogin + 3,
      )

      expect(blockPeriod).toBe('5m')
      expect(epoch).toBe(300)
    })

    it('should return 15 minute block for base + 6 attempts', () => {
      const { userLoginAttemptsService, appConfig } = generateUserLoginAttemptsMock()

      const [blockPeriod, epoch] = userLoginAttemptsService.getBlockPeriodAndEpochByAttempts(
        appConfig.minAttemptsToBlockUserLogin + 6,
      )

      expect(blockPeriod).toBe('15m')
      expect(epoch).toBe(900)
    })

    it('should return 30 minute block for base + 10 attempts', () => {
      const { userLoginAttemptsService, appConfig } = generateUserLoginAttemptsMock()

      const [blockPeriod, epoch] = userLoginAttemptsService.getBlockPeriodAndEpochByAttempts(
        appConfig.minAttemptsToBlockUserLogin + 10,
      )

      expect(blockPeriod).toBe('30m')
      expect(epoch).toBe(1800)
    })

    it('should return 30 minute block for any attempts above base + 10', () => {
      const { userLoginAttemptsService, appConfig } = generateUserLoginAttemptsMock()

      const [blockPeriod, epoch] = userLoginAttemptsService.getBlockPeriodAndEpochByAttempts(
        appConfig.minAttemptsToBlockUserLogin + 15,
      )

      expect(blockPeriod).toBe('30m')
      expect(epoch).toBe(1800)
    })
  })

  describe('getAttemptsError', () => {
    it('should return invalidCredentials error for login operation when under block threshold', () => {
      const { userLoginAttemptsService, userId, attemptsWithOneFailure } =
        generateUserLoginAttemptsMock()

      vi.spyOn(userLoginAttemptsService, 'setUserAttempts').mockResolvedValueOnce()

      const error = userLoginAttemptsService.getAttemptsError(
        userId,
        'login',
        attemptsWithOneFailure,
      )

      expect(error).toEqual({
        key: 'invalidCredentials',
        params: {},
      })
      expect(userLoginAttemptsService.setUserAttempts).toHaveBeenCalledWith(
        userId,
        attemptsWithOneFailure,
      )
    })

    it('should return invalidPasscode error for validatePasscode operation when under block threshold', () => {
      const { userLoginAttemptsService, userId, attemptsWithOneFailure } =
        generateUserLoginAttemptsMock()

      vi.spyOn(userLoginAttemptsService, 'setUserAttempts').mockResolvedValueOnce()

      const error = userLoginAttemptsService.getAttemptsError(
        userId,
        'validatePasscode',
        attemptsWithOneFailure,
      )

      expect(error).toEqual({
        key: 'invalidPasscode',
        params: {},
      })
      expect(userLoginAttemptsService.setUserAttempts).toHaveBeenCalledWith(
        userId,
        attemptsWithOneFailure,
      )
    })

    it('should return exceededAttempts error and set block period when attempts exceed threshold', () => {
      const { userLoginAttemptsService, userId, attemptsBlockedLevel1 } =
        generateUserLoginAttemptsMock()

      vi.spyOn(userLoginAttemptsService, 'getBlockPeriodAndEpochByAttempts').mockReturnValueOnce([
        '1m',
        60,
      ])
      vi.spyOn(userLoginAttemptsService, 'setUserAttempts').mockResolvedValueOnce()

      const error = userLoginAttemptsService.getAttemptsError(
        userId,
        'login',
        attemptsBlockedLevel1,
      )

      expect(error).toEqual({
        key: 'exceededAttempts',
        params: { time: '1m' },
      })
      expect(userLoginAttemptsService.setUserAttempts).toHaveBeenCalledWith(
        userId,
        { ...attemptsBlockedLevel1, attemptsBlockPeriod: '1m' },
        60,
      )
    })
  })

  describe('getUserAttempts', () => {
    it('should return empty attempts when no attempts found in cache', async () => {
      const { userLoginAttemptsService, userId, userLoginAttemptsCache, emptyAttempts } =
        generateUserLoginAttemptsMock()

      vi.spyOn(userLoginAttemptsCache.cache, 'get').mockResolvedValueOnce(undefined)

      const result = await userLoginAttemptsService.getUserAttempts(userId)

      expect(result).toEqual(emptyAttempts)
      expect(userLoginAttemptsCache.cache.get).toHaveBeenCalledWith(userId)
    })

    it('should return cached attempts when available', async () => {
      const { userLoginAttemptsService, userId, userLoginAttemptsCache, attemptsWithOneFailure } =
        generateUserLoginAttemptsMock()

      vi.spyOn(userLoginAttemptsCache.cache, 'get').mockResolvedValueOnce(attemptsWithOneFailure)

      const result = await userLoginAttemptsService.getUserAttempts(userId)

      expect(result).toEqual(attemptsWithOneFailure)
      expect(userLoginAttemptsCache.cache.get).toHaveBeenCalledWith(userId)
    })
  })

  describe('getUserPasscode', () => {
    it('should return undefined when no passcode found', async () => {
      const { userLoginAttemptsService, userId, userLoginPasscodeCache } =
        generateUserLoginAttemptsMock()

      vi.spyOn(userLoginPasscodeCache.cache, 'get').mockResolvedValueOnce(undefined)

      const result = await userLoginAttemptsService.getUserPasscode(userId)

      expect(result).toBeUndefined()
      expect(userLoginPasscodeCache.cache.get).toHaveBeenCalledWith(userId)
    })

    it('should return passcode when available', async () => {
      const { userLoginAttemptsService, userId, userLoginPasscodeCache, passcode } =
        generateUserLoginAttemptsMock()

      vi.spyOn(userLoginPasscodeCache.cache, 'get').mockResolvedValueOnce(passcode)

      const result = await userLoginAttemptsService.getUserPasscode(userId)

      expect(result).toBe(passcode)
      expect(userLoginPasscodeCache.cache.get).toHaveBeenCalledWith(userId)
    })
  })

  describe('delAttempts', () => {
    it('should delete attempts from cache', async () => {
      const { userLoginAttemptsService, userId, userLoginAttemptsCache } =
        generateUserLoginAttemptsMock()

      vi.spyOn(userLoginAttemptsCache.cache, 'del').mockResolvedValueOnce(1)

      await userLoginAttemptsService.delAttempts(userId)

      expect(userLoginAttemptsCache.cache.del).toHaveBeenCalledWith(userId)
    })
  })

  describe('setUserPasscode', () => {
    it('should set passcode in cache with TTL', async () => {
      const { userLoginAttemptsService, userId, passcode, ttl, userLoginPasscodeCache } =
        generateUserLoginAttemptsMock()

      vi.spyOn(userLoginPasscodeCache.cache, 'set').mockResolvedValueOnce(true)

      await userLoginAttemptsService.setUserPasscode(userId, passcode, ttl)

      expect(userLoginPasscodeCache.cache.set).toHaveBeenCalledWith(userId, passcode, ttl)
    })

    it('should be used correctly in UserService.sendMailPasscode', async () => {
      const { userLoginAttemptsService, userId, passcode, appConfig, userLoginPasscodeCache } =
        generateUserLoginAttemptsMock()

      vi.spyOn(userLoginPasscodeCache.cache, 'set').mockResolvedValueOnce(true)

      await userLoginAttemptsService.setUserPasscode(
        userId,
        passcode,
        appConfig.otp.emailTimeoutInMinutes * 60,
      )

      expect(userLoginPasscodeCache.cache.set).toHaveBeenCalledWith(
        userId,
        passcode,
        appConfig.otp.emailTimeoutInMinutes * 60,
      )
    })
  })

  describe('setUserAttempts', () => {
    it('should set attempts in cache with default TTL', async () => {
      const { userLoginAttemptsService, userId, attemptsWithOneFailure, userLoginAttemptsCache } =
        generateUserLoginAttemptsMock()
      const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60

      vi.spyOn(userLoginAttemptsCache.cache, 'set').mockResolvedValueOnce(true)

      await userLoginAttemptsService.setUserAttempts(userId, attemptsWithOneFailure)

      expect(userLoginAttemptsCache.cache.set).toHaveBeenCalledWith(
        userId,
        attemptsWithOneFailure,
        ONE_WEEK_IN_SECONDS,
      )
    })

    it('should set attempts in cache with custom TTL', async () => {
      const { userLoginAttemptsService, userId, attemptsBlockedLevel1, userLoginAttemptsCache } =
        generateUserLoginAttemptsMock()

      vi.spyOn(userLoginAttemptsCache.cache, 'set').mockResolvedValueOnce(true)

      await userLoginAttemptsService.setUserAttempts(userId, attemptsBlockedLevel1, 60)

      expect(userLoginAttemptsCache.cache.set).toHaveBeenCalledWith(
        userId,
        attemptsBlockedLevel1,
        60,
      )
    })
  })

  describe('Integration with UserService', () => {
    it('should handle login failures correctly', async () => {
      const { userLoginAttemptsService, userId, attemptsWithOneFailure, userLoginAttemptsCache } =
        generateUserLoginAttemptsMock()

      const updatedAttempts = {
        ...attemptsWithOneFailure,
        attempts: attemptsWithOneFailure.attempts + 1,
      }

      vi.spyOn(userLoginAttemptsCache.cache, 'get').mockResolvedValueOnce(attemptsWithOneFailure)
      vi.spyOn(userLoginAttemptsService, 'setUserAttempts').mockResolvedValueOnce()

      const error = userLoginAttemptsService.getAttemptsError(userId, 'login', updatedAttempts)

      expect(error.key).toBe('invalidCredentials')
      expect(userLoginAttemptsService.setUserAttempts).toHaveBeenCalledWith(userId, updatedAttempts)
    })

    it('should handle passcode validation failures correctly', async () => {
      const { userLoginAttemptsService, userId, attemptsWithOneFailure, userLoginAttemptsCache } =
        generateUserLoginAttemptsMock()

      const updatedAttempts = {
        ...attemptsWithOneFailure,
        attempts: attemptsWithOneFailure.attempts + 1,
      }

      vi.spyOn(userLoginAttemptsCache.cache, 'get').mockResolvedValueOnce(attemptsWithOneFailure)
      vi.spyOn(userLoginAttemptsService, 'setUserAttempts').mockResolvedValueOnce()

      const error = userLoginAttemptsService.getAttemptsError(
        userId,
        'validatePasscode',
        updatedAttempts,
      )

      expect(error.key).toBe('invalidPasscode')
      expect(userLoginAttemptsService.setUserAttempts).toHaveBeenCalledWith(userId, updatedAttempts)
    })

    it('should reset attempts on successful validation', async () => {
      const { userLoginAttemptsService, userId, userLoginAttemptsCache } =
        generateUserLoginAttemptsMock()

      vi.spyOn(userLoginAttemptsCache.cache, 'del').mockResolvedValueOnce(1)

      await userLoginAttemptsService.delAttempts(userId)

      expect(userLoginAttemptsCache.cache.del).toHaveBeenCalledWith(userId)
    })

    it('should block user after exceeding maximum attempts', async () => {
      const { userLoginAttemptsService, userId, appConfig } = generateUserLoginAttemptsMock()

      const exceededAttempts = {
        attempts: appConfig.minAttemptsToBlockUserLogin,
        attemptsBlockPeriod: undefined,
      }

      vi.spyOn(userLoginAttemptsService, 'getBlockPeriodAndEpochByAttempts').mockReturnValueOnce([
        '1m',
        60,
      ])
      vi.spyOn(userLoginAttemptsService, 'setUserAttempts').mockResolvedValueOnce()

      const error = userLoginAttemptsService.getAttemptsError(userId, 'login', exceededAttempts)

      expect(error).toEqual({
        key: 'exceededAttempts',
        params: { time: '1m' },
      })

      expect(userLoginAttemptsService.setUserAttempts).toHaveBeenCalledWith(
        userId,
        { ...exceededAttempts, attemptsBlockPeriod: '1m' },
        60,
      )
    })
  })
})
