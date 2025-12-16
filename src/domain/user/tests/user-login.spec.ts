import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, type Mocked, vi } from 'vitest'
import { CastError } from '@/shared/errors/handlers'
import type { TLanguages } from '@/shared/utils'
import type { TUser } from '../user.types'
import { generateUserMock } from './user-mock'

describe('User Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should login successfully with valid credentials', async () => {
    const { userService, userRepository, user, userLoginAttemptsService } = generateUserMock()

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(user)
    vi.spyOn(userLoginAttemptsService, 'getUserAttempts').mockResolvedValueOnce({
      attempts: 0,
      attemptsBlockPeriod: undefined,
    })
    vi.spyOn(bcrypt, 'compare' as Mocked<keyof typeof bcrypt>).mockResolvedValue(true)

    vi.spyOn(userService, 'authenticate').mockResolvedValueOnce({
      userId: user.userId,
      email: user.email,
      name: user.name,
      userPicture: '',
      token: 'token',
    })

    const result = await userService.login(user.email, 'test-password', 'pt-BR' as TLanguages)

    expect(userRepository.getUser).toHaveBeenCalledWith({
      email: user.email,
      status: 'ACTIVE',
      provider: 'API',
    })
    expect(result).toEqual({
      userId: user.userId,
      email: user.email,
      name: user.name,
      userPicture: '',
      token: 'token',
    })
  })

  it('should require passcode if MFA is enabled', async () => {
    const { userService, userRepository, user } = generateUserMock()
    const userLoginAttemptsService = userService['userLoginAttemptsService']

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
    vi.spyOn(bcrypt, 'compare' as Mocked<keyof typeof bcrypt>).mockResolvedValue(true)

    const result = await userService.login(
      userWithMfa.email,
      'test-password',
      'pt-BR' as TLanguages,
    )

    expect(userRepository.getUser).toHaveBeenCalledWith({
      email: userWithMfa.email,
      status: 'ACTIVE',
      provider: 'API',
    })
    expect(result).toEqual({
      userId: userWithMfa.userId,
      email: userWithMfa.email,
      requirePasscode: true,
      method: 'APP',
    })
  })

  it('should send email passcode if MFA method is EMAIL', async () => {
    const { userService, userRepository, user, totpService, emailService, appConfig } =
      generateUserMock()
    const userLoginAttemptsService = userService['userLoginAttemptsService']

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
    vi.spyOn(bcrypt, 'compare' as Mocked<keyof typeof bcrypt>).mockResolvedValue(true)

    vi.spyOn(totpService, 'generatePasscode').mockReturnValueOnce('123456')
    vi.spyOn(userLoginAttemptsService, 'setUserPasscode').mockResolvedValueOnce()
    vi.spyOn(emailService, 'sendMailPasscode').mockResolvedValueOnce()

    const result = await userService.login(userWithEmailMfa.email, 'test-password', 'pt')

    expect(userRepository.getUser).toHaveBeenCalledWith({
      email: userWithEmailMfa.email,
      status: 'ACTIVE',
      provider: 'API',
    })
    expect(totpService.generatePasscode).toHaveBeenCalledWith(userWithEmailMfa.mfaKey?.secret || '')
    expect(userLoginAttemptsService.setUserPasscode).toHaveBeenCalledWith(
      userWithEmailMfa.userId,
      '123456',
      appConfig.otp.emailTimeoutInMinutes * 60,
    )
    expect(emailService.sendMailPasscode).toHaveBeenCalledWith(
      userWithEmailMfa.email,
      userWithEmailMfa.name,
      'pt',
      '123456',
    )
    expect(result).toEqual({
      userId: userWithEmailMfa.userId,
      email: userWithEmailMfa.email,
      requirePasscode: true,
      method: 'EMAIL',
    })
  })

  it('should throw error when login attempts are blocked', async () => {
    const { userService, userRepository, user } = generateUserMock()
    const userLoginAttemptsService = userService['userLoginAttemptsService']

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(user)
    vi.spyOn(userLoginAttemptsService, 'getUserAttempts').mockResolvedValueOnce({
      attempts: 0,
      attemptsBlockPeriod: '5m',
    })
    vi.spyOn(bcrypt, 'compare' as Mocked<keyof typeof bcrypt>).mockResolvedValue(true)

    vi.spyOn(userLoginAttemptsService, 'getAttemptsError').mockReturnValueOnce({
      key: 'exceededAttempts',
      params: { time: '5m' },
    })

    await expect(
      userService.login(user.email, 'test-password', 'pt-BR' as TLanguages),
    ).rejects.toThrow(CastError)

    expect(userRepository.getUser).toHaveBeenCalledWith({
      email: user.email,
      status: 'ACTIVE',
      provider: 'API',
    })
    expect(userLoginAttemptsService.getAttemptsError).toHaveBeenCalled()
  })

  it('should throw error for invalid login credentials', async () => {
    const { userService, userRepository, user } = generateUserMock()
    const userLoginAttemptsService = userService['userLoginAttemptsService']

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(user)
    vi.spyOn(userLoginAttemptsService, 'getUserAttempts').mockResolvedValueOnce({
      attempts: 0,
      attemptsBlockPeriod: undefined,
    })
    vi.spyOn(bcrypt, 'compare' as Mocked<keyof typeof bcrypt>).mockResolvedValue(false)

    vi.spyOn(userLoginAttemptsService, 'getAttemptsError').mockReturnValueOnce({
      key: 'invalidCredentials',
      params: {},
    })

    await expect(
      userService.login(user.email, 'wrong-password', 'pt-BR' as TLanguages),
    ).rejects.toThrowError(CastError)

    expect(userRepository.getUser).toHaveBeenCalledWith({
      email: user.email,
      status: 'ACTIVE',
      provider: 'API',
    })
    expect(userLoginAttemptsService.getAttemptsError).toHaveBeenCalledWith(
      user.userId,
      'login',
      expect.objectContaining({
        attempts: 1,
      }),
    )
  })

  it('should throw error when user is not found', async () => {
    const { userService, userRepository } = generateUserMock()

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(null)

    await expect(
      userService.login('nonexistent@email.com', 'password', 'pt-BR' as TLanguages),
    ).rejects.toThrow(CastError)

    expect(userRepository.getUser).toHaveBeenCalledWith({
      email: 'nonexistent@email.com',
      status: 'ACTIVE',
      provider: 'API',
    })
  })
})
