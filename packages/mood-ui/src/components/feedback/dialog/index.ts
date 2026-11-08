import DialogRoot from './Dialog.vue'
import DialogBody from './DialogBody.vue'
import DialogClose from './DialogClose.vue'
import DialogContent from './DialogContent.vue'
import DialogDescription from './DialogDescription.vue'
import DialogFooter from './DialogFooter.vue'
import DialogHeader from './DialogHeader.vue'
import DialogIcon from './DialogIcon.vue'
import DialogTitle from './DialogTitle.vue'
import DialogTrigger from './DialogTrigger.vue'

type DialogCompound = typeof DialogRoot & {
  Trigger: typeof DialogTrigger
  Content: typeof DialogContent
  Header: typeof DialogHeader
  Title: typeof DialogTitle
  Description: typeof DialogDescription
  Body: typeof DialogBody
  Footer: typeof DialogFooter
  Close: typeof DialogClose
  Icon: typeof DialogIcon
}

const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Header: DialogHeader,
  Title: DialogTitle,
  Description: DialogDescription,
  Body: DialogBody,
  Footer: DialogFooter,
  Close: DialogClose,
  Icon: DialogIcon,
}) as DialogCompound

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  DialogTrigger,
}
export default Dialog
