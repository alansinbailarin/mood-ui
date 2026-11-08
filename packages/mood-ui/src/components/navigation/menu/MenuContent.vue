<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, provide, ref, watch } from 'vue'
import type { MenuContentProps } from '../../../interfaces/navigation/Menu.interface'
import { useTeleportedModoTheme } from '../../../composables/useTeleportedModoTheme'
import { MENU_PRESET, runMorph } from '../../../utils/morph/morphEngine'
import {
  adoptTriggerSurface,
  attachCloseScrub,
  isTopMorphLayer,
  matchesShortcut,
  populateGhost,
  resolvePlacement,
} from '../../../utils/morph/morphHelpers'
import { MENU_CONTEXT_KEY, useMenuContext } from './MenuContext'

defineOptions({
  name: 'MenuContent',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<MenuContentProps>(), {
  side: 'auto',
  align: 'auto',
  surface: 'auto',
})

const menu = useMenuContext()
const { phase, setOpen, setPhase, triggerEl, triggerId, menuId, preset, pointBloom } = menu
// Local panel overrides win, then the `<Menu>` props, then the provider.
const { scopedTheme, providerStyle, resolvedRadius, resolvedSize } = useTeleportedModoTheme({
  radius: () => props.radius ?? menu.radius.value,
  size: () => props.size ?? menu.size.value,
})

// Rows read radius / size from the panel they live in, so a `MenuContent`
// override reaches every item.
provide(MENU_CONTEXT_KEY, { ...menu, radius: resolvedRadius, size: resolvedSize })
const panelRef = ref<HTMLDivElement | null>(null)
const ghostRef = ref<HTMLSpanElement | null>(null)

const isVisible = computed(() => phase.value !== 'closed')
const isActive = computed(() => phase.value === 'opening' || phase.value === 'open')
const effectivePreset = computed(() => preset ?? MENU_PRESET)

const ITEM_SELECTOR = '[role="menuitem"]:not([disabled])'

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
      if (prevPhase && prevPhase !== 'closed' && !pointBloom) {
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
        preset: effectivePreset.value,
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
        preset: effectivePreset.value,
        onFinish: () => setPhase('closed'),
      })
    } else if (currentPhase === 'open') {
      panel.querySelector<HTMLElement>(ITEM_SELECTOR)?.focus()
    }
  },
)

watch([() => props.side, () => props.align, () => props.surface], () => {
  if (phase.value === 'open') {
    positionPanel()
  }
})

// Pull-to-close scrub when open
let cleanupScrub: (() => void) | null = null
watch(
  [() => phase.value === 'open', panelRef, effectivePreset],
  ([isOpenPhase, panel, currentPreset]) => {
    cleanupScrub?.()
    cleanupScrub = null
    if (!isOpenPhase || !panel) return

    const trigger = triggerEl.value
    if (!trigger) return
    cleanupScrub = attachCloseScrub(panel, trigger, currentPreset, () => setOpen(false))
  },
  { flush: 'post' },
)

// Keyboard navigation + type-ahead + shortcut keybinds + outside dismiss
let cleanupActiveListeners: (() => void) | null = null
watch(
  [isActive, panelRef],
  ([active, panel]) => {
    cleanupActiveListeners?.()
    cleanupActiveListeners = null
    if (!active || !panel) return

    let typed = ''
    let typedAt = 0

    const onPanelKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault()
        setOpen(false)
        return
      }

      const items = Array.from(panel.querySelectorAll<HTMLElement>(ITEM_SELECTOR))
      if (items.length === 0) return
      const index = items.indexOf(document.activeElement as HTMLElement)

      const bound = items.find((item) => {
        const shortcut = item.getAttribute('data-modo-shortcut')
        return shortcut !== null && matchesShortcut(event, shortcut)
      })
      if (bound) {
        event.preventDefault()
        bound.click()
        return
      }

      let next: HTMLElement | undefined
      if (event.key === 'ArrowDown') next = items[index + 1] ?? items[0]
      else if (event.key === 'ArrowUp') next = items[index - 1] ?? items[items.length - 1]
      else if (event.key === 'Home') next = items[0]
      else if (event.key === 'End') next = items[items.length - 1]
      else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
        const now = Date.now()
        typed = (now - typedAt < 500 ? typed : '') + event.key.toLowerCase()
        typedAt = now
        const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)]
        next = ordered.find((item) =>
          (item.textContent ?? '').trim().toLowerCase().startsWith(typed),
        )
      }

      if (next) {
        event.preventDefault()
        next.focus()
      }
    }

    const onDocKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (!isTopMorphLayer(panel)) return
      event.stopPropagation()
      event.preventDefault()
      setOpen(false)
    }

    const onDocPointerDown = (event: PointerEvent) => {
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

    panel.addEventListener('keydown', onPanelKeyDown)
    document.addEventListener('keydown', onDocKeyDown)
    document.addEventListener('pointerdown', onDocPointerDown)

    cleanupActiveListeners = () => {
      panel.removeEventListener('keydown', onPanelKeyDown)
      document.removeEventListener('keydown', onDocKeyDown)
      document.removeEventListener('pointerdown', onDocPointerDown)
    }
  },
  { flush: 'post' },
)

onBeforeUnmount(() => {
  cleanupScrub?.()
  cleanupActiveListeners?.()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      :id="menuId"
      ref="panelRef"
      v-bind="$attrs"
      role="menu"
      aria-orientation="vertical"
      :aria-labelledby="(!pointBloom && triggerId) || undefined"
      data-modo-menu=""
      :data-modo-surface="surface"
      data-modo-morph-layer=""
      :data-modo-theme="scopedTheme || undefined"
      :data-modo-phase="phase"
      :data-modo-point-bloom="pointBloom ? '' : undefined"
      class="modo-menu text-body"
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
