import { afterEach, describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import ModoProvider from '../../../src/components/ModoProvider.vue'
import { createLiquidToast } from '../../../src/components/feedback/liquid-toast/liquidToast'
import LiquidToaster from '../../../src/components/feedback/liquid-toast/LiquidToaster.vue'

afterEach(() => { vi.useRealTimers(); document.body.innerHTML = '' })
const card = () => document.querySelector<HTMLElement>('[data-modo-liquid-toast]:not([data-modo-peek])')!
async function flush() { await nextTick(); await nextTick() }

describe('liquid notifications', () => {
  it('isolates controllers, coalesces duplicates and defaults to info', () => {
    const a = createLiquidToast(), b = createLiquidToast()
    const id = a('Saved'); expect(a('Saved')).toBe(id)
    expect(a.items.value).toHaveLength(1); expect(a.items.value[0]).toMatchObject({ revision: 1, color: 'info' })
    expect(b.items.value).toHaveLength(0)
  })

  it('mirrors useToast: color helpers, id replace, dismiss and dismissAll', () => {
    const store = createLiquidToast()
    store.success('One'); store.danger({ title: 'Two', id: 'job' })
    expect(store.items.value.map(item => item.color)).toEqual(['success', 'danger'])
    expect(store.push({ id: 'job', title: 'Two done', color: 'success' })).toBe('job')
    expect(store.items.value).toHaveLength(2)
    expect(store.items.value[1]).toMatchObject({ id: 'job', title: 'Two done', color: 'success', revision: 1 })
    store.dismiss('job'); expect(store.items.value[1]?.leaving).toBe(true)
    store.dismissAll(); expect(store.items.value).toHaveLength(0)
  })

  it('settles promises in place and preserves the original promise', async () => {
    const store = createLiquidToast(), promise = Promise.resolve(42)
    expect(store.promise(promise, { loading: 'Saving', success: n => `Saved ${n}`, error: 'Failed' })).toBe(promise)
    const id = store.items.value[0]?.id
    await flushPromises()
    expect(store.items.value[0]).toMatchObject({ id, title: 'Saved 42', color: 'success', loading: false })
  })

  it('does not resurrect a dismissed pending promise', async () => {
    const store = createLiquidToast(); let resolve!: () => void
    store.promise(new Promise<void>(r => { resolve = r }), { loading: 'Saving', success: 'Done', error: 'Failed' })
    store.dismissAll(); resolve(); await flushPromises(); expect(store.items.value).toHaveLength(0)
  })

  it('queues without starting hidden timers and removes dismissed queued items', async () => {
    vi.useFakeTimers()
    const store = createLiquidToast()
    const w = mount(LiquidToaster, { props: { controller: store }, attachTo: document.body })
    store({ title: 'First', duration: 1000 }); const second = store({ title: 'Second', duration: 100 })
    await flush()
    vi.advanceTimersByTime(200); await nextTick()
    expect(store.items.value.find(item => item.id === second)?.leaving).toBe(false)
    store.dismiss(second); await flush()
    expect(store.items.value.some(item => item.id === second)).toBe(false)
    w.unmount()
  })

  it('pauses on hover and keeps the remaining time', async () => {
    vi.useFakeTimers(); const store = createLiquidToast()
    const w = mount(LiquidToaster, { props: { controller: store }, attachTo: document.body })
    store({ title: 'Reading', duration: 1000 }); await flush()
    vi.advanceTimersByTime(400)
    card().dispatchEvent(new Event('pointerenter')); vi.advanceTimersByTime(2000); await nextTick()
    expect(store.items.value[0]?.leaving).toBe(false)
    card().dispatchEvent(new Event('pointerleave')); vi.advanceTimersByTime(599); await nextTick()
    expect(store.items.value[0]?.leaving).toBe(false)
    vi.advanceTimersByTime(2); await nextTick()
    expect(store.items.value[0]?.leaving).toBe(true)
    w.unmount()
  })

  it('ignores hover when pauseOnHover is false', async () => {
    vi.useFakeTimers(); const store = createLiquidToast()
    const w = mount(LiquidToaster, { props: { controller: store }, attachTo: document.body })
    store({ title: 'Go', duration: 500, pauseOnHover: false }); await flush()
    card().dispatchEvent(new Event('pointerenter')); vi.advanceTimersByTime(501); await nextTick()
    expect(store.items.value[0]?.leaving).toBe(true)
    w.unmount()
  })

  it('renders a labelled region, one live announcement and a keyboard dismiss button', async () => {
    const store = createLiquidToast()
    const w = mount(LiquidToaster, { props: { controller: store }, attachTo: document.body })
    store({ title: 'Saved', color: 'danger' }); await flush()
    const region = document.querySelector('[role="region"]')!
    expect(region.getAttribute('aria-label')).toBe('Notifications')
    expect(document.querySelectorAll('[role="status"],[role="alert"]')).toHaveLength(0)
    expect(document.querySelector('[aria-live="assertive"]')?.textContent).toBe('Saved')
    const close = document.querySelector<HTMLButtonElement>('.modo-liquid-toast__ink button.modo-liquid-toast__close')!
    expect(close.getAttribute('aria-label')).toBe('Dismiss')
    close.click(); await nextTick()
    expect(store.items.value[0]?.leaving).toBe(true)
    w.unmount()
  })

  it('hides the close button when not dismissable and keeps the toast on action keepOpen', async () => {
    const store = createLiquidToast(); const onClick = vi.fn()
    const w = mount(LiquidToaster, { props: { controller: store }, attachTo: document.body })
    store({ title: 'Archived', dismissable: false, action: { label: 'Undo', onClick, keepOpen: true } }); await flush()
    expect(document.querySelector('.modo-liquid-toast__close')).toBeNull()
    document.querySelector<HTMLButtonElement>('.modo-liquid-toast__ink button.modo-liquid-toast__action')!.click(); await nextTick()
    expect(onClick).toHaveBeenCalledOnce(); expect(store.items.value[0]?.leaving).toBe(false)
    w.unmount()
  })

  it('applies color, variant, radius, size and placement', async () => {
    const store = createLiquidToast()
    const w = mount(defineComponent({ render: () => h(ModoProvider, { radius: 'none', size: 'large' }, () => h(LiquidToaster, { controller: store, placement: 'bottom-right', defaultVariant: 'filled' })) }), { attachTo: document.body })
    store({ title: 'Heads up', color: 'warning' }); await flush()
    const el = card()
    expect(el.dataset).toMatchObject({ modoColor: 'warning', modoVariant: 'filled', modoRadius: 'none', modoSize: 'large' })
    expect(el.style.getPropertyValue('--modo-liquid-toast-radius')).toBe('0px')
    expect(el.style.getPropertyValue('--modo-liquid-toast-pill-radius')).toBe('0px')
    expect(document.querySelector('[data-modo-liquid-toaster]')?.getAttribute('data-modo-position')).toBe('bottom-right')
    store({ title: 'Mine', radius: 'large', variant: 'outline', placement: 'top-left' }); await flush()
    const mine = document.querySelector<HTMLElement>('[data-modo-position="top-left"] [data-modo-liquid-toast]')!
    expect(mine.dataset).toMatchObject({ modoVariant: 'outline', modoRadius: 'large' })
    w.unmount()
  })

  it('references the goo filters it actually renders', async () => {
    const store = createLiquidToast()
    const w = mount(LiquidToaster, { props: { controller: store }, attachTo: document.body })
    store('Hi'); await flush()
    const region = document.querySelector<HTMLElement>('[role="region"]')!
    const ref = region.style.getPropertyValue('--modo-liquid-toast-goo').match(/url\(#(.+)\)/)?.[1]
    expect(ref && document.getElementById(ref)?.tagName.toLowerCase()).toBe('filter')
    w.unmount()
  })
})
