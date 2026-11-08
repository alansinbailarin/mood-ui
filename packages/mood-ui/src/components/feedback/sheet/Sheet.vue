<script setup lang="ts">
import '../../../utils/morph/morph-trigger.css'
import '../dialog/dialog.css'
import { computed, provide, ref, useId, watch } from 'vue'
import type { SheetProps } from '../../../interfaces/feedback/Sheet.interface'
import type { MorphPhase } from '../../../utils/morph/morphEngine'
import { SHEET_CONTEXT_KEY } from './SheetContext'

defineOptions({
  name: 'Sheet',
})

const props = withDefaults(defineProps<SheetProps>(), {
  open: undefined,
  modelValue: undefined,
  defaultOpen: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:modelValue': [value: boolean]
  openChange: [value: boolean]
}>()

const internalOpen = ref(props.defaultOpen)
const isControlled = computed(
  () => props.open !== undefined || props.modelValue !== undefined,
)

const isOpen = computed<boolean>(() => {
  if (props.open !== undefined) return props.open
  if (props.modelValue !== undefined) return props.modelValue
  return internalOpen.value
})

const phase = ref<MorphPhase>(isOpen.value ? 'open' : 'closed')
const triggerEl = ref<HTMLElement | null>(null)
const sheetId = `modo-sheet-${useId()}`

function setOpen(next: boolean) {
  if (!isControlled.value) {
    internalOpen.value = next
  }
  emit('update:open', next)
  emit('update:modelValue', next)
  emit('openChange', next)
}

function setPhase(next: MorphPhase) {
  phase.value = next
}

watch(
  [isOpen, phase],
  ([openVal, currentPhase]) => {
    if (openVal && (currentPhase === 'closed' || currentPhase === 'closing')) {
      phase.value = 'opening'
    } else if (!openVal && (currentPhase === 'open' || currentPhase === 'opening')) {
      phase.value = 'closing'
    }
  },
  { immediate: true },
)

provide(SHEET_CONTEXT_KEY, {
  open: isOpen,
  phase,
  setOpen,
  setPhase,
  triggerEl,
  color: computed(() => props.color),
  sheetId,
})
</script>

<template>
  <slot :open="isOpen" :phase="phase" :set-open="setOpen" />
</template>
