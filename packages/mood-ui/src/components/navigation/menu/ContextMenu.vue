<script setup lang="ts">
import './menu.css'
import { computed, provide, ref, useId, watch } from 'vue'
import type { ContextMenuProps } from '../../../interfaces/navigation/Menu.interface'
import { CONTEXT_PRESET } from '../../../utils/morph/morphEngine'
import type { MorphPhase } from '../../../utils/morph/morphEngine'
import {
  useResolvedColor,
  useResolvedRadius,
  useResolvedSize,
} from '../../../composables/useModoConfig'
import { CONTEXT_MENU_POINT_KEY, MENU_CONTEXT_KEY } from './MenuContext'

defineOptions({
  name: 'ContextMenu',
})

const props = withDefaults(defineProps<ContextMenuProps>(), {
  open: undefined,
  modelValue: undefined,
  color: 'default',
  radius: undefined,
  size: undefined,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:modelValue': [value: boolean]
  openChange: [value: boolean]
}>()

const internalOpen = ref(false)
const isControlled = computed(
  () => props.open !== undefined || props.modelValue !== undefined,
)

const isOpen = computed<boolean>(() => {
  if (props.open !== undefined) return props.open
  if (props.modelValue !== undefined) return props.modelValue
  return internalOpen.value
})

const phase = ref<MorphPhase>('closed')
const point = ref({ x: 0, y: 0 })
const anchorRef = ref<HTMLElement | null>(null)
const menuId = `modo-context-menu-${useId()}`
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

function setPoint(nextPoint: { x: number; y: number }) {
  point.value = nextPoint
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
  triggerEl: anchorRef,
  triggerId,
  menuId,
  preset: CONTEXT_PRESET,
  pointBloom: true,
  color,
  itemColor,
  radius,
  size,
})

provide(CONTEXT_MENU_POINT_KEY, setPoint)
</script>

<template>
  <Teleport to="body">
    <span
      v-if="phase !== 'closed'"
      ref="anchorRef"
      aria-hidden="true"
      data-modo-context-anchor=""
      :style="{
        position: 'fixed',
        left: `${point.x - 12}px`,
        top: `${point.y - 12}px`,
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 99999,
      }"
    />
  </Teleport>
  <slot :open="isOpen" :phase="phase" :set-open="setOpen" />
</template>
