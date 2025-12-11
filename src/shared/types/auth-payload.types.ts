import type { TUserPermissionDTO } from './user-permission.types'

export type TAuthPayload = {
  userId: string
  email: string
  name: string
  userPicture: string
  token: string
  scopes: TUserPermissionDTO
}
