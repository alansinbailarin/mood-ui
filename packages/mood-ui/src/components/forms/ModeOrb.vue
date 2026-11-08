<script setup lang="ts">
import './mode-orb.css'
import { computed, onMounted, ref } from 'vue'
import { useColorMode } from '../../composables/useColorMode'
import {
  useModoLocale,
  useResolvedColor,
  useSizeTokens,
} from '../../composables/useModoConfig'
import { CONTROL_FOCUS_RING } from '../../composables/useField'
import type { ModeOrbProps } from '../../interfaces/forms/ModeOrb.interface'

defineOptions({
  name: 'ModeOrb',
})

const props = withDefaults(defineProps<ModeOrbProps>(), {
  fixed: false,
  disabled: false,
})

const sz = useSizeTokens(() => props.size)
const color = useResolvedColor(() => props.color)
const loc = useModoLocale()

// The orb is a round control: its diameter is the shared control height.
const ORB_SIZE_BY_CONTROL: Record<string, string> = {
  'h-8': 'h-8 w-8',
  'h-9': 'h-9 w-9',
  'h-10': 'h-10 w-10',
  'h-12': 'h-12 w-12',
}
const sizeClass = computed(() => ORB_SIZE_BY_CONTROL[sz.value.control] ?? 'h-10 w-10')

const label = computed(() => props.ariaLabel ?? loc.value.modeOrb.toggle)

const { resolved, set } = useColorMode()
const isDark = computed(() => resolved.value === 'dark')
// The color mode lives in the browser (localStorage + OS preference). During
// SSR it is unknown, so the pressed state is only exposed once mounted —
// otherwise the server HTML would carry a stale value hydration never fixes.
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
const pressed = computed(() => (mounted.value ? isDark.value : undefined))
const crestRef = ref<HTMLSpanElement | null>(null)

// Matches the wave keyframes in mode-orb.css.
const WAVE_MS = 850
const WAVE_EASE = 'cubic-bezier(0.37, 0, 0.63, 1)'
const CREST_R = 100

type DocumentWithVT = Document & {
  startViewTransition?: (update: () => void) => {
    ready: Promise<void>
    finished: Promise<void>
  }
}

/**
 * Plays the circular reveal on the new snapshot plus the foam crest.
 * Animations run on the clock (not frame-scrubbed), so a slow or throttled
 * page still finishes the theme change in WAVE_MS instead of stalling.
 */
function launchWave(
  root: HTMLElement,
  crest: HTMLElement | null,
  x: number,
  y: number,
  radius: number,
): void {
  root.animate(
    {
      clipPath: [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${radius}px at ${x}px ${y}px)`,
      ],
    },
    {
      duration: WAVE_MS,
      easing: WAVE_EASE,
      fill: 'forwards',
      pseudoElement: '::view-transition-new(root)',
    },
  )

  if (!crest) return
  crest.style.left = `${x}px`
  crest.style.top = `${y}px`
  crest.animate(
    {
      transform: [
        'translate(-50%, -50%) scale(0)',
        `translate(-50%, -50%) scale(${radius / CREST_R})`,
      ],
    },
    { duration: WAVE_MS, easing: WAVE_EASE },
  )
  crest.animate(
    { opacity: [0.9, 0.55, 0], offset: [0, 0.72, 1] },
    { duration: WAVE_MS, easing: 'linear' },
  )
}

function handleToggle(event: MouseEvent) {
  if (props.disabled) return
  if (typeof document === 'undefined' || typeof window === 'undefined') return

  const root = document.documentElement
  const next = isDark.value ? 'light' : 'dark'
  const apply = () => {
    set(next)
  }

  const doc = document as DocumentWithVT
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (still || typeof doc.startViewTransition !== 'function') {
    apply()
    return
  }

  const target = event.currentTarget as HTMLElement
  const orb = target.getBoundingClientRect()
  const x = Math.round(orb.left + orb.width / 2)
  const y = Math.round(orb.top + orb.height / 2)
  const radius = Math.ceil(
    Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    ),
  )

  root.style.setProperty('--modo-wave-x', `${x}px`)
  root.style.setProperty('--modo-wave-y', `${y}px`)
  root.style.setProperty('--modo-wave-r', `${radius}px`)

  root.dataset.modoWave = ''
  const transition = doc.startViewTransition(apply)
  transition.ready
    .then(() => {
      try {
        launchWave(root, crestRef.value, x, y, radius)
      } catch {
        root.dataset.modoWave = 'go'
      }
    })
    .catch(() => {
      /* transition skipped — the theme is already applied */
    })
  transition.finished.finally(() => {
    delete root.dataset.modoWave
  })
}
</script>

<template>
  <button
    type="button"
    :class="[
      'modo-mode-orb',
      sizeClass,
      CONTROL_FOCUS_RING,
      'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
    ]"
    :data-modo-color="color"
    :data-modo-size="sz.control"
    :data-modo-fixed="fixed ? '' : undefined"
    :aria-label="label"
    :aria-pressed="pressed"
    :disabled="disabled"
    @click="handleToggle"
  />
  <Teleport to="body">
    <span ref="crestRef" class="modo-wave-crest" aria-hidden="true" />
  </Teleport>
</template>
