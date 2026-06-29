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
    },
    outDir: "dist",
    cssCodeSplit: false,
    sourcemap: true,
    copyPublicDir: false,
    // Ship readable, unminified chunks. Under preserveModules the minifier can
    // mangle two top-level bindings in a chunk to the same name (e.g. `h`),
    // producing "Identifier already declared" when a consumer re-bundles. The
    // consumer's own build minifies the final output anyway.
    minify: false,
    rollupOptions: {
      external: ["vue", "gsap", /^@heroicons\/vue\/?.*/],
      // `preserveModules` emits one chunk per source module instead of a single
      // bundle. That's what makes the library tree-shakeable: a consumer that
      // only imports `Table` never pulls the chunks that `import "@heroicons/vue"`
      // or `"gsap"`, so those peers stay genuinely optional.
      output: [
        {
          format: "es",
          preserveModules: true,
          preserveModulesRoot: "src",
          entryFileNames: "[name].mjs",
          assetFileNames: (asset) =>
            asset.name === "style.css"
              ? "mood-ui.css"
              : (asset.name ?? "[name][extname]"),
          exports: "named",
        },
        {
          format: "cjs",
          preserveModules: true,
          preserveModulesRoot: "src",
          entryFileNames: "[name].cjs",
          assetFileNames: (asset) =>
            asset.name === "style.css"
              ? "mood-ui.css"
              : (asset.name ?? "[name][extname]"),
          exports: "named",
          globals: { vue: "Vue", gsap: "gsap" },
        },
      ],
    },
    emptyOutDir: true,
  },
});
