<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import Button from '../../forms/Button.vue'
import { useResolvedColor } from '../../../composables/useModoConfig'
import type { DialogTriggerProps } from '../../../interfaces/feedback/Dialog.interface'
import { useDialogContext } from './DialogContext'
import { isKeyboardActivation } from '../../../utils/morph/morphHelpers'

defineOptions({
  name: 'DialogTrigger',
})

const props = withDefaults(defineProps<DialogTriggerProps>(), {
  asChild: false,
  disabled: false,
})

const { open, phase, setOpen, triggerEl, dialogId, color } = useDialogContext()
const resolvedColor = useResolvedColor(() => props.color ?? color.value)
const rootRef = ref<HTMLElement | null>(null)
const landed = ref(false)
let landedTimer: ReturnType<typeof setTimeout> | null = null

function setButtonRef(instance: Element | ComponentPublicInstance | null) {
  const el = instance && '$el' in instance ? instance.$el : instance
  rootRef.value = el instanceof HTMLElement ? el : null
}

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
  if (!rootRef.value) {
    triggerEl.value = null
    return
  }
  if (props.asChild && rootRef.value.firstElementChild instanceof HTMLElement) {
    const child = rootRef.value.firstElementChild
    child.classList.add('modo-morph-trigger')
    if (morphOrigin.value) {
      child.setAttribute('data-modo-morph-origin', morphOrigin.value)
    } else {
      child.removeAttribute('data-modo-morph-origin')
    }
    triggerEl.value = child
  } else {
    triggerEl.value = rootRef.value
  }
}

watch([rootRef, morphOrigin], syncTriggerEl, { immediate: true, flush: 'post' })

onBeforeUnmount(() => {
  if (landedTimer) clearTimeout(landedTimer)
  triggerEl.value = null
})

function handleClick(event: MouseEvent) {
  if (event.defaultPrevented) return
  syncTriggerEl()
  setOpen(!open.value)
}

// asChild with a non-native element (a `<span role="button">`): Enter/Space
// don't become a click, so open by hand. Native buttons keep their own click.
function handleKeyDown(event: KeyboardEvent) {
  if (!isKeyboardActivation(event)) return
  event.preventDefault()
  syncTriggerEl()
  setOpen(!open.value)
}
</script>

<template>
  <span
    v-if="asChild"
    ref="rootRef"
    class="contents"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    <slot :open="open" />
  </span>
  <Button
    v-else
    :id="`${dialogId}-trigger`"
    :ref="setButtonRef"
    :variant="variant"
    :color="resolvedColor"
    :size="size"
    :radius="radius"
    :icon="icon"
    :disabled="disabled"
    class="modo-morph-trigger"
    aria-haspopup="dialog"
    :aria-expanded="open"
    :aria-controls="phase !== 'closed' ? dialogId : undefined"
    :data-modo-morph-origin="morphOrigin"
    @click="handleClick"
  >
    <span class="modo-morph-trigger__content">
      <slot :open="open">{{ label }}</slot>
    </span>
  </Button>
</template>
