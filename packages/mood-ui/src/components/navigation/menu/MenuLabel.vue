<script setup lang="ts">
defineOptions({
  name: 'MenuLabel',
})
</script>

<template>
  <div
    role="presentation"
    data-modo-menu-label=""
    class="modo-menu-label px-3 pt-2 pb-1 text-caption font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap select-none"
  >
    <slot />
  </div>
</template>
