import { defineConfig } from 'drizzle-kit'

const databaseUrl = `postgresql://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}?sslmode=${process.env.DATABASE_IGNORE_SSL === 'true' ? 'disable' : 'require'}`

export default defineConfig({
  out: './src/database',
  schema: './src/database/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
})
