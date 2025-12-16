import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CastError } from '@/shared/errors/handlers'
import { mountMediaUrl } from '@/shared/utils'
import { generateUserMock } from './user-mock'

describe('User Confirm Account', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should confirm account successfully', async () => {
    const { userRepository, userService, tokenService, user, appConfig } = generateUserMock()

    const token = 'valid-token'
    const decodedPayload = {
      userId: user.userId,
      email: user.email,
      type: 'CONFIRM_ACCOUNT',
    }

    vi.spyOn(tokenService, 'verify').mockReturnValueOnce({
      valid: true,
      payload: decodedPayload,
    })

    vi.spyOn(userRepository, 'updateUser').mockResolvedValueOnce({
      ...user,
      status: 'ACTIVE',
    })

    vi.spyOn(userService, 'authenticate').mockResolvedValueOnce({
      userId: user.userId,
      email: user.email,
      name: user.name,
      userPicture: mountMediaUrl(appConfig.cdnUrl, user.userPicture || ''),
      token: 'new-token',
    })
    vi.spyOn(tokenService, 'sign').mockReturnValueOnce('new-token')

    const result = await userService.confirmAccount(token)

    expect(result).toEqual({
      userId: user.userId,
      email: user.email,
      name: user.name,
      userPicture: mountMediaUrl(appConfig.cdnUrl, user.userPicture || ''),
      token: 'new-token',
    })

    expect(tokenService.verify).toHaveBeenCalledWith(token)
    expect(userRepository.updateUser).toHaveBeenCalledWith(user.userId, {
      status: 'ACTIVE',
    })
  })

  it('should throw error when token is invalid', async () => {
    const { userService, tokenService } = generateUserMock()

    const token = 'invalid-token'

    vi.spyOn(tokenService, 'verify').mockReturnValueOnce({
      valid: false,
      payload: null,
    })

    await expect(userService.confirmAccount(token)).rejects.toEqual(new CastError('invalidToken'))

    expect(tokenService.verify).toHaveBeenCalledWith(token)
  })

  it('should throw error when token type is not CONFIRM_ACCOUNT', async () => {
    const { userService, tokenService, user } = generateUserMock()

    const token = 'wrong-type-token'
    const decodedPayload = {
      userId: user.userId,
      email: user.email,
      type: 'WRONG_TYPE',
    }

    vi.spyOn(tokenService, 'verify').mockReturnValueOnce({
      valid: true,
      payload: decodedPayload,
    })

    await expect(userService.confirmAccount(token)).rejects.toEqual(new CastError('invalidToken'))

    expect(tokenService.verify).toHaveBeenCalledWith(token)
  })

  it('should throw error when user is not found', async () => {
    const { userRepository, userService, tokenService, user } = generateUserMock()

    const token = 'valid-token'
    const decodedPayload = {
      userId: user.userId,
      email: user.email,
      type: 'CONFIRM_ACCOUNT',
    }

    vi.spyOn(tokenService, 'verify').mockReturnValueOnce({
      valid: true,
      payload: decodedPayload,
    })

    vi.spyOn(userRepository, 'updateUser').mockResolvedValueOnce(null)

    await expect(userService.confirmAccount(token)).rejects.toEqual(new CastError('invalidToken'))

    expect(tokenService.verify).toHaveBeenCalledWith(token)
    expect(userRepository.updateUser).toHaveBeenCalledWith(user.userId, {
      status: 'ACTIVE',
    })
  })
})
