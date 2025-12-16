import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CastError, NotFoundError } from '@/shared/errors/handlers'
import { generateUserMock } from './user-mock'

describe('User Change Password', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should change password successfully', async () => {
    const { userRepository, userService, user } = generateUserMock()

    const changePasswordInput = {
      oldPassword: 'old-password',
      newPassword: 'new-password',
    }

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(user)
    vi.spyOn(bcrypt, 'compare').mockImplementationOnce(() => Promise.resolve(true))
    vi.spyOn(bcrypt, 'hash').mockImplementationOnce(() => Promise.resolve('hashed-new-password'))
    vi.spyOn(userRepository, 'updateUser').mockResolvedValueOnce({
      ...user,
      password: 'hashed-new-password',
    })

    const result = await userService.changePassword(user.userId, changePasswordInput)

    expect(result).toBe(true)
    expect(userRepository.getUser).toHaveBeenCalledWith({ userId: user.userId })
    expect(bcrypt.compare).toHaveBeenCalledWith(changePasswordInput.oldPassword, user.password)
    expect(bcrypt.hash).toHaveBeenCalledWith(changePasswordInput.newPassword, 10)
    expect(userRepository.updateUser).toHaveBeenCalledWith(user.userId, {
      password: 'hashed-new-password',
    })
  })

  it('should throw error when user is not found', async () => {
    const { userRepository, userService, user } = generateUserMock()

    const changePasswordInput = {
      oldPassword: 'old-password',
      newPassword: 'new-password',
    }

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(null)
    vi.spyOn(userRepository, 'updateUser').mockResolvedValueOnce(null)

    await expect(userService.changePassword(user.userId, changePasswordInput)).rejects.toEqual(
      new NotFoundError('userNotFound'),
    )

    expect(userRepository.getUser).toHaveBeenCalledWith({ userId: user.userId })
    expect(bcrypt.compare).not.toHaveBeenCalled()
    expect(bcrypt.hash).not.toHaveBeenCalled()
    expect(userRepository.updateUser).not.toHaveBeenCalled()
  })

  it('should throw error when current password is invalid', async () => {
    const { userRepository, userService, user } = generateUserMock()

    const changePasswordInput = {
      oldPassword: 'wrong-password',
      newPassword: 'new-password',
    }

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce({ ...user, provider: 'API' })
    vi.spyOn(bcrypt, 'compare').mockImplementationOnce(() => Promise.resolve(false))
    vi.spyOn(userRepository, 'updateUser').mockResolvedValueOnce(null)

    await expect(userService.changePassword(user.userId, changePasswordInput)).rejects.toEqual(
      new CastError('invalidCredentials'),
    )

    expect(userRepository.getUser).toHaveBeenCalledWith({ userId: user.userId })
    expect(bcrypt.compare).toHaveBeenCalledWith(changePasswordInput.oldPassword, user.password)
    expect(bcrypt.hash).not.toHaveBeenCalled()
    expect(userRepository.updateUser).not.toHaveBeenCalled()
  })
})
