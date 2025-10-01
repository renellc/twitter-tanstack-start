import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getServerEnvVars } from "../env";
import * as schema from "./schema";

export const createDbClient = () => {
	const env = getServerEnvVars();

	if (env.ok) {
		const pool = new Pool({ connectionString: env.data.DATABASE_URL });

		return drizzle({ client: pool, schema });
	}

	throw new Error(env.error.message);
};

export const db = createDbClient();
