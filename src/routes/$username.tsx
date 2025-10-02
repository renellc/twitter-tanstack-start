import {
	createFileRoute,
	Link,
	notFound,
	Outlet,
	useMatches,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import { db } from "../lib/db";

const getUserValidatorDataSchema = z.object({
	username: z.string().min(1),
});

type GetUserValidatorData = z.infer<typeof getUserValidatorDataSchema>;

const getUser = createServerFn({ method: "GET" })
	.inputValidator(
		(data: unknown): GetUserValidatorData =>
			getUserValidatorDataSchema.parse(data),
	)
	.handler(async ({ data }) => {
		const user = await db.query.userTable.findFirst({
			where: (usersTable, f) => f.eq(usersTable.username, data.username),
			columns: {
				id: false,
				password: false,
			},
			with: {
				tweets: {
					orderBy: (tweetTable, f) => [f.desc(tweetTable.created_at)],
				},
			},
		});

		if (!user) {
			throw notFound();
		}

		return user;
	});

export const Route = createFileRoute("/$username")({
	loader: ({ params }) => getUser({ data: { username: params.username } }),
	component: RouteComponent,
	errorComponent: ErrorComponent,
});

function ErrorComponent() {
	return <div>Not found</div>;
}

function RouteComponent() {
	const user = Route.useLoaderData();
	const matches = useMatches();

	const isChildRoute =
		matches.length > 0 &&
		matches[matches.length - 1].fullPath !== Route.fullPath;

	if (isChildRoute) {
		return <Outlet />;
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
			<span>Hello {user.username}!</span>
			<span>Bio: {user.bio}</span>
			<span>
				Followers:{" "}
				<Link to="/$username/followers" params={{ username: user.username }}>
					{user.followers}
				</Link>
			</span>
			<span>
				Following:{" "}
				<Link to="/$username/following" params={{ username: user.username }}>
					{user.following}
				</Link>
			</span>
			<span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>

			<div
				style={{ display: "flex", flexDirection: "column", marginTop: "8px" }}
			>
				<span>Tweets</span>

				<ul>
					{user.tweets.map((tweet) => (
						<li key={tweet.id}>
							<Link
								to="/$username/status/$tweetId"
								params={{
									username: user.username,
									tweetId: tweet.id.toString(),
								}}
							>
								<p>{tweet.content}</p>
							</Link>

							<ul>
								<li>{new Date(tweet.created_at).toLocaleDateString()}</li>
								<li>Likes: {tweet.likes}</li>
								<li>Replies: {tweet.replies}</li>
								<li>Retweets: {tweet.retweets}</li>
								<li>Bookmarks: {tweet.bookmarks}</li>
							</ul>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
