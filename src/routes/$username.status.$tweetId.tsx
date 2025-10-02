import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { db } from "../lib/db";
import { tweetTable, userTable } from "../lib/db/schema";

const getTweetValidatorDataSchema = z.object({
	username: z.string().min(1),
	tweetId: z.coerce.number().min(1),
});

type GetTweetValidatorData = z.infer<typeof getTweetValidatorDataSchema>;

const getTweet = createServerFn({ method: "GET" })
	.inputValidator(
		(data: unknown): GetTweetValidatorData =>
			getTweetValidatorDataSchema.parse(data),
	)
	.handler(async ({ data }) => {
		const tweets = await db
			.select({
				id: tweetTable.id,
				owner: userTable.username,
				content: tweetTable.content,
				likes: tweetTable.likes,
				replies: tweetTable.replies,
				retweets: tweetTable.retweets,
				bookmarks: tweetTable.bookmarks,
				created_at: tweetTable.created_at,
			})
			.from(tweetTable)
			.innerJoin(userTable, eq(tweetTable.owner_id, userTable.id))
			.where(
				and(
					eq(userTable.username, data.username),
					eq(tweetTable.id, data.tweetId),
				),
			)
			.limit(1);

		if (tweets.length === 0) {
			throw notFound();
		}

		const tweet = tweets[0];

		const replies = await db.query.tweetTable.findMany({
			where: (table, f) => f.eq(table.parent_tweet_id, tweet.id),
			with: {
				user: {
					columns: {
						username: true,
					},
				},
			},
		});

		return {
			...tweet,
			tweetReplies: replies,
		};
	});

export const Route = createFileRoute("/$username/status/$tweetId")({
	loader: ({ params }) =>
		getTweet({
			data: {
				username: params.username,
				tweetId: params.tweetId,
			},
		}),
	component: RouteComponent,
	notFoundComponent: NotFoundComponent,
});

function NotFoundComponent() {
	return <div>The tweet you're looking for does not exist!</div>;
}

function RouteComponent() {
	const tweet = Route.useLoaderData();

	return (
		<div style={{ display: "flex", flexDirection: "column" }}>
			<p>{tweet.content}</p>

			<ul>
				<li>{new Date(tweet.created_at).toLocaleDateString()}</li>
				<li>Likes: {tweet.likes}</li>
				<li>Replies: {tweet.replies}</li>
				<li>Retweets: {tweet.retweets}</li>
				<li>Bookmarks: {tweet.bookmarks}</li>
			</ul>

			<span>Replies:</span>

			{tweet.tweetReplies.length === 0 && <span>No replies</span>}

			{tweet.tweetReplies.map((reply) => (
				<li key={reply.id}>
					<Link
						to="/$username/status/$tweetId"
						params={{
							username: reply.user.username,
							tweetId: reply.id.toString(),
						}}
					>
						<p>{reply.content}</p>
					</Link>

					<ul>
						<li>{new Date(reply.created_at).toLocaleDateString()}</li>
						<li>Likes: {reply.likes}</li>
						<li>Replies: {reply.replies}</li>
						<li>Retweets: {reply.retweets}</li>
						<li>Bookmarks: {reply.bookmarks}</li>
					</ul>
				</li>
			))}
		</div>
	);
}
