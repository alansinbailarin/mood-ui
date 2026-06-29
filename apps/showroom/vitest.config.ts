import { defineConfig } from "vitest/config";

// Minimal vitest setup for the showroom. The current suite only exercises the
// pure SEO keyword map (no Nuxt runtime / DOM), so the default Node env is fine
// and no Vue plugin is required.
export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["tests/**/*.test.ts", "tests/**/*.spec.ts"],
  },
});
