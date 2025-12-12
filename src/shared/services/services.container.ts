import type { DependencyContainer } from 'tsyringe'
import { type AppConfig, ConfigSymbols } from '@/config'
import type { IContainer } from '@/shared/interfaces'
import {
  EmailService,
  type IEmailService,
  type ITokenService,
  ServicesSymbols,
  TokenService,
} from './'
import { AWSS3Service, type IAWSS3Service } from './aws-s3-service'
import { type ITOTPService, TOTPService } from './TOTP-service'
import { TemplateService } from './template-service'

export class ServicesContainer implements Partial<IContainer> {
  static register(container: DependencyContainer): void {
    container.register<ITokenService>(ServicesSymbols.TokenService, {
      useFactory: (container) => {
        const appConfig = container.resolve<AppConfig>(ConfigSymbols.AppConfig)
        return new TokenService(appConfig.appSecret)
      },
    })
    container.register<IEmailService>(ServicesSymbols.EmailService, EmailService)
    container.register(ServicesSymbols.TemplateService, TemplateService)
    container.register<IAWSS3Service>(ServicesSymbols.S3Service, AWSS3Service)
    container.register<ITOTPService>(ServicesSymbols.TOTPService, TOTPService)
  }
}
