import Root from './MorphTooltip.vue'
import MorphTooltipTrigger from './MorphTooltipTrigger'
import MorphTooltipContent from './MorphTooltipContent.vue'
import { defineComponent, h } from 'vue'
// Typography follows the Content `size` (font-size is inherited); color comes
// from the panel's `text-*` class, so these only set weight and rhythm.
const MorphTooltipTitle = defineComponent({ name: 'MorphTooltipTitle', setup: (_, { slots }) => () => h('p', { class: 'modo-morph-tooltip__title m-0 font-semibold' }, slots.default?.()) })
const MorphTooltipDescription = defineComponent({ name: 'MorphTooltipDescription', setup: (_, { slots }) => () => h('p', { class: 'modo-morph-tooltip__description m-0 opacity-85' }, slots.default?.()) })
const MorphTooltip = Object.assign(Root, { Trigger: MorphTooltipTrigger, Content: MorphTooltipContent, Title: MorphTooltipTitle, Description: MorphTooltipDescription })
export { MorphTooltip, MorphTooltipTrigger, MorphTooltipContent, MorphTooltipTitle, MorphTooltipDescription }
