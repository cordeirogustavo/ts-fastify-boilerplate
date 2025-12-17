import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, type Mocked, vi } from 'vitest'
import { CastError } from '@/shared/errors/handlers'
import { generateUserMock } from './user-mock'

describe('User Reset Password', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should reset password successfully', async () => {
    const { userService, userRepository, tokenService, user, mockPermission } = generateUserMock()

    const mockPayload = {
      userId: user.userId,
      email: user.email,
      type: 'FORGOT_PASSWORD',
    }

    vi.spyOn(tokenService, 'verify').mockReturnValueOnce({
      valid: true,
      payload: mockPayload,
    })

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(user)

    const hashedPassword = 'hashed-new-password'
    vi.spyOn(bcrypt, 'hash' as Mocked<keyof typeof bcrypt>).mockResolvedValue(hashedPassword)

    vi.spyOn(userRepository, 'updateUser').mockResolvedValueOnce({
      ...user,
      password: hashedPassword,
      status: 'ACTIVE',
    })

    vi.spyOn(userService, 'authenticate').mockResolvedValueOnce({
      userId: user.userId,
      email: user.email,
      name: user.name,
      userPicture: '',
      token: 'new-token',
      scopes: mockPermission,
    })

    const result = await userService.resetPassword('valid-token', 'new-password')

    expect(tokenService.verify).toHaveBeenCalledWith('valid-token')
    expect(userRepository.getUser).toHaveBeenCalledWith({
      userId: user.userId,
      email: user.email,
      provider: 'API',
    })
    expect(userRepository.updateUser).toHaveBeenCalledWith(user.userId, {
      name: user.name,
      password: hashedPassword,
      status: 'ACTIVE',
    })
    expect(result).toEqual({
      userId: user.userId,
      email: user.email,
      name: user.name,
      userPicture: '',
      token: 'new-token',
      scopes: mockPermission,
    })
  })

  it('should throw error when token is invalid', async () => {
    const { userService, tokenService } = generateUserMock()

    vi.spyOn(tokenService, 'verify').mockReturnValueOnce({
      valid: false,
      payload: null,
    })

    await expect(userService.resetPassword('invalid-token', 'new-password')).rejects.toThrow(
      CastError,
    )

    expect(tokenService.verify).toHaveBeenCalledWith('invalid-token')
  })

  it('should throw error when token type is not FORGOT_PASSWORD', async () => {
    const { userService, tokenService, user } = generateUserMock()

    const mockPayload = {
      userId: user.userId,
      email: user.email,
      type: 'CONFIRM_ACCOUNT',
    }

    vi.spyOn(tokenService, 'verify').mockReturnValueOnce({
      valid: true,
      payload: mockPayload,
    })

    await expect(userService.resetPassword('wrong-type-token', 'new-password')).rejects.toThrow(
      CastError,
    )

    expect(tokenService.verify).toHaveBeenCalledWith('wrong-type-token')
  })

  it('should throw error when user is not found', async () => {
    const { userService, userRepository, tokenService, user } = generateUserMock()

    const mockPayload = {
      userId: user.userId,
      email: user.email,
      type: 'FORGOT_PASSWORD',
    }

    vi.spyOn(tokenService, 'verify').mockReturnValueOnce({
      valid: true,
      payload: mockPayload,
    })

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(null)

    await expect(userService.resetPassword('valid-token', 'new-password')).rejects.toThrow(
      CastError,
    )

    expect(tokenService.verify).toHaveBeenCalledWith('valid-token')
    expect(userRepository.getUser).toHaveBeenCalledWith({
      userId: user.userId,
      email: user.email,
      provider: 'API',
    })
  })
})
