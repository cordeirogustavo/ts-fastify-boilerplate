import type { TUser, TUserDTO } from './user.types'

export const mapUserToUserDto = (user: TUser): TUserDTO => {
  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    userPicture: user.userPicture,
    mfaEnabled: user.mfaEnabled || 0,
    mfaMethod: user.mfaMethod,
    mfaKey: user.mfaKey,
    provider: user.provider || null,
  }
}
