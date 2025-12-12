import { and, eq, isNull } from 'drizzle-orm'
import { inject, singleton } from 'tsyringe'
import { user } from '@/database/schema'
import { ProvidersSymbols } from '@/shared/providers'
import type { DatabaseProvider } from '@/shared/providers/database-provider'
import type { TCreateUserInput, TMfaKey, TUser, TUserFilters } from './user.types'

export interface IUserRepository {
  getUser(filters: TUserFilters): Promise<TUser | null>
  createUser(userData: TCreateUserInput): Promise<TUser>
  updateUser(userId: string, userData: Partial<TUser>): Promise<TUser | null>
}

@singleton()
export class UserRepository implements IUserRepository {
  constructor(
    @inject(ProvidersSymbols.DatabaseProvider)
    protected databaseProvider: DatabaseProvider,
  ) {}

  private buildUserWhere = (filters: TUserFilters) => {
    const conditions = [isNull(user.deletedAt)]
    if (filters.userId) conditions.push(eq(user.userId, filters.userId))
    if (filters.email) conditions.push(eq(user.email, filters.email))
    if (filters.status) conditions.push(eq(user.status, filters.status))
    return and(...conditions)
  }

  async getUser(filters: TUserFilters): Promise<TUser | null> {
    const where = this.buildUserWhere(filters)
    const result = await this.databaseProvider.db.select().from(user).where(where).limit(1)
    return result.length ? { ...result[0], mfaKey: result[0].mfaKey as TMfaKey } : null
  }

  async createUser(userData: TCreateUserInput): Promise<TUser> {
    const [created] = await this.databaseProvider.db
      .insert(user)
      .values({
        ...userData,
        provider: userData.provider || 'API',
      })
      .returning()
    return { ...created, mfaKey: created.mfaKey as TMfaKey }
  }

  async updateUser(userId: string, userData: Partial<TUser>): Promise<TUser | null> {
    const dataToSave = Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value !== undefined),
    )
    const [updated] = await this.databaseProvider.db
      .update(user)
      .set(dataToSave)
      .where(eq(user.userId, userId))
      .returning()

    return { ...updated, mfaKey: updated.mfaKey as TMfaKey }
  }
}
