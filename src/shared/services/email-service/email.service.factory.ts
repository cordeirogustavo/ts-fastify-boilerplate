import type { AppConfig } from '@/config'
import { NodeMailerService } from '../node-mailer-service'
import type { IEmailService } from './email.service.interface'

export class EmailServiceFactory {
  public static createEmailService(config: AppConfig): IEmailService {
    switch (config.email.emailProvider || 'nodemailer') {
      case 'nodemailer':
        return new NodeMailerService(config)
      default:
        throw new Error('Unsupported email service')
    }
  }
}
