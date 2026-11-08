<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import Button from '../../forms/Button.vue'
import type { MenuTriggerProps } from '../../../interfaces/navigation/Menu.interface'
import { useMenuContext } from './MenuContext'

defineOptions({
  name: 'MenuTrigger',
})

const props = withDefaults(defineProps<MenuTriggerProps>(), {
  asChild: false,
  variant: 'outline',
  disabled: false,
})

const { open, phase, setOpen, triggerEl, triggerId, menuId, color, radius, size } =
  useMenuContext()
const rootRef = ref<HTMLElement | null>(null)
const landed = ref(false)
let landedTimer: ReturnType<typeof setTimeout> | null = null

const ownTriggerId = `${menuId}-trigger`

// Same neutral outline look as the native DropdownMenu trigger: the provider
// color only shows through on `danger` or the filled variants.
const neutralOutlineClass = computed(() =>
  props.variant === 'outline' && color.value !== 'danger'
    ? 'bg-card !border-border !text-foreground hover:!bg-card active:!bg-accent focus-visible:!ring-ring'
    : '',
)

watch(phase, (next, prev) => {
  if (prev === 'closing' && next === 'closed') {
    landed.value = true
    if (landedTimer) clearTimeout(landedTimer)
    landedTimer = setTimeout(() => {
      landed.value = false
    }, 500)
  }
})

const morphOrigin = computed(() => {
  if (phase.value === 'closing') return 'closing'
  if (phase.value !== 'closed') return 'hidden'
  if (landed.value) return 'landed'
  return undefined
})

function syncTriggerEl() {
  // The watcher is immediate, so it also runs during SSR where there is no DOM.
  if (typeof HTMLElement === 'undefined') return
  const child = rootRef.value?.firstElementChild
  if (!(child instanceof HTMLElement)) {
    triggerEl.value = null
    triggerId.value = undefined
    return
  }
  if (props.asChild) {
    // The slotted element is owned by the consumer: decorate it in place so
    // it carries the morph choreography and the ARIA wiring of a trigger.
    child.classList.add('modo-morph-trigger')
    if (morphOrigin.value) {
      child.setAttribute('data-modo-morph-origin', morphOrigin.value)
    } else {
      child.removeAttribute('data-modo-morph-origin')
    }
    if (!child.id) child.id = ownTriggerId
    child.setAttribute('aria-haspopup', 'menu')
    child.setAttribute('aria-expanded', String(open.value))
    if (phase.value !== 'closed') child.setAttribute('aria-controls', menuId)
    else child.removeAttribute('aria-controls')
  }
  triggerEl.value = child
  triggerId.value = child.id || undefined
}

watch([rootRef, morphOrigin, open, () => props.asChild], syncTriggerEl, {
  immediate: true,
  flush: 'post',
})

onBeforeUnmount(() => {
  if (landedTimer) clearTimeout(landedTimer)
  triggerEl.value = null
  triggerId.value = undefined
})

function handleClick(event: MouseEvent) {
  if (event.defaultPrevented) return
  syncTriggerEl()
  setOpen(!open.value)
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    syncTriggerEl()
    setOpen(true)
  }
}
</script>

<template>
  <span
    ref="rootRef"
    class="contents"
    @click="asChild && handleClick($event)"
    @keydown="asChild && handleKeyDown($event)"
  >
    <slot v-if="asChild" :open="open" />
    <Button
      v-else
      :id="ownTriggerId"
      :variant="variant"
      :color="color"
      :size="size"
      :radius="radius"
      :disabled="disabled"
      :class="['modo-morph-trigger', neutralOutlineClass]"
      aria-haspopup="menu"
      :aria-expanded="open"
      :aria-controls="phase !== 'closed' ? menuId : undefined"
      :data-modo-morph-origin="morphOrigin"
      @click="handleClick"
      @keydown="handleKeyDown"
    >
      <span class="modo-morph-trigger__content">
        <slot :open="open" />
      </span>
    </Button>
  </span>
</template>
