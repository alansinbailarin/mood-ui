<div align="center">

# mood-ui

**The Vue 3 component library with the best vibes.**

[![npm version](https://img.shields.io/npm/v/mood-ui?color=%236366f1&label=npm)](https://www.npmjs.com/package/mood-ui)
[![npm downloads](https://img.shields.io/npm/dw/mood-ui?color=%2322c55e&label=downloads)](https://www.npmjs.com/package/mood-ui)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-%2342b883)](https://vuejs.org)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-%2306b6d4)](https://tailwindcss.com)

**81+ accessible components** · reactive theming · dark mode · i18n (ES + EN) · built with Vue 3, TypeScript & Tailwind v4.

[**→ Live docs & playground**](https://mood-ui.com) · [npm](https://www.npmjs.com/package/mood-ui) · [Changelog](https://github.com/alansinbailarin/mood-ui/releases)

</div>

---

## Why mood-ui?

- **Reactive theming** — change color, radius, size, halo and dark/light mode at runtime. Every component reacts instantly.
- **Dark mode + surfaces** — 6 dark surface presets (navy, zinc, charcoal…) or tune all 14 semantic tokens yourself.
- **i18n built-in** — Spanish & English included. Switch globally with `useLocale().set('es')`.
- **Accessibility first** — WAI-ARIA roles, focus rings, keyboard nav and screen readers covered out of the box.
- **Tree-shakeable · TypeScript** — import only what you use. Full types, IntelliSense autocomplete, ESM + CJS.
- **Tailwind v4 native** — CSS vars, design tokens and `@theme inline`. Override from your own config, no hacks needed.

---

## Install

```bash
npm install mood-ui

# Required peer dependencies:
npm install vue@^3.4

# Optional peers (only needed for specific components):
npm install @heroicons/vue@^2   # icons in Sidebar / Topbar / DropdownMenu
npm install gsap@^3             # animations in Toast / Drawer
```

## Setup

Import the stylesheet once at your app entry:

```ts
// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import "mood-ui/style.css";

createApp(App).mount("#app");
```

Wrap your app in `<ModoProvider>` to expose all design tokens to every component:

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ModoProvider, Button, paletteFromHex } from "mood-ui";

const primary = ref("#6366f1");
</script>

<template>
  <ModoProvider
    color="primary"
    radius="medium"
    size="medium"
    :palettes="{ primary: paletteFromHex(primary) }"
  >
    <Button color="primary">Hello mood-ui</Button>
  </ModoProvider>
</template>
```

---

## Powerhouse components — free, no license required

Most UI libraries charge for these. mood-ui ships them out of the box.

### `<Table>` — AG Grid-level features, zero cost

```vue
<Table
  :data="rows"
  :columns="cols"
  virtual              <!-- renders 100k rows at constant speed -->
  tree                 <!-- hierarchical rows with lazy loading -->
  server-side          <!-- delegate sort/filter/page to your API -->
  resizable            <!-- drag column edges to resize -->
  reorderable          <!-- drag headers to reorder -->
  :multi-sort="true"   <!-- shift+click for multi-column sort -->
  v-model:state="savedState"  <!-- persist everything to localStorage/URL in one line -->
/>
```

Full feature list: sorting · multi-sort · single/multi selection · per-column filters · row expansion · client & server-side pagination · column resize & reorder · virtualization (constant render time for 100k+ rows) · tree rows with lazy `loadChildren` · row grouping · state snapshot (`v-model:state`).

---

### `<Scheduler>` — FullCalendar-level, zero cost

```vue
<Scheduler
  :resources="rooms"
  :events="bookings"
  :draggable-events="true"      <!-- drag events between time slots -->
  :resizable-events="true"      <!-- resize event duration -->
  :allow-cross-resource-drag="true"
  :business-hours="officeHours"
  :prevent-overlap="true"
  format="12h"
/>
```

Full feature list: resource rows · drag & drop events · resize events · cross-resource drag · range selection · business hours · disabled time ranges · all-day row · current time indicator · keyboard navigation · 12h/24h · readonly mode.

---

### Calendar suite — 5 views included

`Calendar` · `MonthView` · `WeekView` · `DayView` · `AgendaView` — all with locale support, min/max dates, disabled dates/weekdays, and full theming via `ModoProvider`.

---

## All components

| Category         | Components                                                                                                                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Forms**        | `Button` `ButtonGroup` `FormField` `Input` `Textarea` `PasswordInput` `NumberInput` `SearchInput` `Select` `MultiSelect` `Combobox` `Checkbox` `Radio` `RadioGroup` `Switch` `Slider` `RangeSlider` `FileInput` `DateField` `DateRangeField` `DateTimeField` |
| **Feedback**     | `Badge` `Banner` `Chip` `Drawer` `Loader` `Modal` `Skeleton` `Tooltip` `Toast` `ToastContainer` `ConfirmDialog` `EmptyState` `ProgressBar`                                                                                                                   |
| **Layout**       | `AppShell` `Canvas` `Container` `Divider` `Stack` `HStack` `VStack` `PageHeader` `PopoverPanel` `Sidebar` `SidebarRow` `Topbar`                                                                                                                              |
| **Navigation**   | `Tabs` `Breadcrumbs` `DropdownMenu` `Pagination`                                                                                                                                                                                                             |
| **Data display** | `Card` `Typography` `Avatar` `AvatarGroup` `Table` `TableColumn` `TablePagination` `Calendar` `MonthView` `WeekView` `DayView` `AgendaView` `Scheduler` `DateRangePicker` `DateTimePicker`                                                                   |

## Composables

`useModoConfig` · `useResolvedColor` · `useResolvedRadius` · `useResolvedSize` · `useResolvedTheme` · `useResolvedHalo` · `useColorMode` · `useToast` · `useConfirm` · `useModoLocale` · `useLocaleString`

---

## Contributing

mood-ui is **open source and open to contributions**. Whether it's fixing a bug, proposing a new component, improving docs or just giving feedback — every bit helps.

```bash
# 1. Fork & clone
git clone https://github.com/alansinbailarin/mood-ui.git
cd mood-ui

# 2. Install dependencies
npm install

# 3. Start the development showroom
npm run dev
```

- Check [open issues](https://github.com/alansinbailarin/mood-ui/issues) or open a new one to discuss your idea first.
- Submit changes as a Pull Request against `main`.
- Follow the existing patterns: Vue 3 + TypeScript + Tailwind v4, one component per file.

If mood-ui saves you time, a ⭐ on [GitHub](https://github.com/alansinbailarin/mood-ui) goes a long way — it helps other developers discover the library.

---

## License

MIT © [alansinbailarin](https://github.com/alansinbailarin)
