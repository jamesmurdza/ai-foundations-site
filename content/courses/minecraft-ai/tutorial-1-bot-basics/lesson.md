The goal of this lesson is to create a Minecraft bot that connects to a server and follows a player around.

> **Code:** [`examples/bot-follow-a-player/`](https://github.com/synacktraa/hacking-minecraft/tree/master/examples/bot-follow-a-player)

## What you'll learn

- How to use [Mineflayer](https://github.com/PrismarineJS/mineflayer) to create a Minecraft bot
- Connecting a bot to a local server
- Using the pathfinder plugin to navigate the world
- Finding nearby entities and tracking a specific player

## Step 1: Set up the project

Create a new directory and initialize a Node.js project:

```bash
mkdir bot-follow-a-player
cd bot-follow-a-player
npm init -y
```

Install the dependencies we'll need:

```bash
npm install mineflayer mineflayer-pathfinder yargs
npm install -D typescript @types/node @types/yargs tsx
```

- **mineflayer** — the library that lets us create Minecraft bots. It handles connecting to a server, reading game state, and performing actions.
- **mineflayer-pathfinder** — a plugin for mineflayer that gives our bot the ability to navigate the world. Without it, the bot would just stand still — it wouldn't know _how_ to walk somewhere.
- **yargs** — a helper for parsing command-line arguments, so we can pass in the player name and other options when running the script.
- **tsx** — lets us run TypeScript directly without a compile step. Useful during development.

## Step 2: Parse command-line arguments

Create `src/index.ts`. We'll start with imports and CLI arguments so users can configure the bot without editing code:

```ts
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import mineflayer from "mineflayer";
import mineflayerPathfinder from "mineflayer-pathfinder";

const { pathfinder, Movements, goals } = mineflayerPathfinder;
const { GoalNear } = goals;

const argv = yargs(hideBin(process.argv))
  .option("player", {
    alias: "p",
    description: "Name of the player to follow",
    type: "string",
    demandOption: true,
  })
  .option("interval", {
    alias: "i",
    description: "Interval in ms to check for the player",
    type: "number",
    default: 500,
  })
  .option("range", {
    alias: "r",
    description: "Range in blocks to check for the player",
    type: "number",
    default: 3,
  })
  .option("bot", {
    alias: "b",
    description: "Name for the bot",
    type: "string",
    default: "bot",
  })
  .help()
  .parseSync();

const playerName = argv.player;
const interval = argv.interval;
const range = argv.range;
const botName = argv.bot;
```

The key parameter is `--player` — this is the Minecraft username the bot will follow. The others have sensible defaults: the bot checks every 500ms and tries to stay within 3 blocks.

## Step 3: Create the bot and connect

Now we create a bot that connects to a local Minecraft server:

```ts
const bot = mineflayer.createBot({ host: "localhost", username: botName });
```

That's it — one line to create a bot and connect. By default it connects to `localhost:25565`. The `username` is what other players will see in-game.

The imports we set up earlier give us three things from pathfinder:

- **pathfinder** — the plugin itself, which we'll load onto the bot
- **Movements** — defines _how_ the bot can move (walking, jumping, swimming, etc.)
- **GoalNear** — a goal type that tells pathfinder "get within X blocks of this position"

## Step 4: Follow the player

Once the bot spawns into the world, we load the pathfinder plugin and set up a loop that continuously tracks the target player:

```ts
bot.on("spawn", () => {
  bot.loadPlugin(pathfinder);
  bot.pathfinder.setMovements(new Movements(bot));

  bot.chat(`Hey, ${playerName}, I am here!`);

  setInterval(() => {
    bot.nearestEntity((e) => {
      if (e.type !== "player" && e.username !== playerName) {
        return false;
      }

      const { x, y, z } = e.position;
      bot.pathfinder.setGoal(new GoalNear(x, y, z, range));
      return true;
    });
  }, interval);
});
```

Here's what's happening:

1. **`bot.on('spawn')`** — this fires once the bot has fully joined the server and is in the world.
2. **`bot.loadPlugin(pathfinder)`** — activates the pathfinder plugin so the bot can navigate.
3. **`new Movements(bot)`** — tells pathfinder what the bot is capable of (it reads the world data to know which blocks are walkable, which are dangerous, etc.).
4. **`setInterval`** — every `interval` ms (default 500), we look for the player.
5. **`bot.nearestEntity()`** — scans nearby entities and calls our filter function. When we find the target player, we grab their position and set it as the pathfinder goal.
6. **`GoalNear(x, y, z, range)`** — "navigate to within `range` blocks of this position." The bot will walk, jump, and swim to get there.

The bot continuously updates the goal because the player is moving — so every 500ms it recalculates where to go.

## Running it

Make sure your Minecraft server is running locally, then:

```bash
cd examples/bot-follow-a-player
npm install
npx tsx src/index.ts -- --player <your-minecraft-username>
```

Join your local server and watch the bot follow you around!
