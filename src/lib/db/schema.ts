import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
	id: integer().primaryKey(),
	username: text().notNull(),
	password: text().notNull(),
	avatar_url: text().notNull(),
	bio: text(),
	following: integer().notNull().default(0),
	followers: integer().notNull().default(0),
	created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
