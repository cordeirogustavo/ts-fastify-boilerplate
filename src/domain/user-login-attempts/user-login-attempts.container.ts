import type { DependencyContainer } from 'tsyringe'
import type { IContainer } from '@/shared/interfaces'

import { UserLoginAttemptsCache } from './user-login-attempts.cache'
import type { IUserLoginAttemptsService } from './user-login-attempts.interface'
import { UserLoginAttemptsService } from './user-login-attempts.service'
import { UserLoginAttemptsSymbols } from './user-login-attempts.symbols'
import { UserLoginPasscodeCache } from './user-login-passcode.cache'

export class UserLoginAttemptsContainer implements Partial<IContainer> {
  static register(container: DependencyContainer): void {
    container.register<IUserLoginAttemptsService>(
      UserLoginAttemptsSymbols.UserLoginAttemptsService,
      UserLoginAttemptsService,
    )
    container.register<UserLoginAttemptsCache>(
      UserLoginAttemptsSymbols.UserLoginAttemptsCache,
      UserLoginAttemptsCache,
    )
    container.register<UserLoginPasscodeCache>(
      UserLoginAttemptsSymbols.UserLoginPasscodeCache,
      UserLoginPasscodeCache,
    )
  }
}
