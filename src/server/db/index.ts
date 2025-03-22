import { env } from "@/env.mjs";
import { drizzle } from "drizzle-orm/node-postgres";
import { withReplicas } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import * as schema from "./schema";

// Initialize primary database connection with schema
const primaryDb = drizzle(
  new Pool({
    connectionString: env.DATABASE_URL,
  }),
  { schema }
);

// Initialize read replica connection with schema
const readReplica = drizzle(
  new Pool({
    connectionString: env.DATABASE_URL_REPLICA,
  }),
  { schema }
);

// Combine primary and replica databases
export const db = withReplicas(primaryDb, [readReplica]);
