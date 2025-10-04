import { ArrowLeftIcon } from "@radix-ui/react-icons";
import {
	createFileRoute,
	notFound,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { TweetCard, TweetCardList } from "../component/TweetCard";
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
	const router = useRouter();
	const navigate = useNavigate();

	const onBack = async () => {
		if (router.history.canGoBack()) {
			router.history.back();
		} else {
			await navigate({ to: "/" });
		}
	};

	return (
		<div className="flex flex-col px-4">
			<div className="flex items-center py-3">
				<ArrowLeftIcon
					width="20"
					height="20"
					className="hover:cursor-pointer"
					onClick={onBack}
				/>

				<span className="font-bold text-xl ml-8">Post</span>
			</div>

			<TweetCard
				tweet={{
					username: tweet.owner,
					content: tweet.content,
					comments: tweet.replies,
					likes: tweet.likes,
					retweets: tweet.retweets,
				}}
			/>

			<TweetCardList
				tweets={tweet.tweetReplies.map((reply) => ({
					id: reply.id.toString(),
					username: reply.user.username,
					content: reply.content,
					comments: reply.replies,
					likes: reply.likes,
					retweets: reply.retweets,
				}))}
			/>
		</div>
	);
}
