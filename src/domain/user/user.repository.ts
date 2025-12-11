import { and, eq } from 'drizzle-orm'
import { inject, singleton } from 'tsyringe'
import { user } from '@/database/schema'
import { ProvidersSymbols } from '@/shared/providers'
import type { DatabaseProvider } from '@/shared/providers/database-provider'
import type { TUserDTO } from './user.types'

export interface IUserRepository {
  getUserById(userId: string): Promise<TUserDTO | null>
}

@singleton()
export class UserRepository implements IUserRepository {
  constructor(
    @inject(ProvidersSymbols.DatabaseProvider)
    protected databaseProvider: DatabaseProvider,
  ) {}

  async getUserById(userId: string): Promise<TUserDTO | null> {
    const result = await this.databaseProvider.db
      .select({
        userId: user.userId,
        name: user.name,
        email: user.email,
        userPicture: user.userPicture,
        mfaEnabled: user.mfaEnabled,
        mfaMethod: user.mfaMethod,
        provider: user.provider,
        mfaKey: user.mfaKey,
      })
      .from(user)
      .where(and(eq(user.userId, userId), eq(user.status, 'ACTIVE')))
      .limit(1)

    return (result[0] as TUserDTO) || null
  }
}
