import type { FastifyInstance } from 'fastify'
import { inject, injectable } from 'tsyringe'
import { UserSymbols } from '@/domain/user'
import type { IRouter } from '@/shared/interfaces'

@injectable()
export class AppRouter implements IRouter {
  constructor(
    @inject(UserSymbols.UserRouter)
    private userRouter: IRouter,
  ) {}

  public register(app: FastifyInstance): void {
    this.userRouter.register(app)
  }
}
