import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-01-01",
  future: { compatibilityVersion: 4 },

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

  modules: ["@nuxtjs/i18n", "@nuxtjs/sitemap"],

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
        iso: "en-US",
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
        iso: "es-ES",
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
  },

  sitemap: {
    autoLastmod: true,
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
      htmlAttrs: { lang: "en" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Vue 3 component library — TypeScript, Tailwind CSS v4, dark mode, accessible.",
        },
        { property: "og:site_name", content: "mood-ui" },
        { property: "og:type", content: "website" },
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
      // body parses, so the very first paint already has the right `.dark`
      // class on <html>. Mirrors what the lib's `useColorMode` will set
      // during hydration. Without this, the SSG-rendered HTML (light by
      // default) flashes for ~200ms before Vue hydrates and toggles dark.
      script: [
        {
          tagPosition: "head",
          innerHTML: `(function(){try{var s=localStorage.getItem('modo-color-mode');var p=matchMedia('(prefers-color-scheme: dark)').matches;var d=s==='dark'||(s!=='light'&&p);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
        },
      ],
    },
  },

  typescript: {
    strict: true,
  },

  devtools: { enabled: true },
});
