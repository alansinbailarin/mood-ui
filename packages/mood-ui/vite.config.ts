import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    dts({
      entryRoot: "src",
      outDirs: ["dist/types"],
      include: ["src/**/*.ts", "src/**/*.vue"],
      exclude: ["**/*.spec.ts", "**/*.test.ts"],
      tsconfigPath: "./tsconfig.lib.json",
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      name: "MoodUI",
      formats: ["es", "cjs"],
      fileName: (format) => `mood-ui.${format === "es" ? "mjs" : "cjs"}`,
    },
    outDir: "dist",
    cssCodeSplit: false,
    sourcemap: true,
    copyPublicDir: false,
    rollupOptions: {
      external: ["vue", "gsap", /^@heroicons\/vue\/?.*/],
      output: {
        globals: { vue: "Vue", gsap: "gsap" },
        assetFileNames: (asset) =>
          asset.name === "style.css"
            ? "mood-ui.css"
            : (asset.name ?? "[name][extname]"),
        exports: "named",
      },
    },
    emptyOutDir: true,
  },
});
