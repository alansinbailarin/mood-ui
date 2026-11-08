<script setup lang="ts">
import '../../../utils/morph/morph-trigger.css'
import './menu.css'
import { computed, provide, ref, useId, watch } from 'vue'
import type { MenuProps } from '../../../interfaces/navigation/Menu.interface'
import { MENU_PRESET } from '../../../utils/morph/morphEngine'
import type { MorphPhase } from '../../../utils/morph/morphEngine'
import {
  useResolvedColor,
  useResolvedRadius,
  useResolvedSize,
} from '../../../composables/useModoConfig'
import { MENU_CONTEXT_KEY } from './MenuContext'

defineOptions({
  name: 'Menu',
})

const props = withDefaults(defineProps<MenuProps>(), {
  open: undefined,
  modelValue: undefined,
  defaultOpen: false,
  color: 'default',
  radius: undefined,
  size: undefined,
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
const menuId = `modo-menu-${useId()}`
const triggerId = ref<string | undefined>(undefined)

const color = useResolvedColor(() => props.color)
const itemColor = computed(() => props.color ?? 'default')
const radius = useResolvedRadius(() => props.radius)
const size = useResolvedSize(() => props.size)

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

provide(MENU_CONTEXT_KEY, {
  open: isOpen,
  phase,
  setOpen,
  setPhase,
  triggerEl,
  triggerId,
  menuId,
  preset: MENU_PRESET,
  pointBloom: false,
  color,
  itemColor,
  radius,
  size,
})
</script>

<template>
  <slot :open="isOpen" :phase="phase" :set-open="setOpen" />
</template>
