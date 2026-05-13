## Installation

```bash
npm install mood-ui
# or: pnpm add mood-ui
```

`mood-ui` is built for Vue 3 with TypeScript and Tailwind CSS v4. Import the
compiled stylesheet once in your app entry:

```ts
import "mood-ui/style.css";
```

The stylesheet ships the design tokens (CSS custom properties), the base
styles, and the utilities the components need. Tailwind is optional in your
consuming app — only required if you want to use Tailwind utilities in your
own components.

## ModoProvider

Wrap your application root with `ModoProvider` to set the global config:
default size, radius, theme tokens, locale, and (optionally) AI providers.

```vue
<script setup lang="ts">
import { ModoProvider, type ModoConfig } from "mood-ui";

const config: ModoConfig = {
  size: "medium",
  radius: "md",
  // ai providers are optional; pass functions you implement against
  // your own backend or third-party API.
  ai: {
    // avatarProvider: async ({ prompt }, signal) => "https://...",
  },
};
</script>

<template>
  <ModoProvider :config="config">
    <App />
  </ModoProvider>
</template>
```

`ModoProvider` uses Vue's `provide/inject` with typed `InjectionKey`s. Every
component reads from this context via composables such as `useResolvedSize`,
`useResolvedRadius`, and `useModoLocale`.

## Theming

`mood-ui` ships light and dark themes driven by CSS custom properties. Switch
modes with the `useColorMode` composable or the `ColorModeSwitch` component.

```ts
import { useColorMode } from "mood-ui";

const { mode, toggle } = useColorMode();
```

For custom palettes, pass `palettes` and `surfaces` into the config — see the
`palettes` and `surfaces` config helpers exported from the package.

## Philosophy

**Bring your own AI.** `mood-ui` never imports OpenAI, Anthropic, Replicate,
or any other AI SDK. Components that integrate AI (e.g. `AvatarUpload`)
accept a *provider function* you implement. Your provider is responsible for
the network call, authentication, and error handling — `mood-ui` only owns
the UI and the local state.

**No `M` prefix on components.** The package is named `mood-ui` but the
components are exported with plain names (`Button`, not `MButton`). The
package namespace is the prefix.

**Typed-first.** Every component has a corresponding interface in
`packages/mood-ui/src/interfaces/<group>/<Name>.interface.ts` consumed via
`defineProps<…>()`. All public composables export their option and return
types.

## Conventions

- Props are typed with TypeScript interfaces and `withDefaults(defineProps<…>(), {…})`.
- Locale strings come from `useModoLocale().value.<section>.<key>`; do not
  hard-code English in components.
- Use `provide/inject` with typed `InjectionKey`s for context. The exported
  keys are `MODO_CONFIG` and `MODO_LOCALE`.
