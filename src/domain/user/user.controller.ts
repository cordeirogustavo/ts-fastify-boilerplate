import { inject, singleton } from 'tsyringe'
import type { IHandle } from '@/shared/interfaces'
import type { GetUserById } from './user.schema'
import type { IUserService } from './user.service'
import { UserSymbols } from './user.symbols'

@singleton()
export class UserController {
  constructor(
    @inject(UserSymbols.UserService)
    private readonly userService: IUserService,
  ) {}

  getUserById: IHandle<typeof GetUserById> = async (req, reply) => {
    const { userId } = req.params
    const user = await this.userService.getUserById(userId)
    return reply.status(200).send(user)
  }
}
