import { inject, injectable } from 'tsyringe'
import { UserSymbols } from '@/domain/user'
import type { IRouter } from '@/shared/interfaces'
import type { FastifyTypedInstance } from '../types'

@injectable()
export class AppRouter implements IRouter {
  constructor(
    @inject(UserSymbols.UserRouter)
    private userRouter: IRouter,
  ) {}

  public register(app: FastifyTypedInstance): void {
    this.userRouter.register(app)
  }
}
