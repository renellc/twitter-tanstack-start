import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { db } from "../lib/db";

const getUserFollowingValidatorDataSchema = z.object({
	username: z.string().min(1),
});

type GetUserFollowingValidatorData = z.infer<
	typeof getUserFollowingValidatorDataSchema
>;

const getUserFollowing = createServerFn({ method: "GET" })
	.inputValidator(
		(data: unknown): GetUserFollowingValidatorData =>
			getUserFollowingValidatorDataSchema.parse(data),
	)
	.handler(async ({ data }) => {
		const res = await db.query.userTable.findFirst({
			where: (table, f) => f.eq(table.username, data.username),
			columns: {
				username: true,
			},
			with: {
				followingList: {
					with: {
						follower: {
							columns: {
								username: true,
							},
						},
					},
				},
			},
		});

		if (!res) {
			throw notFound();
		}

		return res;
	});

export const Route = createFileRoute("/$username/following")({
	loader: ({ params }) =>
		getUserFollowing({ data: { username: params.username } }),
	component: RouteComponent,
});

function RouteComponent() {
	const data = Route.useLoaderData();

	return (
		<div style={{ display: "flex", flexDirection: "column" }}>
			<span>{data.username}'s followers</span>

			{data.followingList.length === 0 ? (
				<span>{data.username} does not follow anyone!</span>
			) : (
				<ul>
					{data.followingList.map((following) => (
						<li key={following.following_user_id}>
							<Link
								to="/$username"
								params={{ username: following.follower.username }}
							>
								{following.follower.username}
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
