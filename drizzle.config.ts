import dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({ path: ".env" });

export default {
	schema: "./src/server/db/schema.ts",
	out: "./src/server/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		url: process.env.DATABASE_URL!,
	},
} satisfies Config;
