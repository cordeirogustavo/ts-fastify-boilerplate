import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CastError } from '@/shared/errors/handlers'
import { mountMediaUrl } from '@/shared/utils'
import { generateUserMock } from './user-mock'

describe('User Login With Facebook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should login with facebook when user is already registered', async () => {
    const {
      userRepository,
      userService,
      tokenService,
      facebookProvider,
      user,
      appConfig,
      mockPermission,
    } = generateUserMock()

    vi.spyOn(facebookProvider, 'authenticate').mockResolvedValueOnce({
      facebookId: 'mocked-facebook-id',
      email: user.email || '',
      name: user.name,
      picture: 'https://facebook.com/mocked-facebook-picture',
    })

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce({
      ...user,
      provider: 'FACEBOOK',
      mfaEnabled: 0,
      userPicture: 'https://facebook.com/mocked-facebook-picture',
    })

    vi.spyOn(tokenService, 'sign').mockReturnValueOnce('mocked-jwt-token')

    const loggedFacebookUser = await userService.loginWithFacebook(
      'mocked-facebook-id',
      'mocked-facebook-token',
      'en',
    )

    expect(loggedFacebookUser).toEqual({
      userId: user.userId,
      email: user.email,
      name: user.name,
      token: 'mocked-jwt-token',
      userPicture: mountMediaUrl(appConfig.cdnUrl, 'https://facebook.com/mocked-facebook-picture'),
      scopes: mockPermission,
    })

    expect(userRepository.getUser).toHaveBeenCalledWith({ email: user.email, provider: 'FACEBOOK' })

    expect(tokenService.sign).toHaveBeenCalledWith(
      {
        userId: user.userId,
        name: user.name,
        email: user.email,
        userPicture: mountMediaUrl(
          appConfig.cdnUrl,
          'https://facebook.com/mocked-facebook-picture',
        ),
        scopes: mockPermission,
      },
      '1d',
    )
  })

  it('should require passcode when facebook user has MFA enabled', async () => {
    const { userRepository, userService, facebookProvider, user } = generateUserMock()

    vi.spyOn(facebookProvider, 'authenticate').mockResolvedValueOnce({
      facebookId: 'mocked-facebook-id',
      email: user.email || '',
      name: user.name,
      picture: 'https://facebook.com/mocked-facebook-picture',
    })

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce({
      ...user,
      provider: 'FACEBOOK',
      mfaEnabled: 1,
      mfaMethod: 'APP' as const,
    })

    const result = await userService.loginWithFacebook(
      'mocked-facebook-id',
      'mocked-facebook-token',
      'en',
    )

    expect(result).toEqual({
      userId: user.userId,
      email: user.email,
      requirePasscode: true,
      method: 'APP',
    })

    expect(userRepository.getUser).toHaveBeenCalledWith({ email: user.email, provider: 'FACEBOOK' })
  })

  it('should login with facebook when user is not registered and create a new user', async () => {
    const {
      userRepository,
      userService,
      tokenService,
      facebookProvider,
      user,
      totpService,
      appConfig,
      mockPermission,
    } = generateUserMock()

    vi.spyOn(facebookProvider, 'authenticate').mockResolvedValueOnce({
      facebookId: 'mocked-facebook-id',
      email: user.email || '',
      name: user.name,
      picture: 'https://facebook.com/mocked-facebook-picture',
    })

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(null)

    vi.spyOn(totpService, 'generateKey').mockReturnValueOnce({
      secret: 'mock-secret',
      url: 'mock-url',
    })

    vi.spyOn(userRepository, 'createUser').mockResolvedValueOnce({
      ...user,
      provider: 'FACEBOOK',
      userPicture: 'https://facebook.com/mocked-facebook-picture',
    })

    vi.spyOn(tokenService, 'sign').mockReturnValueOnce('mocked-jwt-token')

    const loggedFacebookUser = await userService.loginWithFacebook(
      'mocked-facebook-id',
      'mocked-facebook-token',
      'en',
    )

    expect(loggedFacebookUser).toEqual({
      userId: user.userId,
      email: user.email,
      name: user.name,
      token: 'mocked-jwt-token',
      userPicture: mountMediaUrl(appConfig.cdnUrl, 'https://facebook.com/mocked-facebook-picture'),
      scopes: mockPermission,
    })

    expect(userRepository.getUser).toHaveBeenCalledWith({ email: user.email, provider: 'FACEBOOK' })

    expect(userRepository.createUser).toHaveBeenCalledWith({
      email: user.email,
      name: user.name,
      password: '',
      provider: 'FACEBOOK',
      userPicture: 'https://facebook.com/mocked-facebook-picture',
      status: 'ACTIVE',
      providerIdentifier: 'mocked-facebook-id',
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
        userPicture: mountMediaUrl(
          appConfig.cdnUrl,
          'https://facebook.com/mocked-facebook-picture',
        ),
        scopes: mockPermission,
      },
      '1d',
    )
  })

  it('should fail facebook login', async () => {
    const { userRepository, userService, tokenService, facebookProvider, user } = generateUserMock()

    vi.spyOn(facebookProvider, 'authenticate').mockResolvedValueOnce(null)

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(null)
    vi.spyOn(userRepository, 'createUser').mockResolvedValueOnce({
      ...user,
      provider: 'FACEBOOK',
    })

    vi.spyOn(tokenService, 'sign').mockResolvedValueOnce('mocked-jwt-token')

    await expect(
      userService.loginWithFacebook('mocked-facebook-id', 'mocked-facebook-token', 'en'),
    ).rejects.toEqual(new CastError('failedFacebookLogin'))

    expect(userRepository.getUser).not.toHaveBeenCalled()
    expect(userRepository.createUser).not.toHaveBeenCalled()
    expect(tokenService.sign).not.toHaveBeenCalled()
  })
})
