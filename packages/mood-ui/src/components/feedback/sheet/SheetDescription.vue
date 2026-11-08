<script setup lang="ts">
import Typography from '../../data-display/Typography.vue'
import { useSheetContext } from './SheetContext'

defineOptions({
  name: 'SheetDescription',
})

const { sheetId } = useSheetContext()
</script>

<template>
  <!-- Same supporting text as Modal's description. -->
  <Typography
    :id="`${sheetId}-description`"
    variant="body"
    size="small"
    color="muted"
    class="modo-sheet__description"
  >
    <slot />
  </Typography>
</template>
