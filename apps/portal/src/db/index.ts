import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { env } from "@/lib/env";

// Reuse a single pool across hot-reloads in dev to avoid exhausting Neon.
const globalForDb = globalThis as unknown as {
  __ssPool?: Pool;
};

// Local Postgres (e.g. a dev container) usually doesn't speak SSL, while hosted
// providers like Neon require it. Decide based on the connection target so the
// same code works in both environments. Honor an explicit `sslmode=disable`.
function shouldUseSsl(connectionString: string): boolean {
  try {
    const url = new URL(connectionString);
    if (url.searchParams.get("sslmode") === "disable") return false;
    const host = url.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
      return false;
    }
    return true;
  } catch {
    // Unparseable / empty connection string: skip SSL to avoid forcing a
    // handshake a local server may reject.
    return false;
  }
}

export const pool =
  globalForDb.__ssPool ??
  new Pool({
    connectionString: env.databaseUrl,
    ssl: shouldUseSsl(env.databaseUrl)
      ? { rejectUnauthorized: false }
      : false,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") globalForDb.__ssPool = pool;

export const db = drizzle(pool, { schema });

export { schema };
