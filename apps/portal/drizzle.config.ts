import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Only ever touch our own namespace; never the existing hh_* applicant tables.
  tablesFilter: ["ss_*"],
  verbose: true,
  strict: false,
});
