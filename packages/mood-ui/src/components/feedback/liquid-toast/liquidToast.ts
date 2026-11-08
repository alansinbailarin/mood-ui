import { shallowReadonly, shallowRef } from 'vue'
import type { LiquidToastColor, LiquidToastItem, LiquidToastOptions } from '../../../interfaces/feedback/LiquidToast.interface'

type Input = string | LiquidToastOptions
type Message<T> = Input | ((value: T) => Input)
const normalize = (value: Input): LiquidToastOptions => typeof value === 'string' ? { title: value } : value
const resolve = <T>(message: Message<T>, value: T) => normalize(typeof message === 'function' ? message(value) : message)
const withColor = (input: Omit<LiquidToastOptions, 'color'> | string, color: LiquidToastColor): LiquidToastOptions =>
  typeof input === 'string' ? { title: input, color } : { ...input, color }

/**
 * Create per-app/per-request state. Mirrors `useToast()` (`push`, `info`,
 * `success`, `warning`, `danger`, `dismiss`, `dismissAll`, id replace) plus
 * `update` and `promise`. The default singleton only accepts browser calls.
 */
export function createLiquidToast() {
  const items = shallowRef<LiquidToastItem[]>([])
  let nextId = 0
  function push(options: Input): string | number {
    const { id: wanted, ...data } = normalize(options)
    const color = data.color ?? 'info'
    // Same id → replace in place (keeps its stage slot, replays the update morph).
    const same = wanted !== undefined ? items.value.find(item => item.id === wanted && !item.leaving) : undefined
    // Same plain-text message fired again → coalesce into the visible one.
    const twin = same ?? (wanted === undefined
      ? items.value.find(item => !item.leaving && typeof item.title === 'string' && item.title === data.title && item.description === data.description && item.color === color)
      : undefined)
    if (twin) {
      items.value = items.value.map(item => item.id === twin.id
        ? { ...(same ? data : item), id: item.id, color: same ? color : item.color, revision: item.revision + 1, leaving: false }
        : item)
      return twin.id
    }
    const id = wanted ?? ++nextId
    items.value = [...items.value.filter(item => item.id !== id), { ...data, id, color, revision: 0, leaving: false }]
    return id
  }
  function update(id: string | number, patch: Partial<LiquidToastOptions>) {
    const { id: _ignored, ...rest } = patch
    items.value = items.value.map(item => item.id === id && !item.leaving ? { ...item, ...rest, loading: rest.loading ?? false, revision: item.revision + 1 } : item)
  }
  /** Removes immediately (after the exit morph has played). */
  function remove(id: string | number) { items.value = items.value.filter(item => item.id !== id) }
  /** Plays the exit morph, then removes. No-op for unknown ids. */
  function dismiss(id: string | number) {
    items.value = items.value.map(item => item.id === id ? { ...item, leaving: true } : item)
  }
  /** Clears the stage and the queue at once. */
  function dismissAll() { items.value = [] }
  function promise<T>(value: Promise<T>, messages: { loading: Input; success: Message<T>; error: Message<unknown> }): Promise<T> {
    const id = push({ ...normalize(messages.loading), loading: true, duration: 0 })
    void value.then(
      result => update(id, { color: 'success', duration: undefined, ...resolve(messages.success, result) }),
      error => update(id, { color: 'danger', duration: undefined, ...resolve(messages.error, error) }),
    ).catch(() => dismiss(id))
    return value
  }
  return Object.assign(push, {
    items: shallowReadonly(items), push, update, dismiss, dismissAll, remove, promise,
    info: (input: Omit<LiquidToastOptions, 'color'> | string) => push(withColor(input, 'info')),
    success: (input: Omit<LiquidToastOptions, 'color'> | string) => push(withColor(input, 'success')),
    warning: (input: Omit<LiquidToastOptions, 'color'> | string) => push(withColor(input, 'warning')),
    danger: (input: Omit<LiquidToastOptions, 'color'> | string) => push(withColor(input, 'danger')),
  })
}
export type LiquidToastController = ReturnType<typeof createLiquidToast>
const browserStore = createLiquidToast()
const isServer = () => typeof window === 'undefined'
/** Call from event handlers/onMounted. Server calls intentionally do not enqueue shared state. */
export const liquidToast: LiquidToastController = Object.assign(
  (options: Input) => isServer() ? -1 : browserStore(options),
  {
    ...browserStore,
    push: (options: Input) => isServer() ? -1 : browserStore.push(options),
    info: (input: Omit<LiquidToastOptions, 'color'> | string) => isServer() ? -1 : browserStore.info(input),
    success: (input: Omit<LiquidToastOptions, 'color'> | string) => isServer() ? -1 : browserStore.success(input),
    warning: (input: Omit<LiquidToastOptions, 'color'> | string) => isServer() ? -1 : browserStore.warning(input),
    danger: (input: Omit<LiquidToastOptions, 'color'> | string) => isServer() ? -1 : browserStore.danger(input),
    promise: <T>(value: Promise<T>, messages: { loading: Input; success: Message<T>; error: Message<unknown> }) => isServer() ? value : browserStore.promise(value, messages),
  },
)
