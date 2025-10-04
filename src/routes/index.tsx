import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
	HomeFeedTabs,
	HomeFeedTabsContent,
	HomeFeedTabsList,
	HomeFeedTabsTrigger,
} from "../component/HomeFeedTabs";
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
			<HomeFeedTabs defaultValue="for-you">
				<HomeFeedTabsList className="border border-b-[#39444D] border-t-0 border-x-0">
					<HomeFeedTabsTrigger value="for-you">
						<span>For You</span>
					</HomeFeedTabsTrigger>

					<HomeFeedTabsTrigger value="following">
						<span>Following</span>
					</HomeFeedTabsTrigger>
				</HomeFeedTabsList>

				<HomeFeedTabsContent value="for-you">
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
				</HomeFeedTabsContent>

				<HomeFeedTabsContent value="following">
					Following Feed
				</HomeFeedTabsContent>
			</HomeFeedTabs>
		</div>
	);
}
