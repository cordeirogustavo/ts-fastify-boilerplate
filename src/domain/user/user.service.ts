import type { TUserDTO } from './user.types'

export interface IUserService {
  getUserById(userId: string): Promise<TUserDTO | null>
}

export class UserService implements IUserService {
  async getUserById(userId: string): Promise<TUserDTO | null> {
    return {
      userId,
      name: 'John Doe',
      email: 'XV2Oa@example.com',
      userPicture: '',
      mfaEnabled: 0,
      mfaMethod: 'EMAIL',
      provider: 'api',
      mfaKey: {
        secret: '',
        url: '',
      },
    }
  }
}
