export type TFacebookUser = {
  facebookId: string
  email: string
  name: string
  picture: string
}

export type TFacebookUserResponse = {
  id: string
  email: string
  name: string
  picture: {
    data: {
      url: string
    }
  }
}

export interface IFacebookAuthProvider {
  authenticate(userId: string, token: string): Promise<TFacebookUser | null>
}
