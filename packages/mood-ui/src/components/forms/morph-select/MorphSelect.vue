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
  modelValue: undefined, defaultValue: '', color: 'default', disabled: false, readonly: false, required: false, invalid: false, fullWidth: true,
})
const emit = defineEmits<{ 'update:modelValue': [value: string]; change: [value: string]; openChange: [value: boolean] }>()
const { fieldId, radius, stateColor, hasError, isDisabled, errorId, helperId, describedBy } = useFieldState(props, { componentName: 'MorphSelect', idPrefix: 'modo-morph-select' })
const size = useResolvedSize(() => props.size)
const internal = ref(props.defaultValue)
const value = computed(() => props.modelValue ?? internal.value)
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
  internal.value = next; emit('update:modelValue', next); emit('change', next); setOpen(false)
}
watch(isDisabled, disabled => { if (disabled) setOpen(false, false) })
let form: HTMLFormElement | null = null
function reset() { internal.value = props.defaultValue; emit('update:modelValue', props.defaultValue); setOpen(false, false) }
onMounted(() => { form = hidden.value?.form ?? null; form?.addEventListener('reset', reset) })
onBeforeUnmount(() => form?.removeEventListener('reset', reset))
provide(selectKey, {
  fieldId, options: computed(() => props.options), value,
  disabled: isDisabled, readonly: computed(() => props.readonly), required: computed(() => props.required),
  label: computed(() => props.label), ariaLabel: computed(() => props.ariaLabel),
  helperText: computed(() => props.helperText), errorText: computed(() => props.errorText),
  hasError, stateColor, radius, size, halo: computed(() => props.halo), fullWidth: computed(() => props.fullWidth),
  errorId, helperId, describedBy,
  phase, open, trigger, button, setOpen, select, restoreFocus,
})
</script>
<template><input ref="hidden" type="hidden" :name="name" :value="value" :disabled="isDisabled" /><slot :value="value" :open="open" /></template>
