<script setup lang="ts">
defineOptions({
  name: 'SheetBody',
})

function handleScroll(event: Event) {
  const el = event.currentTarget as HTMLElement | null
  if (!el) return
  el.toggleAttribute('data-modo-scrolled', el.scrollTop > 4)
}
</script>

<template>
  <div class="modo-sheet__body" @scroll="handleScroll">
    <div aria-hidden="true" class="modo-sheet__fog" />
    <slot />
  </div>
</template>
