import { container } from 'tsyringe'
import { ConfigContainer } from '@/config'
import { UserContainer } from '@/domain/user'
import { ProvidersContainer } from '../providers/providers.container'

ConfigContainer.register(container)
ProvidersContainer.register(container)

UserContainer.register(container)
