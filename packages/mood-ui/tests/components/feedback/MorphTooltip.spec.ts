import { afterEach, describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import ModoProvider from '../../../src/components/ModoProvider.vue'
import { MorphTooltip } from '../../../src/components/feedback/morph-tooltip'
import { resolveTooltipPosition } from '../../../src/components/feedback/morph-tooltip/tooltipPlacement'

afterEach(() => { vi.useRealTimers(); document.body.innerHTML = '' })

const components = { MorphTooltip, MorphTooltipTrigger: MorphTooltip.Trigger, MorphTooltipContent: MorphTooltip.Content }
function fixture(root = '', content = '', trigger = 'as-child', inner = '<button aria-describedby="existing">Save</button>') {
  return defineComponent({ components, template: `<MorphTooltip ${root}><MorphTooltipTrigger ${trigger}>${inner}</MorphTooltipTrigger><MorphTooltipContent ${content}>Save changes</MorphTooltipContent></MorphTooltip>` })
}
const panel = () => document.querySelector<HTMLElement>('[role="tooltip"]')
async function flush() { await nextTick(); await nextTick() }

describe('MorphTooltip', () => {
  it('delays hover with the native defaults, preserves descriptions and closes on Escape', async () => {
    vi.useFakeTimers(); const w = mount(fixture(), { attachTo: document.body })
    await w.get('button').trigger('pointerenter', { pointerType: 'mouse' })
    vi.advanceTimersByTime(199); await nextTick(); expect(panel()).toBeNull()
    vi.advanceTimersByTime(1); await flush()
    expect(panel()?.textContent).toContain('Save changes')
    expect(w.get('button').attributes('aria-describedby')).toContain('existing')
    expect(w.get('button').attributes('aria-describedby')).toContain(panel()!.id)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await flush(); vi.advanceTimersByTime(300); await nextTick()
    expect(panel()).toBeNull(); w.unmount()
  })

  it('closes after closeDelay when the pointer leaves', async () => {
    vi.useFakeTimers(); const w = mount(fixture(':close-delay="150"'), { attachTo: document.body })
    await w.get('button').trigger('pointerenter', { pointerType: 'mouse' }); vi.advanceTimersByTime(200); await flush()
    await w.get('button').trigger('pointerleave', { pointerType: 'mouse' }); vi.advanceTimersByTime(149); await flush()
    expect(panel()?.dataset.modoPhase).not.toBe('closing')
    vi.advanceTimersByTime(1); await flush()
    expect(panel()?.dataset.modoPhase).toBe('closing'); w.unmount()
  })

  it('toggles on touch tap instead of hover, and closes on an outside touch', async () => {
    vi.useFakeTimers(); const w = mount(fixture(), { attachTo: document.body })
    await w.get('button').trigger('pointerenter', { pointerType: 'touch' }); vi.advanceTimersByTime(500); await nextTick()
    expect(panel()).toBeNull()
    await w.get('button').trigger('pointerdown', { pointerType: 'touch' }); await flush()
    expect(panel()).not.toBeNull()
    await w.get('button').trigger('click'); await flush()
    expect(panel()?.dataset.modoPhase).not.toBe('closing')
    document.body.dispatchEvent(new Event('touchstart', { bubbles: true })); await flush()
    expect(panel()?.dataset.modoPhase).toBe('closing'); w.unmount()
  })

  it('opens immediately on keyboard focus', async () => {
    const w = mount(fixture(), { attachTo: document.body }); vi.spyOn(w.get('button').element, 'matches').mockReturnValue(true); (w.get('button').element as HTMLButtonElement).focus(); await flush()
    expect(panel()).not.toBeNull(); w.unmount()
  })

  it('supports click and manual triggers', async () => {
    const click = mount(fixture('trigger="click"'), { attachTo: document.body })
    await click.get('button').trigger('pointerenter', { pointerType: 'mouse' }); await flush(); expect(panel()).toBeNull()
    await click.get('button').trigger('click'); await flush(); expect(panel()).not.toBeNull()
    click.unmount(); document.body.innerHTML = ''
    const manual = mount(defineComponent({ components, data: () => ({ open: false }), template: '<MorphTooltip trigger="manual" :open="open"><MorphTooltipTrigger as-child><button>Save</button></MorphTooltipTrigger><MorphTooltipContent>Hint</MorphTooltipContent></MorphTooltip>' }), { attachTo: document.body })
    await manual.get('button').trigger('click'); await flush(); expect(panel()).toBeNull()
    await manual.setData({ open: true }); await flush(); expect(panel()).not.toBeNull()
    manual.unmount()
  })

  it('never opens while disabled', async () => {
    vi.useFakeTimers(); const w = mount(fixture('disabled'), { attachTo: document.body })
    await w.get('button').trigger('pointerenter', { pointerType: 'mouse' }); vi.advanceTimersByTime(500); await flush()
    expect(panel()).toBeNull(); w.unmount()
  })

  it('renders color, size, radius, shadow and arrow like the native Tooltip', async () => {
    const w = mount(defineComponent({ render: () => h(ModoProvider, { color: 'primary', radius: 'none' }, () => h(fixture('default-open', 'size="large"'))) }), { attachTo: document.body })
    await flush()
    const el = panel()!
    expect(el.className).toContain('bg-primary')
    expect(el.className).toContain('text-primary-foreground')
    expect(el.className).toContain('px-3.5')
    expect(el.className).toContain('shadow-md')
    expect(el.style.getPropertyValue('--modo-morph-tooltip-radius')).toBe('0px')
    expect(el.style.getPropertyValue('--modo-morph-tooltip-seed-radius')).toBe('0px')
    expect(el.querySelector('.modo-morph-tooltip__arrow')?.className).toContain('bg-primary')
    w.unmount()
  })

  it('maps inverted and danger colors, and hides the arrow on demand', async () => {
    const inv = mount(fixture('default-open', 'color="inverted"'), { attachTo: document.body }); await flush()
    expect(panel()!.className).toContain('bg-background'); expect(panel()!.className).toContain('border-border')
    inv.unmount(); document.body.innerHTML = ''
    const danger = mount(fixture('default-open', 'color="danger" :arrow="false"'), { attachTo: document.body }); await flush()
    expect(panel()!.className).toContain('bg-destructive'); expect(panel()!.querySelector('.modo-morph-tooltip__arrow')).toBeNull()
    danger.unmount()
  })

  it('renders a native Button as the default trigger', () => {
    const w = mount(fixture('', '', '', 'Save'), { attachTo: document.body })
    const button = w.get('button')
    expect(button.attributes('type')).toBe('button')
    expect(button.classes().join(' ')).toContain('focus-visible:ring-2')
    w.unmount()
  })

  it('flips left/right and applies the offset', () => {
    const viewport = { width: 400, height: 400 }
    const panelSize = { width: 100, height: 30 }
    expect(resolveTooltipPosition({ left: 10, top: 100, width: 40, height: 20 }, panelSize, viewport, 'left').side).toBe('right')
    expect(resolveTooltipPosition({ left: 350, top: 100, width: 40, height: 20 }, panelSize, viewport, 'right').side).toBe('left')
    expect(resolveTooltipPosition({ left: 150, top: 200, width: 40, height: 20 }, panelSize, viewport, 'top', 'auto', 12).top).toBe(200 - 30 - 12)
  })
})
