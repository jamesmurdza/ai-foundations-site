// Load .env.local so integration tests (e.g. the GitWit Haiku review) can read
// ANTHROPIC_API_KEY. Vitest does not load Next's .env files on its own.
import { config } from "dotenv";

config({ path: ".env.local" });
