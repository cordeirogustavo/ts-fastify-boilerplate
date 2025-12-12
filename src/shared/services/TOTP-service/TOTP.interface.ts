import type { TOTPKey } from './TOTP.service'

export interface ITOTPService {
  generateKey(email: string): TOTPKey
  generatePasscode(secret: string, period?: number): string
  validatePasscode(passcode: string, secret: string): boolean
}
