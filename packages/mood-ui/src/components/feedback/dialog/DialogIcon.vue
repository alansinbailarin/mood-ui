<script setup lang="ts">
import { computed } from 'vue'
import type { DialogIconProps } from '../../../interfaces/feedback/Dialog.interface'
import type { ModoColor, ModoRadius, ModoSize } from '../../../config/ModoConfig'
import {
  useResolvedColor,
  useResolvedRadius,
  useResolvedSize,
} from '../../../composables/useModoConfig'
import { useOverlayScope } from './overlayScope'

defineOptions({
  name: 'DialogIcon',
})

const props = defineProps<DialogIconProps>()

const scope = useOverlayScope()
const resolvedColor = useResolvedColor(() => props.color ?? scope?.color.value)
const resolvedSize = useResolvedSize(() => props.size ?? scope?.size.value)
const resolvedRadius = useResolvedRadius(() => props.radius ?? scope?.radius())

// Same subtle fills as Badge `variant="subtle"`.
const COLOR_CLASSES: Record<ModoColor, string> = {
  default: 'bg-muted text-foreground',
  primary: 'bg-primary-subtle text-primary',
  danger: 'bg-destructive-subtle text-destructive',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
}

// Tile follows the control heights (32/36/40/48); the glyph the icon tokens.
const SIZE_CLASSES: Record<ModoSize, string> = {
  xsmall: 'h-8 w-8 [&>svg]:h-4 [&>svg]:w-4',
  small: 'h-9 w-9 [&>svg]:h-[18px] [&>svg]:w-[18px]',
  medium: 'h-10 w-10 [&>svg]:h-5 [&>svg]:w-5',
  large: 'h-12 w-12 [&>svg]:h-6 [&>svg]:w-6',
}

// Same steps as Button so the tile and the actions share corners.
const RADIUS_CLASSES: Record<ModoRadius, string> = {
  none: 'rounded-none',
  small: 'rounded-sm',
  medium: 'rounded-md',
  large: 'rounded-lg',
  full: 'rounded-full',
}

const classes = computed(() => [
  'modo-dialog__icon inline-flex shrink-0 items-center justify-center mb-3',
  COLOR_CLASSES[resolvedColor.value],
  SIZE_CLASSES[resolvedSize.value],
  RADIUS_CLASSES[resolvedRadius.value],
])
</script>

<template>
  <div
    aria-hidden="true"
    :data-modo-color="resolvedColor"
    :class="classes"
  >
    <slot />
  </div>
</template>
