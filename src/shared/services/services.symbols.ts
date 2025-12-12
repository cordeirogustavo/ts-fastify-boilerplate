import { TokenService } from './token-service'

export const ServicesSymbols = {
  EmailService: Symbol.for('EmailService'),
  TemplateService: Symbol.for('TemplateService'),
  NodeMailerService: Symbol.for('NodeMailerService'),
  S3Service: Symbol.for('S3Service'),
  TOTPService: Symbol.for('TOTPService'),
  TokenService: Symbol.for('TokenService'),
}
