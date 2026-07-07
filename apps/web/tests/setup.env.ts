// Load .env.local so any integration-style tests (e.g. a GitWit Haiku review)
// can read ANTHROPIC_API_KEY. Vitest does not load Next's .env files on its own.
// Harmless for pure unit tests when no .env.local is present.
import { config } from "dotenv";

config({ path: ".env.local" });
