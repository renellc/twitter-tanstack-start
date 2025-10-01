import { seed } from "drizzle-seed";
import { createDbClient } from "../src/lib/db";
import * as schema from "../src/lib/db/schema";

const main = async () => {
	const db = createDbClient();

	await seed(db, schema).refine((f) => ({
		userTable: {
			count: 100,
			columns: {
				avatar_url: f.default({ defaultValue: "" }),
				username: f.firstName({ isUnique: true }),
				bio: f.loremIpsum({ sentencesCount: 2 }),
				following: f.int({ minValue: 0 }),
				followers: f.int({ minValue: 0 }),
			},
		},
	}));
};

main()
	.then(() => {
		console.log("Finished seeding");
		process.exit(0);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
