import ContextMenuRoot from './ContextMenu.vue'
import ContextMenuTrigger from './ContextMenuTrigger.vue'
import MenuRoot from './Menu.vue'
import MenuContent from './MenuContent.vue'
import MenuItem from './MenuItem.vue'
import MenuLabel from './MenuLabel.vue'
import MenuSeparator from './MenuSeparator.vue'
import MenuTrigger from './MenuTrigger.vue'

type MenuCompound = typeof MenuRoot & {
  Trigger: typeof MenuTrigger
  Content: typeof MenuContent
  Item: typeof MenuItem
  Label: typeof MenuLabel
  Separator: typeof MenuSeparator
}

type ContextMenuCompound = typeof ContextMenuRoot & {
  Trigger: typeof ContextMenuTrigger
  Content: typeof MenuContent
  Item: typeof MenuItem
  Label: typeof MenuLabel
  Separator: typeof MenuSeparator
}

const Menu = Object.assign(MenuRoot, {
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  Label: MenuLabel,
  Separator: MenuSeparator,
}) as MenuCompound

const ContextMenu = Object.assign(ContextMenuRoot, {
  Trigger: ContextMenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  Label: MenuLabel,
  Separator: MenuSeparator,
}) as ContextMenuCompound

export {
  ContextMenu,
  ContextMenuTrigger,
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
}
export default Menu
