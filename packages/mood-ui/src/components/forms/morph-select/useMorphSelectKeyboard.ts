import type { Ref } from 'vue'
export function useMorphSelectKeyboard(panel: Ref<HTMLElement | null>, close: () => void) {
  let typed = '', typedAt = 0
  return (event: KeyboardEvent) => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return }
    if (event.key === 'Tab') { event.preventDefault(); close(); return }
    const search = (event.target as HTMLElement).tagName === 'INPUT'
    const items = Array.from(panel.value?.querySelectorAll<HTMLElement>('[role="option"]:not([disabled])') ?? [])
    const index = items.indexOf(document.activeElement as HTMLElement)
    let next: HTMLElement | undefined
    if (event.key === 'ArrowDown') next = items[index + 1] ?? items[0]
    else if (event.key === 'ArrowUp') next = items[index - 1] ?? items.at(-1)
    else if (!search && event.key === 'Home') next = items[0]
    else if (!search && event.key === 'End') next = items.at(-1)
    else if (!search && event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now(); typed = (now - typedAt < 500 ? typed : '') + event.key.toLowerCase(); typedAt = now
      next = [...items.slice(index + 1), ...items.slice(0, index + 1)].find(item => (item.dataset.textValue ?? '').toLowerCase().startsWith(typed))
    }
    if (next) { event.preventDefault(); next.focus(); next.scrollIntoView?.({ block: 'nearest' }) }
  }
}
