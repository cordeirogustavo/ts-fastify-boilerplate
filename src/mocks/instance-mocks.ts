import { vi } from 'vitest'
import { UserRepository } from '@/domain/user/user.repository'
import { UserService } from '@/domain/user/user.service'
import { UserLoginAttemptsCache } from '@/domain/user-login-attempts/user-login-attempts.cache'
import type { IUserLoginAttemptsService } from '@/domain/user-login-attempts/user-login-attempts.interface'
import { UserLoginAttemptsService } from '@/domain/user-login-attempts/user-login-attempts.service'
import { UserLoginPasscodeCache } from '@/domain/user-login-attempts/user-login-passcode.cache'
import { FacebookAuthProvider, GoogleAuthProvider } from '@/shared/providers'
import type { CacheFactory } from '@/shared/providers/cache-provider'
import type { DatabaseProvider, DrizzleDB } from '@/shared/providers/database-provider'
import { EmailService, TemplateService, TOTPService, TokenService } from '@/shared/services'
import { AWSS3Service } from '@/shared/services/aws-s3-service/aws-s3.service'
import { appConfig } from './config-mocks'

export const generateInstanceMock = () => {
  const drizzleMock = (): DrizzleDB => {
    return {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
      limit: vi.fn().mockReturnThis(),
    } as unknown as DrizzleDB
  }
  const databaseProvider: DatabaseProvider = {
    db: drizzleMock(),
    closePool: vi.fn(),
  } as unknown as DatabaseProvider

  const tokenService = new TokenService(appConfig.appSecret)
  const totpService = new TOTPService(appConfig)
  const s3Service = new AWSS3Service(appConfig)
  const userRepository = new UserRepository(databaseProvider)
  const templateService = new TemplateService()
  const emailService = new EmailService(appConfig, templateService)
  const googleProvider = new GoogleAuthProvider(appConfig)
  const facebookProvider = new FacebookAuthProvider()

  const userLoginAttemptsCache = new UserLoginAttemptsCache({
    create: () => ({
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(true),
      del: vi.fn().mockResolvedValue(1),
      take: vi.fn().mockResolvedValue(undefined),
    }),
  } as unknown as CacheFactory)

  const userLoginPasscodeCache = new UserLoginPasscodeCache({
    create: () => ({
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(true),
      del: vi.fn().mockResolvedValue(1),
      take: vi.fn().mockResolvedValue(undefined),
    }),
  } as unknown as CacheFactory)

  const userLoginAttemptsService = new UserLoginAttemptsService(
    appConfig,
    userLoginAttemptsCache,
    userLoginPasscodeCache,
  ) as IUserLoginAttemptsService

  const userService = new UserService(
    appConfig,
    userRepository,
    tokenService,
    emailService,
    googleProvider,
    facebookProvider,
    s3Service,
    totpService,
    userLoginAttemptsService,
  )

  return {
    databaseProvider,
    appConfig,
    s3Service,
    templateService,
    emailService,
    googleProvider,
    facebookProvider,
    totpService,
    userRepository,
    tokenService,
    userService,
    userLoginAttemptsCache,
    userLoginPasscodeCache,
    userLoginAttemptsService,
  }
}
