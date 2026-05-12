# Auditoría SSR — componentes con acceso DOM directo

**Fecha**: 2026-05-12
**Componentes auditados**: 24 + `ModoProvider.vue` + `useColorMode.ts`
**Método**: grep contextual + lectura de los call-sites top-level y guards existentes.

---

## Resumen ejecutivo

| Clasificación | Cantidad | Acción |
|---------------|----------|--------|
| 🟢 SAFE (DOM solo en handlers post-mount o con guards) | 22 | Sin cambios |
| 🟡 NEEDS FIX (hydration mismatch potencial en server) | 2 | Fix menor, <30 LOC |
| 🔴 BREAKS SSR | 0 | — |

**Veredicto**: la librería ya está bien preparada para SSR. La gran mayoría de accesos DOM viven dentro de event handlers (`pointermove`, `scroll`, `keydown`), `onMounted`/`onBeforeUnmount`, o tienen guards `typeof window !== 'undefined'`. Hay **dos casos** con potencial hydration mismatch que conviene proteger.

**Tip clave**: Vue 3 SSR ejecuta solo `setup()` en server — NO ejecuta `onMounted`, NO ejecuta event handlers, y NO ejecuta watchers de refs que recién cambian en cliente. Por eso `window.addEventListener(...)` dentro de `onMounted(...)` es SSR-safe sin guards.

---

## 🟡 NEEDS FIX (hydration mismatch potencial)

Estos dos casos NO tiran error en SSR (tienen `typeof` guards), pero generan HTML server distinto al cliente → warning de hydration mismatch.

### `src/components/forms/DateRangeField.vue:183`

```ts
const isMobileViewport = ref(typeof window !== 'undefined' ? window.innerWidth < 640 : false);
```

**Problema**: en SSR el valor inicial es `false` (asume desktop). En hidratación cliente, si el viewport real es móvil, pasa a `true` → HTML server vs cliente difieren.

**Fix sugerido**:
```ts
const isMobileViewport = ref(false);
onMounted(() => { isMobileViewport.value = window.innerWidth < 640; });
```

### `src/components/forms/SearchInput.vue:256`

```ts
const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
```

**Problema**: en SSR siempre es `false`. Si se usa para renderizar `⌘K` vs `Ctrl+K` en placeholder, el HTML server muestra `Ctrl` y cliente lo flipea → hydration warning + flash.

**Fix sugerido**:
```ts
const isMac = ref(false);
onMounted(() => { isMac.value = /Mac|iPod|iPhone|iPad/.test(navigator.platform); });
```

---

## 🟢 SAFE (sin cambios necesarios)

Todos los componentes siguientes acceden a `document`/`window` exclusivamente dentro de event handlers, hooks de ciclo de vida, o bloques con guard:

| Archivo | Línea(s) | Patrón |
|---------|----------|--------|
| `data-display/calendar/DayView.vue` | 754, 771, 920-922, 937-939 | `document.createElement` en drag start; `window.addEventListener` registrado en pointerdown handler |
| `data-display/calendar/MonthView.vue` | 567, 579 | `document.elementFromPoint` en touch handlers |
| `data-display/calendar/Scheduler.vue` | 835, 852, 1024-1026 | Idéntico a DayView |
| `data-display/calendar/WeekView.vue` | 1057, 1074, 1248-1250 | Idéntico a DayView |
| `data-display/table/Table.vue` | 204-205 | `getComputedStyle(document.documentElement)` con guard `typeof document !== 'undefined'`; `navigator.clipboard` en click handler; `window.getSelection` con guard en línea 1007 |
| `feedback/Banner.vue` | 95-96 | Top-level `const mql = typeof window !== 'undefined' && window.matchMedia(...)` — guard presente |
| `feedback/Drawer.vue` | 234, 256-257, 359-360, 368-377 | Focus trap + body lock en watch handler post-mount; `reduceMotion()` con guard `typeof window !== 'undefined'` |
| `feedback/Modal.vue` | 234, 256-257, 296, 366, 397-416 | Idéntico patrón a Drawer (mismo author, mismo guard pattern) |
| `feedback/Tooltip.vue` | 237-238, 401-424 | `window.innerWidth/Height` solo dentro de `position()` llamada desde show handler; `addEventListener` en show, removeEventListener en hide |
| `forms/ColorModeSwitch.vue` | 131-132, 136-137 | `addEventListener` en `onMounted`, `removeEventListener` en `onBeforeUnmount` |
| `forms/ColorPicker.vue` | 251-252, 260-261, 278-288 | Drag handlers (pointermove/up) registrados desde `onPointerDown` (user action) |
| `forms/Combobox.vue` | 350, 491 | `window.setTimeout` en debounced search; `document.getElementById` en async function por user input |
| `forms/MultiSelect.vue` | 424, 591, 665 | Idéntico a Combobox |
| `forms/NumberInput.vue` | 411-412 | `window.setTimeout/setInterval` en hold-to-step (mousedown handler) |
| `forms/PhoneInput.vue` | 601 | `document.getElementById` en function llamada por user action |
| `forms/RangeSlider.vue` | 311-331 | Drag handlers registrados en `onPointerDown` |
| `forms/Segmented.vue` | 126-127, 133-134 | `window.addEventListener('resize', ...)` con guard explícito + cleanup en `onBeforeUnmount` |
| `forms/Select.vue` | 343, 445, 506 | Idéntico a Combobox |
| `forms/Slider.vue` | 247-260 | Idéntico a RangeSlider |
| `forms/Textarea.vue` | 213 | `window.getComputedStyle(el)` en `adjustHeight()` invocada desde `input` event y watcher post-mount; `el` es ref que solo existe post-mount |
| `layout/AppShell.vue` | 428 | `document.body.style.overflow` en watch handler (scroll lock al abrir sidebar móvil) — watcher dispara client-side |
| `navigation/Tabs.vue` | 248-256, 314 | `window.addEventListener('resize', ...)` con guard; `document.activeElement` en keydown handler |

---

## `ModoProvider.vue` — provider raíz

**Estado**: 🟢 **SAFE**.

No accede directamente a `document`/`window`/`localStorage`. Las side effects (toggle clase `.dark` en `<html>`) están encapsuladas en `useColorMode`, que tiene guards SSR correctos.

El `watch(() => props.theme, ..., { immediate: true })` llama `setColorMode(t)` (línea 100-104): la implementación de `set` solo persiste a localStorage si `typeof window !== "undefined"` y aplica clase solo si `typeof document !== "undefined"`. OK en SSR.

---

## `useColorMode.ts` (singleton crítico)

**Estado**: 🟢 **SAFE**, ya bien protegido.

Guards presentes:
- `applyClass()`: línea 26 — `if (typeof document === "undefined") return;`
- `persistMode()`: línea 32 — `if (typeof window !== "undefined")`
- `init()`: línea 51 — `if (initialized || typeof window === "undefined") return;`
- Module-level: línea 71 — `if (typeof window !== "undefined") init();`

**Riesgo conocido (no rompe SSR, pero genera FOUC)**:
En SSR el `resolved.value` es `'light'` por default (sin acceso a localStorage). Si el usuario tiene `dark` persistido, al hidratar la clase `dark` aparece de golpe → flash claro→oscuro.

**Mitigación recomendada** (no obligatoria para SSG, pero buena UX):
- Crear `apps/showroom/plugins/color-mode-fouc.client.ts` con script inline en `<head>` que lee localStorage **antes** de la hidratación y aplica `class="dark"` síncrono en `<html>` (patrón anti-FOUC estándar de Next/Nuxt).

---

## Componentes que requieren `<ClientOnly>` en demos del showroom

**Importante**: ser SSR-safe ≠ tener sentido renderizar en server. Las demos del showroom Nuxt deben envolverse en `<ClientOnly>` cuando:
1. La interactividad solo tiene sentido client-side (drag, hover, focus trap)
2. El componente usa Vue Teleport (Modal, Drawer, Tooltip)
3. El estado inicial depende de viewport / localStorage (mismatch garantizado)
4. Manipulan CSS vars en vivo (ThemeStudio)

Esto es una **convención del showroom**, NO un requisito de la librería:

### Demos que requieren `<ClientOnly>` (~20 componentes)

| Componente | Motivo |
|------------|--------|
| `Modal`, `Drawer` | Teleport + body scroll lock + focus trap |
| `Tooltip` | Teleport + posicionamiento por viewport |
| `Calendar` views (Day/Week/Month/Agenda), `Scheduler` | Drag-drop interactivo |
| `ColorPicker` | Canvas + drag |
| `ColorModeSwitch` | Estado en localStorage |
| `Combobox`, `Select`, `MultiSelect` | Popover positioning |
| `DateField`, `DateTimeField`, `DateRangeField` | Calendar popover + viewport detection |
| `DropdownMenu` | Popover |
| `AppShell`, `Sidebar` | Mobile drawer + viewport-dependent |
| `Theme Studio` (página completa) | CSS vars + localStorage en vivo |
| `Table` con virtualización/clipboard | Solo demos interactivas; las read-only pueden ir SSR |

### Demos que pueden ir SSR (renderizan bien en server, mejor SEO)

- `Button`, `ButtonGroup`, `Badge`, `Chip`, `Card`, `Typography`
- `Avatar`, `AvatarGroup`, `Kbd`, `Code`, `Stat`, `Skeleton`, `Loader`
- `Switch`, `Checkbox`, `Radio` (sin popover)
- `Input`, `Textarea` (estado controlado; render inicial no necesita DOM)
- `EmptyState`, `ProgressBar`, `ConfirmDialog` (snapshot estático)

---

## Acciones requeridas para Fase 3

1. **2 fixes menores** en la librería:
   - `packages/mood-ui/src/components/forms/DateRangeField.vue:183` — mover initial value a `onMounted`
   - `packages/mood-ui/src/components/forms/SearchInput.vue:256` — idem para `isMac`
2. **Plugin anti-FOUC** en Nuxt: `apps/showroom/plugins/color-mode-fouc.client.ts` con script inline en `<head>` (evita flash claro→oscuro al hidratar)
3. **Convención `<ClientOnly>`** en `apps/showroom/pages/` para los ~20 componentes interactivos listados arriba — codificarla en el script de migración de páginas (Fase 4)
4. **Validación**: ejecutar `pnpm --filter showroom dev` y `pnpm --filter showroom generate`, revisar warnings de hydration mismatch en consola del navegador

**Costo estimado**: ½ día (los fixes son <30 líneas total; el resto es convención al migrar páginas en Fase 4)
