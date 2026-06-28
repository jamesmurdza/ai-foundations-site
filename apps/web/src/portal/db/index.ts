import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { env } from "@portal/lib/env";

// Reuse a single pool across hot-reloads in dev to avoid exhausting Neon.
const globalForDb = globalThis as unknown as {
  __ssPool?: Pool;
};

export const pool =
  globalForDb.__ssPool ??
  new Pool({
    connectionString: env.databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 10,
  });

if (process.env.NODE_ENV !== "production") globalForDb.__ssPool = pool;

export const db = drizzle(pool, { schema });

export { schema };
