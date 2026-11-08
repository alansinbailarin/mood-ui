import { cloneVNode, defineComponent, h, mergeProps, type ComponentPublicInstance } from 'vue'
import Button from '../../forms/Button.vue'
import { useMorphTooltip } from './MorphTooltipContext'

/**
 * Wires the tooltip behaviour onto its control. With `asChild` it binds to the
 * single slotted element; otherwise it renders a native `Button` (attrs such as
 * `variant`, `color`, `size` or `radius` are forwarded to it).
 */
export default defineComponent({
  name: 'MorphTooltipTrigger', inheritAttrs: false, props: { asChild: Boolean },
  setup(props, { attrs, slots }) {
    const ctx = useMorphTooltip()
    return () => {
      const child = props.asChild ? slots.default?.()[0] : undefined
      const visible = ctx.phase.value !== 'closed' && !ctx.disabled.value
      const described = [attrs['aria-describedby'], child?.props?.['aria-describedby'], visible ? ctx.id : undefined].filter(Boolean).join(' ') || undefined
      const bindings = mergeProps(attrs, {
        ref: (el: Element | ComponentPublicInstance | null) => { ctx.trigger.value = (el && '$el' in el ? el.$el : el) as HTMLElement | null },
        'aria-describedby': described,
        onPointerenter: ctx.onPointerEnter,
        onPointerleave: ctx.onPointerLeave,
        onPointerdown: ctx.onPointerDown,
        onClick: ctx.onClick,
        onFocus: ctx.onFocus,
        onBlur: ctx.onBlur,
        onKeydown: (e: KeyboardEvent) => { if (e.key === 'Escape') ctx.hide() },
        // A drag that starts on the trigger is a page scroll: close, as Tooltip does.
        onTouchmovePassive: ctx.hide,
      })
      return child ? cloneVNode(child, bindings, true) : h(Button, bindings, slots)
    }
  },
})
