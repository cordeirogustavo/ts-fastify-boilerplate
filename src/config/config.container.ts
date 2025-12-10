import type { DependencyContainer } from 'tsyringe'
import type { IContainer } from '@/shared/interfaces'
import { ConfigFactory } from './config.factory'
import { ConfigSymbols } from './config.symbols'

export const ConfigContainer: IContainer = {
  register(container: DependencyContainer): void {
    const configFactory = new ConfigFactory()
    const appConfig = configFactory.produce()
    container.registerInstance(ConfigSymbols.AppConfig, appConfig)
  },
}
