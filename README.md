# mood-ui

A complete Vue 3 + TypeScript + Tailwind v4 component library: forms, feedback,
data display (tables, calendars, scheduler), navigation and a full AppShell.
Theming, dark mode and runtime-tunable color palettes are first-class.

## Install

```bash
npm install mood-ui
# Peer dependencies your app must have:
npm install vue@^3.4 @heroicons/vue@^2 gsap@^3
```

> `@heroicons/vue` and `gsap` are listed as **optional** peers — only required
> if you use components that consume them (icons in `Sidebar`/`Topbar`/`DropdownMenu`,
> animations in `Toast`/`Drawer`).

## Setup

`mood-ui` is built with Tailwind v4. Import the compiled stylesheet
**once** at your app entry:

```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';

import 'mood-ui/style.css';

createApp(App).mount('#app');
```

Then wrap your app in `<ModoProvider>` to expose theme tokens (color, radius,
size, halo, dark mode and the primary palette) to every component:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { ModoProvider, Button, paletteFromHex } from 'mood-ui';

const primary = ref('#6366f1');
</script>

<template>
    <ModoProvider
        color="primary"
        radius="medium"
        size="medium"
        :palettes="{ primary: paletteFromHex(primary) }"
    >
        <Button color="primary">Click me</Button>
    </ModoProvider>
</template>
```

## Components

Forms · `Button`, `ButtonGroup`, `FormField`, `Input`, `Textarea`, `PasswordInput`,
`NumberInput`, `SearchInput`, `Select`, `MultiSelect`, `Combobox`, `Checkbox`,
`Radio`, `RadioGroup`, `Switch`, `Slider`, `RangeSlider`, `FileInput`,
`DateField`, `DateRangeField`, `DateTimeField`.

Feedback · `Badge`, `Banner`, `Chip`, `Drawer`, `Loader`, `Modal`, `Skeleton`,
`Tooltip`, `Toast`, `ToastContainer`, `ConfirmDialog`, `EmptyState`, `ProgressBar`.

Layout · `AppShell`, `Canvas`, `Container`, `Divider`, `Stack`, `HStack`, `VStack`,
`PageHeader`, `PopoverPanel`, `Sidebar`, `SidebarRow`, `Topbar`.

Navigation · `Tabs`, `Breadcrumbs`, `DropdownMenu`, `Pagination`.

Data display · `Card`, `Typography`, `Avatar`, `AvatarGroup`, `Table`, `TableColumn`,
`TablePagination`, `Calendar`, `MonthView`, `WeekView`, `DayView`, `AgendaView`,
`Scheduler`, `DateRangePicker`, `DateTimePicker`.

## Composables

`useModoConfig`, `useResolvedColor`, `useResolvedRadius`, `useResolvedSize`,
`useResolvedTheme`, `useResolvedHalo`, `useColorMode`, `useToast`, `useConfirm`,
`useModoLocale`, `useLocaleString`.

## License

MIT © alansinbailarin
