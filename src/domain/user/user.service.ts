import { inject, singleton } from 'tsyringe'
import type { IUserRepository } from './user.repository'
import { UserSymbols } from './user.symbols'
import type { TUserDTO } from './user.types'

export interface IUserService {
  getUserById(userId: string): Promise<TUserDTO | null>
}

@singleton()
export class UserService implements IUserService {
  constructor(
    @inject(UserSymbols.UserRepository)
    protected userRepository: IUserRepository,
  ) {}
  async getUserById(userId: string): Promise<TUserDTO | null> {
    return await this.userRepository.getUserById(userId)
  }
}
