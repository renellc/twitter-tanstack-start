import { eq } from "drizzle-orm";
import { seed } from "drizzle-seed";
import { createDbClient } from "../src/lib/db";
import * as schema from "../src/lib/db/schema";

const main = async () => {
	const db = createDbClient();

	const numUsers = 1000;
	const numTweets = 10000;

	console.log("Initial seeding...");
	await seed(db, schema).refine((f) => ({
		userTable: {
			count: numUsers,
			columns: {
				avatar_url: f.default({ defaultValue: "" }),
				username: f.firstName({ isUnique: true }),
				bio: f.loremIpsum({ sentencesCount: 2 }),
				following: f.int({ minValue: 0 }),
				followers: f.int({ minValue: 0 }),
			},
		},
		tweetTable: {
			count: numTweets,
			columns: {
				owner_id: f.int({
					minValue: 1,
					maxValue: numUsers,
				}),
				parent_tweet_id: f.default({ defaultValue: null }),
				content: f.loremIpsum({ sentencesCount: 2 }),
				likes: f.int({ minValue: 0 }),
				replies: f.default({ defaultValue: 0 }),
				retweets: f.default({ defaultValue: 0 }),
				bookmarks: f.default({ defaultValue: 0 }),
			},
		},
	}));
	console.log("Initial seeding ok!");

	// Fix tweet values for likes, replies, retweets, bookmarks, etc.
	// TODO: have these values be consistent based on some seed number (current is just random)
	const tweets = await db.query.tweetTable.findMany();

	console.log("Seeding parent tweet id values for tweets...");
	for (const tweet of tweets) {
		const shouldHaveParentTweet = Math.random() >= 0.5;
		if (shouldHaveParentTweet) {
			const parentTweetId = Math.floor(Math.random() * numTweets) + 1;

			await db
				.update(schema.tweetTable)
				.set({ parent_tweet_id: parentTweetId })
				.where(eq(schema.tweetTable.id, tweet.id));
		}
	}
	console.log("Seeding parent tweet id values for tweets ok!");

	console.log("Seeding reply, retweet, and bookmark counts for tweets...");
	for (const tweet of tweets) {
		const realReplyCount = await db.$count(
			schema.tweetTable,
			eq(schema.tweetTable.parent_tweet_id, tweet.id),
		);

		await db
			.update(schema.tweetTable)
			.set({ replies: realReplyCount })
			.where(eq(schema.tweetTable.id, tweet.id));
	}
	console.log("Seeding reply, retweet, and bookmark counts for tweets ok!");
};

main()
	.then(() => {
		console.log("Finished seeding");
		process.exit(0);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
