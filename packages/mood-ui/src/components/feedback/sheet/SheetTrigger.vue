<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import Button from '../../forms/Button.vue'
import { useResolvedColor } from '../../../composables/useModoConfig'
import type { SheetTriggerProps } from '../../../interfaces/feedback/Sheet.interface'
import { useSheetContext } from './SheetContext'
import { isKeyboardActivation } from '../../../utils/morph/morphHelpers'

defineOptions({
  name: 'SheetTrigger',
})

const props = withDefaults(defineProps<SheetTriggerProps>(), {
  asChild: false,
  disabled: false,
})

const { open, phase, setOpen, triggerEl, sheetId, color } = useSheetContext()
const resolvedColor = useResolvedColor(() => props.color ?? color.value)
const rootRef = ref<HTMLElement | null>(null)

function setButtonRef(instance: Element | ComponentPublicInstance | null) {
  const el = instance && '$el' in instance ? instance.$el : instance
  rootRef.value = el instanceof HTMLElement ? el : null
}

function syncTriggerEl() {
  if (!rootRef.value) {
    triggerEl.value = null
    return
  }
  if (props.asChild && rootRef.value.firstElementChild instanceof HTMLElement) {
    triggerEl.value = rootRef.value.firstElementChild
  } else {
    triggerEl.value = rootRef.value
  }
}

watch(rootRef, syncTriggerEl, { immediate: true })

onBeforeUnmount(() => {
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
    class="modo-sheet-trigger contents"
    :aria-haspopup="'dialog'"
    :aria-expanded="open"
    :aria-controls="phase !== 'closed' ? sheetId : undefined"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    <slot :open="open" />
  </span>
  <Button
    v-else
    :id="`${sheetId}-trigger`"
    :ref="setButtonRef"
    :variant="variant"
    :color="resolvedColor"
    :size="size"
    :radius="radius"
    :icon="icon"
    :disabled="disabled"
    class="modo-sheet-trigger"
    aria-haspopup="dialog"
    :aria-expanded="open"
    :aria-controls="phase !== 'closed' ? sheetId : undefined"
    @click="handleClick"
  >
    <slot :open="open">{{ label }}</slot>
  </Button>
</template>
