import Anthropic from "@anthropic-ai/sdk";

const apiKey =
  process.env.HH_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error(
    "HH_ANTHROPIC_API_KEY (or ANTHROPIC_API_KEY) is not set in .env.local",
  );
}

export const anthropic = new Anthropic({ apiKey });

export const HAIKU_MODEL = "claude-haiku-4-5-20251001";
