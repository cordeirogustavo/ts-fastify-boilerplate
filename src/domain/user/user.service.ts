import bcrypt from 'bcryptjs'
import { inject, singleton } from 'tsyringe'
import { type AppConfig, ConfigSymbols } from '@/config'
import { CastError, NotFoundError } from '@/shared/errors'
import {
  type IFacebookAuthProvider,
  type IGoogleAuthProvider,
  ProvidersSymbols,
} from '@/shared/providers'
import {
  type EmailService,
  type IAWSS3Service,
  type ITOTPService,
  ServicesSymbols,
  type TokenService,
} from '@/shared/services'
import type { TAuthPayload, TLanguages } from '@/shared/types'
import { capitalizeWords, mountMediaUrl } from '@/shared/utils'
import { UserLoginAttemptsSymbols } from '../user-login-attempts'
import type { IUserLoginAttemptsService } from '../user-login-attempts/user-login-attempts.interface'
import { mapUserToUserDto } from './user.mapper'
import type { IUserRepository } from './user.repository'
import { UserSymbols } from './user.symbols'
import type { TCreateUserInput, TUser, TUserDTO } from './user.types'

export interface IUserService {
  getUserById(userId: string): Promise<TUserDTO>
  createUser(userData: TCreateUserInput, language: TLanguages): Promise<TUserDTO>
  confirmAccount(token: string): Promise<TAuthPayload>
}

@singleton()
export class UserService implements IUserService {
  constructor(
    @inject(ConfigSymbols.AppConfig)
    private readonly appConfig: AppConfig,
    @inject(UserSymbols.UserRepository)
    protected userRepository: IUserRepository,
    @inject(ServicesSymbols.TokenService)
    private readonly tokenService: TokenService,
    @inject(ServicesSymbols.EmailService)
    private readonly emailService: EmailService,
    @inject(ProvidersSymbols.GoogleAuthProvider)
    private readonly googleAuthProvider: IGoogleAuthProvider,
    @inject(ProvidersSymbols.FacebookAuthProvider)
    private readonly facebookAuthProvider: IFacebookAuthProvider,
    @inject(ServicesSymbols.S3Service)
    private readonly s3Service: IAWSS3Service,
    @inject(ServicesSymbols.TOTPService)
    private readonly totpService: ITOTPService,
    @inject(UserLoginAttemptsSymbols.UserLoginAttemptsService)
    private readonly userLoginAttemptsService: IUserLoginAttemptsService,
  ) {}

  private async authenticate(user: TUser): Promise<TAuthPayload> {
    const userPicture = mountMediaUrl(this.appConfig.cdnUrl, user.userPicture || '')
    const userPermissions = {
      global: [],
      organizations: {},
    }
    return {
      userId: user.userId,
      email: user?.email || '',
      name: user.name,
      userPicture,
      scopes: userPermissions,
      token: this.tokenService.sign(
        {
          userId: user.userId,
          name: user.name,
          email: user.email,
          userPicture,
          scopes: userPermissions,
        },
        '1d',
      ),
    }
  }

  async getUserById(userId: string): Promise<TUserDTO> {
    const user = await this.userRepository.getUser({ userId })
    if (!user) throw new NotFoundError('userNotFound')
    return mapUserToUserDto(user)
  }

  async createUser(userData: TCreateUserInput, language: TLanguages): Promise<TUserDTO> {
    const alreadyExists = await this.userRepository.getUser({
      email: userData.email,
      provider: 'API',
    })
    if (alreadyExists) throw new CastError('userAlreadyExists')
    const createdUser = await this.userRepository.createUser({
      ...userData,
      name: capitalizeWords(userData?.name),
      email: userData?.email?.toLocaleLowerCase().trim(),
      password: userData?.password ? await bcrypt.hash(userData.password, 10) : '',
      mfaKey: this.totpService.generateKey(userData.email),
      status: 'PENDING',
    })
    const user = mapUserToUserDto(createdUser)
    if (!createdUser.email) return user
    const confirmToken = this.tokenService.sign(
      {
        userId: createdUser.userId,
        email: createdUser.email,
        type: 'CONFIRM_ACCOUNT',
      },
      '1d',
    )
    await this.emailService.sendAccountConfirmationEmail(
      createdUser.email,
      createdUser.name,
      language,
      confirmToken,
    )
    return user
  }
  async confirmAccount(token: string): Promise<TAuthPayload> {
    const decoded = this.tokenService.verify<{
      userId: string
      email: string
      type: string
    }>(token)
    if (!decoded.valid) throw new CastError('invalidToken')
    if (!decoded.payload?.type || decoded.payload.type !== 'CONFIRM_ACCOUNT')
      throw new CastError('invalidToken')
    const confirmedUser = await this.userRepository.updateUser(decoded.payload?.userId, {
      status: 'ACTIVE',
    })
    if (!confirmedUser) throw new CastError('invalidToken')
    return this.authenticate(confirmedUser)
  }
}
