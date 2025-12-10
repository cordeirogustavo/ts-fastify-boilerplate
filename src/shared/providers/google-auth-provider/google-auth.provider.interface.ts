export type TGoogleUser = {
  googleId: string
  email: string
  name: string
  picture: string
}

export type TGoogleUserResponse = {
  id: string
  email: string
  name: string
  picture: string
}

export interface IGoogleAuthProvider {
  authenticate(token: string): Promise<TGoogleUser | null>
}
