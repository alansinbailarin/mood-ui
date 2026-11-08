<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { PopoverContentProps } from '../../../interfaces/layout/Popover.interface'
import { useTeleportedModoTheme } from '../../../composables/useTeleportedModoTheme'
import { MENU_PRESET, runMorph } from '../../../utils/morph/morphEngine'
import {
  adoptTriggerSurface,
  attachCloseScrub,
  isTopMorphLayer,
  populateGhost,
  resolvePlacement,
} from '../../../utils/morph/morphHelpers'
import { usePopoverContext } from './PopoverContext'

defineOptions({
  name: 'PopoverContent',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<PopoverContentProps>(), {
  side: 'auto',
  align: 'auto',
  surface: 'auto',
  dismissable: true,
})

const { phase, setOpen, setPhase, triggerEl, triggerId, popoverId, radius, size } =
  usePopoverContext()
// Local panel overrides win, then the `<Popover>` props, then the provider.
const { scopedTheme, providerStyle } = useTeleportedModoTheme({
  radius: () => props.radius ?? radius.value,
  size: () => props.size ?? size.value,
})
const panelRef = ref<HTMLDivElement | null>(null)
const ghostRef = ref<HTMLSpanElement | null>(null)

const isVisible = computed(() => phase.value !== 'closed')
const isActive = computed(() => phase.value === 'opening' || phase.value === 'open')

function positionPanel() {
  const panel = panelRef.value
  const trigger = triggerEl.value
  if (!panel || !trigger || typeof window === 'undefined') return

  if (phase.value !== 'closing' && typeof panel.getAnimations === 'function') {
    for (const animation of panel.getAnimations()) animation.cancel()
  }

  const t = trigger.getBoundingClientRect()
  const p = panel.getBoundingClientRect()
  const placement = resolvePlacement(
    { top: t.top, left: t.left, width: t.width, height: t.height },
    { width: p.width, height: p.height },
    { width: window.innerWidth, height: window.innerHeight },
    props.side,
    props.align,
  )
  panel.style.left = `${placement.left}px`
  panel.style.top = `${placement.top}px`

  if (props.surface === 'trigger') {
    adoptTriggerSurface(panel, trigger, 'menu')
  } else {
    panel.style.removeProperty('--modo-menu-surface')
    panel.style.removeProperty('color')
  }

  const originX =
    placement.align === 'end' ? '100%' : placement.align === 'center' ? '50%' : '0%'
  const originY = placement.side === 'top' ? '100%' : '0%'
  panel.style.transformOrigin = `${originX} ${originY}`
  panel.setAttribute('data-modo-side', placement.side)
  panel.setAttribute('data-modo-align', placement.align)

  if (ghostRef.value) {
    populateGhost(ghostRef.value, trigger)
  }
}

watch(
  phase,
  async (currentPhase, prevPhase) => {
    if (currentPhase === 'closed') {
      if (prevPhase && prevPhase !== 'closed') {
        triggerEl.value?.focus?.()
      }
      return
    }

    await nextTick()
    positionPanel()

    const panel = panelRef.value
    if (!panel) return

    if (currentPhase === 'opening') {
      runMorph({
        panel,
        trigger: triggerEl.value,
        direction: 'open',
        preset: MENU_PRESET,
        onFinish: () => setPhase('open'),
      })
    } else if (currentPhase === 'closing') {
      if (triggerEl.value && ghostRef.value) {
        populateGhost(ghostRef.value, triggerEl.value)
      }
      runMorph({
        panel,
        trigger: triggerEl.value,
        ghost: ghostRef.value,
        direction: 'close',
        preset: MENU_PRESET,
        onFinish: () => setPhase('closed'),
      })
    } else if (currentPhase === 'open') {
      panel
        .querySelector<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        ?.focus()
    }
  },
)

watch([() => props.side, () => props.align, () => props.surface], () => {
  if (phase.value === 'open') {
    positionPanel()
  }
})

let cleanupScrub: (() => void) | null = null
watch(
  [() => phase.value === 'open', panelRef, () => props.dismissable],
  ([isOpenPhase, panel, dismissable]) => {
    cleanupScrub?.()
    cleanupScrub = null
    if (!isOpenPhase || !panel || !dismissable) return

    const trigger = triggerEl.value
    if (!trigger) return
    cleanupScrub = attachCloseScrub(panel, trigger, MENU_PRESET, () => setOpen(false))
  },
  { flush: 'post' },
)

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
      if (
        target &&
        !panel.contains(target) &&
        !(triggerEl.value && triggerEl.value.contains(target))
      ) {
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
  cleanupScrub?.()
  cleanupDismissListeners?.()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      :id="popoverId"
      ref="panelRef"
      v-bind="$attrs"
      role="dialog"
      :aria-labelledby="triggerId || undefined"
      data-modo-popover=""
      :data-modo-surface="surface"
      data-modo-morph-layer=""
      :data-modo-theme="scopedTheme || undefined"
      :data-modo-phase="phase"
      class="modo-popover text-body"
      :style="[{ position: 'fixed' }, providerStyle]"
    >
      <slot />
      <div
        v-if="phase === 'closing'"
        aria-hidden="true"
        class="modo-morph-ghost"
      >
        <span ref="ghostRef" class="modo-morph-ghost__inner" />
      </div>
    </div>
  </Teleport>
</template>
