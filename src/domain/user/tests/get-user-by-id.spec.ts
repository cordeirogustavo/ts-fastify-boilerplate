import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CastError, NotFoundError } from '@/shared/errors/handlers'
import { mapUserToUserDto } from '../user.mapper'
import { generateUserMock } from './user-mock'

describe('User Get By Id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should get user by id successfully', async () => {
    const { userRepository, userService, user } = generateUserMock()

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(user)

    const result = await userService.getUserById(user.userId)

    expect(result).toEqual(mapUserToUserDto(user))
    expect(userRepository.getUser).toHaveBeenCalledWith({ userId: user.userId })
  })

  it('should throw error when user is not found', async () => {
    const { userRepository, userService, user } = generateUserMock()

    vi.spyOn(userRepository, 'getUser').mockResolvedValueOnce(null)

    await expect(userService.getUserById(user.userId)).rejects.toEqual(
      new NotFoundError('userNotFound'),
    )

    expect(userRepository.getUser).toHaveBeenCalledWith({ userId: user.userId })
  })
})
