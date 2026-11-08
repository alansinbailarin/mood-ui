<script setup lang="ts">
import Typography from '../../data-display/Typography.vue'
import { useDialogContext } from './DialogContext'

defineOptions({
  name: 'DialogDescription',
})

const { dialogId } = useDialogContext()
</script>

<template>
  <!-- Same supporting text as Modal's description. -->
  <Typography
    :id="`${dialogId}-description`"
    variant="body"
    size="small"
    color="muted"
    class="modo-dialog__description"
  >
    <slot />
  </Typography>
</template>
