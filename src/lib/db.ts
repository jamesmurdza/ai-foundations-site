import { neon } from "@neondatabase/serverless";
import pg from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const isLocalhost = process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1");

// Use standard pg for local development, Neon serverless for production
let sql: ReturnType<typeof neon> | ((strings: TemplateStringsArray, ...values: unknown[]) => Promise<pg.QueryResultRow[]>);

if (isLocalhost) {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  sql = async (strings: TemplateStringsArray, ...values: unknown[]) => {
    // Convert template literal to parameterized query
    const text = strings.reduce((acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ""), "");
    const result = await pool.query(text, values);
    return result.rows;
  };
} else {
  sql = neon(process.env.DATABASE_URL);
}

export { sql };
