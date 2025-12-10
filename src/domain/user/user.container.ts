import type { DependencyContainer } from 'tsyringe'
import type { IContainer, IRouter } from '@/shared/interfaces'
import { UserController } from './user.controller'
import { UserRouter } from './user.router'
import { type IUserService, UserService } from './user.service'
import { UserSymbols } from './user.symbols'

export class UserContainer implements Partial<IContainer> {
  static register(container: DependencyContainer): void {
    container.register<IUserService>(UserSymbols.UserService, UserService)
    container.register<UserController>(UserSymbols.UserController, UserController)
    container.register<IRouter>(UserSymbols.UserRouter, UserRouter)
  }
}
