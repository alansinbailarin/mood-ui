# mood-ui — Component Roadmap

> **Stack:** Vue 3 · TypeScript · Tailwind CSS · Heroicons  
> **Patrón base:** `defineProps` + interfaces en `src/interfaces/` · composables `useResolvedRadius/Size` · clases Tailwind computadas  
> **Fecha:** 2026-05-10

---

## Prioridad estratégica

| # | Componente | Impacto | Complejidad | Categoría sugerida |
|---|-----------|---------|-------------|-------------------|
| 1 | AI Avatar Upload | MUY ALTO | Media | `forms/` |
| 2 | Masonry / Moodboard Feed | MUY ALTO | Alta | `layout/` |
| 3 | Smart Command Palette | MUY ALTO | Alta | `navigation/` |
| 4 | Story Viewer | ALTO | Media-Alta | `feedback/` |
| 5 | Smart Video Player | ALTO | Media | `data-display/` |
| 6 | AI Form Assistant | ALTO | Media-Alta | `forms/` |
| 7 | Dock | MEDIO-ALTO | Media | `navigation/` |
| 8 | Bento Grid System | MEDIO-ALTO | Baja-Media | `layout/` |
| 9 | Collaboration Presence | MEDIO-ALTO | Alta | `feedback/` |
| 10 | Reaction Picker | MEDIO | Media | `feedback/` |
| 11 | Spotlight Card | MEDIO | Baja-Media | `data-display/` |
| 12 | Kanban Board | MEDIO | Alta | `data-display/` |
| 13 | AI Empty State | MEDIO | Baja-Media | `feedback/` |

---

## Principios AI transversales

> Aplica a: **AI Avatar Upload**, **AI Form Assistant**, **AI Empty State** y el AI mode del **Command Palette**.

### Mood UI no provee ni gestiona la IA

Mood UI aporta únicamente la infraestructura de UI: estados, loading, errores, animaciones, accesibilidad y el flujo de experiencia. El developer trae su propia inteligencia artificial con sus propias API keys.

Esto implica:
- Mood UI **nunca almacena, gestiona ni expone API keys** de ningún proveedor de IA
- El developer conecta lo que quiera: OpenAI, Anthropic, Fal.ai, Replicate, HuggingFace, un backend propio, modelos locales, cualquier API
- Si no se pasa un `provider`, el componente funciona en modo degradado sin IA
- Mood UI nunca hace requests de red relacionados con IA; solo invoca la función que el developer proporciona

### Contrato del provider (convención universal)

Todos los providers de IA en Mood UI son **funciones async simples**. El componente las invoca, gestiona sus estados y maneja sus errores. El developer elige la implementación.

```ts
// Patrón base de cualquier provider AI en Mood UI
type MoodAiProvider<TInput, TOutput> = (
  input: TInput,
  signal?: AbortSignal   // para cancelación
) => Promise<TOutput>
```

### Configuración global

Todos los componentes AI soportan inyección a nivel de app vía `createMoodUI` para no repetir props en cada instancia:

```ts
createMoodUI({
  ai: {
    avatarProvider: myAvatarGenerateFn,
    formProvider: myFormAssistantFn,
    emptyStateProvider: myEmptyStateFn,
  }
})
```

Resolución de provider: `prop :provider` → `createMoodUI({ ai: {...} })` → sin IA (modo degradado).

### Flujo de generación estándar

1. Usuario interactúa (escribe prompt, sube imagen, abre estado vacío)
2. Mood UI muestra estado `loading` + anuncia a screen readers (`aria-live="polite"`)
3. Mood UI invoca el provider pasando `AbortSignal` para permitir cancelación
4. **Éxito**: UI actualizada + emit con el resultado
5. **Error**: Mood UI muestra mensaje de error accesible + emit `error`
6. **Cancelación**: Mood UI restaura estado previo + anuncio accesible

### Estándar de accesibilidad para AI components

- `aria-live="polite"` en región de status para anunciar generación, éxito y error
- `aria-busy="true"` en el componente durante loading
- El loading nunca bloquea el foco del usuario
- Siempre existe alternativa no-AI funcional (upload manual, texto manual, acción manual)
- Los errores se anuncian con `role="alert"` + mensaje descriptivo en lenguaje humano
- Botones "Generar" y "Cancelar" siempre con `aria-label` explícito
- Respetar `prefers-reduced-motion`: sin animaciones de loading si el sistema lo pide

---

## 1. AI Avatar Upload

**Archivo:** `src/components/forms/AvatarUpload.vue`  
**Interface:** `src/interfaces/forms/AvatarUpload.interface.ts`  
**Impacto:** MUY ALTO · **Complejidad:** Media

### Filosofía

Mood UI maneja toda la UI, UX, estados, previews, upload, crop y errores. El developer solo conecta su proveedor de IA. El componente **nunca importa un SDK de IA** directamente.

Mood UI abstrae:
- UI y experiencia visual
- Estados de carga, error, éxito
- Upload, crop, resize, preview
- Fallbacks automáticos

El developer conecta:
- OpenAI, Fal.ai, Replicate, HuggingFace
- Backend propio o modelos locales
- Cualquier API personalizada

### Objetivo
Resolver el problema de perfiles vacíos en onboarding. El usuario puede subir una imagen, describirla en lenguaje natural, transformar una foto real en un estilo visual, o regenerar variantes — todo desde un componente único.

### Uso mínimo

```vue
<!-- Solo upload clásico -->
<AvatarUpload v-model="avatar" />

<!-- Con generación por IA -->
<AvatarUpload
  v-model="avatar"
  ai
  :provider="generateAvatar"
/>

<!-- Con estilo predefinido -->
<AvatarUpload
  v-model="avatar"
  ai
  variant="anime"
  :provider="generateAvatar"
/>
```

### Configuración global

```ts
createMoodUI({
  ai: {
    provider: generateAvatar
  }
})
```

Cuando se define en la config global, no es necesario pasar `:provider` en cada instancia.

### Provider API

El provider es una función simple. Mood UI la llama; el developer la implementa:

```ts
type AvatarProvider = (options: {
  prompt?: string    // descripción de texto del usuario
  image?: File       // imagen base para transformar (image-to-image)
  variant?: string   // estilo visual elegido
}) => Promise<string>  // retorna URL o base64
```

Ejemplos de implementación:

```ts
// Con fal.ai
const generateAvatar: AvatarProvider = async ({ prompt, image, variant }) => {
  const result = await fal.run('fal-ai/flux', { input: { prompt } })
  return result.images[0].url
}

// Con backend propio
const generateAvatar: AvatarProvider = async (options) => {
  const { url } = await $fetch('/api/avatar/generate', { method: 'POST', body: options })
  return url
}
```

### Arquitectura

```
AvatarUpload (orquestador principal)
├── AvatarPreview.vue          — preview circular + estado vacío + fallback
├── AvatarDropzone.vue         — zona drag & drop y file picker
├── AvatarCropper.vue          — crop interactivo con Canvas 2D (modal)
├── AvatarPrompt.vue           — input de prompt + selector de variante
├── AvatarActions.vue          — botones: subir, generar, regenerar, eliminar
└── composables/
    ├── useAvatarUpload.ts      — FileReader, validación, resize, emit
    ├── useAvatarCrop.ts        — lógica Canvas: drag, zoom, recorte circular
    └── useAvatarProvider.ts    — invoke del provider, loading, cancelación, caché
```

### Props / Interface

```ts
type AvatarVariant =
  | 'default'
  | 'illustration'
  | 'anime'
  | 'cartoon'
  | 'minimal'
  | 'cyberpunk'
  | 'sketch'
  | 'pixel'
  | '3d'
  | 'retro'

interface AvatarSavePayload {
  blob: Blob                              // imagen final lista para subir
  url: string                             // URL/base64 temporal (pre-guardado)
  source: 'upload' | 'generated' | 'transformed'
  mimeType: string                        // 'image/webp'
  size: number                            // bytes
}

interface AvatarUpload {
  modelValue?: string                     // URL o base64 actual del avatar
  ai?: boolean                            // activar modo IA (prompt + generación)
  provider?: AvatarProvider               // función de generación (o inyectada globalmente)
  variant?: AvatarVariant                 // estilo visual para la generación
  size?: 'small' | 'medium' | 'large'
  radius?: ModoRadius
  disabled?: boolean
  readonly?: boolean
  crop?: boolean                          // activar cropper al subir imagen, default true
  maxSize?: number                        // bytes, default 5MB
  accept?: string[]                       // default ['image/png','image/jpeg','image/webp']
  fallback?: string                       // URL de fallback si no hay avatar
  name?: string                           // nombre del usuario para fallback de iniciales
  regenerate?: boolean                    // mostrar botón regenerar, default true si ai=true
  preview?: boolean                       // mostrar preview en tiempo real, default true
  promptPlaceholder?: string
  // Flujo de guardado
  saveMode?: 'auto' | 'manual' | 'none'  // default: 'manual' si hay provider, 'none' si no
  onSave?: (payload: AvatarSavePayload) => Promise<string>  // retorna URL final (CDN, backend, etc.)
}
```

### Emits

```ts
'update:modelValue'  (value: string)              // nueva URL/base64
'generated'          (url: string)                // generación IA exitosa
'uploaded'           (file: File)                 // archivo subido por el usuario
'error'              (err: Error)                 // cualquier error (generación, upload, save)
'loading'            (state: boolean)             // inicio/fin de carga (generación o guardado)
'change'             (value: string | null)       // cualquier cambio (upload o generación)
'remove'             ()                           // avatar eliminado
'save'               (payload: AvatarSavePayload) // usuario presionó Guardar — developer hace el upload
'saved'              (finalUrl: string)           // onSave completó — URL final del backend/CDN
'save-error'         (err: Error)                 // onSave falló
```

### Slots

| Slot | Scope | Descripción |
|------|-------|-------------|
| `default` | — | Reemplaza el área central del dropzone |
| `preview` | `{ url, fallback, loading }` | Override del preview circular |
| `actions` | `{ generate, upload, remove, save, loading, hasPendingImage }` | Botones de acción custom |
| `prompt-prefix` | — | Icono o texto antes del input de prompt |
| `empty` | — | Estado cuando no hay avatar |
| `save-button` | `{ save, loading, hasPendingImage }` | Override del botón Guardar |

### Features por implementar

1. **Upload & Drop zone** — `dragover`/`drop` + `<input type="file">` oculto. `FileReader` para preview inmediato. Validación de tipo y tamaño con emit `error`. Resize automático a 512×512 antes de emitir.

2. **Crop interactivo** — Modal con Canvas 2D. Drag para reposicionar, rueda/pinch para zoom, máscara circular. Al confirmar, exportar `Blob` como `image/webp` quality 0.85 y emitir `update:modelValue`.

3. **Generación por prompt (text-to-image)** — Input de descripción visible solo si `ai=true` y existe provider. Al enviar, llamar provider con `{ prompt, variant }`. Estado `loading`, botón de cancelación via `AbortController`. Emit `generated` al éxito.

4. **Transformación por imagen (image-to-image)** — Si el usuario sube una imagen con `ai=true`, el componente ofrece transformarla al `variant` activo. Llama provider con `{ image: File, variant }`. Permite comparar original vs. resultado.

5. **Regenerar variantes** — Botón shuffle que re-llama el provider con el mismo prompt/imagen + timestamp para obtener resultado distinto. Visible si `regenerate=true`.

6. **Fallbacks inteligentes** — Sin provider ni imagen: mostrar initials (si se puede inferir del contexto del formulario), gradiente automático basado en hash del fallback seed, o DiceBear via URL construida sin dependencia directa.

7. **Caché de sesión** — `sessionStorage` keyed por hash de `{ prompt, variant }`. Evita re-generaciones idénticas en la misma sesión.

8. **Variantes visuales** — El `variant` se pasa al provider. El componente muestra un selector de chips si `ai=true`. El developer decide qué hace el provider con el valor.

9. **SSR safe** — Canvas, FileReader y `sessionStorage` solo en `onMounted`. Sin referencias a `window` en setup.

10. **Métodos públicos** — `defineExpose({ reset, generate, clear })` para control programático.

### Flujo de guardado

El componente distingue dos momentos: **imagen pendiente** (generada/cargada pero aún no persistida en el backend) e **imagen guardada** (URL final del servidor/CDN).

```
Usuario genera/sube imagen
        ↓
  preview temporal (blob/base64)
        ↓
  [saveMode = 'manual']     [saveMode = 'auto']
  Botón "Guardar" visible   → llama onSave inmediatamente
        ↓                            ↓
  Usuario click "Guardar"   onSave(payload) en ejecución
        ↓                            ↓
  emit 'save'(payload)      loading state (aria-busy)
  + llama onSave(payload)            ↓
        ↓                   emit 'saved'(finalUrl)
  loading state                      ↓
        ↓                   update:modelValue(finalUrl)
  emit 'saved'(finalUrl)
        ↓
  update:modelValue(finalUrl)
```

Ejemplos de implementación del `onSave`:

```ts
// Subir a S3 / Cloudinary desde el frontend
const handleSave = async ({ blob }: AvatarSavePayload): Promise<string> => {
  const form = new FormData()
  form.append('file', blob, 'avatar.webp')
  const { url } = await $fetch('/api/upload', { method: 'POST', body: form })
  return url
}

// Subir a backend propio en Nuxt
const handleSave = async ({ blob }: AvatarSavePayload): Promise<string> => {
  const form = new FormData()
  form.append('avatar', blob)
  const { data } = await useFetch('/api/user/avatar', { method: 'PUT', body: form })
  return data.value.avatarUrl
}
```

Si `onSave` no se provee, el emit `save` se dispara igual — el developer puede manejarlo en el padre y llamar `componentRef.value.markAsSaved(url)` cuando su upload complete.

### Accesibilidad

**Dropzone:**
- `role="button"` + `tabindex="0"` en el área de drop
- `aria-label="Subir avatar. Arrastra una imagen o presiona Enter para seleccionar"`
- `aria-disabled` cuando `disabled=true`
- Activación con `Enter`/`Space`

**Preview:**
- `<img>` con `alt` dinámico: `"Avatar de {name}"`, `"Avatar generado"`, o `"Sin avatar"`
- Fallback de iniciales/gradiente: `role="img"` + `aria-label="Iniciales {initials}"`

**Región de anuncios AI:**
- `aria-live="polite" aria-atomic="true"` anuncia:
  - `"Generando avatar..."` al iniciar
  - `"Avatar generado exitosamente"` al completar
  - `"Error al generar: {message}"` en error

**Controles de generación:**
- Botón Generar: `aria-label="Generar avatar con IA"`, `aria-busy="true"` durante loading
- Botón Cancelar: visible solo durante loading, `aria-label="Cancelar generación"`
- Botón Regenerar: `aria-label="Generar otra variante del avatar"`

**Selector de variantes:**
- `role="radiogroup"` + `aria-label="Estilo visual del avatar"`
- Cada chip: `role="radio"` + `aria-checked`
- Navegación: `←→` entre opciones, `Enter`/`Space` para seleccionar

**Crop modal:**
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby="crop-title"`
- Focus trap: primer control al abrir, regresa al trigger al cerrar
- `Escape` cancela y cierra
- `Ctrl+Z` deshace el último movimiento del crop

**Guardar:**
- Botón Guardar: `aria-label="Guardar avatar"`, `aria-busy` durante el save
- Estado pendiente (imagen generada sin guardar): badge visual + `aria-describedby` con `"Imagen sin guardar"`
- Al completar: `aria-live` anuncia `"Avatar guardado correctamente"`
- `prefers-reduced-motion`: sin animaciones de transición ni esqueletos animados

### Consideraciones técnicas
- El componente es un orquestador de UI pura. Nunca hace `fetch` ni importa SDKs de IA.
- El provider recibe `AbortSignal` para soportar cancelación en providers que lo aceptan.
- `useAvatarProvider` resuelve: prop `:provider` → config global → sin IA (modo upload clásico).
- El cropper usa solo Canvas 2D nativo. Sin librerías externas.
- `hasPendingImage` es un estado interno que indica que hay imagen generada/cargada sin persistir.

### Clases Tailwind base
```
modo-avatar-upload relative inline-flex flex-col items-center gap-4
modo-avatar-dropzone relative flex items-center justify-center cursor-pointer
  border-2 border-dashed border-border rounded-full transition-colors
  hover:border-primary/60 hover:bg-muted/40
  data-[dragging]:border-primary data-[dragging]:bg-primary/5
modo-avatar-preview relative overflow-hidden rounded-full bg-muted shrink-0
modo-avatar-actions flex items-center gap-2 flex-wrap justify-center
modo-avatar-prompt w-full flex gap-2 items-center
  border border-border rounded-lg px-3 py-2 bg-background
  focus-within:ring-2 focus-within:ring-ring
modo-avatar-variant-chip px-2.5 py-1 rounded-full text-xs border border-border
  cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent
  data-[active]:bg-primary/10 data-[active]:border-primary/50 data-[active]:text-primary
```

---

## 2. Masonry / Moodboard Feed

**Archivo:** `src/components/layout/MasonryFeed.vue`  
**Interface:** `src/interfaces/layout/MasonryFeed.interface.ts`  
**Impacto:** MUY ALTO · **Complejidad:** Alta

### Objetivo
Layouts tipo Pinterest/Are.na/Dribbble con alturas dinámicas, virtualización y scroll infinito.

### Arquitectura

```
MasonryFeed (contenedor grid)
├── MasonryItem.vue            — wrapper de item con slot
└── composables/
    ├── useMasonryLayout.ts    — cálculo de columnas y posicionamiento
    ├── useMasonryVirtualizer.ts — ventana virtual de items visibles
    └── useMasonryInfiniteScroll.ts — IntersectionObserver para load more
```

### Props / Interface

```ts
interface MasonryFeed<T = unknown> {
  items: T[]
  columns?: number | { sm: number; md: number; lg: number; xl: number }
  gap?: 'none' | 'small' | 'medium' | 'large'
  virtualizeThreshold?: number    // activar virtual si items > N, default 50
  loading?: boolean
  hasMore?: boolean
  skeletonCount?: number          // cuántos skeletons mostrar mientras carga
  transitionDuration?: number     // ms, default 300
  observerRootMargin?: string     // para IntersectionObserver, default '200px'
}
```

### Emits
- `load-more` — cuando se llega al final y `hasMore` es true
- `item-visible(index: number)` — cuando un item entra al viewport

### Slots
- `item({ item, index })` — contenido de cada tarjeta
- `skeleton` — item de carga (si no, usa Skeleton interno)
- `empty` — estado vacío (integra con EmptyState existente)
- `footer` — zona tras el último item

### Features por implementar

1. **Layout multi-columna** — CSS columns + break-inside:avoid como base. Para virtualización, cambiar a CSS Grid con `grid-template-rows`.
2. **Columnas responsivas** — ResizeObserver en el contenedor para recalcular sin romper SSR.
3. **Auto-height items** — Cada item mide su altura con `ResizeObserver` y actualiza el store interno del layout.
4. **Virtualización** — Renderizar solo items en viewport ± `observerRootMargin`. Calcular offsets acumulados.
5. **Infinite scroll** — `IntersectionObserver` en un sentinel div al final. Emit `load-more`.
6. **Transiciones suaves** — `v-move` de `<TransitionGroup>` para reordenamientos. CSS `translate` (no `top/left`) para GPU.
7. **Media support** — `<img>` con `aspect-ratio` calculado + lazy loading nativo. Videos con poster.
8. **SSR** — Primer render con columnas calculadas via CSS puro; JS toma el control en `onMounted`.

### Consideraciones técnicas
- Evitar `position: absolute` para el layout base; usar CSS Columns para compatibilidad SSR.
- `ResizeObserver` desconectado en `onUnmounted`.
- Emitir `load-more` con debounce de 100ms para evitar múltiples llamadas.
- Tipado genérico `<T>` en los items para type-safety en el slot.

### Clases Tailwind base
```
modo-masonry-feed w-full
modo-masonry-columns columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4
modo-masonry-item break-inside-avoid mb-4 transition-all duration-300
```

---

## 3. Smart Command Palette

**Archivo:** `src/components/navigation/CommandPalette.vue`  
**Interface:** `src/interfaces/navigation/CommandPalette.interface.ts`  
**Impacto:** MUY ALTO · **Complejidad:** Alta

### Objetivo
Búsqueda y acciones globales tipo Linear/Vercel con soporte de fuzzy search, grupos, AI mode y atajo de teclado.

### Arquitectura

```
CommandPalette (modal/overlay global)
├── CommandPaletteInput.vue        — input de búsqueda con icono AI
├── CommandPaletteGroup.vue        — sección agrupada con label
├── CommandPaletteItem.vue         — item de acción con shortcut
├── CommandPaletteEmpty.vue        — estado sin resultados
└── composables/
    ├── useCommandPalette.ts       — estado global (open/close), provide/inject
    ├── useFuzzySearch.ts          — algoritmo fuse.js-like puro
    └── useCommandProvider.ts      — abstracción de proveedor async/AI
```

### Props / Interface

```ts
interface CommandPaletteAction {
  id: string
  label: string
  description?: string
  group?: string
  icon?: Component
  shortcut?: string[]             // ej. ['⌘', 'K']
  keywords?: string[]
  onSelect: () => void | Promise<void>
}

interface CommandPaletteGroup {
  id: string
  label: string
  actions: CommandPaletteAction[]
}

interface CommandPalette {
  actions?: CommandPaletteAction[]
  groups?: CommandPaletteGroup[]
  placeholder?: string
  shortcut?: string[]             // default ['Meta', 'k']
  aiProvider?: CommandAiProvider
  maxResults?: number             // default 8 por grupo
  debounceMs?: number             // default 150
  closeOnSelect?: boolean         // default true
}

// El developer implementa este provider con su propia IA y API key
// Mood UI nunca provee ni gestiona la inteligencia artificial
interface CommandAiProvider {
  search: (
    input: { query: string },
    signal?: AbortSignal
  ) => Promise<CommandPaletteAction[]>
  label?: string
  triggerPrefix?: string          // ej. '>' para activar AI mode
}
```

### Emits
- `open`
- `close`
- `select(action: CommandPaletteAction)`
- `search(query: string)`

### Composable público: `useCommandPalette()`
```ts
const { open, close, toggle, isOpen, register } = useCommandPalette()
// register() permite agregar acciones dinámicamente desde cualquier componente
```

### Features por implementar

1. **Shortcut global** — `keydown` en `document` en `onMounted`, cleanup en `onUnmounted`. Default `Cmd/Ctrl+K`.
2. **Fuzzy search** — Implementación propia: score basado en distancia de edición + bonus de caracteres consecutivos. Sin dependencias externas.
3. **Grupos** — Agrupar acciones con `group` label. Orden de grupos configurable. Ocultar grupos sin resultados.
4. **Navegación por teclado** — `↑↓` mueven selección entre items visibles (skippeando headers). `Enter` ejecuta. `Escape` cierra.
5. **AI mode** — Si query empieza con el `triggerPrefix` (ej. `>`), llamar `aiProvider.search()`. Mostrar indicador de loading. Resultados AI mezclados con resultados locales o en sección separada.
6. **Async providers** — Debounce configurable. Cancelar requests previos con `AbortController`.
7. **Virtualización** — Si items > 50, usar ventana virtual en la lista (altura fija por item).
8. **Accesibilidad** — `role="combobox"`, `aria-expanded`, `aria-activedescendant`, `aria-label`.
9. **Animación** — `<Transition>` con fade + scale desde el centro. Backdrop blur.

### Consideraciones técnicas
- `provide/inject` para el estado global, no Pinia (la librería no debe tener dependencia de store).
- El modal se teleporta a `<body>` con `<Teleport>`.
- Focus trap dentro del modal mientras está abierto.
- Soporte para registro dinámico de acciones desde child components.

### Clases Tailwind base
```
modo-command-palette fixed inset-0 z-50 flex items-start justify-center pt-[15vh]
  bg-background/80 backdrop-blur-sm
modo-command-dialog w-full max-w-xl bg-popover border border-border rounded-xl shadow-2xl
  overflow-hidden
modo-command-input w-full bg-transparent px-4 py-3 text-sm outline-none border-b border-border
modo-command-item flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-sm
  hover:bg-accent data-[selected]:bg-accent
```

---

## 4. Story Viewer

**Archivo:** `src/components/feedback/StoryViewer.vue`  
**Interface:** `src/interfaces/feedback/StoryViewer.interface.ts`  
**Impacto:** ALTO · **Complejidad:** Media-Alta

### Objetivo
Experiencia inmersiva tipo Instagram/TikTok stories con soporte de imagen, video, gestos touch y accesibilidad.

### Arquitectura

```
StoryViewer (contenedor principal)
├── StoryProgressBar.vue      — barras de progreso animadas
├── StoryMedia.vue             — renderiza imagen o video
├── StoryHeader.vue            — avatar + nombre + tiempo
├── StoryActions.vue           — reply, like, share
└── composables/
    ├── useStoryPlayer.ts      — lógica de autoplay, pausa, navegación
    └── useStoryGestures.ts    — touch events: swipe left/right, hold
```

### Props / Interface

```ts
interface Story {
  id: string
  type: 'image' | 'video'
  src: string
  poster?: string           // para video
  duration?: number         // ms, default 5000 para imágenes
  user?: { name: string; avatar?: string }
  timestamp?: Date | string
  content?: string          // texto overlay
}

interface StoryViewer {
  stories: Story[]
  initialIndex?: number     // default 0
  loop?: boolean            // default false
  autoplay?: boolean        // default true
  showHeader?: boolean      // default true
  showActions?: boolean     // default true
  fullscreen?: boolean      // default true (ocupa todo el viewport)
  swipeThreshold?: number   // px mínimos para swipe, default 50
}
```

### Emits
- `change(index: number, story: Story)`
- `complete` — cuando termina la última story
- `close`
- `reply(story: Story, text: string)`

### Slots
- `header({ story, index })` — reemplaza header por defecto
- `actions({ story, index })` — botones de acción custom
- `overlay({ story, index })` — contenido sobre la media

### Features por implementar

1. **Progress bars** — Una barra por story. Animación CSS `width: 0% → 100%` con `transition-duration` = duración de la story. Pausa con `animation-play-state: paused`.
2. **Navegación** — Click en mitad izquierda = anterior, derecha = siguiente. Swipe horizontal en mobile.
3. **Pausa on hold** — `pointerdown`/`pointerup` pausa/reanuda. Útil para leer texto largo.
4. **Video support** — `<video>` con `muted autoplay playsinline`. Duración tomada de `video.duration` si no se provee. Sincronizar progress bar con `timeupdate`.
5. **Preloading** — Precargar la siguiente story (img: `new Image()`, video: `preload="metadata"`).
6. **Gestos swipe** — `touchstart`/`touchmove`/`touchend` con delta X. Threshold configurable.
7. **Accesibilidad** — `role="dialog"`, `aria-label`, controles visibles con teclado (`←→` para navegar, `Space` para pausar).
8. **Animación entre stories** — Slide horizontal con `<Transition>` de `translateX`.

### Consideraciones técnicas
- El viewer se monta en `<Teleport to="body">` para full-viewport.
- `requestAnimationFrame` para el progreso de video (evitar jank con `setInterval`).
- Limpiar timers en `onUnmounted` y en cada cambio de story.
- En iOS, autoplay de video requiere `muted` + `playsinline`.

### Clases Tailwind base
```
modo-story-viewer fixed inset-0 z-50 bg-black flex items-center justify-center
modo-story-container relative w-full h-full max-w-sm mx-auto
modo-story-progress absolute top-0 left-0 right-0 flex gap-1 p-2 z-10
modo-story-bar h-0.5 flex-1 bg-white/30 overflow-hidden rounded-full
modo-story-bar-fill h-full bg-white
```

---

## 5. Smart Video Player

**Archivo:** `src/components/data-display/VideoPlayer.vue`  
**Interface:** `src/interfaces/data-display/VideoPlayer.interface.ts`  
**Impacto:** ALTO · **Complejidad:** Media

### Objetivo
Video player moderno para feeds y apps sociales con hover preview, autoplay lazy, calidad adaptativa y modo Reels.

### Arquitectura

```
VideoPlayer (contenedor)
├── VideoControls.vue         — play/pause, volumen, fullscreen, progress
├── VideoHoverPreview.vue     — thumbnail scrubber al hover en progress bar
├── VideoReelsMode.vue        — UI vertical tipo TikTok/Reels
└── composables/
    └── useVideoPlayer.ts     — estado, intersectionObserver, quality
```

### Props / Interface

```ts
interface VideoSource {
  src: string
  quality?: '360p' | '480p' | '720p' | '1080p' | 'auto'
  type?: string               // 'video/mp4' etc.
}

interface VideoPlayer {
  src: string | VideoSource[]
  poster?: string
  autoplay?: boolean          // default false; se activa al entrar viewport
  muted?: boolean             // default true para autoplay
  loop?: boolean
  controls?: boolean          // default true
  reelsMode?: boolean         // UI vertical compacta
  hoverPreview?: boolean      // preview al hover en timeline
  previewSprites?: string     // URL de sprite sheet para previews
  lazyThreshold?: string      // IntersectionObserver rootMargin, default '0px'
  aspectRatio?: '16/9' | '9/16' | '1/1' | '4/3'
  maxWidth?: string
  radius?: ModoRadius
}
```

### Emits
- `play`
- `pause`
- `ended`
- `timeupdate(time: number, duration: number)`
- `quality-change(quality: string)`
- `error(err: MediaError)`

### Features por implementar

1. **Lazy autoplay** — `IntersectionObserver`: play cuando >50% visible, pause al salir.
2. **Hover preview** — Al hover sobre el progress bar, mostrar frame del segundo correspondiente. Usar sprites o canvas snapshot.
3. **Adaptive quality** — Si `src` es array de `VideoSource`, seleccionar calidad según `navigator.connection.effectiveType` o `downlink`.
4. **Reels mode** — Controles mínimos superpuestos, aspect 9:16, swipe vertical para cambiar video (emit `swipe-up`/`swipe-down`).
5. **Controls accesibles** — Teclado: `Space` play/pause, `←→` ±5s, `↑↓` volumen, `F` fullscreen, `M` mute.
6. **Bandwidth optimization** — `preload="none"` por defecto; cargar metadatos solo al entrar viewport.
7. **Buffer indicator** — Mostrar spinner cuando `video.readyState < 3`.

### Clases Tailwind base
```
modo-video-player relative overflow-hidden bg-black group
modo-video-controls absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t
  from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity
modo-video-progress w-full h-1 bg-white/30 rounded-full cursor-pointer
  hover:h-1.5 transition-all
```

---

## 6. AI Form Assistant

**Archivo:** `src/components/forms/AiFormAssistant.vue`  
**Interface:** `src/interfaces/forms/AiFormAssistant.interface.ts`  
**Impacto:** ALTO · **Complejidad:** Media-Alta

> Ver [Principios AI transversales](#principios-ai-transversales). El developer provee el `provider` con su propia API key. Mood UI no incluye ni gestiona ningún proveedor de IA.

### Objetivo
Asistente inteligente inline para formularios: sugerencias, autocompletado, validación con lenguaje natural y correcciones. Sin IA conectada, funciona como campo normal.

### Arquitectura

```
AiFormAssistant (wrapper de campo)
├── AiSuggestionDropdown.vue  — lista flotante de sugerencias (patrón combobox)
├── AiCorrectionTooltip.vue   — corrección inline sobre el texto
├── AiFieldDescription.vue    — descripción generada por IA del campo
├── AiStatusRegion.vue        — aria-live region para anuncios de screen reader
└── composables/
    ├── useAiFormProvider.ts  — abstracción del proveedor, AbortController
    └── useAiDebounce.ts      — debounce con cancelación automática
```

### Provider API

```ts
// El developer implementa esta interfaz con su propia IA
interface AiFormProvider {
  suggest: (
    input: { field: string; value: string; context?: Record<string, string> },
    signal?: AbortSignal
  ) => Promise<string[]>

  validate?: (
    input: { field: string; value: string },
    signal?: AbortSignal
  ) => Promise<{ valid: boolean; message?: string }>

  describe?: (
    input: { field: string; context?: string },
    signal?: AbortSignal
  ) => Promise<string>

  correct?: (
    input: { field: string; value: string },
    signal?: AbortSignal
  ) => Promise<string>
}
```

### Props / Interface

```ts
interface AiFormAssistant {
  fieldName: string
  fieldLabel?: string
  currentValue?: string
  formContext?: Record<string, string>   // otros campos del form para contexto
  provider?: AiFormProvider              // o inyectado vía createMoodUI
  debounceMs?: number                    // default 400
  maxSuggestions?: number                // default 5
  showInlineCorrection?: boolean         // default true
  showDescription?: boolean              // default false
  triggerOn?: 'input' | 'focus' | 'manual'
  disabled?: boolean
}
```

### Emits

```ts
'suggest'   (suggestions: string[])
'select'    (suggestion: string)
'correct'   (correction: string)
'describe'  (description: string)
'validate'  (result: { valid: boolean; message?: string })
'error'     (err: Error)              // error del provider AI
'loading'   (state: boolean)
```

### Slots
- `default` — el campo de formulario (Input, Textarea, Select de modo-ui)
- `suggestion-item({ suggestion, select, index })` — item custom en el dropdown
- `loading-indicator` — override del spinner de loading
- `description({ description, loading })` — panel de descripción AI custom

### Features por implementar

1. **Sugerencias tipo autocomplete** — Dropdown flotante bajo el campo. Navegación con `↑↓↩`. Llama `provider.suggest()` con debounce y cancela el request previo.
2. **Corrección inline** — Subrayado ondulado en texto con problema. Tooltip con corrección y botón "Aplicar". Emit `correct` al aplicar.
3. **Descripción AI del campo** — Ícono de info que al hover/focus muestra descripción generada. Llama API una sola vez (cached por `fieldName`).
4. **Validación con mensaje natural** — Si `provider.validate` existe, mostrar mensaje de error/éxito en lenguaje natural bajo el campo al blur.
5. **Cancelación de requests** — `AbortController` por request. Nuevo input cancela el anterior automáticamente.
6. **Integración con FormField** — Compatible con el `FormField.vue` existente vía slot.
7. **Degradación sin IA** — Si no hay `provider`, el componente es transparente: renderiza el slot `default` sin overhead.

### Accesibilidad

El componente sigue el patrón **ARIA Combobox** (APG 3.1.2) para las sugerencias.

**Input con sugerencias:**
- `role="combobox"` en el input wrapper
- `aria-expanded` refleja si el listbox está abierto
- `aria-autocomplete="list"`
- `aria-controls` apunta al `id` del listbox
- `aria-activedescendant` apunta al item activo en el listbox

**Dropdown:**
- `role="listbox"` + `aria-label="Sugerencias para {fieldLabel}"`
- Cada sugerencia: `role="option"` + `aria-selected`
- Ítem de loading: `role="option" aria-disabled="true" aria-label="Cargando sugerencias"`

**Teclado:**
- `↓` en el input: abre listbox y mueve foco al primer item
- `↑↓`: navegan entre sugerencias (sin salir del input, via `aria-activedescendant`)
- `Enter`: selecciona la sugerencia activa
- `Escape`: cierra el listbox sin seleccionar
- `Tab`: cierra el listbox y mueve foco al siguiente campo

**Anuncios de estado:**
- `aria-live="polite"` anuncia: `"Cargando sugerencias..."`, `"3 sugerencias disponibles"`, `"Sin sugerencias"`
- Error del provider: `role="alert"` con mensaje descriptivo
- Corrección aplicada: `aria-live="polite"` anuncia `"Corrección aplicada"`

**Tooltip de corrección:**
- Accesible vía teclado: al recibir foco el campo con error, anunciar la corrección disponible
- Botón "Aplicar corrección": `aria-label="Aplicar corrección: {corrección sugerida}"`

### Consideraciones técnicas
- El dropdown usa `position: fixed` + coordenadas del campo para no verse afectado por `overflow: hidden` padres.
- El foco permanece en el input durante la navegación por sugerencias (modelo `aria-activedescendant`, no foco real en el listbox).
- `provide/inject` para pasar el `provider` desde un `AiFormAssistantProvider` wrapper a nivel de formulario completo.

---

## 7. Dock

**Archivo:** `src/components/navigation/Dock.vue`  
**Interface:** `src/interfaces/navigation/Dock.interface.ts`  
**Impacto:** MEDIO-ALTO · **Complejidad:** Media

### Objetivo
Dock estilo macOS con efecto de magnificación por proximidad del cursor, física de hover y soporte de teclado.

### Arquitectura

```
Dock (contenedor)
├── DockItem.vue          — item individual con icono y tooltip
└── composables/
    └── useDockMagnifier.ts — cálculo de escala por distancia al cursor
```

### Props / Interface

```ts
interface DockItem {
  id: string
  icon: Component
  label: string
  badge?: number | string
  active?: boolean
  href?: string
  onClick?: () => void
}

interface Dock {
  items: DockItem[]
  position?: 'bottom' | 'left' | 'right' | 'top'
  magnification?: number      // factor máximo de escala, default 1.6
  magnificationRadius?: number // px de radio de influencia, default 120
  size?: 'small' | 'medium' | 'large'
  showLabels?: boolean        // default false (solo tooltip)
  radius?: ModoRadius
  glass?: boolean             // efecto glass morphism, default true
}
```

### Emits
- `select(item: DockItem)`

### Features por implementar

1. **Magnification** — `mousemove` en el contenedor. Para cada item, calcular distancia al cursor. Escala = `1 + (magnification - 1) * gaussiana(distancia, radius)`. Aplicar con `transform: scale()` en CSS var.
2. **Hover physics** — Transición suave con `cubic-bezier` de "rebote" al entrar/salir. Spring animation via CSS custom properties.
3. **Tooltips** — Usar el `Tooltip.vue` existente de modo-ui. Solo visible al hover, posicionado dinámicamente según `position` del dock.
4. **Keyboard support** — `Tab` entre items, `Enter`/`Space` activa, `←→` o `↑↓` navegan según orientación.
5. **Mobile fallback** — Sin efecto de magnification en touch devices. Layout horizontal scrollable.
6. **Badge** — Número/texto superpuesto sobre el ícono (notificaciones).

### Clases Tailwind base
```
modo-dock inline-flex items-end gap-1 p-2 rounded-2xl
  bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl
modo-dock-item relative flex items-center justify-center
  rounded-xl cursor-pointer transition-all duration-150
  hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring
```

---

## 8. Bento Grid System

**Archivo:** `src/components/layout/BentoGrid.vue` + `BentoItem.vue`  
**Interface:** `src/interfaces/layout/BentoGrid.interface.ts`  
**Impacto:** MEDIO-ALTO · **Complejidad:** Baja-Media

### Objetivo
Sistema de grid estilo landing page moderno (tipo Apple/Vercel) con spans responsivos, hover effects y soporte de motion.

### Arquitectura

```
BentoGrid (grid container)
└── BentoItem (grid item con slot)
```

### Props / Interface

```ts
interface BentoGrid {
  columns?: number                 // default 4
  rows?: number                    // auto
  gap?: 'none' | 'small' | 'medium' | 'large'
  autoRows?: string                // default 'minmax(120px, auto)'
}

interface BentoItem {
  colSpan?: 1 | 2 | 3 | 4         // default 1
  rowSpan?: 1 | 2 | 3 | 4         // default 1
  colStart?: number
  rowStart?: number
  hoverable?: boolean
  highlighted?: boolean            // borde/glow de acento
  radius?: ModoRadius
  glass?: boolean
  // responsive overrides
  smColSpan?: number
  mdColSpan?: number
  lgColSpan?: number
}
```

### Features por implementar

1. **CSS Grid auto-layout** — `grid-template-columns: repeat(N, 1fr)` con clases utilitarias.
2. **Spans responsivos** — Clases Tailwind generadas por props: `col-span-{n}`, `sm:col-span-{n}`, etc.
3. **Hover effects** — Border glow, background shimmer, elevación. Aplicar con group/peer de Tailwind.
4. **Motion support** — Slot interno, no opinar sobre animaciones. Documentar que es compatible con cualquier animation lib.
5. **SSR safe** — Solo CSS Grid, sin JS para el layout.

### Clases Tailwind base
```
modo-bento-grid grid gap-4 w-full
modo-bento-item relative overflow-hidden transition-all duration-300
  border border-border bg-card rounded-xl
  data-[highlighted]:border-primary/50 data-[highlighted]:shadow-primary/10 shadow-sm
```

---

## 9. Collaboration Presence

**Archivo:** `src/components/feedback/CollabPresence.vue`  
**Interface:** `src/interfaces/feedback/CollabPresence.interface.ts`  
**Impacto:** MEDIO-ALTO · **Complejidad:** Alta

### Objetivo
Visualización de presencia colaborativa en tiempo real: cursores, avatars de usuarios activos, typing indicators y selecciones compartidas.

### Arquitectura

```
CollabPresence (overlay / provider)
├── PresenceCursor.vue         — cursor con nombre de usuario
├── PresenceAvatarStack.vue    — stack de avatars de usuarios activos
├── PresenceTypingIndicator.vue — "X está escribiendo..."
├── PresenceSelection.vue      — highlight de selección de otro usuario
└── composables/
    └── useCollabProvider.ts   — abstracción de la capa realtime
```

### Props / Interface

```ts
interface PresenceUser {
  id: string
  name: string
  avatar?: string
  color?: string              // color asignado al usuario (cursor, highlight)
}

interface PresenceCursorState {
  userId: string
  x: number                   // relativo al contenedor
  y: number
}

interface PresenceSelection {
  userId: string
  start: number
  end: number
  elementId?: string
}

interface CollabPresenceProvider {
  users: Ref<PresenceUser[]>
  cursors?: Ref<PresenceCursorState[]>
  typing?: Ref<string[]>      // userIds escribiendo
  selections?: Ref<PresenceSelection[]>
  broadcast: (event: string, data: unknown) => void
}

interface CollabPresence {
  provider: CollabPresenceProvider
  currentUserId?: string       // ocultar cursor/selection propios
  showCursors?: boolean        // default true
  showAvatars?: boolean        // default true
  showTyping?: boolean         // default true
  maxVisibleAvatars?: number   // default 5
}
```

### Emits
- `cursor-move(position: { x: number; y: number })`
- `user-join(user: PresenceUser)`
- `user-leave(user: PresenceUser)`

### Slots
- `avatar({ user })` — avatar custom en el stack
- `cursor-label({ user })` — etiqueta sobre el cursor

### Features por implementar

1. **Live cursors** — `mousemove` throttled a 50ms. Cursores de otros usuarios interpolados con `lerp` para suavidad. Animación de entrada/salida.
2. **Presence avatars** — `PresenceAvatarStack` reutiliza el componente `Avatar` existente. Overflow con "+N" badge.
3. **Typing indicator** — Mostrar "X está escribiendo..." con animación de puntos. Auto-hide tras 3s sin updates.
4. **Shared selections** — Highlight de texto con `color` del usuario. Usar `Range` API o posicionamiento absoluto.
5. **Color assignment** — Asignar color único por userId (hash → paleta de colores predefinida).
6. **Provider abstraction** — El componente acepta cualquier objeto que implemente `CollabPresenceProvider`. Compatible con Liveblocks, Supabase Realtime, Ably, etc.

### Consideraciones técnicas
- Los cursores se posicionan relativo al contenedor padre (`position: relative` requerido en el padre).
- Throttle de mousemove para no saturar el WebSocket.
- `pointer-events: none` en los overlays para no bloquear interacción.

---

## 10. Reaction Picker

**Archivo:** `src/components/feedback/ReactionPicker.vue`  
**Interface:** `src/interfaces/feedback/ReactionPicker.interface.ts`  
**Impacto:** MEDIO · **Complejidad:** Media

### Objetivo
Picker de reacciones moderno y animado con floating reactions tipo Clubhouse/Facebook Live.

### Arquitectura

```
ReactionPicker
├── ReactionButton.vue         — botón trigger con contador
├── ReactionPickerPopover.vue  — grid de emojis flotante
├── FloatingReaction.vue       — animación de emoji flotando hacia arriba
└── composables/
    └── useFloatingReactions.ts — gestión de partículas flotantes
```

### Props / Interface

```ts
interface Reaction {
  emoji: string
  label: string
  count?: number
  reacted?: boolean          // si el usuario actual ya reaccionó
}

interface ReactionPicker {
  reactions?: Reaction[]     // default: ❤️ 👍 😂 😮 😢 🔥
  modelValue?: Record<string, number>   // { emoji: count }
  showCounts?: boolean       // default true
  showFloating?: boolean     // default true (partículas al reaccionar)
  floatingDuration?: number  // ms de la animación flotante, default 1500
  maxVisible?: number        // emojis visibles sin abrir picker, default 6
  placement?: 'top' | 'bottom' | 'left' | 'right'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}
```

### Emits
- `update:modelValue(reactions: Record<string, number>)`
- `react(emoji: string)`
- `unreact(emoji: string)`

### Features por implementar

1. **Emoji grid** — Grid de emojis en popover flotante. Hover con escala + tooltip de label. Click cierra el picker y emite reacción.
2. **Floating reactions** — Al reaccionar, crear elemento DOM temporal que anima hacia arriba con fade-out. Múltiples a la vez (queue).
3. **Contadores animados** — Número que hace "pop" al incrementar (scale 1→1.3→1 con spring).
4. **Realtime reactions** — Recibir `modelValue` reactivo; las partículas flotantes se pueden disparar externamente.
5. **Keyboard navigation** — Tab entre emojis en el grid, Enter para seleccionar.
6. **Agrupación de reacciones similares** — Mostrar los top N emojis con contadores, "+" para ver todos.

### Clases Tailwind base
```
modo-reaction-picker relative inline-flex items-center gap-1 flex-wrap
modo-reaction-btn inline-flex items-center gap-1 px-2 py-1 rounded-full
  border border-border bg-background text-sm transition-all
  hover:scale-105 hover:border-primary/50 hover:bg-accent
  data-[reacted]:bg-primary/10 data-[reacted]:border-primary/40
```

---

## 11. Spotlight Card

**Archivo:** `src/components/data-display/SpotlightCard.vue`  
**Interface:** `src/interfaces/data-display/SpotlightCard.interface.ts`  
**Impacto:** MEDIO · **Complejidad:** Baja-Media

### Objetivo
Cards premium con efectos de cursor glow, hover magnético y sombras dinámicas. Extiende el `Card.vue` existente.

### Arquitectura

```
SpotlightCard (extiende Card.vue)
└── composables/
    └── useSpotlightEffect.ts — tracking de posición del cursor
```

### Props / Interface

```ts
interface SpotlightCard extends Card {
  spotlight?: boolean          // default true
  spotlightColor?: string      // default 'hsl(var(--primary))'
  spotlightSize?: number       // px, default 200
  magnetic?: boolean           // default false
  magneticStrength?: number    // 0-1, default 0.3
  tilt?: boolean               // efecto parallax 3D, default false
  tiltMaxAngle?: number        // grados, default 10
}
```

### Features por implementar

1. **Cursor glow** — Radial gradient CSS que sigue al cursor usando `--x` y `--y` CSS vars. `mousemove` actualiza las vars.
2. **Magnetic hover** — `mousemove` calcula desplazamiento relativo al centro de la card. Aplicar `translate` proporcional con `lerp` para suavidad. `mouseleave` reset a 0.
3. **Dynamic shadows** — Sombra que se desplaza opuesto al cursor (luz desde arriba-izquierda cuando cursor está arriba-izquierda).
4. **Tilt 3D** — `rotateX`/`rotateY` basado en posición del cursor dentro de la card. Max ± `tiltMaxAngle`.
5. **GPU acceleration** — Usar `will-change: transform` solo durante la interacción (agregar/remover en `mouseenter`/`mouseleave`).
6. **Responsive** — Deshabilitar efectos de cursor en dispositivos touch.

### Clases Tailwind base
```
modo-spotlight-card relative overflow-hidden
  [background-image:radial-gradient(circle_var(--size)_at_var(--x)_var(--y),
  var(--color)_0%,transparent_100%)]
```

---

## 12. Kanban Board

**Archivo:** `src/components/data-display/KanbanBoard.vue`  
**Interface:** `src/interfaces/data-display/KanbanBoard.interface.ts`  
**Impacto:** MEDIO · **Complejidad:** Alta

### Objetivo
Board tipo Trello/Linear con drag & drop, grupos anidados, virtualización y soporte de sync en tiempo real.

### Arquitectura

```
KanbanBoard (orquestador DnD)
├── KanbanColumn.vue           — columna con header y lista de cards
├── KanbanCard.vue             — card draggable con slot
├── KanbanColumnHeader.vue     — título, conteo, acciones de columna
├── KanbanAddCard.vue          — inline form para nueva card
└── composables/
    ├── useKanbanDnd.ts        — lógica drag & drop (HTML5 DnD API)
    └── useKanbanVirtual.ts    — virtualización por columna
```

### Props / Interface

```ts
interface KanbanCard {
  id: string
  title: string
  description?: string
  labels?: Array<{ text: string; color: string }>
  assignees?: Array<{ name: string; avatar?: string }>
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: Date | string
  [key: string]: unknown      // campos extra pasados al slot
}

interface KanbanColumn {
  id: string
  title: string
  color?: string
  limit?: number              // WIP limit
  cards: KanbanCard[]
  collapsed?: boolean
}

interface KanbanBoard {
  columns: KanbanColumn[]
  draggable?: boolean         // default true
  addable?: boolean           // mostrar "Add card" button, default true
  groupBy?: string            // key del card para agrupar dentro de columna
  virtualizeThreshold?: number // activar virtual si cards > N, default 30
  compact?: boolean           // modo compacto (cards más pequeñas)
  readonly?: boolean
}
```

### Emits
- `card-move(card, fromColumn, toColumn, newIndex)`
- `card-add(column, card)`
- `card-remove(column, card)`
- `column-add(column)`
- `column-remove(column)`
- `update:columns(columns)` — para v-model

### Slots
- `card({ card, column })` — contenido custom de la card
- `card-header({ card })` / `card-footer({ card })`
- `column-header({ column })`
- `empty-column({ column })` — estado vacío de una columna

### Features por implementar

1. **Drag & Drop** — HTML5 DnD API con `draggable` nativo. Indicador visual de posición de drop (borde punteado). Soporte de drag entre columnas.
2. **Touch DnD** — `touchstart`/`touchmove`/`touchend` con clone visual del elemento para mobile.
3. **Grupos anidados** — Si `groupBy` está definido, cards agrupadas por ese campo dentro de la columna. Grupos colapsables.
4. **Virtualización** — `IntersectionObserver` por columna para renderizar solo cards visibles. Altura estimada configurable.
5. **WIP limit** — Si `limit` está definido en la columna, highlight visual cuando se supera.
6. **Accesibilidad** — Opción de mover cards con teclado: `Space` para "agarrar", `←→` para cambiar columna, `↑↓` para reordenar, `Space`/`Esc` para soltar/cancelar.

### Consideraciones técnicas
- No depender de `@dnd-kit` ni `Sortable.js`. Implementar con API nativa para mantener cero dependencias.
- El estado del board es manejado por el consumer (props + emits). El componente es "controlled".
- Deshabilitar `user-select` durante el drag.

---

## 13. AI Empty State

**Archivo:** `src/components/feedback/AiEmptyState.vue`  
**Interface:** `src/interfaces/feedback/AiEmptyState.interface.ts`  
**Impacto:** MEDIO · **Complejidad:** Baja-Media

> Ver [Principios AI transversales](#principios-ai-transversales). El developer provee el `provider` con su propia API key. Sin provider, funciona como `EmptyState` mejorado con sugerencias estáticas.

### Objetivo
Extender el `EmptyState` existente con acciones sugeridas inteligentes, ejemplos generados y onboarding guiado. Se degrada elegantemente si no hay proveedor AI.

### Arquitectura

```
AiEmptyState (extiende EmptyState)
├── AiSuggestionList.vue           — lista de acciones (estáticas o AI)
├── AiExamplePreview.vue           — card que muestra el ejemplo generado
├── AiOnboardingChecklist.vue      — pasos de onboarding con progressbar
├── AiStatusRegion.vue             — aria-live region para anuncios
└── composables/
    └── useAiEmptyStateProvider.ts — abstracción, loading, cache por context
```

### Provider API

```ts
// El developer implementa con su propia IA
interface AiEmptyStateProvider {
  getSuggestions: (
    input: { context: string },
    signal?: AbortSignal
  ) => Promise<AiSuggestedAction[]>

  generateExample?: (
    input: { context: string },
    signal?: AbortSignal
  ) => Promise<string>  // texto, JSON, o cualquier dato que el developer renderice
}
```

### Props / Interface

```ts
interface AiSuggestedAction {
  label: string
  description?: string
  icon?: Component
  onClick: () => void
  ai?: boolean                             // marcar como sugerencia de IA
}

interface AiOnboardingStep {
  id: string
  label: string
  description?: string
  completed: boolean
  href?: string
  onClick?: () => void
}

interface AiEmptyState extends EmptyState {
  context?: string                         // descripción del contexto para la IA
  provider?: AiEmptyStateProvider          // o inyectado vía createMoodUI
  suggestions?: AiSuggestedAction[]        // sugerencias estáticas (sin IA)
  showDemo?: boolean                       // botón "Ver ejemplo" / "Generar demo"
  onboardingSteps?: AiOnboardingStep[]
  aiLabel?: string                         // texto del badge, default "Sugerido por IA"
}
```

### Emits

```ts
'action'            (action: AiSuggestedAction)
'generate-example'  ()
'example-generated' (result: string)
'step-complete'     (step: AiOnboardingStep)
'error'             (err: Error)
'loading'           (state: boolean)
```

### Slots

| Slot | Scope | Descripción |
|------|-------|-------------|
| Todos los de `EmptyState` | — | Heredados |
| `suggestions` | `{ suggestions, loading }` | Lista de acciones custom |
| `suggestion-item` | `{ action, select }` | Item individual custom |
| `example` | `{ result, loading }` | Preview del ejemplo generado |
| `onboarding` | `{ steps, progress }` | Checklist custom |

### Features por implementar

1. **Sugerencias estáticas** — Lista de `<button>` nativos bajo el mensaje. Sin IA requerida.
2. **Sugerencias AI** — Con `provider`, llamar `getSuggestions(context)` en `onMounted`. Skeleton mientras carga. Cache por `context` en `sessionStorage`.
3. **Badge "IA"** — Las sugerencias AI tienen un badge visual diferenciador. Texto configurable via `aiLabel`.
4. **Generar ejemplo** — Botón llama `provider.generateExample()`. Resultado pasa al slot `example` — el developer decide cómo renderizarlo.
5. **Onboarding checklist** — Steps con estado y `progressbar`. Animación al completar. Emit `step-complete`.
6. **Degradación sin IA** — Sin `provider`, cero overhead: solo sugerencias estáticas y onboarding si se proveen.

### Accesibilidad

**Base (hereda de EmptyState):**
- `role="status"` en el contenedor principal
- Título con el nivel de heading apropiado via prop `as`

**Lista de sugerencias:**
- `role="list"` en el contenedor
- Cada acción: `<button>` nativo, nunca `div` con `@click`
- Badge "IA": `aria-label="Sugerido por inteligencia artificial"` en el elemento badge

**Generación de ejemplo:**
- Botón: `aria-label="Generar ejemplo con IA"`, `aria-busy` durante loading
- Al generar: foco se mueve al resultado + `aria-live="polite"` anuncia `"Ejemplo generado"`
- Error: `role="alert"` con mensaje descriptivo en lenguaje natural

**Onboarding checklist:**
- `role="list"` + cada step como `role="listitem"`
- Checkbox visual: `role="checkbox"` + `aria-checked` + `aria-label="{label del step}"`
- Barra de progreso: `role="progressbar"` + `aria-valuenow` + `aria-valuemax` + `aria-label="Progreso del onboarding"`
- Al completar step: `aria-live="polite"` anuncia `"Paso completado: {label}"`

**Estado de loading AI:**
- `aria-live="polite"` anuncia `"Cargando sugerencias..."` y `"X sugerencias disponibles"`
- `aria-busy="true"` en el contenedor de sugerencias durante la carga

### Clases Tailwind base
```
modo-ai-empty-state
modo-ai-suggestion-list mt-4 flex flex-col gap-2 w-full max-w-sm
modo-ai-suggestion-item flex items-center gap-3 px-4 py-2.5 rounded-lg
  border border-border bg-background cursor-pointer text-sm
  hover:border-primary/40 hover:bg-accent transition-colors
  focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
modo-ai-badge inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs
  bg-primary/10 text-primary font-medium
modo-ai-progress-bar h-1 w-full bg-muted rounded-full overflow-hidden
modo-ai-progress-fill h-full bg-primary transition-all duration-500
```

---

## Estructura de archivos final

```
src/
├── components/
│   ├── forms/
│   │   ├── AvatarUpload.vue          — orquestador AI Avatar
│   │   ├── AvatarPreview.vue
│   │   ├── AvatarDropzone.vue
│   │   ├── AvatarCropper.vue
│   │   ├── AvatarPrompt.vue
│   │   ├── AvatarActions.vue
│   │   ├── AiFormAssistant.vue
│   │   ├── AiSuggestionDropdown.vue
│   │   ├── AiCorrectionTooltip.vue
│   │   └── AiStatusRegion.vue         — aria-live compartido entre AI components
│   ├── layout/
│   │   ├── MasonryFeed.vue
│   │   ├── MasonryItem.vue
│   │   └── BentoGrid.vue + BentoItem.vue
│   ├── navigation/
│   │   ├── CommandPalette.vue
│   │   ├── CommandPaletteInput.vue
│   │   ├── CommandPaletteGroup.vue
│   │   ├── CommandPaletteItem.vue
│   │   ├── Dock.vue
│   │   └── DockItem.vue
│   ├── feedback/
│   │   ├── StoryViewer.vue
│   │   ├── StoryProgressBar.vue
│   │   ├── StoryMedia.vue
│   │   ├── CollabPresence.vue
│   │   ├── PresenceCursor.vue
│   │   ├── PresenceAvatarStack.vue
│   │   ├── PresenceTypingIndicator.vue
│   │   ├── ReactionPicker.vue
│   │   ├── FloatingReaction.vue
│   │   └── AiEmptyState.vue
│   └── data-display/
│       ├── VideoPlayer.vue
│       ├── VideoControls.vue
│       ├── SpotlightCard.vue
│       └── KanbanBoard.vue + KanbanColumn.vue + KanbanCard.vue
├── interfaces/
│   ├── forms/AvatarUpload.interface.ts
│   ├── forms/AiFormAssistant.interface.ts
│   ├── layout/MasonryFeed.interface.ts
│   ├── layout/BentoGrid.interface.ts
│   ├── navigation/CommandPalette.interface.ts
│   ├── navigation/Dock.interface.ts
│   ├── feedback/StoryViewer.interface.ts
│   ├── feedback/CollabPresence.interface.ts
│   ├── feedback/ReactionPicker.interface.ts
│   ├── feedback/AiEmptyState.interface.ts
│   ├── data-display/VideoPlayer.interface.ts
│   ├── data-display/SpotlightCard.interface.ts
│   └── data-display/KanbanBoard.interface.ts
└── composables/
    ├── useAvatarUpload.ts
    ├── useAvatarCrop.ts
    ├── useAvatarProvider.ts
    ├── useMasonryLayout.ts
    ├── useMasonryVirtualizer.ts
    ├── useCommandPalette.ts
    ├── useFuzzySearch.ts
    ├── useStoryPlayer.ts
    ├── useVideoPlayer.ts
    ├── useAiFormProvider.ts
    ├── useDockMagnifier.ts
    ├── useCollabProvider.ts
    ├── useFloatingReactions.ts
    ├── useSpotlightEffect.ts
    └── useKanbanDnd.ts
```

---

## Principios transversales

1. **Cero dependencias nuevas** por defecto. Canvas API, IntersectionObserver, ResizeObserver, HTML5 DnD, Web Animations API — todo nativo.

2. **IA 100% del developer** — Mood UI nunca provee, gestiona ni expone API keys. Nunca hace requests de red por IA. El developer conecta su proveedor via función simple (`provider` prop o `createMoodUI`). Ver [Principios AI transversales](#principios-ai-transversales).

3. **Accessible first (WCAG 2.1 AA)** — Todos los componentes cumplen:
   - ARIA roles semánticos correctos (`role`, `aria-label`, `aria-live`, `aria-busy`, `aria-expanded`, etc.)
   - Navegación completa por teclado sin ratón
   - Focus management: foco visible, traps en modales, retorno al trigger al cerrar
   - `prefers-reduced-motion`: ninguna animación si el sistema lo solicita
   - Contraste mínimo 4.5:1 en texto, 3:1 en elementos UI
   - Screen reader friendly: anuncios de estado en `aria-live`, estados de loading anunciados

4. **Flujo de guardado explícito** — Los componentes que generan contenido (AI Avatar Upload) distinguen entre "imagen pendiente" e "imagen guardada". El componente emite `save` con el payload; el developer implementa el upload al backend con su propia función `onSave`.

5. **SSR safe** — Nada que toque `window`/`document` fuera de `onMounted`. Guards `typeof window !== 'undefined'`.

6. **Consistent with modo-ui patterns** — `withDefaults(defineProps<Interface>(), {...})`, `useResolvedRadius/Size`, clases prefijadas `modo-*`, TypeScript strict.

7. **No opinión sobre el estado global** — Los componentes son "controlled" (props + emits). Sin Pinia, sin stores internos.

8. **GPU-friendly animations** — Solo `transform` y `opacity`. Nunca animar `width`, `height`, `top`, `left` directamente.
