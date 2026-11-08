<script setup lang="ts">
import Typography from '../../data-display/Typography.vue'
import { useDialogContext } from './DialogContext'

defineOptions({
  name: 'DialogTitle',
})

const { dialogId } = useDialogContext()
</script>

<template>
  <!-- Same heading as Modal's title. -->
  <Typography
    :id="`${dialogId}-title`"
    variant="title"
    size="medium"
    as="h2"
    weight="semibold"
    class="modo-dialog__title"
  >
    <slot />
  </Typography>
</template>
