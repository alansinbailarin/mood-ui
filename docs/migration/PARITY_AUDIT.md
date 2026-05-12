# Audit de paridad: main vs feat/nuxt-migration

**Fecha**: 2026-05-12
**Método**: comparación legacy (`/tmp/showroom-legacy/` extraído de `main`) vs nuevo (`apps/showroom/`).

---

## Resumen ejecutivo

- 6 gaps críticos identificados, 4 ya resueltos en este audit, 2 pendientes
- 2 gaps visuales (1 resuelto)
- 3 gaps de UX

## Gaps críticos

### ✅ 1. DocToc no se renderizaba

- **Qué hace main**: `<DocToc :toc="toc" />` en `DocsShell.vue:297`, columna derecha con scroll-spy
- **Qué hacía ahora**: provide(DOC_TOC_KEY) en layout pero sin renderizar el componente → cada página registraba items que nunca se mostraban
- **Fix aplicado**: agregado `<DocToc :toc="toc" />` al final del flex container en `layouts/default.vue` con `:key="route.path"` en `<main>` para que se re-monte por página

### ✅ 2. Page transitions ausentes

- **Qué hace main**: `<Transition mode="out-in">` keyed en `activeId` envolviendo `<main>` (DocsShell:284-294)
- **Qué hacía ahora**: sin transición; al cambiar de página los hooks `onMounted` no se re-ejecutaban (afectaba TOC scroll-spy)
- **Fix aplicado**: `app.pageTransition` global en `nuxt.config.ts` + CSS `.page-enter-active`/`.page-leave-active` en `assets/docs.css`. Mismo timing (200ms ease-out) que el legacy.

### ✅ 3. ShowroomSettings: surfaces no fluían al provider

- **Qué hace main**: `baseIntensity` tinta light/dark surfaces vía `tintedLightSurfaces`/`tintedDarkSurfaces`; `darkSurface` preset elige base oscura
- **Qué hacía ahora**: el panel actualizaba `state.value.baseIntensity` y `state.value.darkSurface`, pero el `ModoProvider` en `layouts/default.vue` y `landing.vue` solo recibía radius/size/halo/palette — la sección de surfaces era visualmente inerte
- **Fix aplicado**: ambos layouts ahora derivan `lightSurfacesConfig` (tinted cuando baseIntensity > 0) y `darkSurfaceConfig` (preset + tinted opcional) y los pasan al ModoProvider

### ⚠️ 4. Mobile section switcher ausente

- **Qué hace main**: pill button en mobile (HeaderBar:214-227) que abre bottom sheet con tiles de Docs/Components/Templates/Theme Studio (HeaderBar:265-353)
- **Qué hace ahora**: solo color mode + settings; el switcher no fue migrado
- **Estado**: PENDIENTE — afecta solo mobile, no bloqueante para deploy. Migrar como `apps/showroom/components/AppMobileSectionSwitcher.vue` en una iteración futura.

### ✅ 5. Docs TOC visible (consecuencia de #1)

Las páginas `/docs/*.vue` ya registran items en el TOC vía `inject(DOC_TOC_KEY)`. Al renderizar el DocToc (fix #1), la funcionalidad se restaura automáticamente.

### ✅ 6. Composables legacy

`useShowroomRouter`, `useShowroomLocale` reemplazados por Nuxt nativos (`useRouter`, `useRoute`, `useI18n`). Las páginas que dependían del viejo `go(id)` ahora usan un stub local que acepta tanto IDs legacy como rutas Nuxt (resuelve vía `allEntries`).

---

## Gaps visuales

### ✅ 7. Transiciones del mobile drawer

El drawer del layout default ya tiene `<Transition>` para opacity + transform. Sin issue real.

### ✅ 8. Search button i18n

- **Estaba**: hardcoded `"Search…"` y `aria-label="Search (⌘K)"`
- **Fix aplicado**: ambos cambiados a `t("search.label")` en `AppSidebar.vue` y `layouts/default.vue`

---

## Gaps de UX

### ⚠️ 9. Color mode switch sin fallback visual

`<ClientOnly>` alrededor de `ColorModeSwitch` esconde el switch hasta hidratar. Sin fallback el header se ve "vacío" 100-200ms.

**Fix sugerido (no crítico)**: agregar `<template #fallback>` con un placeholder visual (botón con icono sun/moon estático).

### ✅ 10. Scroll-to-anchor en TOC (consecuencia de #1)

Restaurado al renderizar el `<DocToc>`.

### ✅ 11. Page transitions disparan onMounted

Con `pageTransition` global, cada cambio de ruta provoca un unmount/mount del `<NuxtPage>` interno → hooks se ejecutan, scroll-spy se inicializa, TOC se limpia y repuebla.

---

## Cosas NO migradas explícitamente

- **4 templates huérfanas** (`pages/templates/{Auth,Dashboard,Pricing,Settings}Page.vue`) — sin tráfico actual, no estaban en sidebar registry. Documentado en `docs/migration/page-inventory.md`.
- **`color` y `accentHex` en `useShowroomPreferences`** — el legacy las guardaba pero la UI principal (HeaderBar) no las exponía como controles editables; las usaba solo Theme Studio. Mantenido fuera de `useDocsTheme` para no inflar el state. Si en el futuro se necesitan, agregar a `DocsThemeState`.

---

## Orden de fix recomendado (ejecutado en este audit)

1. ✅ Renderizar DocToc en layout (P1)
2. ✅ Restaurar page transitions (P1)
3. ✅ Conectar surfaces (baseIntensity + darkSurface) al ModoProvider (P1)
4. ✅ Search i18n hardcoded → t() (P2)
5. ⚠️ Mobile section switcher (P2 — iteración futura)
6. ⚠️ Color mode fallback visual (P3 — polish)
