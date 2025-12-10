import type { DependencyContainer } from 'tsyringe'

export interface IContainer {
  register(container: DependencyContainer): void
}
