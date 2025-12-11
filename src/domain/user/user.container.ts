import type { DependencyContainer } from 'tsyringe'
import type { IContainer, IRouter } from '@/shared/interfaces'
import { type IUserRepository, UserRepository } from './user.repository'
import { UserRouter } from './user.router'
import { type IUserService, UserService } from './user.service'
import { UserSymbols } from './user.symbols'

export class UserContainer implements Partial<IContainer> {
  static register(container: DependencyContainer): void {
    container.register<IUserRepository>(UserSymbols.UserRepository, UserRepository)
    container.register<IUserService>(UserSymbols.UserService, UserService)
    container.register<IRouter>(UserSymbols.UserRouter, UserRouter)
  }
}
