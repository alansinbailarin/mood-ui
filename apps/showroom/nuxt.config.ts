import tailwindcss from "@tailwindcss/vite";
import { defineOrganization } from "nuxt-schema-org/schema";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-01-01",
  future: { compatibilityVersion: 4 },

  devServer: { port: 3030 },

  // Static Site Generation — `nuxt generate` produces a fully pre-rendered
  // site that Vercel serves as plain HTML. Each component page becomes
  // independently indexable by search engines.
  nitro: {
    preset: "vercel-static",
    prerender: {
      // Fase 4 is complete — every sidebar link should resolve to a real
      // page. Fail the build if the crawler finds a broken link so we
      // never regress silently.
      failOnError: true,
    },
  },

  modules: ["@nuxtjs/i18n", "@nuxt/fonts", "@nuxtjs/seo"],

  // Tailwind v4 is integrated via the official Vite plugin. The lib already
  // ships its own compiled `mood-ui.css`, but the docs site has its own
  // utility classes for the docs shell.
  vite: {
    plugins: [tailwindcss()],
  },

  css: ["mood-ui/style.css", "~/assets/docs.css"],

  i18n: {
    // Each locale loads 13 grouped JSON files (common, doc, forms, feedback,
    // data-display, layout, navigation, composables, utilities, templates,
    // docs, welcome, theme-studio). vue-i18n deep-merges them under the same
    // root, so keys like `pages.forms.button.title` keep working even though
    // they now live in `forms.json` instead of `pages/forms/button.json`.
    locales: [
      {
        code: "en",
        language: "en-US",
        files: [
          "en/common.json",
          "en/doc.json",
          "en/forms.json",
          "en/feedback.json",
          "en/data-display.json",
          "en/layout.json",
          "en/navigation.json",
          "en/composables.json",
          "en/utilities.json",
          "en/templates.json",
          "en/docs.json",
          "en/welcome.json",
          "en/theme-studio.json",
        ],
      },
      {
        code: "es",
        language: "es-ES",
        files: [
          "es/common.json",
          "es/doc.json",
          "es/forms.json",
          "es/feedback.json",
          "es/data-display.json",
          "es/layout.json",
          "es/navigation.json",
          "es/composables.json",
          "es/utilities.json",
          "es/templates.json",
          "es/docs.json",
          "es/welcome.json",
          "es/theme-studio.json",
        ],
      },
    ],
    defaultLocale: "en",
    lazy: true,
    langDir: "locales/",
    strategy: "no_prefix",
  },

  site: {
    url: "https://mood-ui.com",
    name: "mood-ui",
    description:
      "Vue 3 component library — TypeScript, Tailwind CSS v4, dark mode, accessible.",
    defaultLocale: "en",
  },

  sitemap: {
    autoLastmod: true,
    // SSG: bake the sitemap at build time, no server runtime needed.
    zeroRuntime: true,
  },

  // Schema.org identity — anchors the auto WebSite/WebPage graph to a real
  // Organization so Google can attribute pages, show sitelinks and build a
  // knowledge panel. The logo uses the dark mark (visible on white SERPs).
  schemaOrg: {
    identity: defineOrganization({
      name: "Mood UI",
      url: "https://mood-ui.com",
      logo: "https://mood-ui.com/logo_dark.png",
      sameAs: ["https://github.com/alansinbailarin/mood-ui"],
    }),
  },

  // NOTE: nuxt-og-image@6.7.0 is patched (patches/nuxt-og-image@6.7.0.patch).
  // Its `extractHeadSeoProps` doesn't read the unhead-v2 / Nuxt 4 head format
  // (a `meta` array instead of `_flatMeta`), so each page's title/description
  // weren't injected into the OG card. Remove the patch when a version that
  // fixes this upstream is available (check on any `@nuxtjs/seo` bump).
  //
  // v6: fonts are resolved via @nuxt/fonts (below), not ogImage.fonts.
  // v6: site-wide default component is OgImage/Default.{renderer}.vue —
  // defaults.component is removed. Width/height still live in defaults.
  ogImage: {
    // SSG: render every image at build time, no serverless runtime.
    zeroRuntime: true,
    defaults: {
      width: 1200,
      height: 630,
    },
  },

  // @nuxt/fonts resolves Poppins at build time so nuxt-og-image v6 can embed
  // it in the OG card without a network call at render time. We deliberately
  // omit `global: true` — that would inject a site-wide @font-face, but the
  // page CSS already loads Poppins via the Google Fonts <link> in app.head,
  // so a global injection would load the font twice. @nuxt/fonts still
  // provides the family to the OG renderer regardless of the flag.
  fonts: {
    families: [
      { name: "Poppins", weights: [600, 800] },
    ],
  },

  // The umbrella enables nuxt-link-checker with failOnError by default,
  // which would block `generate`. Out of scope for A1 — revisit later.
  linkChecker: {
    enabled: false,
  },

  // Global fade between pages. We deliberately DROP `mode: "out-in"`
  // here: that mode causes Vue to emit a transient null vnode between
  // the leave of the old page and the enter of the new one, which
  // `runtime-core` then chokes on with `Cannot read properties of null`
  // for any page whose slot resolves to a `<ClientOnly>`-only shell
  // (EmptyState, installation, etc). A plain crossfade is enough.
  app: {
    pageTransition: { name: "docs-page", duration: 180 },

    head: {
      titleTemplate: "%s · Mood-UI",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [
        // The favicon.svg got dropped from public/ when the brand assets
        // were swapped; rely on the legacy ico + sized pngs that ship
        // alongside. Browsers pick the right one per density.
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "manifest", href: "/site.webmanifest" },
        // Brand typography — the lib's style.css declares
        // `--font-sans: "Poppins", ...` but doesn't ship the font file,
        // so the showroom is responsible for loading it. JetBrains Mono
        // covers the inline `<code>` and CodePreview blocks.
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap",
        },
      ],
      // Inline anti-FOUC script. Runs synchronously in <head> before the
      // body parses so the very first paint has both:
      //   1) The right `.dark` class on <html>.
      //   2) The user's previously-cached CSS custom properties applied
      //      to `<html>` — primary palette, semantic tokens and surface
      //      vars — so returning visitors don't flash through the lib's
      //      indigo defaults on their way to whatever palette they
      //      picked in the docs settings panel / Theme Studio.
      // The cache is written by `composables/usePersistedThemeVars.ts`
      // every time the docs theme changes. ModoProvider on the server
      // emits `style=""` until it mounts, so the inline `<html>` styles
      // we set here win the first paint.
      script: [
        {
          tagPosition: "head",
          innerHTML: `(function(){try{var s=localStorage.getItem('modo-color-mode');var p=matchMedia('(prefers-color-scheme: dark)').matches;var d=s==='dark'||(s!=='light'&&p);if(d)document.documentElement.classList.add('dark');var raw=localStorage.getItem('mood-ui:cached-vars');if(!raw)return;var cache=JSON.parse(raw);var vars=cache&&cache[d?'dark':'light'];if(!vars)return;var r=document.documentElement;for(var k in vars){if(k.charAt(0)==='-'&&k.charAt(1)==='-')r.style.setProperty(k,vars[k]);}}catch(e){}})();`,
        },
      ],
    },
  },

  typescript: {
    strict: true,
  },

  devtools: { enabled: true },
});
