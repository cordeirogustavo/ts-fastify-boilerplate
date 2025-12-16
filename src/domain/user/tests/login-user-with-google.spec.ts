import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CastError } from '@/shared/errors/handlers'
import { mountMediaUrl } from '@/shared/utils'
import { generateUserMock } from './user-mock'

describe('User Login With Google', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should login with google when user is already registered', async () => {
    const {
      userRepository,
      userService,
      tokenService,
      googleProvider,
      user,
      appConfig,
      mockPermission,
    } = generateUserMock()

    vi.spyOn(googleProvider, 'authenticate').mockResolvedValueOnce({
      googleId: 'mocked-google-id',
      email: user.email || '',
      name: user.name,
      picture: 'mocked-google-picture',
    })

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce({
      ...user,
      provider: 'GOOGLE',
      mfaEnabled: 0,
      userPicture: 'mocked-google-picture',
    })

    vi.spyOn(tokenService, 'sign').mockReturnValueOnce('mocked-jwt-token')
    const loggedGoogleUser = await userService.loginWithGoogle('mocked-google-id', 'en')

    expect(loggedGoogleUser).toEqual({
      userId: user.userId,
      email: user.email,
      name: user.name,
      token: 'mocked-jwt-token',
      userPicture: mountMediaUrl(appConfig.cdnUrl, 'mocked-google-picture'),
      scopes: mockPermission,
    })

    expect(userRepository.getUser).toHaveBeenCalledWith({ email: user.email, provider: 'GOOGLE' })

    expect(tokenService.sign).toHaveBeenCalledWith(
      {
        userId: user.userId,
        name: user.name,
        email: user.email,
        userPicture: mountMediaUrl(appConfig.cdnUrl, 'mocked-google-picture'),
        scopes: mockPermission,
      },
      '1d',
    )
  })

  it('should require passcode when google user has MFA enabled', async () => {
    const { userRepository, userService, googleProvider, user } = generateUserMock()

    vi.spyOn(googleProvider, 'authenticate').mockResolvedValueOnce({
      googleId: 'mocked-google-id',
      email: user.email || '',
      name: user.name,
      picture: 'mocked-google-picture',
    })

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce({
      ...user,
      provider: 'GOOGLE',
      mfaEnabled: 1,
      mfaMethod: 'APP' as const,
    })

    const result = await userService.loginWithGoogle('mocked-google-id', 'en')

    expect(result).toEqual({
      userId: user.userId,
      email: user.email,
      requirePasscode: true,
      method: 'APP',
    })

    expect(userRepository.getUser).toHaveBeenCalledWith({ email: user.email, provider: 'GOOGLE' })
  })

  it('should login with google when user is not registered and create a new user', async () => {
    const {
      userRepository,
      userService,
      tokenService,
      googleProvider,
      user,
      totpService,
      appConfig,
      mockPermission,
    } = generateUserMock()

    vi.spyOn(googleProvider, 'authenticate').mockResolvedValueOnce({
      googleId: 'mocked-google-id',
      email: user.email || '',
      name: user.name,
      picture: 'mocked-google-picture',
    })

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(null)

    vi.spyOn(totpService, 'generateKey').mockReturnValueOnce({
      secret: 'mock-secret',
      url: 'mock-url',
    })

    vi.spyOn(userRepository, 'createUser').mockResolvedValueOnce({
      ...user,
      provider: 'GOOGLE',
      userPicture: 'mocked-google-picture',
    })

    vi.spyOn(tokenService, 'sign').mockReturnValueOnce('mocked-jwt-token')

    const loggedGoogleUser = await userService.loginWithGoogle('mocked-google-id', 'en')

    expect(loggedGoogleUser).toEqual({
      userId: user.userId,
      email: user.email,
      name: user.name,
      token: 'mocked-jwt-token',
      userPicture: mountMediaUrl(appConfig.cdnUrl, 'mocked-google-picture'),
      scopes: mockPermission,
    })

    expect(userRepository.getUser).toHaveBeenCalledWith({ email: user.email, provider: 'GOOGLE' })

    expect(userRepository.createUser).toHaveBeenCalledWith({
      email: user.email,
      name: user.name,
      password: '',
      provider: 'GOOGLE',
      userPicture: 'mocked-google-picture',
      status: 'ACTIVE',
      providerIdentifier: 'mocked-google-id',
      mfaKey: {
        secret: 'mock-secret',
        url: 'mock-url',
      },
    })

    expect(tokenService.sign).toHaveBeenCalledWith(
      {
        userId: user.userId,
        name: user.name,
        email: user.email,
        userPicture: mountMediaUrl(appConfig.cdnUrl, 'mocked-google-picture'),
        scopes: mockPermission,
      },
      '1d',
    )
  })

  it('should fail google login', async () => {
    const { userRepository, userService, tokenService, googleProvider, user } = generateUserMock()

    vi.spyOn(googleProvider, 'authenticate').mockResolvedValueOnce(null)

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(null)
    vi.spyOn(userRepository, 'createUser').mockResolvedValueOnce({
      ...user,
      provider: 'GOOGLE',
    })

    vi.spyOn(tokenService, 'sign').mockResolvedValueOnce('mocked-jwt-token')

    await expect(userService.loginWithGoogle('mocked-google-id', 'en')).rejects.toEqual(
      new CastError('failedGoogleLogin'),
    )

    expect(userRepository.getUser).not.toHaveBeenCalled()
    expect(userRepository.createUser).not.toHaveBeenCalled()
    expect(tokenService.sign).not.toHaveBeenCalled()
  })
})
