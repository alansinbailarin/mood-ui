<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import Button from '../../forms/Button.vue'
import { useModoLocale } from '../../../composables/useModoConfig'
import type { PopoverCloseProps } from '../../../interfaces/layout/Popover.interface'
import { usePopoverContext } from './PopoverContext'

defineOptions({
  name: 'PopoverClose',
})

withDefaults(defineProps<PopoverCloseProps>(), {
  asChild: false,
  variant: 'text',
})

const { setOpen, color, radius } = usePopoverContext()
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
    v-else-if="$slots.default"
    :variant="variant"
    :color="color"
    size="small"
    :radius="radius"
    @click="handleClick"
  >
    <slot :close="() => setOpen(false)" />
  </Button>
  <Button
    v-else
    :variant="variant"
    :color="color"
    size="small"
    :radius="radius"
    :icon="XMarkIcon"
    :aria-label="loc.common.close"
    @click="handleClick"
  />
</template>
