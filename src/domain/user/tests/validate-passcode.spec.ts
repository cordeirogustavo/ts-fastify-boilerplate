import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CastError, ExpiredError, NotFoundError } from '@/shared/errors/handlers'
import type { TUser } from '../user.types'
import { generateUserMock } from './user-mock'

describe('User Validate Passcode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should validate passcode successfully with APP method', async () => {
    const {
      userService,
      userRepository,
      user,
      totpService,
      userLoginAttemptsService,
      mockPermission,
    } = generateUserMock()

    const userWithMfa = {
      ...user,
      mfaEnabled: 1,
      mfaMethod: 'APP' as TUser['mfaMethod'],
    }

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(userWithMfa)
    vi.spyOn(userLoginAttemptsService, 'getUserAttempts').mockResolvedValueOnce({
      attempts: 0,
      attemptsBlockPeriod: undefined,
    })
    vi.spyOn(totpService, 'validatePasscode').mockReturnValueOnce(true)
    vi.spyOn(userLoginAttemptsService, 'delUserPasscode').mockResolvedValueOnce()
    vi.spyOn(userLoginAttemptsService, 'delAttempts').mockResolvedValueOnce()
    vi.spyOn(userService, 'authenticate').mockResolvedValueOnce({
      userId: userWithMfa.userId,
      email: userWithMfa.email,
      name: userWithMfa.name,
      userPicture: '',
      token: 'token',
      scopes: mockPermission,
    })

    const mfaKey = userWithMfa.mfaKey?.secret || ''

    const result = await userService.validatePasscode(userWithMfa.userId, '123456')

    expect(userRepository.getUser).toHaveBeenCalledWith({ userId: userWithMfa.userId })
    expect(totpService.validatePasscode).toHaveBeenCalledWith('123456', mfaKey)
    expect(userLoginAttemptsService.delUserPasscode).toHaveBeenCalledWith(userWithMfa.userId)
    expect(userLoginAttemptsService.delAttempts).toHaveBeenCalledWith(userWithMfa.userId)
    expect(result).toEqual({
      userId: userWithMfa.userId,
      email: userWithMfa.email,
      name: userWithMfa.name,
      userPicture: '',
      token: 'token',
      scopes: mockPermission,
    })
  })

  it('should validate passcode successfully with EMAIL method', async () => {
    const { userService, userRepository, user, userLoginAttemptsService, mockPermission } =
      generateUserMock()

    const userWithEmailMfa = {
      ...user,
      mfaEnabled: 1,
      mfaMethod: 'EMAIL' as TUser['mfaMethod'],
    }

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(userWithEmailMfa)
    vi.spyOn(userLoginAttemptsService, 'getUserAttempts').mockResolvedValueOnce({
      attempts: 0,
      attemptsBlockPeriod: undefined,
    })
    vi.spyOn(userLoginAttemptsService, 'getUserPasscode').mockResolvedValueOnce('123456')
    vi.spyOn(userLoginAttemptsService, 'delUserPasscode').mockResolvedValueOnce()
    vi.spyOn(userLoginAttemptsService, 'delAttempts').mockResolvedValueOnce()
    vi.spyOn(userService, 'authenticate').mockResolvedValueOnce({
      userId: userWithEmailMfa.userId,
      email: userWithEmailMfa.email,
      name: userWithEmailMfa.name,
      userPicture: '',
      token: 'token',
      scopes: mockPermission,
    })

    const result = await userService.validatePasscode(userWithEmailMfa.userId, '123456')

    expect(userRepository.getUser).toHaveBeenCalledWith({ userId: userWithEmailMfa.userId })
    expect(userLoginAttemptsService.getUserPasscode).toHaveBeenCalledWith(userWithEmailMfa.userId)
    expect(userLoginAttemptsService.delUserPasscode).toHaveBeenCalledWith(userWithEmailMfa.userId)
    expect(userLoginAttemptsService.delAttempts).toHaveBeenCalledWith(userWithEmailMfa.userId)
    expect(result).toEqual({
      userId: userWithEmailMfa.userId,
      email: userWithEmailMfa.email,
      name: userWithEmailMfa.name,
      userPicture: '',
      token: 'token',
      scopes: mockPermission,
    })
  })

  it('should throw error if passcode is expired for EMAIL method', async () => {
    const { userService, userRepository, user, userLoginAttemptsService } = generateUserMock()

    const userWithEmailMfa = {
      ...user,
      mfaEnabled: 1,
      mfaMethod: 'EMAIL' as TUser['mfaMethod'],
    }

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(userWithEmailMfa)
    vi.spyOn(userLoginAttemptsService, 'getUserAttempts').mockResolvedValueOnce({
      attempts: 0,
      attemptsBlockPeriod: undefined,
    })
    vi.spyOn(userLoginAttemptsService, 'getUserPasscode').mockResolvedValueOnce(undefined)

    await expect(userService.validatePasscode(userWithEmailMfa.userId, '123456')).rejects.toThrow(
      ExpiredError,
    )

    expect(userRepository.getUser).toHaveBeenCalledWith({ userId: userWithEmailMfa.userId })
    expect(userLoginAttemptsService.getUserPasscode).toHaveBeenCalledWith(userWithEmailMfa.userId)
  })

  it('should throw error when user is not found', async () => {
    const { userService, userRepository } = generateUserMock()

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(null)

    await expect(userService.validatePasscode('non-existent-id', '123456')).rejects.toThrow(
      NotFoundError,
    )

    expect(userRepository.getUser).toHaveBeenCalledWith({ userId: 'non-existent-id' })
  })

  it('should throw error when user has no MFA key', async () => {
    const { userService, userRepository, user } = generateUserMock()

    const userWithoutMfaKey = {
      ...user,
      mfaKey: undefined,
    }

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(userWithoutMfaKey)

    await expect(userService.validatePasscode(userWithoutMfaKey.userId, '123456')).rejects.toThrow(
      CastError,
    )

    expect(userRepository.getUser).toHaveBeenCalledWith({ userId: userWithoutMfaKey.userId })
  })

  it('should throw error when passcode is invalid for APP method', async () => {
    const { userService, userRepository, user, totpService, userLoginAttemptsService } =
      generateUserMock()

    const userWithMfa = {
      ...user,
      mfaEnabled: 1,
      mfaMethod: 'APP' as TUser['mfaMethod'],
    }

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(userWithMfa)
    vi.spyOn(userLoginAttemptsService, 'getUserAttempts').mockResolvedValueOnce({
      attempts: 0,
      attemptsBlockPeriod: undefined,
    })
    vi.spyOn(totpService, 'validatePasscode').mockReturnValueOnce(false)
    vi.spyOn(userLoginAttemptsService, 'getAttemptsError').mockReturnValueOnce({
      key: 'invalidPasscode',
      params: {},
    })

    await expect(
      userService.validatePasscode(userWithMfa.userId, 'wrong-passcode'),
    ).rejects.toBeInstanceOf(CastError)

    expect(userRepository.getUser).toHaveBeenCalledWith({ userId: userWithMfa.userId })
    expect(totpService.validatePasscode).toHaveBeenCalledWith(
      'wrong-passcode',
      userWithMfa.mfaKey?.secret,
    )
    expect(userLoginAttemptsService.getAttemptsError).toHaveBeenCalledWith(
      userWithMfa.userId,
      'validatePasscode',
      expect.objectContaining({
        attempts: 1,
      }),
    )
  })

  it('should throw error when passcode is invalid for EMAIL method', async () => {
    const { userService, userRepository, user, userLoginAttemptsService } = generateUserMock()

    const userWithEmailMfa = {
      ...user,
      mfaEnabled: 1,
      mfaMethod: 'EMAIL' as TUser['mfaMethod'],
    }

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(userWithEmailMfa)
    vi.spyOn(userLoginAttemptsService, 'getUserAttempts').mockResolvedValueOnce({
      attempts: 0,
      attemptsBlockPeriod: undefined,
    })
    vi.spyOn(userLoginAttemptsService, 'getUserPasscode').mockResolvedValueOnce('123456')
    vi.spyOn(userLoginAttemptsService, 'getAttemptsError').mockReturnValueOnce({
      key: 'invalidPasscode',
      params: {},
    })

    await expect(
      userService.validatePasscode(userWithEmailMfa.userId, 'wrong-passcode'),
    ).rejects.toThrow(CastError)

    expect(userRepository.getUser).toHaveBeenCalledWith({ userId: userWithEmailMfa.userId })
    expect(userLoginAttemptsService.getUserPasscode).toHaveBeenCalledWith(userWithEmailMfa.userId)
    expect(userLoginAttemptsService.getAttemptsError).toHaveBeenCalledWith(
      userWithEmailMfa.userId,
      'validatePasscode',
      expect.objectContaining({
        attempts: 1,
      }),
    )
  })

  it('should throw error when user has exceeded maximum attempts', async () => {
    const { userService, userRepository, user, appConfig, totpService, userLoginAttemptsService } =
      generateUserMock()

    const userWithMfa = {
      ...user,
      mfaEnabled: 1,
      mfaMethod: 'APP' as TUser['mfaMethod'],
    }

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(userWithMfa)
    vi.spyOn(userLoginAttemptsService, 'getUserAttempts').mockResolvedValueOnce({
      attempts: appConfig.minAttemptsToBlockUserLogin - 1,
      attemptsBlockPeriod: undefined,
    })
    vi.spyOn(totpService, 'validatePasscode').mockReturnValueOnce(false)
    vi.spyOn(userLoginAttemptsService, 'getAttemptsError').mockReturnValueOnce({
      key: 'exceededAttempts',
      params: { time: '1m' },
    })

    await expect(userService.validatePasscode(userWithMfa.userId, '123456')).rejects.toThrow(
      CastError,
    )

    expect(userLoginAttemptsService.getAttemptsError).toHaveBeenCalledWith(
      userWithMfa.userId,
      'validatePasscode',
      expect.objectContaining({
        attempts: appConfig.minAttemptsToBlockUserLogin,
      }),
    )
  })
})
