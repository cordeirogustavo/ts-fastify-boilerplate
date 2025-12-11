import { inject, singleton } from 'tsyringe'
import { NotFoundError } from '@/shared/errors'
import type { IUserRepository } from './user.repository'
import { UserSymbols } from './user.symbols'
import type { TUserDTO } from './user.types'

export interface IUserService {
  getUserById(userId: string): Promise<TUserDTO>
}

@singleton()
export class UserService implements IUserService {
  constructor(
    @inject(UserSymbols.UserRepository)
    protected userRepository: IUserRepository,
  ) {}
  async getUserById(userId: string): Promise<TUserDTO> {
    const user = await this.userRepository.getUserById(userId)
    if (!user) throw new NotFoundError('userNotFound')
    return user
  }
}
