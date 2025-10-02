import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import { db } from "../lib/db";

const getUserFollowersValidatorDataSchema = z.object({
	username: z.string().min(1),
});

type GetUserFollowersValidatorData = z.infer<
	typeof getUserFollowersValidatorDataSchema
>;

const getUserFollowers = createServerFn({ method: "GET" })
	.inputValidator(
		(data: unknown): GetUserFollowersValidatorData =>
			getUserFollowersValidatorDataSchema.parse(data),
	)
	.handler(async ({ data }) => {
		const res = await db.query.userTable.findFirst({
			where: (table, f) => f.eq(table.username, data.username),
			columns: {
				username: true,
			},
			with: {
				followersList: {
					with: {
						user: {
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

export const Route = createFileRoute("/$username/followers")({
	loader: ({ params }) =>
		getUserFollowers({ data: { username: params.username } }),
	component: RouteComponent,
});

function RouteComponent() {
	const data = Route.useLoaderData();

	return (
		<div style={{ display: "flex", flexDirection: "column" }}>
			<span>{data.username}'s followers</span>

			{data.followersList.length === 0 ? (
				<span>{data.username} has not followers!</span>
			) : (
				<ul>
					{data.followersList.map((follower) => (
						<li key={follower.user_id}>
							<Link
								to="/$username"
								params={{ username: follower.user.username }}
							>
								{follower.user.username}
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
