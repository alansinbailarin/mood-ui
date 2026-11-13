<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import type { MorphSelectTriggerProps } from '../../../interfaces/forms/MorphSelect.interface'
import { FIELD_AFFORDANCE_ICON_BY_COLOR, useFieldClasses } from '../../../composables/useField'
import { useModoLocale, useSizeTokens } from '../../../composables/useModoConfig'
import RenderContent from '../../../utils/RenderContent'
import Typography from '../../data-display/Typography.vue'
import { useMorphSelect } from './MorphSelectContext'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<MorphSelectTriggerProps>(), { variant: 'outline' })
const {
  fieldId, multiple, selectedOptions, disabled, readonly, required, label, ariaLabel, helperText, errorText, hasError, stateColor,
  radius, size, halo, fullWidth, errorId, helperId, describedBy, phase, open, trigger, button, setOpen,
} = useMorphSelect()
const loc = useModoLocale()
const sz = useSizeTokens(() => size.value)
const { wrapperVariantClasses, radiusClasses } = useFieldClasses({ variant: () => props.variant, stateColor, hasError, radius, halo })
const affordanceIconClass = computed(() => FIELD_AFFORDANCE_ICON_BY_COLOR[stateColor.value] ?? 'text-muted-foreground')

const landed = ref(false)
let landedTimer: ReturnType<typeof setTimeout> | undefined
watch(phase, (next, previous) => {
  if (previous === 'closing' && next === 'closed') {
    landed.value = true; clearTimeout(landedTimer)
    landedTimer = setTimeout(() => { landed.value = false }, 500)
  }
})
onBeforeUnmount(() => clearTimeout(landedTimer))
const selected = computed(() => selectedOptions.value[0])
// Multiple: the selected labels joined, in option order.
const summary = computed(() => selectedOptions.value.map(option => option.textValue ?? String(option.label)).join(', '))
const hasValue = computed(() => selectedOptions.value.length > 0)
function key(event: KeyboardEvent) { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true) } }
</script>
<template>
  <div :class="['modo-morph-select flex flex-col gap-1.5', fullWidth ? 'w-full' : 'inline-flex']" data-modo-morph-select="" :data-modo-size="size" :data-modo-radius="radius" :data-modo-variant="variant">
    <label v-if="label" :for="fieldId" class="modo-morph-select__label text-caption font-medium text-foreground">
      {{ label }}
      <span v-if="required" aria-hidden="true" class="text-destructive ml-0.5">*</span>
    </label>
    <div ref="trigger"
      :class="['modo-morph-select__field modo-field-wrapper', wrapperVariantClasses, radiusClasses, sz.control, disabled ? 'opacity-60 cursor-not-allowed' : '']"
      :data-modo-morph-origin="phase === 'closed' ? (landed ? 'landed' : undefined) : phase === 'closing' ? 'closing' : 'hidden'">
      <button :id="fieldId" ref="button" v-bind="$attrs" type="button" role="combobox" aria-haspopup="listbox"
        :class="['modo-morph-select__button flex h-full w-full items-center gap-2 text-left outline-none', sz.padX, sz.text, disabled ? 'cursor-not-allowed' : readonly ? 'cursor-default' : 'cursor-pointer']"
        :aria-expanded="open" :aria-controls="phase !== 'closed' ? `${fieldId}-listbox` : undefined"
        :aria-label="!label ? ariaLabel : undefined" :aria-describedby="describedBy" :aria-invalid="hasError || undefined"
        :aria-required="required || undefined" :aria-readonly="readonly || undefined" :disabled="disabled" @keydown="key" @click="setOpen(!open)">
        <span v-if="$slots.icon || icon" :class="['modo-morph-select__icon inline-flex shrink-0 items-center', affordanceIconClass]" aria-hidden="true">
          <slot name="icon"><component :is="icon" :class="sz.icon" /></slot>
        </span>
        <span :class="['modo-morph-select__value min-w-0 flex-1 truncate', hasValue ? 'text-foreground' : 'text-muted-foreground']" :data-modo-placeholder="hasValue ? undefined : ''">
          <slot :option="selected" :options="selectedOptions">
            <template v-if="multiple && hasValue">{{ summary }}</template>
            <RenderContent v-else :content="selected?.label ?? placeholder ?? loc.morphSelect.placeholder" />
          </slot>
        </span>
        <ChevronDownIcon class="modo-morph-select__chevron" aria-hidden="true" :class="['shrink-0 transition-transform duration-base ease-standard', affordanceIconClass, sz.icon, open ? 'rotate-180' : '']" />
      </button>
    </div>
    <Typography v-if="hasError && errorText" :id="errorId" variant="caption" size="medium" color="danger" as="p">{{ errorText }}</Typography>
    <Typography v-else-if="helperText" :id="helperId" variant="caption" size="medium" color="muted" as="p">{{ helperText }}</Typography>
  </div>
</template>
