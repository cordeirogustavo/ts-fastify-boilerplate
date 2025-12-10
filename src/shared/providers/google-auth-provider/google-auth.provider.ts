import { inject, singleton } from 'tsyringe'
import { type AppConfig, ConfigSymbols } from '@/config'
import { CastError } from '@/shared/errors/handlers'
import type {
  IGoogleAuthProvider,
  TGoogleUser,
  TGoogleUserResponse,
} from './google-auth.provider.interface'

@singleton()
export class GoogleAuthProvider implements IGoogleAuthProvider {
  constructor(@inject(ConfigSymbols.AppConfig) private readonly config: AppConfig) {}

  async authenticate(idToken: string): Promise<TGoogleUser | null> {
    const requestQueryParams = {
      code: idToken,
      client_id: this.config.google.oAuth.clientId || '',
      client_secret: this.config.google.oAuth.clientSecret || '',
      redirect_uri: this.config.appUrl || '',
      grant_type: 'authorization_code',
    }

    const tokenResponse = await fetch(`https://oauth2.googleapis.com/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(requestQueryParams),
    })

    if (!tokenResponse.ok) {
      throw new CastError('failedGoogleLogin')
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token: string
    }

    if (!tokenData.access_token) {
      throw new CastError('failedGoogleLogin')
    }
    const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userInfoResponse.ok) {
      throw new CastError('failedGoogleLogin')
    }

    const userInfo = (await userInfoResponse.json()) as TGoogleUserResponse

    return {
      googleId: userInfo.id,
      email: userInfo.email || '',
      name: userInfo.name || '',
      picture: userInfo.picture || '',
    }
  }
}
