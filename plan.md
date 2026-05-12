# Plan de desarrollo y crecimiento de Mood UI

## Fase 1 — Hotfix y correcciones (Completado)

- ✅ Publicar hotfix `v0.7.1`
  - [useColorMode](src/composables/useColorMode.ts) ahora reacciona a cambios directos en `mode.value`
  - `npm publish` completado para `mood-ui@0.7.1`
  - Deploy automático de GitHub Pages removido
- ✅ SEO on-page actualizado
  - Títulos y descripciones incluyen "Vue and Nuxt component library"
  - Keywords optimizadas para búsqueda técnica

## Fase 2 — Auditoría completa de documentación del showroom

### Objetivo

Auditar todos los componentes documentados en el showroom, en el mismo orden de `src/showroom/registry.ts`, para asegurar que cada página tenga documentación completa y útil para usuarios externos.

### Criterio de aceptación por componente

Cada componente debe tener:

- **Ejemplos completos:** cada `Preview` debe tener su tab `Code` con código real y autocontenido.
- **Setup visible:** si el ejemplo usa `rows`, `cols`, `items`, `options`, `model`, `events`, etc., el code tab debe mostrar cómo se crean.
- **API completa:** props, emits, slots y tipos principales.
- **Explicación de estructuras:** describir shapes importantes (`rows`, `columns`, `items`, `options`, etc.).
- **A11y notes:** keyboard behavior, ARIA, focus management y recomendaciones.
- **i18n EN/ES:** todos los textos nuevos deben estar traducidos.
- **Build OK:** correr `npm run build` al cerrar cada bloque grande.

### Orden de auditoría según `registry.ts`

#### Forms

1. [x] Button — `src/showroom/pages/forms/ButtonPage.vue`
2. [x] ButtonGroup — `src/showroom/pages/forms/ButtonGroupPage.vue`
3. [x] FormField — `src/showroom/pages/forms/FormFieldPage.vue`
4. [x] Input — `src/showroom/pages/forms/InputPage.vue`
5. [x] Textarea — `src/showroom/pages/forms/TextareaPage.vue`
6. [x] PasswordInput — `src/showroom/pages/forms/PasswordInputPage.vue`
7. [x] NumberInput — `src/showroom/pages/forms/NumberInputPage.vue`
8. [x] SearchInput — `src/showroom/pages/forms/SearchInputPage.vue`
9. [x] Select — `src/showroom/pages/forms/SelectPage.vue`
10. [x] MultiSelect — `src/showroom/pages/forms/MultiSelectPage.vue`
11. [x] Combobox — `src/showroom/pages/forms/ComboboxPage.vue`
12. [x] Checkbox — `src/showroom/pages/forms/CheckboxPage.vue`
13. [x] Radio — `src/showroom/pages/forms/RadioPage.vue`
14. [x] Radio & RadioGroup — `src/showroom/pages/forms/RadioGroupPage.vue`
15. [x] Switch — `src/showroom/pages/forms/SwitchPage.vue`
16. [x] DateField — `src/showroom/pages/forms/DateFieldPage.vue`
17. [x] DateTimeField — `src/showroom/pages/forms/DateTimeFieldPage.vue`
18. [x] DateRangeField — `src/showroom/pages/forms/DateRangeFieldPage.vue`
19. [x] FileInput — `src/showroom/pages/forms/FileInputPage.vue`
20. [x] Slider — `src/showroom/pages/forms/SliderPage.vue`
21. [x] RangeSlider — `src/showroom/pages/forms/RangeSliderPage.vue`
22. [x] Segmented — `src/showroom/pages/forms/SegmentedPage.vue`
23. [x] Rating — `src/showroom/pages/forms/RatingPage.vue`
24. [x] ColorPicker — `src/showroom/pages/forms/ColorPickerPage.vue`
25. [x] TagInput — `src/showroom/pages/forms/TagInputPage.vue`
26. [x] ColorModeSwitch — `src/showroom/pages/forms/ColorModeSwitchPage.vue`

#### Feedback

27. [x] Badge — `src/showroom/pages/feedback/BadgePage.vue`
28. [x] Banner — `src/showroom/pages/feedback/BannerPage.vue`
29. [x] Chip — `src/showroom/pages/feedback/ChipPage.vue`
30. [x] Drawer — `src/showroom/pages/feedback/DrawerPage.vue`
31. [x] Loader — `src/showroom/pages/feedback/LoaderPage.vue`
32. [x] Modal — `src/showroom/pages/feedback/ModalPage.vue`
33. [x] Skeleton — `src/showroom/pages/feedback/SkeletonPage.vue`
34. [x] Tooltip — `src/showroom/pages/feedback/TooltipPage.vue`
35. [x] Toast — `src/showroom/pages/feedback/ToastPage.vue`
36. [x] Toast (item) — `src/showroom/pages/feedback/ToastItemPage.vue`
37. [x] ConfirmDialog — `src/showroom/pages/feedback/ConfirmDialogPage.vue`
38. [x] EmptyState — `src/showroom/pages/feedback/EmptyStatePage.vue`
39. [x] ProgressBar — `src/showroom/pages/feedback/ProgressBarPage.vue`

#### Data display

40. [x] Card — `src/showroom/pages/data-display/CardPage.vue`
41. [x] Typography — `src/showroom/pages/data-display/TypographyPage.vue`
42. [x] Avatar — `src/showroom/pages/data-display/AvatarPage.vue`
43. [x] AvatarGroup — `src/showroom/pages/data-display/AvatarGroupPage.vue`
44. [x] Accordion — `src/showroom/pages/data-display/AccordionPage.vue`
45. [x] Kbd — `src/showroom/pages/data-display/KbdPage.vue`
46. [x] Code — `src/showroom/pages/data-display/CodePage.vue`
47. [x] Stat — `src/showroom/pages/data-display/StatPage.vue`
48. [x] Timeline — `src/showroom/pages/data-display/TimelinePage.vue`
49. [x] Table — `src/showroom/pages/data-display/TablePage.vue`

- Nota: ya se inició una mejora, pero debe re-auditarse con el nuevo estándar antes de marcarse completo.

#### Calendar

50. [x] Calendar — `src/showroom/pages/data-display/CalendarPage.vue`
51. [x] MonthView — `src/showroom/pages/data-display/MonthViewPage.vue`
52. [x] WeekView — `src/showroom/pages/data-display/WeekViewPage.vue`
53. [x] DayView — `src/showroom/pages/data-display/DayViewPage.vue`
54. [x] AgendaView — `src/showroom/pages/data-display/AgendaViewPage.vue`
55. [x] Scheduler — `src/showroom/pages/data-display/SchedulerPage.vue`
56. [x] DateTimePicker — `src/showroom/pages/data-display/DateTimePickerPage.vue`
57. [x] DateRangePicker — `src/showroom/pages/data-display/DateRangePickerPage.vue`

#### Layout

58. [x] AppShell — `src/showroom/pages/layout/AppShellPage.vue`
59. [x] Canvas — `src/showroom/pages/layout/CanvasPage.vue`
60. [x] Sidebar — `src/showroom/pages/layout/SidebarPage.vue`
61. [x] Topbar — `src/showroom/pages/layout/TopbarPage.vue`
62. [x] PageHeader — `src/showroom/pages/layout/PageHeaderPage.vue`
63. [x] Container — `src/showroom/pages/layout/ContainerPage.vue`
64. [x] Divider — `src/showroom/pages/layout/DividerPage.vue`
65. [x] Stack — `src/showroom/pages/layout/StackPage.vue`
66. [x] HStack — `src/showroom/pages/layout/HStackPage.vue`
67. [x] VStack — `src/showroom/pages/layout/VStackPage.vue`
68. [x] PopoverPanel — `src/showroom/pages/layout/PopoverPanelPage.vue`

#### Navigation

69. [x] Tabs — `src/showroom/pages/navigation/TabsPage.vue`
70. [x] Breadcrumbs — `src/showroom/pages/navigation/BreadcrumbsPage.vue`
71. [x] DropdownMenu — `src/showroom/pages/navigation/DropdownMenuPage.vue`
72. [x] Pagination — `src/showroom/pages/navigation/PaginationPage.vue`
73. [x] Stepper — `src/showroom/pages/navigation/StepperPage.vue`

### Orden de ejecución propuesto (done)

1. Completar auditoría de `Button` como primer modelo real.
2. Validar contigo el formato final.
3. Aplicar el mismo patrón al resto en orden de `registry.ts`.
4. Hacer commits por bloque pequeño, por ejemplo:
   - `docs: improve forms documentation part 1`
   - `docs: improve forms documentation part 2`
   - `docs: improve feedback documentation`
   - `docs: improve data display documentation`

- **Documentar composables públicos e interfaces de componentes**

  **1. Inventario previo**
  - Composables en `src/composables/`: `useColorMode.ts`, `useToast.ts`, `useConfirm.ts`, `useLocale.ts`, `useModoConfig.ts`, `useCalendar.ts`, `useAutoScroll.ts`, `eventColors.ts`.
  - Interfaces de componentes en `src/interfaces/`: cada componente expone un `*.interface.ts` (ej. `Button.interface.ts`, `Toast.interface.ts`, `AppShell.interface.ts`).
  - Hoy ninguno de estos dos grupos tiene docs en el showroom.

  **2. Registrar nueva categoría "Composables" en el showroom**
  - Añadir entrada en `src/showroom/registry.ts` (ej. `{ name: 'Composables', path: '/composables' }`).
  - Crear `src/showroom/pages/composables/index.vue` como landing con tabla de contenidos.
  - Añadir la categoría al sidebar en `src/showroom/components/Sidebar.vue` o config de rutas.

  **3. Estructura por página de composable**
  Cada página (`useColorModePage.vue`, `useToastPage.vue`, etc.) debe tener:
  - **Import path** real (`import { useToast } from 'mood-ui'`).
  - **API tab** con: argumentos, valor de retorno (tipo + descripción), eventos/emits expuestos.
  - **Code tab** autocontenido: imports + setup + template usando el composable.
  - **Setup visible**: si devuelve un objeto, listar cada propiedad con su tipo.
  - **Casos de uso**: al menos 2 ejemplos distintos (ej. `useToast` → push simple + push con action).
  - **i18n EN/ES** para título, descripción, props, ejemplos y notas.
  - **Notas de accesibilidad**: cuando aplica (ej. `useColorMode` → respetar `prefers-color-scheme`).

  **4. Orden de composables (prioridad alta → baja)**
  1. `useColorMode` — más mencionado en issues, dependencia crítica para dark mode.
  2. `useToast` — usado en casi todos los flujos de feedback.
  3. `useConfirm` — flujo de diálogos de confirmación reutilizable.
  4. `useLocale` — configuración de idioma para consumidores.
  5. `useModoConfig` — acceso al theme provider.
  6. `useCalendar` — API de navegación de calendarios.
  7. `useAutoScroll` + `eventColors` — helpers de calendario/agenda.

  **5. Documentar interfaces de componentes**

  **5.1 Inventario real**
  - 45 archivos `*.interface.ts` en `src/interfaces/` → 155 interfaces/types exportados
  - 89 páginas en el registry (componentes + docs + composables)
  - Sólo 7 páginas tienen sección Types actualmente

  **5.2 Clasificación**

  | Tipo            | Qué son                                           | Documentación requerida                                       |
  | --------------- | ------------------------------------------------- | ------------------------------------------------------------- |
  | **Data Shape**  | Tipos que el usuario importa para tipar sus datos | Título + Descripción + Tabla 4 col + CodePreview code-only    |
  | **Props**       | Describe las props del componente                 | Título + Descripción + CodePreview con la interfaz TypeScript |
  | **Union Types** | Conjuntos de valores literales                    | Incluir dentro del bloque de la interfaz Props                |

  **5.3 Infraestructura (ya implementada)**
  - Slot `#extra` en `ComponentDoc.vue` → se renderiza entre Examples y API Reference
  - Cada página usa `<template #extra>` con `CodePreview :code="typesCode" lang="ts" code-only`
  - Para Data Shapes: tabla HTML + CodePreview
  - Para Props: solo CodePreview mostrando la interfaz TS completa

  **5.4 Inventario completo por bloque**

  Leyenda: ✅ = Hecho · ⬜ = Pendiente · 🔷 = Data Shape · 📦 = Props Interface

  ***

  **Bloque 1 — Forms (24 páginas)**

  | #   | Página           | Interfaces a documentar                                                   | Tipo  | Estado |
  | --- | ---------------- | ------------------------------------------------------------------------- | ----- | ------ |
  | 1   | Button           | `Button`                                                                  | 📦    | ✅     |
  | 2   | ButtonGroup      | `ButtonGroup`                                                             | 📦    | ✅     |
  | 3   | FormField        | `FormField`, `FormFieldSlotProps`                                         | 📦+🔷 | ✅     |
  | 4   | Input            | `Input`                                                                   | 📦    | ✅     |
  | 5   | Textarea         | `Textarea`                                                                | 📦    | ✅     |
  | 6   | PasswordInput    | `PasswordInput`, `PasswordStrengthScore`, `PasswordStrengthLabels`        | 📦+🔷 | ✅     |
  | 7   | NumberInput      | `NumberInput`                                                             | 📦    | ✅     |
  | 8   | SearchInput      | `SearchInput`                                                             | 📦    | ✅     |
  | 9   | Select           | `SelectOption`, `Select`                                                  | 🔷+📦 | ✅     |
  | 10  | MultiSelect      | reutiliza `SelectOption` (remitir a Select) + `MultiSelect`               | 📦    | ✅     |
  | 11  | Combobox         | reutiliza `SelectOption` (remitir a Select) + `Combobox`                  | 📦    | ✅     |
  | 12  | Checkbox         | `Checkbox`                                                                | 📦    | ✅     |
  | 13  | Radio/RadioGroup | `RadioOption`, `Radio`, `RadioGroup`                                      | 🔷+📦 | ✅     |
  | 14  | Switch           | `Switch`                                                                  | 📦    | ✅     |
  | 15  | DateField        | `DateDisplayFormat`, `DateField`                                          | 🔷+📦 | ✅     |
  | 16  | DateTimeField    | `DateDisplayFormat`, `TimeDisplayFormat`, `DateTimeField`                 | 🔷+📦 | ✅     |
  | 17  | DateRangeField   | `RangePreset`, `DateRangeField`                                           | 🔷+📦 | ✅     |
  | 18  | FileInput        | `FileInputFile`, `FileInputRejection`, `FileInputRejectCode`, `FileInput` | 🔷+📦 | ✅     |
  | 19  | Slider           | `Slider`                                                                  | 📦    | ✅     |
  | 20  | RangeSlider      | `RangeSlider`                                                             | 📦    | ✅     |
  | 21  | Segmented        | `SegmentedItem`, `Segmented`                                              | 🔷+📦 | ✅     |
  | 22  | Rating           | `Rating`                                                                  | 📦    | ✅     |
  | 23  | ColorPicker      | `ColorPicker`                                                             | 📦    | ✅     |
  | 24  | TagInput         | `TagInput`                                                                | 📦    | ✅     |
  | 25  | ColorModeSwitch  | sin interfaz propia                                                       | —     | —      |

  ***

  **Bloque 2 — Feedback (13 páginas)**

  | #   | Página        | Interfaces a documentar                                     | Tipo  | Estado |
  | --- | ------------- | ----------------------------------------------------------- | ----- | ------ |
  | 1   | Badge         | `Badge`                                                     | 📦    | ✅     |
  | 2   | Banner        | `Banner`                                                    | 📦    | ✅     |
  | 3   | Chip          | `Chip`, `ChipPlacement`                                     | 📦    | ✅     |
  | 4   | Drawer        | `Drawer`, `DrawerSide`, `DrawerSize`, `DrawerOverlay`       | 📦    | ✅     |
  | 5   | Loader        | `Loader`                                                    | 📦    | ✅     |
  | 6   | Modal         | `Modal`, `ModalSize`, `ModalPosition`, `ModalOverlay`       | 📦    | ✅     |
  | 7   | Skeleton      | `Skeleton`                                                  | 📦    | ✅     |
  | 8   | Tooltip       | `Tooltip`, `TooltipPlacement`, `TooltipTrigger`             | 📦    | ✅     |
  | 9   | Toast         | `ToastInput`, `ToastAction`, `ToastColor`, `ToastPlacement` | 🔷+📦 | ✅     |
  | 10  | ToastItem     | parte del sistema Toast                                     | —     | —      |
  | 11  | ConfirmDialog | `ConfirmInput`, `ConfirmColor`                              | 🔷+📦 | ✅     |
  | 12  | EmptyState    | `EmptyState`, `EmptyStateSize`, `EmptyStateVariant`         | 📦    | ✅     |
  | 13  | ProgressBar   | `ProgressBar`, `ProgressBarColor`, `ProgressBarSize`        | 📦    | ✅     |

  ***

  **Bloque 3 — Data Display (10 páginas)**

  | #   | Página      | Interfaces a documentar                                                                           | Tipo  | Estado |
  | --- | ----------- | ------------------------------------------------------------------------------------------------- | ----- | ------ |
  | 1   | Card        | `Card`                                                                                            | 📦    | ✅     |
  | 2   | Typography  | `Typography`                                                                                      | 📦    | ✅     |
  | 3   | Avatar      | `Avatar`                                                                                          | 📦    | ✅     |
  | 4   | AvatarGroup | `AvatarGroup`                                                                                     | 📦    | ✅     |
  | 5   | Accordion   | `AccordionItem`, `Accordion`                                                                      | 🔷+📦 | ✅     |
  | 6   | Kbd         | `Kbd`                                                                                             | 📦    | ✅     |
  | 7   | Code        | `Code`                                                                                            | 📦    | ✅     |
  | 8   | Stat        | `Stat`                                                                                            | 📦    | ✅     |
  | 9   | Timeline    | `TimelineItem`, `Timeline`                                                                        | 🔷+📦 | ✅     |
  | 10  | Table       | `TableColumn`, `TableSortState`, `TableFilterState`, `TablePaginationState`, `TableCellEditEvent` | 🔷+📦 | ✅     |

> **Nota:** Fix de i18n aplicado — todas las claves `pages.dataDisplay` corregidas a `pages.data-display` para alinear con la estructura de directorios. JSONs aplanados eliminando wrapper `{"pages":{"dataDisplay":{...}}}`. Type-check OK.

---

**Bloque 4 — Calendar (6 páginas)**

| #   | Página     | Interfaces a documentar                            | Tipo  | Estado |
| --- | ---------- | -------------------------------------------------- | ----- | ------ |
| 1   | Calendar   | `Calendar`                                         | 📦    | ✅     |
| 2   | MonthView  | `CalendarEvent`, `MonthView`                       | 🔷+📦 | ✅     |
| 3   | WeekView   | `DisabledTimeRange`, `BusinessHours`, `WeekView`   | 🔷+📦 | ✅     |
| 4   | DayView    | `DayView`                                          | 📦    | ✅     |
| 5   | AgendaView | `AgendaView`                                       | 📦    | ✅     |
| 6   | Scheduler  | `SchedulerResource`, `SchedulerEvent`, `Scheduler` | 🔷+📦 | ✅     |

---

**Bloque 5 — Date Picker (2 páginas)**

| #   | Página          | Interfaces a documentar                                                   | Tipo | Estado |
| --- | --------------- | ------------------------------------------------------------------------- | ---- | ------ |
| 1   | DateTimePicker  | `DateTimePicker`                                                          | 📦   | ✅     |
| 2   | DateRangePicker | `RangePreset` (ya docs en DateRangeField, referenciar), `DateRangePicker` | 📦   | ✅     |

---

**Bloque 6 — Layout (11 páginas)**

| #   | Página       | Interfaces a documentar                                                 | Tipo  | Estado |
| --- | ------------ | ----------------------------------------------------------------------- | ----- | ------ |
| 1   | AppShell     | `AppShell`                                                              | 📦    | ✅     |
| 2   | Canvas       | `Canvas`                                                                | 📦    | ✅     |
| 3   | Sidebar      | `SidebarItem`, `SidebarSection`, `Sidebar`                              | 🔷+📦 | ✅     |
| 4   | Topbar       | `Topbar`                                                                | 📦    | ✅     |
| 5   | PageHeader   | `PageHeader`                                                            | 📦    | ✅     |
| 6   | Container    | `Container`                                                             | 📦    | ✅     |
| 7   | Divider      | `Divider`, `DividerOrientation`, `DividerVariant`, `DividerEmphasis`    | 📦    | ✅     |
| 8   | Stack        | `Stack`, `StackDirection`, `StackSpacing`, `StackAlign`, `StackJustify` | 📦    | ✅     |
| 9   | HStack       | `HStack` (alias de Stack)                                               | 📦    | ✅     |
| 10  | VStack       | `VStack` (alias de Stack)                                               | 📦    | ✅     |
| 11  | PopoverPanel | sin interfaz propia                                                     | —     | —      |

---

**Bloque 7 — Navigation (5 páginas)**

| #   | Página       | Interfaces a documentar                                                              | Tipo  | Estado |
| --- | ------------ | ------------------------------------------------------------------------------------ | ----- | ------ |
| 1   | Tabs         | `TabItem`, `Tabs`                                                                    | 🔷+📦 | ✅     |
| 2   | Breadcrumbs  | `BreadcrumbItem`, `Breadcrumbs`                                                      | 🔷+📦 | ✅     |
| 3   | DropdownMenu | `DropdownMenuItem`, `DropdownMenuDivider`, `DropdownMenuHeader`, `DropdownMenuEntry` | 🔷+📦 | ✅     |
| 4   | Pagination   | `Pagination`                                                                         | 📦    | ✅     |
| 5   | Stepper      | `StepperStep`, `Stepper`                                                             | 🔷+📦 | ✅     |

---

**Bloque 7b — Utilities (1 página)**

| #   | Página      | Interfaces a documentar | Tipo  | Estado |
| --- | ----------- | ----------------------- | ----- | ------ |
| 1   | eventColors | `EventColor`            | 🔷+📦 | ✅     |

---

**Bloque 8 — Composables (7 páginas)**

| #   | Página        | Interfaces a documentar                                                         | Tipo  | Estado |
| --- | ------------- | ------------------------------------------------------------------------------- | ----- | ------ |
| 1   | useColorMode  | `ColorMode`, `UseColorModeReturn`                                               | 🔷+📦 | ✅     |
| 2   | useAutoScroll | `UseAutoScrollOptions`, `UseAutoScrollReturn`                                   | 🔷+📦 | ✅     |
| 3   | useCalendar   | `CalendarCell`, `UseCalendarReturn`                                             | 🔷+📦 | ✅     |
| 4   | useConfirm    | `ConfirmInput`, `UseConfirmReturn`                                              | 🔷+📦 | ✅     |
| 5   | useLocale     | `UseLocaleReturn`                                                               | 📦    | ✅     |
| 6   | useModoConfig | `ModoConfig`, `ModoColor`, `ModoRadius`, `ModoSize`, `ModoTheme`, `HaloVariant` | 🔷+📦 | ✅     |
| 7   | useToast      | `ToastInput`, `ToastAction`, `ToastPlacement`, `ToastColor`                     | 🔷+📦 | ✅     |

---

**5.5 Reglas**

- Cada nueva sección Types debe tener i18n EN/ES
- Correr `npx vue-tsc -p tsconfig.app.json --noEmit` al cerrar cada bloque
- No proceder al siguiente bloque sin aprobación del usuario
- Los snippets de código van siempre con `<CodePreview :code="typesCode" lang="ts" code-only />` (sin tab Preview)

**6. Verificación**

- Correr `npx vue-tsc -p tsconfig.app.json --noEmit` después de cada bloque de 2–3 composables.
- Validar que las nuevas rutas se resuelven correctamente en el router del showroom.

- **Agregar documentación de accesibilidad/WCAG**
  - Página general explicando filosofía a11y
  - Nivel objetivo: **WCAG 2.2 AA where applicable**
  - Disclaimer: no es certificación formal
  - Documentar keyboard/focus/ARIA por componente
  - Guía de testing a11y para usuarios

## Fase 3 — UX del showroom

- **Mejorar route transitions**
  - Suavizar o remover `ViewTransition`
  - Respetar `prefers-reduced-motion`
  - Desactivar en mobile si sigue siendo problemático
  - Duración más corta, sin transform/scale agresivos

- **Mejorar lectura de ejemplos**
  - Expandir ejemplos con datos reales
  - Agregar descripciones de props/estructuras
  - Links cruzados entre componentes relacionados
  - Búsqueda de ejemplos dentro de páginas

## Fase 4 — Nuevos componentes

- **PhoneInput**
  - Selector de país con búsqueda
  - Formato visual (national/international/e164)
  - Validación opcional
  - i18n para nombres/labels
  - Accesibilidad teclado/screen reader
  - Considerar usar `libphonenumber-js`

- **OTPInput**
  - Pegar código completo
  - Auto focus siguiente input
  - Backspace al anterior
  - `type="text" | "number" | "password"`
  - Separadores visuales
  - Disabled/error states
  - A11y labels

## Fase 5 — Estrategia de SEO y visibilidad

- **Long-tail keywords (realista)**
  - "Vue 3 component library with Tailwind CSS v4"
  - "Vue 3 component library with dark mode and theming"
  - "Vue 3 component library with calendar and scheduler"
  - "Accessible Vue 3 component library"
  - "TypeScript Vue 3 component library"
  - "Vue 3 table with pagination and filtering"
  - "Vue 3 calendar component with drag and drop"

- **Crear contenido de valor**
  - Blog posts en el sitio:
    - "How to build a Vue 3 app with Mood UI"
    - "Dark mode implementation in Vue 3"
    - "Building accessible forms with Vue 3"
    - "Vue 3 calendar component comparison"
  - Tutoriales en Dev.to, Medium, Hashnode
  - Ejemplos en CodeSandbox/StackBlitz
  - Vídeos de YouTube mostrando casos de uso

- **Optimizar para búsqueda técnica**
  - Responder preguntas reales en docs
  - "How to use Vue 3 calendar component"
  - "Vue 3 dark mode implementation"
  - "Vue 3 table with pagination"
  - "Vue 3 form validation with accessible components"

- **GitHub como canal de descubrimiento**
  - Optimizar README para "component library", "Vue 3", "Tailwind"
  - Aumentar stars (más visibilidad en GitHub search)
  - Actividad en issues/PRs (aparecer en trending)
  - Discussions para responder preguntas
  - Mostrar casos de uso reales

- **Integraciones y ecosistema**
  - Nuxt module
  - Starter templates
  - Integración con frameworks populares
  - Ser mencionado en listas de componentes

- **Social y comunidad**
  - Twitter/X, LinkedIn, Reddit (r/vuejs, r/vuenextjs)
  - Mostrar casos de uso reales
  - Screenshots, demos interactivos
  - Comparativas con otras librerías

## Prioridades sugeridas

1. Auditar y mejorar documentación actual (Tabla como ejemplo)
2. Crear sección de Composables (useColorMode primero)
3. Agregar docs de accesibilidad/WCAG
4. Mejorar transitions del showroom
5. Planificar PhoneInput
6. Planificar OTPInput
7. Iniciar estrategia de contenido/SEO (long-tail primero)

## Notas sobre SEO

- Competir en "Vue component library" es muy difícil (Vuetify, Element Plus, etc.)
- Enfocarse en long-tail keywords específicas
- SEO on-page es el primer paso, pero no suficiente solo
- Autoridad de dominio + backlinks toma meses/años
- Contenido de valor + comunidad es lo que realmente mueve el needle
