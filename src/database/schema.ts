import { pgTable, uuid, varchar, integer, json, timestamp, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const mfaType = pgEnum("MfaType", ['EMAIL', 'APP'])
export const userProvider = pgEnum("UserProvider", ['API', 'GOOGLE', 'FACEBOOK'])
export const userStatus = pgEnum("UserStatus", ['ACTIVE', 'DEACTIVATED', 'PENDING'])


export const user = pgTable("user", {
	userId: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: varchar({ length: 150 }).notNull(),
	email: varchar({ length: 150 }).notNull(),
	password: varchar({ length: 200 }),
	status: userStatus(),
	provider: userProvider().notNull(),
	providerIdentifier: varchar({ length: 100 }),
	mfaEnabled: integer().default(0),
	mfaKey: json(),
	mfaMethod: mfaType(),
	mfaEabledAt: timestamp({ mode: 'string' }),
	userPicture: varchar({ length: 1024 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }),
	deletedAt: timestamp({ mode: 'string' }),
});
