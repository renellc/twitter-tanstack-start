import { createServerOnlyFn } from "@tanstack/react-start";
import * as z from "zod";
import type { Result } from "./fp";

const envSchema = z.object({
	DATABASE_URL: z.url(),
});

export type Env = z.infer<typeof envSchema>;

export const getServerEnvVars = createServerOnlyFn(
	(): Result<Env, z.ZodError<Env>> => {
		const result = envSchema.safeParse(process.env);

		if (result.success) {
			return { ok: true, data: result.data };
		}

		return { ok: false, error: result.error };
	},
);
