import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CastError } from '@/shared/errors/handlers'
import { mapUserToUserDto } from '../user.mapper'
import { generateUserMock } from './user-mock'

describe('User Create', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a user when no existing user with the same email', async () => {
    const {
      userRepository,
      userService,
      emailService,
      tokenService,
      totpService,
      user,
      userInput,
      mfaKey,
    } = generateUserMock()

    vi.spyOn(tokenService, 'sign').mockReturnValue('mocked-jwt-token')
    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(null)
    vi.spyOn(totpService, 'generateKey').mockReturnValueOnce(mfaKey)
    vi.spyOn(userRepository, 'createUser').mockResolvedValueOnce(user)

    vi.spyOn(emailService, 'sendAccountConfirmationEmail').mockResolvedValueOnce(undefined)

    const result = await userService.createUser(userInput, 'en')

    expect(result).toEqual(mapUserToUserDto(user))

    expect(userRepository.getUser).toHaveBeenCalledWith({
      email: userInput.email,
      provider: userInput.provider,
    })
    expect(userRepository.getUser).toHaveResolvedWith(null)
    expect(totpService.generateKey).toHaveBeenCalledWith(userInput.email)
    expect(userRepository.createUser).toHaveBeenCalledWith({
      ...userInput,
      name: 'Test User',
      email: 'test@example.com',
      password: expect.stringMatching(/^\$2[aby]\$.{56}$/),
      mfaKey: mfaKey,
    })
    expect(tokenService.sign).toHaveBeenCalledWith(
      {
        userId: user.userId,
        email: user.email,
        type: 'CONFIRM_ACCOUNT',
      },
      '1d',
    )
    expect(emailService.sendAccountConfirmationEmail).toHaveBeenCalledWith(
      user.email,
      user.name,
      'en',
      'mocked-jwt-token',
    )
  })

  it('should not create a user when an existing user with the same email', async () => {
    const { userRepository, userService, tokenService, userInput, user } = generateUserMock()

    vi.spyOn(tokenService, 'sign').mockReturnValue('mocked-jwt-token')
    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(user)
    vi.spyOn(userRepository, 'createUser').mockRejectedValueOnce(undefined)

    await expect(userService.createUser(userInput, 'en')).rejects.toEqual(
      new CastError('userAlreadyExists'),
    )

    expect(userRepository.getUser).toHaveBeenCalledWith({
      email: userInput.email,
      provider: userInput.provider,
    })
    expect(userRepository.createUser).not.toHaveBeenCalled()
  })
})
