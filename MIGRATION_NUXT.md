# Plan de Migración: Showroom → Nuxt 4 + SSG

## Contexto

El showroom actual es un SPA de Vue 3 + Vite con un router hash-based custom
(`#button`, `#select`…). Google crawlea `mood-ui.com` y encuentra HTML vacío —
el contenido solo existe después de que JavaScript ejecuta. Resultado: el sitio
es invisible para buscadores.

La migración a Nuxt 4 con SSG (Static Site Generation) genera HTML pre-renderizado
por cada página, haciendo que cada componente sea indexable individualmente.

---

## Arquitectura final: Monorepo pnpm workspaces

```
mood-ui/                          ← raíz del monorepo (git repo actual)
├── package.json                  ← workspace root
├── pnpm-workspace.yaml
│
├── packages/
│   └── mood-ui/                  ← librería actual (todo src/components, src/composables, etc.)
│       ├── src/
│       ├── package.json
│       ├── vite.config.ts
│       └── tsconfig.lib.json
│
└── apps/
    └── docs/                     ← Nuxt 4, importa mood-ui desde workspace:*
        ├── pages/
        ├── components/
        ├── composables/
        ├── public/
        ├── nuxt.config.ts
        └── package.json
```

**Por qué monorepo y no repo separado:**
- `apps/docs` importa `mood-ui` como `workspace:*` → cambios en la librería
  se ven en tiempo real sin publicar a npm
- Un solo `git push` despliega librería + docs en sync
- No hay riesgo de que la doc quede desfasada de la versión real

---

## Stack del nuevo `apps/docs`

| Pieza              | Paquete                    | Nota                                   |
|--------------------|----------------------------|----------------------------------------|
| Framework          | `nuxt` ^4.x                |                                        |
| CSS                | `tailwindcss` ^4           | vía `@tailwindcss/vite`                |
| i18n               | `@nuxtjs/i18n`             | reemplaza `vue-i18n` standalone        |
| Code highlighting  | `shiki`                    | ya se usa, integrar en server plugin   |
| Iconos             | `@heroicons/vue`            | sin cambios                            |
| Analytics          | `@vercel/analytics`         | módulo Nuxt o script directo           |
| SEO                | `nuxt-seo` o built-in      | `useSeoMeta`, `useHead` por página     |
| Sitemap            | `@nuxtjs/sitemap`           | auto-generado                          |
| Despliegue         | Vercel / Netlify            | con `nuxt generate` (SSG)              |

---

## Estructura de rutas (file-based routing)

Las URLs hash-based (`mood-ui.com/#button`) se convierten en rutas reales:

```
pages/
├── index.vue                         → /                 (landing page nueva)
│
├── docs/
│   ├── introduction.vue              → /docs/introduction
│   ├── installation.vue              → /docs/installation
│   ├── theming.vue                   → /docs/theming
│   ├── i18n.vue                      → /docs/i18n
│   ├── accessibility.vue             → /docs/accessibility
│   └── changelog.vue                 → /docs/changelog
│
├── forms/
│   ├── button.vue                    → /forms/button
│   ├── button-group.vue              → /forms/button-group
│   ├── input.vue                     → /forms/input
│   ├── textarea.vue                  → /forms/textarea
│   ├── select.vue                    → /forms/select
│   ├── combobox.vue                  → /forms/combobox
│   ├── multi-select.vue              → /forms/multi-select
│   ├── number-input.vue              → /forms/number-input
│   ├── password-input.vue            → /forms/password-input
│   ├── search-input.vue              → /forms/search-input
│   ├── checkbox.vue                  → /forms/checkbox
│   ├── radio.vue                     → /forms/radio
│   ├── radio-group.vue               → /forms/radio-group
│   ├── switch.vue                    → /forms/switch
│   ├── slider.vue                    → /forms/slider
│   ├── range-slider.vue              → /forms/range-slider
│   ├── tag-input.vue                 → /forms/tag-input
│   ├── color-picker.vue              → /forms/color-picker
│   ├── file-input.vue                → /forms/file-input
│   ├── avatar-upload.vue             → /forms/avatar-upload
│   ├── otp-input.vue                 → /forms/otp-input
│   ├── phone-input.vue               → /forms/phone-input
│   ├── date-field.vue                → /forms/date-field
│   ├── date-range-field.vue          → /forms/date-range-field
│   ├── date-time-field.vue           → /forms/date-time-field
│   ├── form-field.vue                → /forms/form-field
│   ├── segmented.vue                 → /forms/segmented
│   └── color-mode-switch.vue         → /forms/color-mode-switch
│
├── feedback/
│   ├── badge.vue                     → /feedback/badge
│   ├── banner.vue                    → /feedback/banner
│   ├── chip.vue                      → /feedback/chip
│   ├── toast.vue                     → /feedback/toast
│   ├── modal.vue                     → /feedback/modal
│   ├── drawer.vue                    → /feedback/drawer
│   ├── tooltip.vue                   → /feedback/tooltip
│   ├── confirm-dialog.vue            → /feedback/confirm-dialog
│   ├── loader.vue                    → /feedback/loader
│   ├── skeleton.vue                  → /feedback/skeleton
│   ├── progress-bar.vue              → /feedback/progress-bar
│   └── empty-state.vue               → /feedback/empty-state
│
├── data-display/
│   ├── typography.vue                → /data-display/typography
│   ├── avatar.vue                    → /data-display/avatar
│   ├── avatar-group.vue              → /data-display/avatar-group
│   ├── card.vue                      → /data-display/card
│   ├── table.vue                     → /data-display/table
│   ├── stat.vue                      → /data-display/stat
│   ├── timeline.vue                  → /data-display/timeline
│   ├── kbd.vue                       → /data-display/kbd
│   ├── code.vue                      → /data-display/code
│   ├── calendar.vue                  → /data-display/calendar
│   ├── scheduler.vue                 → /data-display/scheduler
│   └── ...                           → resto de data-display
│
├── layout/
│   ├── app-shell.vue                 → /layout/app-shell
│   ├── sidebar.vue                   → /layout/sidebar
│   ├── topbar.vue                    → /layout/topbar
│   └── ...
│
├── navigation/
│   ├── tabs.vue                      → /navigation/tabs
│   ├── breadcrumbs.vue               → /navigation/breadcrumbs
│   └── ...
│
└── theme-studio.vue                  → /theme-studio
```

---

## Fases de implementación

### Fase 1 — Monorepo setup (½ día)

1. Crear `pnpm-workspace.yaml` en la raíz:
   ```yaml
   packages:
     - 'packages/*'
     - 'apps/*'
   ```

2. Mover el código actual:
   - Todo `src/components/`, `src/composables/`, `src/interfaces/`, etc. → `packages/mood-ui/src/`
   - `vite.config.ts`, `tsconfig.lib.json` → `packages/mood-ui/`
   - `packages/mood-ui/package.json` = el `package.json` actual (librería)

3. Crear `apps/docs/` vacío con `nuxt init`

4. En `apps/docs/package.json`:
   ```json
   {
     "dependencies": {
       "mood-ui": "workspace:*"
     }
   }
   ```

5. Verificar que `packages/mood-ui` compila: `pnpm --filter mood-ui build`

---

### Fase 2 — Nuxt base + layout (1 día)

**`apps/docs/nuxt.config.ts`:**
```ts
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  future: { compatibilityVersion: 4 },

  nitro: {
    preset: 'static',      // SSG: nuxt generate → dist/
  },

  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@tailwindcss/nuxt',   // Tailwind v4
  ],

  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    lazy: true,
    langDir: 'i18n/',
  },

  app: {
    head: {
      titleTemplate: '%s · mood-ui',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'description', content: 'Vue 3 component library — TypeScript, Tailwind CSS, dark mode, accessible.' },
        { property: 'og:site_name', content: 'mood-ui' },
      ],
      link: [
        { rel: 'canonical', href: 'https://mood-ui.com' },
      ],
    },
  },

  sitemap: {
    hostname: 'https://mood-ui.com',
  },
})
```

**`apps/docs/app.vue`** — layout raíz con `DocsShell` (el sidebar + header actual, adaptado):
```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

**`apps/docs/layouts/default.vue`** — DocsShell migrado:
- El sidebar pasa de leer `useShowroomRouter` a usar `useRoute`/`NuxtLink`
- El header con búsqueda y selector de idioma queda igual visualmente
- `<router-view>` → `<slot />`

---

### Fase 3 — Compatibilidad SSR de mood-ui components (1 día)

Este es el paso más crítico. Muchos componentes acceden al DOM directamente
(ColorPicker, DatePicker, Modal con GSAP, etc.) y romperían en SSR.

**Estrategia:** todas las demos de componentes se envuelven en `<ClientOnly>`.
El HTML estático muestra el contenido de documentación (título, descripción,
props table) y la demo hidrata en cliente.

**En cada página de componente:**
```vue
<!-- pages/forms/button.vue -->
<template>
  <ComponentDoc ...>
    <template #overview>
      <ClientOnly>
        <ComponentPreview ...>
          <Button label="Click me" />
        </ComponentPreview>
      </ClientOnly>
    </template>
  </ComponentDoc>
</template>
```

El texto de la documentación (título, descripción, tabla de props, a11y) se renderiza
en servidor → **indexable por Google**. Las demos interactivas hidratan en cliente.

**Componentes del showroom que necesitan revisión SSR:**
- `ComponentPreview.vue` — usa `document` para copy-to-clipboard
- `CodePreview.vue` — shiki puede correr en servidor (ventaja)
- `ThemeStudioPage.vue` — manipula CSS variables, va completo en `<ClientOnly>`
- Cualquier uso de `window`, `localStorage`, `document` → extraer a `onMounted`

**shiki en servidor (ventaja de Nuxt):**
```ts
// server/plugins/shiki.ts
import { createHighlighter } from 'shiki'
// Se puede pre-cachear el highlighter en el servidor
// → highlight más rápido que en cliente
```

---

### Fase 4 — Migrar las páginas de componentes (2-3 días)

Cada `XxxPage.vue` del showroom actual se convierte en `pages/category/xxx.vue`.

El contenido de las páginas es prácticamente un copy-paste — la diferencia es:

| Antes (showroom SPA)             | Después (Nuxt page)                          |
|----------------------------------|----------------------------------------------|
| `import { useI18n }`             | igual — `@nuxtjs/i18n` es compatible         |
| `<ComponentDoc />`               | igual — componente migrado a `components/`   |
| `<ComponentPreview />`           | envuelto en `<ClientOnly>`                   |
| Sin `useSeoMeta`                 | añadir `useSeoMeta` al inicio del script     |

**Template de página migrada:**
```vue
<!-- pages/forms/button.vue -->
<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('pages.forms.button.title'),
  description: () => t('pages.forms.button.description'),
  ogTitle: () => `${t('pages.forms.button.title')} · mood-ui`,
  ogDescription: () => t('pages.forms.button.description'),
})
</script>

<template>
  <!-- Mismo template de ButtonPage.vue -->
</template>
```

**Automatizable:** con un script se puede generar el boilerplate `useSeoMeta`
para las ~80 páginas en minutos, luego ajustar descriptions a mano.

---

### Fase 5 — Redirects de URLs hash → rutas reales (½ día)

Las URLs actuales son `mood-ui.com/#button`. Con Nuxt pasan a ser
`mood-ui.com/forms/button`. Hay que redirigir para no perder el tráfico existente.

**`apps/docs/public/_redirects`** (Netlify) o **`vercel.json`**:
```json
{
  "redirects": [
    { "source": "/#button",        "destination": "/forms/button",      "permanent": true },
    { "source": "/#select",        "destination": "/forms/select",       "permanent": true },
    { "source": "/#input",         "destination": "/forms/input",        "permanent": true }
  ]
}
```

También un `app.vue` con lógica que detecta hash en la URL y redirige
en cliente para cubrir los casos que no alcanza el servidor.

---

### Fase 6 — Landing page `/` (1 día aparte, diseño)

La página `/` es nueva — no existe en el showroom actual. Es la más importante
para SEO y conversión. Debe tener:

- **Hero**: nombre, tagline con keywords ("Vue 3 component library, TypeScript, Tailwind CSS"), demo animada en vivo y botón "Get started"
- **Features**: dark mode, accessible, TypeScript-first, 60+ components, SSR-ready
- **Componentes en acción**: 3-4 ejemplos visuales inline (Button, Input, Card, Select)
- **Quick install**: `npm install mood-ui`, setup mínimo funcional
- **Stats**: número de componentes, versión npm, GitHub stars
- **Links**: Docs, GitHub, npm

---

### Fase 7 — SEO final y Google Search Console (½ día)

1. `nuxt generate` → verificar que cada URL genera HTML con contenido real
2. `curl https://mood-ui.com/forms/button | grep "<h1>"` → confirmar que el título está en el HTML
3. Dar de alta en **Google Search Console** → verificar dominio `mood-ui.com`
4. Subir `sitemap.xml` en Search Console → solicitar indexación
5. Verificar que `robots.txt` no bloquea nada: `Allow: /`
6. Añadir `<link rel="canonical">` en cada página

---

## Resumen de tiempos estimados

| Fase                                   | Tiempo estimado |
|----------------------------------------|-----------------|
| 1. Monorepo setup                      | ½ día           |
| 2. Nuxt base + layout shell            | 1 día           |
| 3. Compatibilidad SSR                  | 1 día           |
| 4. Migrar ~80 páginas de componentes   | 2-3 días        |
| 5. Redirects URLs hash → reales        | ½ día           |
| 6. Landing page (diseño + contenido)   | 1 día aparte    |
| 7. SEO final + Search Console          | ½ día           |
| **Total (sin landing)**                | **~6 días**     |

---

## Riesgos y mitigaciones

| Riesgo                                           | Mitigación                                              |
|--------------------------------------------------|---------------------------------------------------------|
| Componentes con DOM directo rompen en SSR        | `<ClientOnly>` en todas las demos — bajo riesgo real    |
| ThemeStudio con CSS vars no funciona en SSR      | Página completa en `<ClientOnly>` o `ssr: false` local  |
| GSAP en Modal genera hydration mismatch          | Animaciones solo en `onMounted`, no en `setup`          |
| Tailwind v4 en Nuxt todavía en maduración        | `@tailwindcss/nuxt` ya es estable desde Nuxt 3.11+      |
| ~80 páginas a migrar, riesgo de omitir algo      | Script de validación: comparar lista de rutas vs pages/ |

---

## Lo que NO cambia

- Los componentes de `mood-ui` (librería) no se tocan — solo el showroom
- El sistema de i18n es compatible: `vue-i18n` → `@nuxtjs/i18n` misma API
- Los archivos JSON de traducciones se copian sin cambios
- El design system, tokens, dark mode — todo igual
- El flujo de publicación a npm de la librería no cambia
