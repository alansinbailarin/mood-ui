<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, provide, ref, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import Button from '../../forms/Button.vue'
import type { DialogContentProps } from '../../../interfaces/feedback/Dialog.interface'
import { useTeleportedModoTheme } from '../../../composables/useTeleportedModoTheme'
import { useModoLocale, useResolvedColor } from '../../../composables/useModoConfig'
import { DIALOG_PRESET, runMorph } from '../../../utils/morph/morphEngine'
import {
  acquireScrollLock,
  adoptTriggerSurface,
  attachCloseScrub,
  attachFocusTrap,
  isTopMorphLayer,
  populateGhost,
  resolveDialogPosition,
} from '../../../utils/morph/morphHelpers'
import { useDialogContext } from './DialogContext'
import { COLOR_TOKEN_BY_COLOR, OVERLAY_SCOPE_KEY } from './overlayScope'

defineOptions({
  name: 'DialogContent',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DialogContentProps>(), {
  placement: 'trigger',
  side: 'auto',
  align: 'auto',
  surface: 'auto',
  width: 'medium',
  dismissable: undefined,
  alert: false,
})

const { phase, setOpen, setPhase, triggerEl, dialogId, color } = useDialogContext()
const { scopedTheme, providerStyle, resolvedSize } = useTeleportedModoTheme({
  radius: () => props.radius,
  size: () => props.size,
})
const resolvedColor = useResolvedColor(() => props.color ?? color.value)
const loc = useModoLocale()
const closeLabelText = computed(() => props.closeLabel ?? loc.value.common.close)
const fallbackLabel = computed(() => props.ariaLabel ?? loc.value.dialog.label)

provide(OVERLAY_SCOPE_KEY, {
  color: resolvedColor,
  size: resolvedSize,
  radius: () => props.radius,
})
const panelRef = ref<HTMLDivElement | null>(null)
const ghostRef = ref<HTMLSpanElement | null>(null)

const isVisible = computed(() => phase.value !== 'closed')
const isActive = computed(() => phase.value === 'opening' || phase.value === 'open')
const effectiveDismissable = computed(() =>
  props.dismissable !== undefined ? props.dismissable : !props.alert,
)
const isFull = computed(() => props.width === 'full')
const preset = computed(() =>
  isFull.value ? { ...DIALOG_PRESET, overshoot: 0 } : DIALOG_PRESET,
)

const ariaLabelledby = ref<string | undefined>(undefined)
const ariaDescribedby = ref<string | undefined>(undefined)

function syncAria() {
  const titleEl = document.getElementById(`${dialogId}-title`)
  const descEl = document.getElementById(`${dialogId}-description`)
  ariaLabelledby.value = titleEl ? `${dialogId}-title` : undefined
  ariaDescribedby.value = descEl ? `${dialogId}-description` : undefined
}

function positionPanel() {
  const panel = panelRef.value
  if (!panel || typeof window === 'undefined') return

  if (phase.value !== 'closing' && typeof panel.getAnimations === 'function') {
    for (const animation of panel.getAnimations()) animation.cancel()
  }

  const viewport = { width: window.innerWidth, height: window.innerHeight }
  const p = panel.getBoundingClientRect()
  const trigger = triggerEl.value
  panel.toggleAttribute('data-modo-detached', !trigger)

  if (!trigger || isFull.value) {
    const full = isFull.value
    panel.style.left = full ? '0' : `${Math.max(16, (viewport.width - p.width) / 2)}px`
    panel.style.top = full ? '0' : `${Math.max(24, (viewport.height - p.height) / 2)}px`
    panel.style.transformOrigin = '50% 50%'
  } else {
    const t = trigger.getBoundingClientRect()
    const pos = resolveDialogPosition(
      props.placement,
      { top: t.top, left: t.left, width: t.width, height: t.height },
      { width: p.width, height: p.height },
      viewport,
      props.side,
      props.align,
    )
    panel.style.left = `${pos.left}px`
    panel.style.top = `${pos.top}px`
    panel.style.width = pos.width !== undefined ? `${pos.width}px` : ''
    panel.style.transformOrigin = `${pos.originX} ${pos.originY}`
  }

  if (trigger && props.surface === 'trigger') {
    adoptTriggerSurface(panel, trigger, 'dialog', COLOR_TOKEN_BY_COLOR[resolvedColor.value])
  } else {
    panel.style.removeProperty('--modo-dialog-surface')
    panel.style.removeProperty('color')
  }
  if (trigger && ghostRef.value) {
    populateGhost(ghostRef.value, trigger)
  }
}

// Run morph choreography on phase transitions
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
    syncAria()
    positionPanel()

    const panel = panelRef.value
    if (!panel) return

    if (currentPhase === 'opening') {
      runMorph({
        panel,
        trigger: triggerEl.value,
        direction: 'open',
        preset: preset.value,
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
        preset: preset.value,
        onFinish: () => setPhase('closed'),
      })
    }
  },
)

// Re-position if layout props change while open
watch(
  [() => props.placement, () => props.side, () => props.align, () => props.surface, () => props.width, resolvedColor],
  () => {
    if (phase.value === 'open') {
      positionPanel()
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

// Focus trap + pull-to-close scrub when open
let cleanupOpenListeners: (() => void) | null = null
watch(
  [() => phase.value === 'open', panelRef, effectiveDismissable, preset],
  ([isOpenPhase, panel, dismissable, currentPreset]) => {
    cleanupOpenListeners?.()
    cleanupOpenListeners = null
    if (!isOpenPhase || !panel) return

    const stopTrap = attachFocusTrap(panel)
    const trigger = triggerEl.value
    const stopScrub =
      dismissable && trigger
        ? attachCloseScrub(panel, trigger, currentPreset, () => setOpen(false))
        : () => {}

    cleanupOpenListeners = () => {
      stopTrap()
      stopScrub()
    }
  },
  { flush: 'post' },
)

// Escape + outside pointerdown dismiss
let cleanupDismissListeners: (() => void) | null = null
watch(
  [isActive, panelRef, effectiveDismissable],
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
      data-modo-dialog-root=""
      :data-modo-theme="scopedTheme || undefined"
      :data-modo-phase="phase"
      :style="providerStyle"
    >
      <div data-modo-dialog-scrim="" :data-modo-phase="phase" />
      <div
        :id="dialogId"
        ref="panelRef"
        v-bind="$attrs"
        :role="alert ? 'alertdialog' : 'dialog'"
        aria-modal="true"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby"
        :aria-label="!ariaLabelledby ? fallbackLabel : undefined"
        data-modo-dialog=""
        data-modo-morph-layer=""
        :data-modo-phase="phase"
        :data-modo-placement="placement"
        :data-modo-width="width"
        class="modo-dialog"
        style="position: fixed"
      >
        <slot />
        <div v-if="!alert" class="modo-dialog__x">
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
        <div
          v-if="phase === 'closing'"
          aria-hidden="true"
          class="modo-morph-ghost"
        >
          <span ref="ghostRef" class="modo-morph-ghost__inner" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
