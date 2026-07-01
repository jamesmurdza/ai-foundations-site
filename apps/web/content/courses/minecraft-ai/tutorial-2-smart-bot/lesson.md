The goal of this lesson is to upgrade the bot to protect a player by attacking hostile mobs and navigating to coordinates.

> **Code:** [`examples/bot-protect-a-player-from-hostile/`](https://github.com/synacktraa/hacking-minecraft/tree/master/examples/bot-protect-a-player-from-hostile)

## What you'll learn

- Managing bot state (following vs. navigating to coordinates)
- Detecting and attacking hostile entities
- Parsing player chat messages for coordinates
- Handling edge cases (player out of range, multiple coordinate formats)

## Overview

In Tutorial 1, our bot could only do one thing — follow a player. Now we're going to make it useful. By the end of this tutorial, the bot will:

- Follow you around like before
- Attack hostile mobs that get too close
- Ask for your coordinates if it loses sight of you
- Navigate to coordinates you send in chat

This introduces an important concept: **state management**. The bot now has multiple behaviors and needs to decide what to do based on the current situation.

## Step 1: Set up the project

Same setup as Tutorial 1 — same dependencies:

```bash
mkdir bot-protect-a-player-from-hostile
cd bot-protect-a-player-from-hostile
npm init -y
npm install mineflayer mineflayer-pathfinder yargs
npm install -D typescript @types/node @types/yargs tsx
```

Use the same `tsconfig.json` and `package.json` scripts from Tutorial 1. Create `src/index.ts` with the same imports and CLI argument parsing. One new thing — we derive a `hostileRange` from the player range:

```ts
const playerRange = argv.range;
const hostileRange = argv.range * 1.5;
```

The hostile detection range is 1.5x the follow range. This means the bot starts attacking mobs _before_ they reach the player — it acts like a perimeter guard.

## Step 2: Add state tracking

Our bot now has multiple modes of operation, so we need state flags:

```ts
let needsPlayerCoords = false;
let isNavigatingToCoords = false;
```

- **`needsPlayerCoords`** — `true` when the bot can't find the player and has already asked for coordinates. This prevents the bot from spamming "where are you?" every 500ms.
- **`isNavigatingToCoords`** — `true` when the bot is walking toward coordinates the player sent. While navigating, it skips the normal "find and follow player" loop.

This is a simple state machine with two flags. In more complex bots you might use an enum or a proper state machine library, but for two states this works fine.

## Step 3: Follow and protect

The main loop runs on spawn, just like Tutorial 1, but now it does more:

```ts
bot.on("spawn", () => {
  bot.loadPlugin(pathfinder);
  bot.pathfinder.setMovements(new Movements(bot));

  bot.chat(`Hey, ${playerName}, I am here!`);

  setInterval(() => {
    // Skip if we're navigating to coordinates
    if (isNavigatingToCoords) return;

    const player = bot.nearestEntity((e) => e.type === "player" && e.username === playerName);

    if (player) {
      needsPlayerCoords = false;
      const { x, y, z } = player.position;
      bot.pathfinder.setGoal(new GoalNear(x, y, z, playerRange));

      // Check for hostile entities and attack them
      bot.nearestEntity((e) => {
        if (e.type !== "hostile") return false;
        if (bot.entity.position.distanceTo(e.position) <= hostileRange) {
          bot.lookAt(e.position, true).then(() => {
            bot.attack(e);
          });
        }
        return true;
      });
    } else if (!needsPlayerCoords) {
      needsPlayerCoords = true;
      bot.chat(`${playerName}, I can't find you! Please share your coordinates.`);
    }
  }, interval);
});
```

Let's break down what's new compared to Tutorial 1:

1. **`if (isNavigatingToCoords) return`** — if the player sent coordinates and the bot is walking there, don't override the goal by trying to find the player visually.
2. **Player found → attack hostiles** — after setting the follow goal, we scan for hostile entities. If any are within `hostileRange`, the bot looks at the mob (for aiming) and then attacks.
3. **`bot.lookAt(e.position, true)`** — the `true` parameter forces the bot's head to snap to the target. The bot needs to face a mob to attack it. This returns a Promise, so we chain `.then(() => bot.attack(e))`.
4. **`distanceTo()`** — mineflayer provides euclidean distance calculation on position vectors. We use it to check if a hostile is close enough to engage.
5. **Player not found** — if the player isn't nearby and we haven't already asked, set the flag and ask in chat. The `needsPlayerCoords` flag ensures we only ask once.

## Step 4: Parse coordinates from chat

We need a helper to understand coordinates in different formats, since players might type them differently:

```ts
function parseCoordinates(message: string) {
  const coordPatterns = [
    /(-?\d+)\s+(-?\d+)\s+(-?\d+)/, // "100 64 -200"
    /(-?\d+),\s*(-?\d+),\s*(-?\d+)/, // "100,64,-200" or "100, 64, -200"
    /(-?\d+)\/(-?\d+)\/(-?\d+)/, // "100/64/-200"
  ];

  for (const pattern of coordPatterns) {
    const match = message.match(pattern);
    if (match) {
      const [_, x, y, z] = match;
      return { x: parseInt(x), y: parseInt(y), z: parseInt(z) };
    }
  }
  return null;
}
```

Each regex captures three groups of digits (including negative numbers with `-?`). We try each pattern in order and return the first match. If nothing matches, we return `null`.

This is a small but important UX detail — the player shouldn't have to remember a specific format. Minecraft's F3 screen shows coordinates with slashes, the chat shows them with spaces, and some people naturally use commas.

## Step 5: Handle coordinate navigation

Now we listen for chat messages and navigate when the player sends coordinates:

```ts
bot.on("chat", (username, message) => {
  if (username === playerName) {
    const coords = parseCoordinates(message);
    if (coords) {
      const { x, y, z } = coords;
      bot.chat(`Thanks! I'm coming to coordinates: ${x}, ${y}, ${z}`);
      isNavigatingToCoords = true;
      needsPlayerCoords = false;

      bot.pathfinder.setGoal(new GoalNear(x, y, z, playerRange));

      // Still attack hostiles while navigating
      bot.nearestEntity((e) => {
        if (e.type !== "hostile") return false;
        bot.attack(e);
        return true;
      });

      // Check progress and reset when we arrive
      const checkInterval = setInterval(() => {
        const botPos = bot.entity.position;
        if (isNavigatingToCoords) {
          bot.chat(
            `Current position: ${Math.floor(botPos.x)}, ${Math.floor(botPos.y)}, ${Math.floor(botPos.z)}`,
          );
        }

        if (bot.entity.position.distanceTo({ x, y, z }) <= playerRange) {
          isNavigatingToCoords = false;
          clearInterval(checkInterval);
          bot.chat("I have reached the target location!");
        }
      }, 4000);
    }
  }
});
```

Here's the flow:

1. **Filter messages** — we only care about chat from the target player.
2. **Parse coordinates** — try to extract x, y, z from the message. If the message isn't coordinates, `parseCoordinates` returns `null` and we ignore it.
3. **Set navigation state** — flip `isNavigatingToCoords` to `true` so the main loop stops trying to visually find the player.
4. **Navigate** — set a pathfinder goal to the coordinates.
5. **Progress updates** — a separate interval (every 4 seconds, slower than the main loop) reports the bot's current position in chat so the player can see it approaching.
6. **Arrival detection** — when the bot is within `playerRange` of the target, clear the interval and reset `isNavigatingToCoords`. The main loop takes over again and resumes normal follow/protect behavior.

## Running it

```bash
cd examples/bot-protect-a-player-from-hostile
npm install
npx tsx src/index.ts -- --player <your-minecraft-username>
```

The bot will follow you and attack any hostile mobs that get close. If it loses sight of you, send your coordinates in chat (e.g. `100 64 -200`) and it'll navigate to you.

## What's next?

At this point we have a bot with hardcoded behaviors — it always follows, always attacks hostiles, and responds to a fixed set of chat patterns. In Tutorial 3, we'll break these behaviors out into MCP tools so that Claude can decide _when_ and _how_ to use them. Instead of rigid if/else logic, an LLM will be making the decisions.
