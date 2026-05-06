import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';

/**
 * Two build modes:
 *   - `npm run dev` / `npm run build:showroom` → bundles `index.html` + showroom (for local dev / GitHub Pages)
 *   - `npm run build`                          → bundles `src/index.ts` as a library (publishable to npm)
 *
 * Toggled via `BUILD_TARGET=lib` env var (set by the npm scripts).
 */
const isLib = process.env.BUILD_TARGET === 'lib';

export default defineConfig({
    // Always serve from root – Vercel with custom domain modo-ui.com
    base: isLib ? '/' : '/',
    plugins: [
        vue(),
        tailwindcss(),
        ...(isLib
            ? [
                  dts({
                      entryRoot: 'src',
                      outDirs: ['dist/types'],
                      include: ['src/**/*.ts', 'src/**/*.vue'],
                      exclude: ['src/showroom/**', 'src/main.ts', 'src/App.vue', '**/*.spec.ts', '**/*.test.ts'],
                      tsconfigPath: './tsconfig.lib.json',
                  }),
              ]
            : []),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: isLib
        ? {
              lib: {
                  entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
                  name: 'MoodUI',
                  formats: ['es', 'cjs'],
                  fileName: (format) => `mood-ui.${format === 'es' ? 'mjs' : 'cjs'}`,
              },
              outDir: 'dist',
              cssCodeSplit: false,
              sourcemap: true,
              copyPublicDir: false,
              rollupOptions: {
                  external: [
                      'vue',
                      'gsap',
                      /^@heroicons\/vue\/?.*/,
                  ],
                  output: {
                      globals: { vue: 'Vue', gsap: 'gsap' },
                      assetFileNames: (asset) =>
                          asset.name === 'style.css' ? 'mood-ui.css' : asset.name ?? '[name][extname]',
                      exports: 'named',
                  },
              },
              emptyOutDir: true,
          }
        : {
              outDir: 'dist-showroom',
          },
});
