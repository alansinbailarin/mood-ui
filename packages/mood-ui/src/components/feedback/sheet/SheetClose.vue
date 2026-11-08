<script setup lang="ts">
import Button from '../../forms/Button.vue'
import { useModoLocale, useResolvedColor } from '../../../composables/useModoConfig'
import type { SheetCloseProps } from '../../../interfaces/feedback/Sheet.interface'
import { useSheetContext } from './SheetContext'
import { useOverlayScope } from '../dialog/overlayScope'

defineOptions({
  name: 'SheetClose',
})

const props = withDefaults(defineProps<SheetCloseProps>(), {
  asChild: false,
  variant: 'outline',
  disabled: false,
})

const { setOpen, color } = useSheetContext()
const scope = useOverlayScope()
const resolvedColor = useResolvedColor(() => props.color ?? scope?.color.value ?? color.value)
const loc = useModoLocale()

function handleClick(event: MouseEvent) {
  if (event.defaultPrevented) return
  setOpen(false)
}
</script>

<template>
  <span
    v-if="asChild"
    class="contents"
    @click="handleClick"
  >
    <slot :close="() => setOpen(false)" />
  </span>
  <Button
    v-else
    :variant="variant"
    :color="resolvedColor"
    :size="size"
    :radius="radius ?? scope?.radius()"
    :icon="icon"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot :close="() => setOpen(false)">{{ label ?? loc.common.close }}</slot>
  </Button>
</template>
