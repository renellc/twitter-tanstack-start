CREATE TABLE "tweet" (
	"id" integer PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"parent_tweet_id" integer,
	"content" text NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"replies" integer DEFAULT 0 NOT NULL,
	"retweets" integer DEFAULT 0 NOT NULL,
	"bookmarks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"edited_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tweet" ADD CONSTRAINT "tweet_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tweet" ADD CONSTRAINT "tweet_parent_tweet_id_tweet_id_fk" FOREIGN KEY ("parent_tweet_id") REFERENCES "public"."tweet"("id") ON DELETE no action ON UPDATE no action;