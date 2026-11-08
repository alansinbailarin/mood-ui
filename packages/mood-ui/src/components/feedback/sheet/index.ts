import SheetRoot from './Sheet.vue'
import SheetBody from './SheetBody.vue'
import SheetClose from './SheetClose.vue'
import SheetContent from './SheetContent.vue'
import SheetDescription from './SheetDescription.vue'
import SheetFooter from './SheetFooter.vue'
import SheetHeader from './SheetHeader.vue'
import SheetTitle from './SheetTitle.vue'
import SheetTrigger from './SheetTrigger.vue'

type SheetCompound = typeof SheetRoot & {
  Trigger: typeof SheetTrigger
  Content: typeof SheetContent
  Header: typeof SheetHeader
  Title: typeof SheetTitle
  Description: typeof SheetDescription
  Body: typeof SheetBody
  Footer: typeof SheetFooter
  Close: typeof SheetClose
}

const Sheet = Object.assign(SheetRoot, {
  Trigger: SheetTrigger,
  Content: SheetContent,
  Header: SheetHeader,
  Title: SheetTitle,
  Description: SheetDescription,
  Body: SheetBody,
  Footer: SheetFooter,
  Close: SheetClose,
}) as SheetCompound

export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
}
export default Sheet
