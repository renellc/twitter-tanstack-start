import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../component/Tabs";
import { TweetCardList } from "../component/TweetCard";
import { db } from "../lib/db";

const getForYouTweets = createServerFn({ method: "GET" }).handler(async () => {
	const tweets = await db.query.tweetTable.findMany({
		with: {
			user: {
				columns: {
					id: true,
					username: true,
				},
			},
		},
		orderBy: (table, f) => [f.desc(table.created_at)],
		limit: 100,
	});

	return tweets;
});

export const Route = createFileRoute("/")({
	loader: () => getForYouTweets(),
	component: RouteComponent,
});

function RouteComponent() {
	const forYouTweets = Route.useLoaderData();

	console.log(forYouTweets);

	return (
		<div className="flex flex-col">
			<Tabs defaultValue="for-you">
				<TabsList className="border border-b-[#39444D] border-t-0 border-x-0">
					<TabsTrigger value="for-you">
						<span>For You</span>
					</TabsTrigger>

					<TabsTrigger value="following">
						<span>Following</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="for-you">
					<TweetCardList
						tweets={forYouTweets.map((tweet) => ({
							id: tweet.id.toString(),
							username: tweet.user.username,
							content: tweet.content,
							comments: tweet.replies,
							likes: tweet.likes,
							retweets: tweet.retweets,
						}))}
					/>
				</TabsContent>

				<TabsContent value="following">Following Feed</TabsContent>
			</Tabs>
		</div>
	);
}
