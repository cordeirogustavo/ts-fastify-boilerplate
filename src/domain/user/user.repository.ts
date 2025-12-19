import { inject, singleton } from 'tsyringe'
import { user } from '@/database/schema'
import { ProvidersSymbols } from '@/shared/providers'
import type { DatabaseProvider } from '@/shared/providers/database-provider'
import { clearEmptyValues } from '@/shared/utils'
import type { TCreateUserInput, TMfaKey, TUser, TUserFilters } from './user.types'

export interface IUserRepository {
  getUser(filters: TUserFilters): Promise<TUser | null>
  createUser(userData: TCreateUserInput): Promise<TUser>
  updateUser(userId: string, userData: Partial<TUser>): Promise<TUser | null>
}

@singleton()
export class UserRepository implements IUserRepository {
  private db: DatabaseProvider['db']
  private expr: DatabaseProvider['expr']

  constructor(
    @inject(ProvidersSymbols.DatabaseProvider)
    protected databaseProvider: DatabaseProvider,
  ) {
    this.db = this.databaseProvider.db
    this.expr = this.databaseProvider.expr
  }

  private buildUserWhere = (filters: TUserFilters) => {
    const conditions = [this.expr.isNull(user.deletedAt)]
    if (filters.userId) conditions.push(this.expr.eq(user.userId, filters.userId))
    if (filters.email) conditions.push(this.expr.eq(user.email, filters.email))
    if (filters.status) conditions.push(this.expr.eq(user.status, filters.status))
    return this.expr.and(...conditions)
  }

  async getUser(filters: TUserFilters): Promise<TUser | null> {
    const where = this.buildUserWhere(filters)
    const result = await this.db.select().from(user).where(where).limit(1)
    return result.length ? { ...result[0], mfaKey: result[0].mfaKey as TMfaKey } : null
  }

  async createUser(userData: TCreateUserInput): Promise<TUser> {
    const [created] = await this.db
      .insert(user)
      .values({
        ...userData,
        provider: userData.provider || 'API',
      })
      .returning()
    return { ...created, mfaKey: created.mfaKey as TMfaKey }
  }

  async updateUser(userId: string, userData: Partial<TUser>): Promise<TUser | null> {
    const dataToSave = clearEmptyValues(userData)
    const [updated] = await this.db
      .update(user)
      .set(dataToSave)
      .where(this.expr.eq(user.userId, userId))
      .returning()
    return { ...updated, mfaKey: updated.mfaKey as TMfaKey }
  }
}
