CREATE TABLE "user_following" (
	"user_id" integer NOT NULL,
	"following_user_id" integer NOT NULL,
	CONSTRAINT "user_following_user_id_following_user_id_pk" PRIMARY KEY("user_id","following_user_id")
);
--> statement-breakpoint
ALTER TABLE "user_following" ADD CONSTRAINT "user_following_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_following" ADD CONSTRAINT "user_following_following_user_id_user_id_fk" FOREIGN KEY ("following_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;