import { generateConfig, Totp, type ValidTotpConfig } from 'time2fa'
import { inject, singleton } from 'tsyringe'
import { type AppConfig, ConfigSymbols } from '@/config'
import type { ITOTPService } from './TOTP.interface'
export type TOTPKey = {
  secret: string
  url: string
}

@singleton()
export class TOTPService implements ITOTPService {
  private readonly issuer: string
  private readonly otpConfig: ValidTotpConfig
  private readonly defaultValidationWindow = 1

  constructor(@inject(ConfigSymbols.AppConfig) config: AppConfig) {
    this.issuer = config.otp.issuer
    this.otpConfig = generateConfig()
  }

  generateKey(email: string): TOTPKey {
    const { secret, url } = Totp.generateKey(
      {
        issuer: this.issuer,
        user: email,
      },
      this.otpConfig,
    )

    return {
      secret,
      url,
    }
  }

  generatePasscode(secret: string, period?: number): string {
    const [passcode] = Totp.generatePasscodes(
      {
        secret,
      },
      generateConfig({
        period,
      }),
    )

    return passcode
  }

  validatePasscode(passcode: string, secret: string): boolean {
    return Totp.validate({
      passcode,
      secret,
      drift: this.defaultValidationWindow,
    })
  }
}
