import type { Course } from "./types";

const REPO = "https://github.com/synacktraa/hacking-minecraft";

export const minecraftAi: Course = {
  slug: "minecraft-ai",
  title: "Hacking Minecraft with AI",
  thumbnail: "/images/minecraft.png",
  description:
    "Build intelligent Minecraft bots with TypeScript — from a simple follower " +
    "to a Claude-controlled agent via MCP.",
  metaTitle: "Hacking Minecraft with AI",
  metaDescription:
    "Build Minecraft bots with Mineflayer and control them with Claude through " +
    "the Model Context Protocol (MCP).",
  resources: [
    {
      type: "github",
      label: "hacking-minecraft on GitHub",
      href: REPO,
    },
  ],
  lessons: [
    {
      id: "intro",
      title: "Introduction",
      summary:
        "What you'll build across the three tutorials, the project structure, and prerequisites.",
      tabs: [{ type: "lesson" }],
    },
    {
      id: "setup",
      title: "Setup Guide",
      summary:
        "Install Node.js, Java, a PaperMC server, a Minecraft client, and Claude Desktop or Code.",
      tabs: [{ type: "lesson" }],
    },
    {
      id: "tutorial-1-bot-basics",
      title: "Tutorial 1: Bot Basics",
      summary:
        "Create a Mineflayer bot, connect it to a server, and make it follow a player around.",
      resources: [
        {
          type: "github",
          label: "Tutorial 1 code: bot-follow-a-player",
          href: `${REPO}/tree/master/examples/bot-follow-a-player`,
        },
      ],
      tabs: [{ type: "lesson" }, { type: "material" }],
    },
    {
      id: "tutorial-2-smart-bot",
      title: "Tutorial 2: Smart Bot",
      summary: "Add combat, coordinate navigation from chat, and state management to the bot.",
      resources: [
        {
          type: "github",
          label: "Tutorial 2 code: bot-protect-a-player-from-hostile",
          href: `${REPO}/tree/master/examples/bot-protect-a-player-from-hostile`,
        },
      ],
      tabs: [{ type: "lesson" }, { type: "material" }],
    },
    {
      id: "tutorial-3-mcp-server",
      title: "Tutorial 3: MCP Server",
      summary: "Expose the bot's actions as MCP tools so Claude can control it directly.",
      resources: [
        {
          type: "github",
          label: "Tutorial 3 code: mcp server",
          href: `${REPO}/tree/master/mcp`,
        },
      ],
      tabs: [{ type: "lesson" }, { type: "material" }],
    },
  ],
};
