import { container } from 'tsyringe'
import { ConfigContainer } from '@/config'

ConfigContainer.register(container)
ProvidersContainer.register(container)
ServicesContainer.register(container)
