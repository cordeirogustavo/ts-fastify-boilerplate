import bcrypt from 'bcryptjs'
import { inject, singleton } from 'tsyringe'
import { type AppConfig, ConfigSymbols } from '@/config'
import { CastError, ExpiredError, NotFoundError } from '@/shared/errors'
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
import { capitalizeWords, getKey, mountMediaUrl } from '@/shared/utils'
import { UserLoginAttemptsSymbols } from '../user-login-attempts'
import type { IUserLoginAttemptsService } from '../user-login-attempts/user-login-attempts.interface'
import { mapUserToUserDto } from './user.mapper'
import type { IUserRepository } from './user.repository'
import { UserSymbols } from './user.symbols'
import type {
  TChangePasswordInput,
  TCreateUserInput,
  TForgotPassword,
  TLoginRequirePasscode,
  TUpdateUserInput,
  TUser,
  TUserDTO,
} from './user.types'

export interface IUserService {
  authenticate(user: TUser): Promise<TAuthPayload>
  sendMailPasscode(user: TUser, language: TLanguages): Promise<void>
  getUserById(userId: string): Promise<TUserDTO>
  createUser(userData: TCreateUserInput, language: TLanguages): Promise<TUserDTO>
  confirmAccount(token: string): Promise<TAuthPayload>
  login(
    email: string,
    password: string,
    language: TLanguages,
  ): Promise<TAuthPayload | TLoginRequirePasscode>
  loginWithGoogle(
    idToken: string,
    language: TLanguages,
  ): Promise<TAuthPayload | TLoginRequirePasscode>
  loginWithFacebook(
    userId: string,
    token: string,
    language: TLanguages,
  ): Promise<TAuthPayload | TLoginRequirePasscode>
  validatePasscode(userId: string, passcode: string): Promise<TAuthPayload>
  forgotPassword(email: string, language: TLanguages): Promise<TForgotPassword>
  resetPassword(token: string, newPassword: string): Promise<TAuthPayload>
  updateUser(userId: string, data: TUpdateUserInput): Promise<TUserDTO>
  changePassword(userId: string, data: TChangePasswordInput): Promise<boolean>
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

  async authenticate(user: TUser): Promise<TAuthPayload> {
    const userPicture = mountMediaUrl(this.appConfig.cdnUrl, user.userPicture || '')
    const userPermissions = {
      global: [],
      organizations: {},
    }
    return {
      userId: user.userId,
      email: user.email,
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

  async sendMailPasscode(user: TUser, language: TLanguages): Promise<void> {
    const emailPasscode = this.totpService.generatePasscode(user?.mfaKey?.secret || '')
    await this.userLoginAttemptsService.setUserPasscode(
      user.userId,
      emailPasscode,
      this.appConfig.otp.emailTimeoutInMinutes * 60,
    )
    await this.emailService.sendMailPasscode(user.email, user.name, language, emailPasscode)
  }

  async getUserById(userId: string): Promise<TUserDTO> {
    const user = await this.userRepository.getUser({ userId })
    if (!user) throw new NotFoundError('userNotFound')
    return mapUserToUserDto({
      ...user,
      userPicture: mountMediaUrl(this.appConfig.cdnUrl, user.userPicture || ''),
    })
  }

  async createUser(userData: TCreateUserInput, language: TLanguages): Promise<TUserDTO> {
    const alreadyExists = await this.userRepository.getUser({
      email: userData.email,
      provider: 'API',
    })
    if (alreadyExists) throw new CastError('userAlreadyExists')
    const createdUser = await this.userRepository.createUser({
      ...userData,
      name: capitalizeWords(userData.name),
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

  async login(
    email: string,
    password: string,
    language: TLanguages,
  ): Promise<TAuthPayload | TLoginRequirePasscode> {
    const user = await this.userRepository.getUser({
      email: email.toLocaleLowerCase().trim(),
      status: 'ACTIVE',
      provider: 'API',
    })
    const isPasswordValid = await bcrypt.compare(password || '', user?.password || '')
    if (!user) throw new CastError('invalidCredentials')
    const userAttempts = await this.userLoginAttemptsService.getUserAttempts(user.userId)

    userAttempts.attempts++
    if (!isPasswordValid || userAttempts.attemptsBlockPeriod) {
      const error = this.userLoginAttemptsService.getAttemptsError(
        user.userId,
        'login',
        userAttempts,
      )
      throw new CastError(error)
    }

    if (user.mfaEnabled === 1) {
      if (user.mfaMethod === 'EMAIL') await this.sendMailPasscode(user, language)
      return {
        userId: user.userId,
        email: user.email,
        requirePasscode: true,
        method: user.mfaMethod || 'APP',
      }
    }
    return this.authenticate(user)
  }

  async loginWithGoogle(
    idToken: string,
    language: TLanguages,
  ): Promise<TAuthPayload | TLoginRequirePasscode> {
    const googleUser = await this.googleAuthProvider.authenticate(idToken)
    if (!googleUser) throw new CastError('failedGoogleLogin')
    let user = await this.userRepository.getUser({ email: googleUser.email, provider: 'GOOGLE' })

    if (!user) {
      user = await this.userRepository.createUser({
        email: googleUser.email,
        name: capitalizeWords(googleUser.name),
        provider: 'GOOGLE',
        userPicture: googleUser.picture,
        status: 'ACTIVE',
        providerIdentifier: googleUser.googleId,
        password: '',
        mfaKey: this.totpService.generateKey(googleUser.email),
      })
    }

    if (user.mfaEnabled === 1) {
      if (user.mfaMethod === 'EMAIL') await this.sendMailPasscode(user, language)
      return {
        userId: user.userId,
        email: user.email,
        requirePasscode: true,
        method: user.mfaMethod || 'APP',
      }
    }
    return this.authenticate(user)
  }

  async loginWithFacebook(
    userId: string,
    token: string,
    language: TLanguages,
  ): Promise<TAuthPayload | TLoginRequirePasscode> {
    const facebookUser = await this.facebookAuthProvider.authenticate(userId, token)
    if (!facebookUser) throw new CastError('failedFacebookLogin')
    let user = await this.userRepository.getUser({
      email: facebookUser.email,
      provider: 'FACEBOOK',
    })

    if (!user) {
      user = await this.userRepository.createUser({
        email: facebookUser.email,
        name: capitalizeWords(facebookUser.name),
        provider: 'FACEBOOK',
        userPicture: facebookUser.picture,
        status: 'ACTIVE',
        providerIdentifier: facebookUser.facebookId,
        password: '',
        mfaKey: this.totpService.generateKey(facebookUser.email),
      })
    }

    if (user.mfaEnabled === 1) {
      if (user.mfaMethod === 'EMAIL') {
        await this.sendMailPasscode(user, language)
      }
      return {
        userId: user.userId,
        email: user.email,
        requirePasscode: true,
        method: user.mfaMethod || 'APP',
      }
    }
    return this.authenticate(user)
  }

  async validatePasscode(userId: string, passcode: string): Promise<TAuthPayload> {
    const user = await this.userRepository.getUser({ userId })
    if (!user) throw new NotFoundError('userNotFound')
    if (!user.mfaKey) throw new CastError('mfaNotEnabled')
    const userAttempts = await this.userLoginAttemptsService.getUserAttempts(user.userId)
    userAttempts.attempts++

    let isValidatedByEmail = false
    if (user.mfaMethod === 'EMAIL') {
      const userPasscode = await this.userLoginAttemptsService.getUserPasscode(user.userId)
      if (!userPasscode) {
        throw new ExpiredError('passcodeExpired')
      }
      isValidatedByEmail = userPasscode === passcode
    }

    const passcodeMatch =
      user.mfaMethod === 'EMAIL'
        ? isValidatedByEmail
        : this.totpService.validatePasscode(passcode, user.mfaKey.secret)

    if (!passcodeMatch) {
      const error = this.userLoginAttemptsService.getAttemptsError(
        userId,
        'validatePasscode',
        userAttempts,
      )
      throw new CastError(error)
    }
    await this.userLoginAttemptsService.delUserPasscode(userId)
    await this.userLoginAttemptsService.delAttempts(userId)
    return this.authenticate(user)
  }

  async forgotPassword(email: string, language: TLanguages): Promise<TForgotPassword> {
    const user = await this.userRepository.getUser({
      email: email.toLocaleLowerCase().trim(),
      provider: 'API',
    })

    if (!user)
      return {
        email: email,
        success: true,
      }

    const resetPasswordToken = this.tokenService.sign(
      {
        userId: user.userId,
        email: user.email,
        type: 'FORGOT_PASSWORD',
      },
      '1d',
    )
    if (!user.email) return { email: email, success: true }
    await this.emailService.sendResetPasswordEmail(
      user.email,
      user.name,
      language,
      resetPasswordToken,
    )
    return {
      email: email,
      success: true,
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<TAuthPayload> {
    const decoded = this.tokenService.verify<{
      userId: string
      email: string
      type: string
    }>(token)
    if (!decoded.valid) throw new CastError('invalidToken')
    if (!decoded.payload?.type || decoded.payload.type !== 'FORGOT_PASSWORD')
      throw new CastError('invalidToken')

    const user = await this.userRepository.getUser({
      userId: decoded.payload?.userId,
      email: decoded.payload?.email,
      provider: 'API',
    })

    if (!user) throw new CastError('invalidToken')
    if (user.userId !== decoded.payload?.userId) throw new CastError('invalidToken')

    const updatePasswordUser = await this.userRepository.updateUser(user.userId, {
      name: user.name,
      password: await bcrypt.hash(newPassword, 10),
      status: 'ACTIVE',
    })
    if (!updatePasswordUser) throw new CastError('userNotFound')
    return this.authenticate(updatePasswordUser)
  }

  async updateUser(userId: string, data: TUpdateUserInput): Promise<TUserDTO> {
    const user = await this.userRepository.getUser({ userId })
    if (!user) throw new NotFoundError('userNotFound')

    let profilePicture = user.userPicture
    const file = data.file
    if (file) {
      const fileKey = await getKey(file.name)
      const s3Key = `${this.appConfig.appName}/assets/user-profiles/${fileKey}-${file.name}`
      const oldPicture = user.userPicture

      const uploadResult = await this.s3Service.uploadFile({
        bucket: this.appConfig.aws.bucketName,
        key: s3Key,
        contents: await file.bytes(),
        metadata: {
          contentType: file.type,
        },
      })
      if (!uploadResult.success) throw new CastError('failedToUploadProfilePicture')
      if (oldPicture) {
        await this.s3Service.deleteFile(this.appConfig.aws.bucketName, oldPicture)
      }
      profilePicture = s3Key
    }
    if (user.userPicture && !data.picturePath && !file) {
      await this.s3Service.deleteFile(this.appConfig.aws.bucketName, user.userPicture)
      profilePicture = ''
    }
    delete data.picturePath
    const updatedUser = await this.userRepository.updateUser(userId, {
      ...data,
      userPicture: profilePicture,
    })
    if (!updatedUser) throw new CastError('failedToUpdateUser')
    return mapUserToUserDto({
      ...updatedUser,
      userPicture: mountMediaUrl(this.appConfig.cdnUrl, updatedUser.userPicture || ''),
    })
  }

  async changePassword(userId: string, data: TChangePasswordInput): Promise<boolean> {
    const user = await this.userRepository.getUser({ userId })
    if (!user) throw new NotFoundError('userNotFound')
    if (!user.provider || user.provider !== 'API')
      throw new CastError('changeAllowedOnlyForApiProvider')

    const passwordMatch = await bcrypt.compare(data.oldPassword, user.password || '')
    if (!passwordMatch) throw new CastError('invalidCredentials')
    const hashedPassword = await bcrypt.hash(data.newPassword, 10)
    await this.userRepository.updateUser(user.userId, {
      password: hashedPassword,
    })
    return true
  }
}
