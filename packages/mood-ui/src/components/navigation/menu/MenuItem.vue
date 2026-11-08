<script setup lang="ts">
import { computed } from 'vue'
import { SIZE_TOKENS } from '../../../config/sizes'
import type { MenuItemProps } from '../../../interfaces/navigation/Menu.interface'
import { useMenuContext } from './MenuContext'

defineOptions({
  name: 'MenuItem',
})

const props = withDefaults(defineProps<MenuItemProps>(), {
  icon: undefined,
  shortcut: undefined,
  color: undefined,
  disabled: false,
})

const emit = defineEmits<{
  select: []
  click: [event: MouseEvent]
}>()

const { setOpen, itemColor, size } = useMenuContext()

// Like DropdownMenu, rows never pick up the provider brand color: an
// explicit item color wins, then an explicit menu color, else neutral.
const effectiveColor = computed(() => props.color ?? itemColor.value)

const iconClass = computed(() => [
  SIZE_TOKENS[size.value].icon,
  // Neutral rows tint the icon like native menu/field affordances; colored
  // rows let it follow the row text.
  effectiveColor.value === 'default' ? 'modo-affordance-icon' : '',
])

function handleClick(event: MouseEvent) {
  emit('click', event)
  if (event.defaultPrevented || props.disabled) return
  emit('select')
  setOpen(false)
}
</script>

<template>
  <button
    type="button"
    role="menuitem"
    :disabled="disabled"
    :aria-disabled="disabled || undefined"
    data-modo-menu-item=""
    :data-modo-color="effectiveColor"
    :data-modo-shortcut="typeof shortcut === 'string' ? shortcut : undefined"
    class="modo-menu-item text-body"
    @click="handleClick"
  >
    <span
      v-if="icon || $slots.icon"
      aria-hidden="true"
      :class="['modo-menu-item__icon', iconClass]"
    >
      <slot name="icon">
        <component :is="icon" />
      </slot>
    </span>
    <span class="modo-menu-item__label">
      <slot />
    </span>
    <span
      v-if="shortcut || $slots.shortcut"
      aria-hidden="true"
      class="modo-menu-item__shortcut ml-auto pl-4 text-caption text-muted-foreground tabular-nums"
    >
      <slot name="shortcut">
        {{ shortcut }}
      </slot>
    </span>
  </button>
</template>
