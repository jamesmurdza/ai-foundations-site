import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@portal": fileURLToPath(new URL("./src/portal", import.meta.url)),
      "@site": fileURLToPath(new URL("./src/site", import.meta.url)),
      "@dashboard": fileURLToPath(new URL("./src/dashboard", import.meta.url)),
      // Let unit tests import pure helpers from server-only modules.
      "server-only": fileURLToPath(
        new URL("./tests/stubs/empty.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    setupFiles: ["./tests/setup.env.ts"],
    environment: "node",
  },
});
