The goal of this lesson is to build an MCP server that exposes bot actions as tools, so Claude can control your Minecraft bot.

> **Code:** [`mcp/`](https://github.com/synacktraa/hacking-minecraft/tree/master/mcp)

## What you'll learn

- What MCP (Model Context Protocol) is and why it matters
- Designing good MCP tools — specific, well-named actions
- Connecting Claude to your Minecraft bot through MCP
- The difference between hardcoded bot behavior and LLM-driven control

## Tools we'll build

| Tool                | Description                                                 |
| ------------------- | ----------------------------------------------------------- |
| `connect`           | Connect the bot to a Minecraft server                       |
| `disconnect`        | Disconnect the bot from the server                          |
| `status`            | Get the bot's connection status, position, health, and food |
| `moveToCoordinates` | Navigate the bot to specific x, y, z coordinates            |
| `followPlayer`      | Follow a player, optionally protecting them from hostiles   |
| `stopMovement`      | Stop the bot's current movement and protection              |

## Overview

In the first two tutorials, we wrote bots with hardcoded behavior — the bot _always_ follows, _always_ attacks, and responds to a fixed set of chat patterns. In this tutorial, we'll expose those behaviors as MCP tools that Claude can call on demand.

[MCP (Model Context Protocol)](https://modelcontextprotocol.io/) lets you define **tools** — actions with names, descriptions, and parameters — that Claude can discover and call. We define what the bot _can_ do, and Claude decides _when_ to do it.

## Step 1: Set up the project

```bash
mkdir mcp && cd mcp
npm init -y
npm install @modelcontextprotocol/sdk mineflayer mineflayer-pathfinder zod
npm install -D typescript @types/node tsx
```

New dependencies compared to the previous tutorials:

- **@modelcontextprotocol/sdk** — the official MCP SDK. It handles the protocol communication between Claude and our server.
- **zod** — a schema validation library. MCP uses it to define the shape of each tool's input parameters. When Claude calls a tool, zod validates that the arguments are correct.
- **tsx** — lets us run TypeScript directly without a compile step. Useful during development.

Set up `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

And update `package.json` to add `"type": "module"` and scripts:

```json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts"
  }
}
```

## Step 2: Create the MCP server and bot state

Create `src/index.ts`. We start with imports and global bot state:

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import mineflayer, { Bot } from "mineflayer";
import mineflayerPathfinder from "mineflayer-pathfinder";

const { pathfinder, Movements, goals } = mineflayerPathfinder;
const { GoalNear } = goals;
```

A few things to note:

- **StdioServerTransport** — MCP servers communicate over stdin/stdout. Claude Desktop and Claude Code both launch the server as a subprocess and talk to it through these pipes. This is why you never see an HTTP server or port — it's all stdio.
- We only need **GoalNear** from pathfinder — same as Tutorials 1 and 2.

Next, the bot state and a helper:

```ts
let bot: Bot | null = null;
let botReady = false;
let followInterval: ReturnType<typeof setInterval> | null = null;

function requireBot(): Bot {
  if (!bot || !botReady) {
    throw new Error("Bot is not connected. Use the connect tool first.");
  }
  return bot;
}
```

The bot starts as `null` — unlike Tutorials 1 and 2 where the bot connects immediately on startup, here the MCP server starts first and Claude decides _when_ to connect (the `connect` tool's parameters have sensible defaults). The `requireBot()` helper is used by every tool that needs an active bot, giving Claude a clear error message if it tries to act before connecting. The `followInterval` tracks the active follow/protect loop so we can clean it up when stopping.

Now create the MCP server:

```ts
const server = new McpServer({
  name: "minecraft-mcp",
  version: "1.0.0",
});
```

## Step 3: Connection tools

The `connect` tool creates a mineflayer bot — similar to Tutorials 1 and 2, but now Claude provides the parameters:

```ts
server.tool(
  "connect",
  "Connect the bot to a Minecraft server",
  {
    host: z.string().optional().describe("Server host (default: localhost)"),
    port: z.number().optional().describe("Server port (default: 25565)"),
    username: z.string().optional().describe("Bot username (default: mcp-bot)"),
    auth: z.enum(["offline", "microsoft"]).optional().describe("Auth mode (default: offline)"),
  },
  async ({ host, port, username, auth }) => {
    if (bot && botReady) {
      return {
        content: [{ type: "text", text: "Bot is already connected. Use disconnect first." }],
      };
    }

    const connectHost = host || "localhost";
    const connectPort = port || 25565;
    const connectUsername = username || "mcp-bot";
    const connectAuth = auth || "offline";

    return new Promise((resolve) => {
      bot = mineflayer.createBot({
        host: connectHost,
        port: connectPort,
        username: connectUsername,
        auth: connectAuth as "offline" | "microsoft",
      });

      bot.on("spawn", async () => {
        try {
          bot!.loadPlugin(pathfinder);
          bot!.pathfinder.setMovements(new Movements(bot!));
          await bot!.waitForChunksToLoad();
          botReady = true;
          resolve({
            content: [
              {
                type: "text",
                text: `Connected to ${connectHost}:${connectPort} as ${connectUsername}. Bot is ready.`,
              },
            ],
          });
        } catch (err: unknown) {
          const error = err as Error;
          resolve({
            content: [{ type: "text", text: `Spawn error: ${error.message}` }],
            isError: true,
          });
        }
      });

      bot.on("error", (err) => {
        botReady = false;
        resolve({
          content: [{ type: "text", text: `Connection error: ${err.message}` }],
          isError: true,
        });
      });

      bot.on("kicked", (reason) => {
        botReady = false;
        resolve({
          content: [{ type: "text", text: `Kicked from server: ${reason}` }],
          isError: true,
        });
      });

      setTimeout(() => {
        if (!botReady) {
          resolve({
            content: [{ type: "text", text: "Connection timeout after 30 seconds." }],
            isError: true,
          });
        }
      }, 30000);
    });
  },
);
```

Let's break down the `server.tool()` pattern — you'll see it for every tool:

1. **Name** (`"connect"`) — what Claude sees and calls.
2. **Description** (`"Connect the bot to a Minecraft server"`) — Claude reads this to understand _when_ to use the tool. Write these like you're explaining to a person.
3. **Parameters** (the zod schema) — defines what arguments the tool accepts. The `.describe()` strings help Claude understand what to pass. Optional parameters have defaults.
4. **Handler** (the async function) — runs when Claude calls the tool. Returns `content` with the result text.

The handler itself is mostly the same as `mineflayer.createBot()` from Tutorial 1, wrapped in a Promise so the tool waits for the bot to spawn before responding. We also handle errors and kicks so Claude gets useful feedback instead of a silent failure.

The `disconnect` tool is simpler:

```ts
server.tool("disconnect", "Disconnect the bot from the Minecraft server", {}, async () => {
  if (!bot) {
    return {
      content: [{ type: "text", text: "Bot is not connected." }],
    };
  }

  bot.end();
  bot = null;
  botReady = false;

  return {
    content: [{ type: "text", text: "Disconnected from server." }],
  };
});
```

And a `status` tool so Claude can check on the bot:

```ts
server.tool("status", "Get the bot's current connection status and basic info", {}, async () => {
  if (!bot || !botReady) {
    return {
      content: [{ type: "text", text: "Bot is not connected." }],
    };
  }

  const pos = bot.entity.position;
  const health = bot.health;
  const food = bot.food;

  return {
    content: [
      {
        type: "text",
        text: [
          `Username: ${bot.username}`,
          `Position: ${Math.floor(pos.x)}, ${Math.floor(pos.y)}, ${Math.floor(pos.z)}`,
          `Health: ${health}/20`,
          `Food: ${food}/20`,
        ].join("\n"),
      },
    ],
  };
});
```

This gives Claude awareness of the bot's state — position, health, food level. Without this, Claude would be flying blind.

## Step 4: Movement tools

Now we build the tools that map to the behaviors we hardcoded in Tutorials 1 and 2. An important design decision: **movement tools should be non-blocking**. If `followPlayer` blocked until it was done, Claude couldn't call any other tools while the bot was following. Instead, we start the action and return immediately — the bot continues in the background.

**moveToCoordinates** — the pathfinder navigation from Tutorial 2's coordinate handling, but now Claude provides the coordinates directly:

```ts
server.tool(
  "moveToCoordinates",
  "Navigate the bot to specific x, y, z coordinates. Returns immediately — use status to check progress.",
  {
    x: z.number().describe("X coordinate"),
    y: z.number().describe("Y coordinate"),
    z: z.number().describe("Z coordinate"),
    range: z.number().optional().describe("How close to get to the target (default: 2 blocks)"),
  },
  async ({ x, y, z: zCoord, range }) => {
    const currentBot = requireBot();
    const goalRange = range ?? 2;

    currentBot.pathfinder.setGoal(new GoalNear(x, y, zCoord, goalRange));

    const pos = currentBot.entity.position;
    return {
      content: [
        {
          type: "text",
          text: `Navigating to ${x}, ${y}, ${zCoord} (within ${goalRange} blocks). Current position: ${Math.floor(pos.x)}, ${Math.floor(pos.y)}, ${Math.floor(pos.z)}`,
        },
      ],
    };
  },
);
```

We set the pathfinder goal and return immediately. The bot walks there in the background — Claude can use `status` to check progress or call other tools while the bot is moving. Note `z: zCoord` in the destructuring — we rename the parameter because `z` is already imported from zod.

**followPlayer** — combines the follow logic from Tutorial 1 with the hostile protection from Tutorial 2, using the same proven `setInterval` + `GoalNear` pattern:

```ts
server.tool(
  "followPlayer",
  "Follow a player by their username. Stops any active movement before following. Returns immediately — the bot keeps following in the background. Use stopMovement to stop.",
  {
    name: z.string().describe("Username of the player to follow"),
    range: z.number().optional().describe("How close to stay to the player (default: 3 blocks)"),
    protectFromHostiles: z
      .boolean()
      .optional()
      .describe("Attack nearby hostile mobs while following (default: false)"),
    hostileRange: z
      .number()
      .optional()
      .describe(
        "Range in blocks to scan for hostiles (default: 6). Only used when protectFromHostiles is true.",
      ),
  },
  async ({ name, range, protectFromHostiles, hostileRange }) => {
    const currentBot = requireBot();
    const followRange = range ?? 3;
    const protect = protectFromHostiles ?? false;
    const attackRange = hostileRange ?? 6;

    // Stop any active movement
    currentBot.pathfinder.stop();
    if (followInterval) {
      clearInterval(followInterval);
      followInterval = null;
    }

    const player = currentBot.players[name];
    if (!player?.entity) {
      return {
        content: [
          {
            type: "text",
            text: `Player "${name}" is not nearby or not visible.`,
          },
        ],
        isError: true,
      };
    }

    followInterval = setInterval(() => {
      const target = currentBot.nearestEntity((e) => e.type === "player" && e.username === name);
      if (target) {
        const { x, y, z } = target.position;
        currentBot.pathfinder.setGoal(new GoalNear(x, y, z, followRange));
      }

      if (protect) {
        for (const entityId of Object.keys(currentBot.entities)) {
          const entity = currentBot.entities[entityId];
          if (
            entity.type === "hostile" &&
            currentBot.entity.position.distanceTo(entity.position) <= attackRange
          ) {
            currentBot
              .lookAt(entity.position, true)
              .then(() => {
                currentBot.attack(entity);
              })
              .catch(() => {
                // Entity may have died or moved out of range
              });
          }
        }
      }
    }, 500);

    const mode = protect
      ? `following and protecting from hostiles within ${attackRange} blocks`
      : "following";
    return {
      content: [
        {
          type: "text",
          text: `Now ${mode} ${name} (staying within ${followRange} blocks). Use stopMovement to stop.`,
        },
      ],
    };
  },
);
```

A few things to notice:

1. **Stops existing movement first** — if the bot was already following someone or navigating, we clean that up before starting. This prevents multiple intervals from stacking up.
2. **Same pattern as Tutorial 1** — a `setInterval` that runs every 500ms, finds the player with `nearestEntity`, and sets a `GoalNear` goal. We use this instead of pathfinder's `GoalFollow` because it's the pattern we've already proven works.
3. **Protection is built-in** — when `protectFromHostiles` is `true`, the same interval loop also scans for hostiles and attacks them. This mirrors Tutorial 2's behavior, but now Claude decides whether to enable it via a parameter.
4. **Non-blocking** — the tool sets up the interval and returns immediately. Claude can call other tools while the bot follows.

**stopMovement** — a simple tool to cancel everything:

```ts
server.tool(
  "stopMovement",
  "Stop the bot's current movement (following, navigating, etc.) and hostile protection.",
  {},
  async () => {
    const currentBot = requireBot();
    currentBot.pathfinder.stop();
    if (followInterval) {
      clearInterval(followInterval);
      followInterval = null;
    }
    const pos = currentBot.entity.position;
    return {
      content: [
        {
          type: "text",
          text: `Stopped. Position: ${Math.floor(pos.x)}, ${Math.floor(pos.y)}, ${Math.floor(pos.z)}`,
        },
      ],
    };
  },
);
```

This clears the pathfinder goal and the follow/protect interval. Without this, the only way to stop the bot would be to disconnect it.

## Step 5: Start the server

```ts
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

That's the entire server startup. `StdioServerTransport` hooks up stdin/stdout, and `server.connect()` starts listening for tool calls from Claude.

## Building and running

Build the project:

```bash
cd mcp
npm install
npm run build
```

For development, you can use `npm run dev` to run directly without compiling.

## Setup with Claude Desktop

Add the following to your Claude Desktop MCP config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "minecraft": {
      "command": "node",
      "args": ["path/to/mcp/dist/index.js"]
    }
  }
}
```

## Setup with Claude Code

```bash
claude mcp add minecraft node <path-to-repo>/mcp/dist/index.js
```

## Try it out

Once configured, you can ask Claude things like:

- _"Connect the bot to my Minecraft server"_
- _"What's the bot's status?"_
- _"Move the bot to coordinates 100, 64, -200"_
- _"Follow the player Synacktra and protect him from hostiles"_
- _"Stop the bot from following me"_

The key difference from Tutorials 1 and 2: you're not writing behavior logic anymore. Claude reads the tool descriptions, understands the game context from your messages, and decides which tools to call. You could ask it _"follow me and protect me from mobs"_ and it would call `followPlayer` with `protectFromHostiles: true` — the same behavior we hardcoded in Tutorial 2.
