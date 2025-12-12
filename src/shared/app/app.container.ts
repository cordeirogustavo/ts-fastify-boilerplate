import { container } from 'tsyringe'
import { ConfigContainer } from '@/config'
import { UserContainer } from '@/domain/user'
import { UserLoginAttemptsContainer } from '@/domain/user-login-attempts'
import { ProvidersContainer } from '../providers/providers.container'
import { ServicesContainer } from '../services'

ConfigContainer.register(container)
ProvidersContainer.register(container)
ServicesContainer.register(container)

UserContainer.register(container)
UserLoginAttemptsContainer.register(container)
