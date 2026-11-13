<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import type { MorphSelectProps } from '../../../interfaces/forms/MorphSelect.interface'
import type { MorphPhase } from '../../../utils/morph/morphEngine'
import { useFieldState } from '../../../composables/useField'
import { useResolvedSize } from '../../../composables/useModoConfig'
import { selectKey } from './MorphSelectContext'
import './morph-select.css'
defineOptions({ name: 'MorphSelect' })
const props = withDefaults(defineProps<MorphSelectProps>(), {
  modelValue: undefined, defaultValue: undefined, multiple: false, color: 'default', disabled: false, readonly: false, required: false, invalid: false, fullWidth: true,
})
const emit = defineEmits<{ 'update:modelValue': [value: string | string[]]; change: [value: string | string[]]; openChange: [value: boolean] }>()
const { fieldId, radius, stateColor, hasError, isDisabled, errorId, helperId, describedBy } = useFieldState(props, { componentName: 'MorphSelect', idPrefix: 'modo-morph-select' })
const size = useResolvedSize(() => props.size)
const multiple = computed(() => props.multiple)
// `defaultValue` normalised to the mode: `''` single, `[]` multiple.
function initial(): string | string[] {
  const d = props.defaultValue
  if (props.multiple) return Array.isArray(d) ? [...d] : d ? [d] : []
  return Array.isArray(d) ? (d[0] ?? '') : (d ?? '')
}
const internal = ref<string | string[]>(initial())
const value = computed(() => props.modelValue ?? internal.value)
const values = computed<string[]>(() => Array.isArray(value.value) ? value.value : value.value ? [value.value] : [])
function isSelected(option: string) { return values.value.includes(option) }
const selectedOptions = computed(() => props.options.filter(option => isSelected(option.value)))
const open = ref(false), phase = ref<MorphPhase>('closed')
const trigger = ref<HTMLElement | null>(null), button = ref<HTMLButtonElement | null>(null)
const restoreFocus = ref(true)
const hidden = ref<HTMLInputElement | null>(null)
function setOpen(next: boolean, restore = true) {
  if (next && (isDisabled.value || props.readonly)) return
  restoreFocus.value = restore; open.value = next
  phase.value = next ? 'opening' : phase.value === 'closed' ? 'closed' : 'closing'
  emit('openChange', next)
}
function select(next: string) {
  if (isDisabled.value || props.readonly || !props.options.some(option => option.value === next && !option.disabled)) return
  if (props.multiple) {
    // Toggle and keep the panel open; the order follows the options.
    const picked = new Set(values.value)
    if (picked.has(next)) picked.delete(next)
    else picked.add(next)
    const result = props.options.map(option => option.value).filter(v => picked.has(v))
    internal.value = result; emit('update:modelValue', result); emit('change', result)
    return
  }
  internal.value = next; emit('update:modelValue', next); emit('change', next); setOpen(false)
}
watch(isDisabled, disabled => { if (disabled) setOpen(false, false) })
let form: HTMLFormElement | null = null
function reset() { internal.value = initial(); emit('update:modelValue', internal.value); setOpen(false, false) }
onMounted(() => { form = hidden.value?.form ?? null; form?.addEventListener('reset', reset) })
onBeforeUnmount(() => form?.removeEventListener('reset', reset))
provide(selectKey, {
  fieldId, options: computed(() => props.options), value, multiple, selectedOptions, isSelected,
  disabled: isDisabled, readonly: computed(() => props.readonly), required: computed(() => props.required),
  label: computed(() => props.label), ariaLabel: computed(() => props.ariaLabel),
  helperText: computed(() => props.helperText), errorText: computed(() => props.errorText),
  hasError, stateColor, radius, size, halo: computed(() => props.halo), fullWidth: computed(() => props.fullWidth),
  errorId, helperId, describedBy,
  phase, open, trigger, button, setOpen, select, restoreFocus,
})
</script>
<template>
  <template v-if="multiple">
    <!-- Unnamed anchor: only used to find the parent form (reset). -->
    <input ref="hidden" type="hidden" disabled />
    <input v-for="v in values" :key="v" type="hidden" :name="name" :value="v" :disabled="isDisabled" />
  </template>
  <input v-else ref="hidden" type="hidden" :name="name" :value="value" :disabled="isDisabled" />
  <slot :value="value" :open="open" />
</template>
