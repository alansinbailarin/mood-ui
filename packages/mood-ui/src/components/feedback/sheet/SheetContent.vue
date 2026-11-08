<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, provide, ref, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import Button from '../../forms/Button.vue'
import type { SheetContentProps } from '../../../interfaces/feedback/Sheet.interface'
import { useTeleportedModoTheme } from '../../../composables/useTeleportedModoTheme'
import { useModoLocale, useResolvedColor } from '../../../composables/useModoConfig'
import { prefersReducedMotion } from '../../../utils/morph/morphEngine'
import {
  acquireScrollLock,
  attachFocusTrap,
  attachSheetExpand,
  attachSheetPullDismiss,
  isTopMorphLayer,
} from '../../../utils/morph/morphHelpers'
import { useSheetContext } from './SheetContext'
import { OVERLAY_SCOPE_KEY } from '../dialog/overlayScope'

defineOptions({
  name: 'SheetContent',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SheetContentProps>(), {
  height: 'auto',
  expandable: false,
  dismissable: true,
})

const { phase, setOpen, setPhase, triggerEl, sheetId, color } = useSheetContext()
const { scopedTheme, providerStyle, resolvedSize } = useTeleportedModoTheme({
  radius: () => props.radius,
  size: () => props.size,
})
const resolvedColor = useResolvedColor(() => props.color ?? color.value)
const loc = useModoLocale()
const closeLabelText = computed(() => props.closeLabel ?? loc.value.common.close)
const fallbackLabel = computed(() => props.ariaLabel ?? loc.value.sheet.label)

provide(OVERLAY_SCOPE_KEY, {
  color: resolvedColor,
  size: resolvedSize,
  radius: () => props.radius,
})
const panelRef = ref<HTMLDivElement | null>(null)
const isVisible = computed(() => phase.value !== 'closed')
const isActive = computed(() => phase.value === 'opening' || phase.value === 'open')

const ariaLabelledby = ref<string | undefined>(undefined)
const ariaDescribedby = ref<string | undefined>(undefined)

function syncAria() {
  const panel = panelRef.value
  if (!panel) return
  const titleEl = document.getElementById(`${sheetId}-title`)
  const descEl = document.getElementById(`${sheetId}-description`)
  ariaLabelledby.value = titleEl ? `${sheetId}-title` : undefined
  ariaDescribedby.value = descEl ? `${sheetId}-description` : undefined
}

// Phase progression (`opening -> open` and `closing -> closed`)
watch(
  [phase, panelRef],
  ([currentPhase, panel], _old, onCleanup) => {
    if (currentPhase !== 'opening' && currentPhase !== 'closing') return
    const next = currentPhase === 'opening' ? 'open' : 'closed'

    if (!panel || prefersReducedMotion() || panel.hasAttribute('data-modo-skip-morph')) {
      setPhase(next)
      return
    }

    const onEnd = (event: AnimationEvent) => {
      if (event.target === panel) setPhase(next)
    }
    panel.addEventListener('animationend', onEnd)
    const fallback = setTimeout(() => setPhase(next), 700)
    onCleanup(() => {
      clearTimeout(fallback)
      panel.removeEventListener('animationend', onEnd)
    })
  },
  { flush: 'post' },
)

// Sync ARIA + restore focus on close
watch(
  phase,
  async (currentPhase, prevPhase) => {
    if (currentPhase !== 'closed') {
      await nextTick()
      syncAria()
    }
    if (currentPhase === 'closed' && prevPhase && prevPhase !== 'closed') {
      triggerEl.value?.focus?.()
    }
  },
)

// Scroll lock while active
let releaseScrollLock: (() => void) | null = null
watch(
  isActive,
  (active) => {
    if (active && !releaseScrollLock) {
      releaseScrollLock = acquireScrollLock()
    } else if (!active && releaseScrollLock) {
      releaseScrollLock()
      releaseScrollLock = null
    }
  },
  { immediate: true },
)

// Focus trap, pull-to-dismiss, and upward expand detent when open
let cleanupOpenListeners: (() => void) | null = null
watch(
  [() => phase.value === 'open', panelRef, () => props.dismissable, () => props.expandable],
  ([isOpenPhase, panel, dismissable, expandable]) => {
    cleanupOpenListeners?.()
    cleanupOpenListeners = null
    if (!isOpenPhase || !panel) return

    const stopTrap = attachFocusTrap(panel)
    const stopPull = dismissable
      ? attachSheetPullDismiss(panel, () => setOpen(false))
      : () => {}
    const stopExpand = expandable ? attachSheetExpand(panel) : () => {}

    cleanupOpenListeners = () => {
      stopTrap()
      stopPull()
      stopExpand()
    }
  },
  { flush: 'post' },
)

// Escape + outside pointerdown dismiss
let cleanupDismissListeners: (() => void) | null = null
watch(
  [isActive, panelRef, () => props.dismissable],
  ([active, panel, dismissable]) => {
    cleanupDismissListeners?.()
    cleanupDismissListeners = null
    if (!active || !dismissable || !panel) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (!isTopMorphLayer(panel)) return
      event.stopPropagation()
      event.preventDefault()
      setOpen(false)
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!isTopMorphLayer(panel)) return
      const target = event.target as Node | null
      if (target && !panel.contains(target)) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    cleanupDismissListeners = () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  },
  { flush: 'post' },
)

onBeforeUnmount(() => {
  releaseScrollLock?.()
  cleanupOpenListeners?.()
  cleanupDismissListeners?.()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      data-modo-sheet-root=""
      :data-modo-theme="scopedTheme || undefined"
      :data-modo-phase="phase"
      :style="providerStyle"
    >
      <div data-modo-sheet-scrim="" :data-modo-phase="phase" />
      <div
        :id="sheetId"
        ref="panelRef"
        v-bind="$attrs"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby"
        :aria-label="!ariaLabelledby ? fallbackLabel : undefined"
        data-modo-sheet=""
        data-modo-morph-layer=""
        :data-modo-phase="phase"
        :data-modo-height="height"
        class="modo-sheet"
      >
        <slot />
        <div class="modo-sheet__x">
          <Button
            variant="text"
            size="small"
            :color="resolvedColor"
            :radius="radius"
            :icon="XMarkIcon"
            :aria-label="closeLabelText"
            @click="setOpen(false)"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>
