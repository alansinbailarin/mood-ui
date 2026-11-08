<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useAttrs } from 'vue'
import type { GlassSwitchProps } from '../../../interfaces/forms/GlassSwitch.interface'
import { useFieldState } from '../../../composables/useField'
import { useResolvedRadius, useResolvedSize } from '../../../composables/useModoConfig'
import Typography from '../../data-display/Typography.vue'
import './glass-switch.css'

defineOptions({ name: 'GlassSwitch', inheritAttrs: false })
const props = withDefaults(defineProps<GlassSwitchProps>(), {
  modelValue: undefined,
  defaultChecked: false,
  color: 'default',
  labelPosition: 'right',
  disabled: false,
  readonly: false,
  required: false,
  loading: false,
  fullWidth: false,
  value: 'on',
})
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; change: [value: boolean] }>()
const attrs = useAttrs()
// class/style lay out the field; every other attribute lands on the real input.
const inputAttrs = computed(() => { const { class: _c, style: _s, ...rest } = attrs; return rest })

const { fieldId, stateColor, hasError, isDisabled, errorId, helperId, describedBy } = useFieldState(props, {
  componentName: 'GlassSwitch',
  idPrefix: 'modo-glass-switch',
})

const size = useResolvedSize(() => props.size)
// Track radius (default pill), same steps as the native Switch track. The thumb stays round.
const resolvedRadius = useResolvedRadius(() => props.radius ?? 'full')
const trackRadiusClass = computed(() => {
  switch (resolvedRadius.value) {
    case 'none': return 'rounded-none'
    case 'small': return 'rounded-sm'
    case 'medium': return 'rounded-md'
    case 'large': return 'rounded-lg'
    case 'full':
    default: return 'rounded-full'
  }
})
const labelSizeClass = computed(() => {
  switch (size.value) {
    case 'xsmall':
    case 'small': return 'text-caption'
    case 'large': return 'text-body-lg'
    case 'medium':
    default: return 'text-body'
  }
})

const CHECKED_BG_BY_COLOR: Record<string, string> = {
  default: 'bg-foreground',
  primary: 'bg-primary',
  danger: 'bg-destructive',
  success: 'bg-success',
  warning: 'bg-warning',
}
const fillClass = computed(() => CHECKED_BG_BY_COLOR[stateColor.value] ?? 'bg-foreground')
const trackStateClass = computed(() => (hasError.value ? 'bg-destructive/20' : 'bg-input group-hover:bg-muted'))

const internal = ref(props.defaultChecked)
const checked = computed(() => props.modelValue ?? internal.value)
const descriptionId = computed(() => `${fieldId.value}-description`)
const ariaDescribedBy = computed(() => {
  const ids = [props.description ? descriptionId.value : '', describedBy.value, attrs['aria-describedby'] as string | undefined]
  return ids.filter(Boolean).join(' ') || undefined
})
const isLocked = computed(() => isDisabled.value || props.readonly)

const input = ref<HTMLInputElement | null>(null)
const track = ref<HTMLElement | null>(null)
let stopDrag: (() => void) | undefined
let suppressUntil = 0
let resetForm: HTMLFormElement | null = null

function change(event: Event) {
  const target = event.target as HTMLInputElement
  if (props.readonly) { target.checked = checked.value; return }
  internal.value = target.checked
  emit('update:modelValue', target.checked)
  emit('change', target.checked)
  // Controlled consumers remain the source of truth.
  if (props.modelValue !== undefined) target.checked = checked.value
}
function reset() { internal.value = props.defaultChecked; emit('update:modelValue', props.defaultChecked) }
onMounted(() => { resetForm = input.value?.form ?? null; resetForm?.addEventListener('reset', reset) })
function click(event: MouseEvent) {
  if (Date.now() < suppressUntil) { event.preventDefault(); event.stopPropagation(); suppressUntil = 0 }
}
function start(event: PointerEvent) {
  const el = input.value, rail = track.value
  if (!el || !rail || isLocked.value || event.button > 0) return
  stopDrag?.()
  suppressUntil = 0
  const thumb = rail.querySelector<HTMLElement>('.modo-glass-switch__thumb')!
  const fill = rail.querySelector<HTMLElement>('.modo-glass-switch__fill')!
  const travel = Math.max(1, rail.clientWidth - thumb.offsetWidth - thumb.offsetLeft * 2)
  const from = checked.value ? 1 : 0
  const startX = event.clientX
  let progress = from, moved = false
  const move = (e: PointerEvent) => {
    if (e.pointerId !== event.pointerId) return
    const dx = e.clientX - startX
    if (Math.abs(dx) > 4) moved = true
    if (!moved) return
    progress = Math.min(1, Math.max(0, from + dx / travel))
    rail.setAttribute('data-modo-dragging', '')
    thumb.style.transform = `translateX(${progress * travel}px)`
    fill.style.opacity = String(progress)
  }
  const clean = () => {
    document.removeEventListener('pointermove', move)
    document.removeEventListener('pointerup', end)
    document.removeEventListener('pointercancel', end)
    rail.removeAttribute('data-modo-dragging')
    thumb.style.transform = ''; fill.style.opacity = ''
    stopDrag = undefined
  }
  const end = (e: PointerEvent) => {
    if (e.pointerId !== event.pointerId) return
    clean()
    if (!moved) return
    if (e.type !== 'pointercancel' && !isLocked.value && (progress > .5) !== checked.value) el.click()
    suppressUntil = Date.now() + 350
  }
  document.addEventListener('pointermove', move, { passive: true })
  document.addEventListener('pointerup', end)
  document.addEventListener('pointercancel', end)
  stopDrag = clean
}
onBeforeUnmount(() => { stopDrag?.(); resetForm?.removeEventListener('reset', reset) })
defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <div :class="['flex flex-col gap-1', fullWidth ? 'w-full' : 'inline-flex', attrs.class]" :style="attrs.style as any">
    <label
      :for="fieldId"
      :data-modo-size="size"
      :class="[
        'modo-glass-switch group inline-flex items-start gap-2.5 select-none',
        labelPosition === 'left' ? 'flex-row-reverse justify-end' : '',
        isDisabled ? 'opacity-60 cursor-not-allowed' : readonly ? 'cursor-default' : 'cursor-pointer',
      ]"
      @click.capture="click"
    >
      <input
        v-bind="inputAttrs"
        :id="fieldId"
        ref="input"
        class="modo-glass-switch__input peer sr-only"
        type="checkbox"
        role="switch"
        :checked="checked"
        :disabled="isDisabled"
        :readonly="readonly"
        :required="required"
        :name="name"
        :value="value"
        :aria-label="!label ? ariaLabel : undefined"
        :aria-invalid="hasError || undefined"
        :aria-readonly="readonly || undefined"
        :aria-describedby="ariaDescribedBy"
        @change="change"
      />
      <span
        ref="track"
        aria-hidden="true"
        :class="[
          'modo-glass-switch__track mt-0.5 ring-4 ring-border/25',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-ring/60',
          trackRadiusClass,
          trackStateClass,
        ]"
        @pointerdown="start"
      >
        <span :class="['modo-glass-switch__fill', fillClass]" /><span class="modo-glass-switch__thumb" />
      </span>
      <span v-if="label || description" class="flex flex-col gap-0.5">
        <span v-if="label" :class="['font-medium text-foreground', labelSizeClass]">
          {{ label }}
          <span v-if="required" aria-hidden="true" class="text-destructive ml-0.5">*</span>
        </span>
        <span v-if="description" :id="descriptionId" class="text-caption text-muted-foreground">{{ description }}</span>
      </span>
    </label>

    <Typography v-if="hasError && errorText" :id="errorId" variant="caption" size="medium" color="danger" as="p" role="alert">
      {{ errorText }}
    </Typography>
    <Typography v-else-if="helperText" :id="helperId" variant="caption" size="medium" color="muted" as="p">
      {{ helperText }}
    </Typography>
  </div>
</template>
