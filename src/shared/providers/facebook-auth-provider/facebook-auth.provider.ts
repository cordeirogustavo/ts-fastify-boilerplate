import { singleton } from 'tsyringe'
import { CastError } from '@/shared/errors/handlers'
import type {
  IFacebookAuthProvider,
  TFacebookUser,
  TFacebookUserResponse,
} from './facebook-auth.provider.interface'

@singleton()
export class FacebookAuthProvider implements IFacebookAuthProvider {
  async authenticate(userId: string, token: string): Promise<TFacebookUser | null> {
    const userInfoResponse = await fetch(
      `https://graph.facebook.com/${userId}?fields=id,name,email,picture&access_token=${token}`,
      {
        method: 'GET',
      },
    )

    if (!userInfoResponse.ok) {
      const _errorText = await userInfoResponse.text()
      throw new CastError('failedFacebookLogin')
    }

    const userInfo = (await userInfoResponse.json()) as TFacebookUserResponse

    if (!userInfo.id) {
      throw new CastError('failedFacebookLogin')
    }

    return {
      facebookId: userInfo.id,
      email: userInfo.email || '',
      name: userInfo.name || '',
      picture: userInfo.picture?.data?.url || '',
    }
  }
}
