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
    locales: [
      { code: "en", file: "en.json", iso: "en-US" },
      { code: "es", file: "es.json", iso: "es-ES" },
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

  app: {
    head: {
      titleTemplate: "%s · mood-ui",
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
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },

  typescript: {
    strict: true,
  },

  devtools: { enabled: true },
});
