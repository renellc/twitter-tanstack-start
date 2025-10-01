import { createFileRoute, notFound } from "@tanstack/react-router";
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

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
			<span>Hello {user.username}!</span>
			<span>Bio: {user.bio}</span>
			<span>Followers: {user.followers}</span>
			<span>Following: {user.following}</span>
			<span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
		</div>
	);
}
