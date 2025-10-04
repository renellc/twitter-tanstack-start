import { ArrowLeftIcon, CalendarIcon } from "@radix-ui/react-icons";
import {
	createFileRoute,
	Link,
	notFound,
	Outlet,
	useMatches,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../component/Tabs";
import { TweetCardList } from "../component/TweetCard";
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
					with: {
						user: {
							columns: { username: true },
						},
					},
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
	const router = useRouter();
	const navigate = useNavigate();

	const isChildRoute =
		matches.length > 0 &&
		matches[matches.length - 1].fullPath !== Route.fullPath;

	const onBack = async () => {
		if (router.history.canGoBack()) {
			router.history.back();
		} else {
			await navigate({ to: "/" });
		}
	};

	if (isChildRoute) {
		return <Outlet />;
	}

	return (
		<div className="flex flex-col px-4">
			<div className="flex items-center py-3">
				<ArrowLeftIcon
					width="20"
					height="20"
					className="hover:cursor-pointer"
					onClick={onBack}
				/>

				<span className="font-bold text-xl ml-8">{user.username}</span>
			</div>

			<div className="flex flex-col gap-3">
				<div className="flex flex-col">
					<span className="font-bold text-xl">{user.username}</span>

					<span className="font-light text-base text-[#8C98A5]">
						@{user.username}
					</span>
				</div>

				<span>{user.bio}</span>

				<div className="flex flex-row">
					<div className="flex flex-row gap-2 items-center">
						<CalendarIcon color="#8C98A5" />

						<span className="text-base text-[#8C98A5]">
							{new Date(user.created_at).toLocaleDateString()}
						</span>
					</div>
				</div>

				<div className="flex flex-row gap-5">
					<Link to="/$username/following" params={{ username: user.username }}>
						<p className="text-[#8C98A5] hover:underline">
							<span className="font-bold text-[#F9F9F9]">{user.following}</span>{" "}
							Following
						</p>
					</Link>

					<Link to="/$username/followers" params={{ username: user.username }}>
						<p className="text-[#8C98A5] hover:underline">
							<span className="font-bold text-[#F9F9F9]">{user.followers}</span>{" "}
							Followers
						</p>
					</Link>
				</div>
			</div>

			<Tabs defaultValue="tweets">
				<TabsList className="border border-b-[#39444D] border-t-0 border-x-0">
					<TabsTrigger value="tweets">Tweets</TabsTrigger>

					<TabsTrigger value="replies">Replies</TabsTrigger>

					<TabsTrigger value="likes">Likes</TabsTrigger>
				</TabsList>

				<TabsContent value="tweets">
					<TweetCardList
						tweets={user.tweets.map((tweet) => ({
							id: tweet.id.toString(),
							username: tweet.user.username,
							content: tweet.content,
							comments: tweet.replies,
							likes: tweet.likes,
							retweets: tweet.retweets,
						}))}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
