import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { db } from "../lib/db";

const getUsers = createServerFn({ method: "GET" }).handler(async () => {
	const users = await db.query.userTable.findMany({
		columns: { id: true, username: true },
	});

	return users;
});

export const Route = createFileRoute("/")({
	loader: () => getUsers(),
	component: RouteComponent,
});

function RouteComponent() {
	const users = Route.useLoaderData();

	return (
		<div className="flex flex-col">
			<span className="mb-2">Home Page</span>

			<span>Users:</span>

			<ul>
				{users.map((user) => (
					<li key={user.id}>
						<Link to="/$username" params={{ username: user.username }}>
							{user.username}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
