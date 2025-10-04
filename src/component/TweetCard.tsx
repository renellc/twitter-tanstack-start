import { ChatBubbleIcon, HeartIcon, UpdateIcon } from "@radix-ui/react-icons";
import { Link } from "@tanstack/react-router";

type TweetCardTweet = {
	username: string;
	content: string;
	comments: number;
	retweets: number;
	likes: number;
};

export interface TweetCardProps {
	tweet: TweetCardTweet;
}

// TODO: Make this composable to support different use cases
export const TweetCard = ({ tweet }: TweetCardProps) => {
	return (
		<div className="flex gap-2 py-3 px-4 border border-b-[#39444D] border-t-0 border-x-0 hover:bg-[#1C2732] hover:cursor-pointer">
			{/* TODO: add avatar here */}

			<div className="flex flex-col gap-1">
				<div className="flex gap-2">
					<Link to="/$username" params={{ username: tweet.username }}>
						<span className="font-bold hover:underline">{tweet.username}</span>
					</Link>

					<span className="font-light text-[#8C98A5]">@{tweet.username}</span>
				</div>

				<p>{tweet.content}</p>

				<div className="flex gap-4">
					<div className="flex gap-1 items-center">
						<ChatBubbleIcon />

						<span>{tweet.comments}</span>
					</div>

					<div className="flex gap-1 items-center">
						<UpdateIcon />

						<span>{tweet.retweets}</span>
					</div>

					<div className="flex gap-1 items-center">
						<HeartIcon />

						<span>{tweet.likes}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export interface TweetCardListProps {
	tweets: (TweetCardTweet & { id: string })[];
}

export const TweetCardList = ({ tweets }: TweetCardListProps) => {
	return (
		<div className="flex flex-col">
			{tweets.map((tweet) => (
				<Link
					key={tweet.id}
					to="/$username/status/$tweetId"
					params={{
						username: tweet.username,
						tweetId: tweet.id.toString(),
					}}
				>
					<TweetCard
						key={tweet.id}
						tweet={{
							username: tweet.username,
							content: tweet.content,
							comments: tweet.comments,
							likes: tweet.likes,
							retweets: tweet.retweets,
						}}
					/>
				</Link>
			))}
		</div>
	);
};
