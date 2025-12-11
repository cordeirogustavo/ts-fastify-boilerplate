import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { inject, singleton } from 'tsyringe'

import { type AppConfig, ConfigSymbols } from '@/config'
import * as schema from '@/database/schema'

export type DrizzleDB = NodePgDatabase<typeof schema>

@singleton()
export class DatabaseProvider {
  public readonly db: DrizzleDB
  private readonly pool: Pool

  constructor(@inject(ConfigSymbols.AppConfig) private readonly config: AppConfig) {
    this.pool = new Pool({
      connectionString: this.config.databaseUrl,
      ssl: this.config.env === 'production' ? { rejectUnauthorized: false } : false,
    })
    this.db = drizzle(this.pool, {
      schema,
      logger: false,
    })
    console.log('Drizzle initialized')
  }

  public async closePool(): Promise<void> {
    await this.pool.end()
  }
}
