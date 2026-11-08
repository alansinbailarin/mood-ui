import PopoverRoot from './Popover.vue'
import PopoverClose from './PopoverClose.vue'
import PopoverContent from './PopoverContent.vue'
import PopoverTrigger from './PopoverTrigger.vue'

type PopoverCompound = typeof PopoverRoot & {
  Trigger: typeof PopoverTrigger
  Content: typeof PopoverContent
  Close: typeof PopoverClose
}

const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Close: PopoverClose,
}) as PopoverCompound

export {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
}
export default Popover
