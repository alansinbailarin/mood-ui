<script setup lang="ts">
import Typography from '../../data-display/Typography.vue'
import { useSheetContext } from './SheetContext'

defineOptions({
  name: 'SheetTitle',
})

const { sheetId } = useSheetContext()
</script>

<template>
  <!-- Same heading as Modal's title. -->
  <Typography
    :id="`${sheetId}-title`"
    variant="title"
    size="medium"
    as="h2"
    weight="semibold"
    class="modo-sheet__title"
  >
    <slot />
  </Typography>
</template>
