<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useContextMenuPoint, useMenuContext } from './MenuContext'

defineOptions({
  name: 'ContextMenuTrigger',
})

const LONG_PRESS_MS = 500
const CANCEL_DISTANCE = 10

const { setOpen } = useMenuContext()
const setPoint = useContextMenuPoint()

let pressState: {
  timer: ReturnType<typeof setTimeout>
  x: number
  y: number
} | null = null

function openAt(x: number, y: number) {
  setPoint({ x, y })
  setOpen(true)
}

function clearPress() {
  if (pressState) {
    clearTimeout(pressState.timer)
    pressState = null
  }
}

function handleContextMenu(event: MouseEvent) {
  event.preventDefault()
  openAt(event.clientX, event.clientY)
}

function handlePointerDown(event: PointerEvent) {
  if (event.pointerType !== 'touch') return
  const { clientX, clientY } = event
  clearPress()
  pressState = {
    x: clientX,
    y: clientY,
    timer: setTimeout(() => {
      pressState = null
      openAt(clientX, clientY)
    }, LONG_PRESS_MS),
  }
}

function handlePointerMove(event: PointerEvent) {
  if (!pressState) return
  if (
    Math.abs(event.clientX - pressState.x) > CANCEL_DISTANCE ||
    Math.abs(event.clientY - pressState.y) > CANCEL_DISTANCE
  ) {
    clearPress()
  }
}

onBeforeUnmount(clearPress)
</script>

<template>
  <div
    data-modo-context-trigger=""
    class="modo-context-trigger"
    @contextmenu="handleContextMenu"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="clearPress"
    @pointercancel="clearPress"
  >
    <slot />
  </div>
</template>
