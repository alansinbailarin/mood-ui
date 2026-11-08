<script setup lang="ts">
defineOptions({
  name: 'DialogBody',
})

function handleScroll(event: Event) {
  const el = event.currentTarget as HTMLElement | null
  if (!el) return
  el.toggleAttribute('data-modo-scrolled', el.scrollTop > 4)
}
</script>

<template>
  <div class="modo-dialog__body" @scroll="handleScroll">
    <div aria-hidden="true" class="modo-dialog__fog" />
    <slot />
  </div>
</template>
