import { inject, singleton } from 'tsyringe'
import { type AppConfig, ConfigSymbols } from '@/config'
import { getTranslate, type TLanguages } from '@/shared/utils/translates'
import {
  EmailPasscodeTemplate,
  type TEmailPasscodeTemplate,
  type TUserActivationEmail,
  type TUserForgotPasswordEmail,
  UserActivationEmailTemplate,
  UserForgotPasswordEmailTemplate,
} from '@/templates'
import { EmailServiceFactory, type IEmailService, type TemplateService } from '../'
import { ServicesSymbols } from '../services.symbols'

@singleton()
export class EmailService implements IEmailService {
  private emailService: IEmailService

  constructor(
    @inject(ConfigSymbols.AppConfig)
    private readonly config: AppConfig,
    @inject(ServicesSymbols.TemplateService)
    private readonly templateService: TemplateService,
  ) {
    this.emailService = EmailServiceFactory.createEmailService(this.config)
  }

  public async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      await this.emailService.sendEmail(to, subject, body)
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }

  public async sendAccountConfirmationEmail(
    email: string,
    name: string,
    language: TLanguages,
    token: string,
  ): Promise<void> {
    this.sendEmail(
      email,
      getTranslate('emailConfirmation', language),
      this.templateService.render<TUserActivationEmail>(UserActivationEmailTemplate, {
        hello: getTranslate('hello', language),
        userName: name,
        welcomeActivateEmailMessage: getTranslate('welcomeActivateEmailMessage', language),
        ignoreEmailMessage: getTranslate('ignoreEmailMessage', language),
        confirmAccount: getTranslate('confirmAccount', language),
        confirmAccountLink: `${this.config.appUrl}/confirm-account?token=${token}`,
        allRightsReserved: getTranslate('allRightsReserved', language),
      }),
    )
  }

  public async sendResetPasswordEmail(
    email: string,
    name: string,
    language: TLanguages,
    token: string,
  ): Promise<void> {
    this.sendEmail(
      email,
      getTranslate('forgotPasswordRequestTitle', language),
      this.templateService.render<TUserForgotPasswordEmail>(UserForgotPasswordEmailTemplate, {
        hello: getTranslate('hello', language),
        userName: name,
        forgotPasswordEmailMessage: getTranslate('forgotPasswordEmailMessage', language),
        ignoreEmailMessage: getTranslate('ignoreEmailMessage', language),
        createNewPassword: getTranslate('createNewPassword', language),
        createNewPasswordLink: `${this.config.appUrl}/reset-password?token=${token}`,
        allRightsReserved: getTranslate('allRightsReserved', language),
      }),
    )
  }

  public async sendMailPasscode(
    email: string,
    name: string,
    language: TLanguages,
    passcode: string,
  ): Promise<void> {
    this.sendEmail(
      email,
      getTranslate('twoFactorAuthenticationTitle', language),
      this.templateService.render<TEmailPasscodeTemplate>(EmailPasscodeTemplate, {
        hello: getTranslate('hello', language),
        userName: name,
        passcodeMessage: getTranslate('passcodeMessage', language),
        passcode: passcode,
        expirationMessage: getTranslate('passcodeExpirationMessage', language, {
          minutes: this.config.otp.emailTimeoutInMinutes,
        }),
        ignoreEmailMessage: getTranslate('ignoreEmailMessage', language),
        allRightsReserved: getTranslate('allRightsReserved', language),
      }),
    )
  }
}
