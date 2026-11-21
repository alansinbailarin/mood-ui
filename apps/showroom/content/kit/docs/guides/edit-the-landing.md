# Edit the landing

The home page of the root domain (`example.com/`, `localhost:3000/` locally) is the product's landing: a hero, a row of
customer logos, the features, what it does by area, one feature at length, the prices, the questions and a closing call.
It lives in the `marketing` layer, and almost everything you will want to change is in two kinds of file: one config file
and two locale files. This guide shows where each thing lives and how to make the usual edits.

## Where everything lives

| What | Where |
| ---- | ----- |
| Which sections show, and in which order | `frontend/layers/marketing/app/app.config.ts`, `marketing.sections` |
| The header's links and the footer's columns and legal links | the same file, `site.nav` and `site.footer` |
| The customer logos | the same file, `marketing.logos`; the images under `frontend/public/` |
| Which questions the FAQ asks, and in which order | the same file, `marketing.faq` |
| The plan raised among the others | the same file, `marketing.pricing.highlight` (a plan's slug) |
| Where "Write to us" goes | the same file, `marketing.contactEmail` |
| Every word on the page | `frontend/layers/marketing/i18n/locales/en.json` and `es.json`, under `marketing` |
| The prices, the plans and what each includes | the plan catalog, edited by a super admin on the admin host (**Plans**), never in code |
| The page itself | `frontend/app/pages/index.vue`, which draws `MarketingLanding` on the root domain |
| The header, the footer and the layout around the page | core: the `site` layout, `SiteHeader`, `SiteFooter` and `BrandMark` |
| The main call ("Create account" or "Join the waitlist") | core's `useJoinCall()`, from the platform's access mode |

The landing is drawn by the server, prices included, so a search engine reads the whole page. The root domain's
`sitemap.xml` already lists `/`.

### The prices

The pricing section reads `GET /api/v1/plans` (public, no session), the same catalog the app charges from: the plans on sale
in their order, each with its name and description in the visitor's language, its monthly and yearly prices in cents, its
trial and what it includes (see [Plans](../packages/plans.md)). To change a price, a plan's name or what it includes, a
super admin edits the plan on the admin host (`admin.<root domain>/platform/plans`). There is no price anywhere in the
frontend, so the landing never shows a price the app does not charge. If the API cannot be reached, the section says the
prices could not be loaded.

The words around the prices (the title, "per month", "Free", the button) are in the locale files under
`marketing.pricing`.

## Hide or reorder a section

`marketing.sections` lists the sections that show, top to bottom:

```ts
marketing: {
  sections: ["hero", "logos", "features", "areas", "highlight", "pricing", "faq", "cta"],
  // ...
},
```

Take a name out of the list to hide that section, or move it to change the order. The names are `hero`, `logos`,
`features`, `areas`, `highlight`, `pricing`, `faq` and `cta`. Keep `cta` while the platform lets people in by waitlist:
it holds the waitlist form (see [The access mode](#the-access-mode)). When `pricing` is gone, the page does not ask the
API for the plans at all. Hiding a section does not remove its words from the locale files; delete them if you want the
files tidy.

The header's links point at sections by their anchor (`/#features`, `/#pricing`, `/#faq`): if you hide one, take its
link out too.

## Add a link to the header or the footer

`site.nav` holds the header's links; `site.footer` holds the footer's line under the logo (`tagline`), its columns of
links (`columns`) and the legal links beside the copyright (`legal`). A link is a `label`, which is an i18n key, and a
`to`, which is a path of this app (`/#pricing`, `/terms`), a `mailto:` address or a whole address (`https://...`), which
opens in a new tab:

```ts
site: {
  nav: [
    { label: "marketing.nav.features", to: "/#features" },
    { label: "marketing.nav.pricing", to: "/#pricing" },
    { label: "marketing.nav.blog", to: "https://blog.example.com" },
  ],
  // ...
},
```

Then add the key to both locale files:

```json
"nav": { "features": "Features", "pricing": "Pricing", "faq": "FAQ", "blog": "Blog" }
```

The header always shows the brand, the language, **Sign in** (to `/find-workspace`) and the main call; on a phone the links
move into the menu panel under the bar. With `site.nav` empty, the header shows no links.

## Add customer logos

Put the images under `frontend/public/` (for example `frontend/public/logos/acme.svg`), then list them:

```ts
marketing: {
  logos: [
    { name: "Acme", src: "/logos/acme.svg" },
    { name: "Globex", src: "/logos/globex.svg" },
  ],
  // ...
},
```

`name` is the image's `alt`. `src` is a path under `public/` or a whole address (an image on another host also needs its
origin in the Content Security Policy's `img-src`; see [Production](../configuration/production.md#security-headers)). The
logos show in gray and take their color on hover. While the list is empty the row shows five dashed boxes that say where
logos go: either add logos or take `logos` out of `marketing.sections`.

The title over the row is `marketing.logos.title`.

## Add a question to the FAQ

A question has a key under `marketing.faq.items` in both locale files, with its question (`q`) and its answer (`a`).
`{platform}` in either is replaced by the platform's name:

```json
"faq": {
  "items": {
    "what": { "q": "What is {platform}?", "a": "..." },
    "export": { "q": "Can I take my data with me?", "a": "Yes. You can download your clients as a CSV file at any time." }
  }
}
```

Then add the key to `marketing.faq`, where you want it in the list:

```ts
faq: ["what", "trial", "plans", "export", "cancel", "data", "help"],
```

A key in the locale files that is not in `marketing.faq` does not show. The first question in the list starts open.

## Change the hero

The hero's words are `marketing.hero.title`, `marketing.hero.subtitle` (where `{platform}` is the platform's name),
`marketing.hero.see_pricing` (the second button) and `marketing.hero.note` (the small line under the buttons). The first
button is the main call, which follows the access mode (below). Under the buttons is a drawing of the product
(`MarketingPreview`), made of mood-ui pieces in the primary color; its sample texts are under `marketing.preview`.

The page's title and description for search engines and link previews are `marketing.seo.title` and
`marketing.seo.description`.

The colors are the platform's: the primary color a super admin sets on the admin host (**Settings**), or
`PLATFORM_PRIMARY_COLOR` (see [Brand the platform](brand-the-platform.md)). The logo in the header and the footer is the
platform's logo; with none uploaded, a dashed "Your logo here" box shows in its place.

## The access mode

Who may sign up is the platform's access mode (see [Control who signs up](control-who-signs-up.md)), and the landing
follows it through core's `useJoinCall()`:

| Mode | The main call (header, hero, highlight, prices) | The closing section (`cta`) |
| ---- | ----------------------------------------------- | --------------------------- |
| `open` (or not known yet) | **Create account**, to `/signup`; a plan's button goes to `/signup?plan=<slug>` | the main call and **Sign in** |
| `waitlist` | **Join the waitlist**, to `/#waitlist` | the waitlist form (name, email, company, a note, the captcha) |
| `closed` | none | **Sign in** only |

The waitlist form is the platform layer's `WaitlistForm`, which `frontend/app/pages/index.vue` hands to the landing in its
`waitlist` slot. The section's anchor is `#waitlist` (core's `KIT_ROUTES.waitlist`), and the old `/waitlist` address
redirects there. A super admin sees who asked on the admin host, at `/platform/waitlist`.

## Remove the landing

To use a landing of your own (a separate site, or a page you build), remove the marketing layer:

1. Delete `frontend/layers/marketing/`, then run `pnpm install` from the repo root and commit the change it makes to
   `pnpm-lock.yaml` (the `frontend/layers/marketing` importer goes away).
2. Give the root domain's home another page: in `frontend/app/pages/index.vue`, replace `<MarketingLanding>` with your own
   content, or send visitors elsewhere. The page must still show the waitlist form (`WaitlistForm`, with `id="waitlist"` on
   its section) if you keep the `waitlist` access mode, since `KIT_ROUTES.waitlist` points at `/#waitlist`.
3. Without the layer, `site.nav` and `site.footer` are empty (core's defaults): the `site` layout's header shows the brand,
   the language, **Sign in** and the main call, and its footer the copyright. Set your own links in an `app.config.ts` of
   your own layer, or drop the `site` layout from the page.
4. The `/waitlist` redirect lived in the marketing layer's `nuxt.config.ts`; add it to yours if old links point there.
5. Update the tests that look at the home page: `frontend/layers/auth/tests/homePage.test.ts` and
   `frontend/tests/e2e/home.spec.ts` (and its baselines).

The legal pages (`/terms`, `/privacy`) belong to the signup layer and keep working.

## Prompts for a coding agent

Paste one of these into your coding agent, filling in the parts in angle brackets. Each names the files to touch, so the
agent does not have to search for them.

**Reorder or hide sections**

```text
In frontend/layers/marketing/app/app.config.ts, set marketing.sections to <list, for example: hero, features, pricing,
faq, cta>. If a section I removed has a link in site.nav or site.footer (its anchor, like /#features), remove that link
too. Do not touch the components. Run pnpm --filter ./frontend lint and npx vitest run layers/marketing from frontend/.
```

**Add a link to the header**

```text
Add a link "<label in English>" / "<label in Spanish>" to <url or path> in the landing's header. Add it to site.nav in
frontend/layers/marketing/app/app.config.ts with a new key under marketing.nav, and add that key to
frontend/layers/marketing/i18n/locales/en.json and es.json. Run the locale tests: npx vitest run layers/core/tests/locales.test.ts.
```

**Add customer logos**

```text
I put these logo files in frontend/public/logos/: <file names>. List them in marketing.logos in
frontend/layers/marketing/app/app.config.ts, each with the customer's name as name and /logos/<file> as src, in this
order: <names>. Check the landing at http://localhost:3000 at 1440 and 375 pixels wide.
```

**Add a question to the FAQ**

```text
Add a question to the landing's FAQ, after "<existing question key>". Question: "<question>". Answer: "<answer>".
Write it in English and in Spanish under marketing.faq.items.<new key> in
frontend/layers/marketing/i18n/locales/en.json and es.json (q and a), and add the key to marketing.faq in
frontend/layers/marketing/app/app.config.ts. Plain words, short sentences, no dashes.
```

**Rewrite the hero**

```text
Rewrite the landing's hero for <what the product is, who it is for>. Change only marketing.hero.title,
marketing.hero.subtitle, marketing.hero.note, marketing.seo.title and marketing.seo.description in
frontend/layers/marketing/i18n/locales/en.json and es.json. Keep {platform} where the platform's name belongs. Plain and
concrete, no more than 10 words in the title, no dashes, no emojis.
```

**Change the contact email**

```text
Set marketing.contactEmail and the footer's contact link (site.footer, the mailto: link) in
frontend/layers/marketing/app/app.config.ts to <email>.
```

**Remove the landing**

```text
Remove the marketing layer and give the root domain a simple home of our own, following docs/guides/edit-the-landing.md,
"Remove the landing". The home on the root domain should show <what>. Keep the waitlist form with id="waitlist". Run
pnpm install from the repo root, then pnpm --filter ./frontend lint, pnpm --filter ./frontend typecheck and
npx vitest run layers app from frontend/, and update the home page's tests.
```

To change a price or what a plan includes, no prompt is needed: edit the plan on the admin host.
