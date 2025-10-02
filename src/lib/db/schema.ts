import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

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

export const userRelations = relations(userTable, ({ many }) => ({
	tweets: many(tweetTable),
}));

export const tweetTable = pgTable(
	"tweet",
	{
		id: integer().primaryKey(),
		owner_id: integer()
			.notNull()
			.references(() => userTable.id),
		parent_tweet_id: integer(),
		content: text().notNull(),
		likes: integer().notNull().default(0),
		replies: integer().notNull().default(0),
		retweets: integer().notNull().default(0),
		bookmarks: integer().notNull().default(0),
		created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
		edited_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		foreignKey({
			columns: [table.parent_tweet_id],
			foreignColumns: [table.id],
		}),
	],
);

export const tweetRelations = relations(tweetTable, ({ one, many }) => ({
	user: one(userTable, {
		fields: [tweetTable.owner_id],
		references: [userTable.id],
	}),
	parent: one(tweetTable, {
		fields: [tweetTable.parent_tweet_id],
		references: [tweetTable.id],
	}),
	replies: many(tweetTable),
}));
