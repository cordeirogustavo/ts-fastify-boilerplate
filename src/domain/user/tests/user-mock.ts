import { generateInstanceMock } from '@/mocks/instance-mocks'
import type { TCreateUserInput, TUser } from '../user.types'

export const generateUserMock = () => {
  const {
    userRepository,
    userService,
    emailService,
    tokenService,
    googleProvider,
    facebookProvider,
    totpService,
    appConfig,
    userLoginAttemptsService,
  } = generateInstanceMock()

  const userInput: TCreateUserInput = {
    email: 'test@example.com',
    password: 'testpassword',
    name: 'Test User',
    provider: 'API',
    status: 'PENDING',
  }

  const mfaKey = {
    secret: 'test-secret',
    url: 'test-url',
  }

  const user: TUser = {
    userId: 'test-user-id',
    name: 'Test',
    email: 'test@example.com',
    status: 'ACTIVE',
    password: 'test-password',
    provider: 'API',
    providerIdentifier: '',
    userPicture: '',
    mfaEnabled: 0,
    mfaKey: mfaKey,
    mfaMethod: null,
  }

  const mockPermission = {
    global: [],
    organizations: {},
  }

  return {
    userRepository,
    userService,
    emailService,
    tokenService,
    googleProvider,
    facebookProvider,
    totpService,
    user,
    userInput,
    appConfig,
    mfaKey,
    userLoginAttemptsService,
    mockPermission,
  }
}
