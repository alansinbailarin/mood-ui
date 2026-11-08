import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import GlassSwitch from '../../../src/components/forms/glass-switch/GlassSwitch.vue'
import ModoProvider from '../../../src/components/ModoProvider.vue'

describe('GlassSwitch', () => {
  it('uses native form semantics and accessible description', async () => {
    const w = mount(GlassSwitch, { props: { label: 'Alerts', description: 'Email', name: 'alerts', defaultChecked: true }, attachTo: document.body })
    const input = w.get('input')
    expect(input.attributes('role')).toBe('switch')
    expect((input.element as HTMLInputElement).checked).toBe(true)
    expect(document.getElementById(input.attributes('aria-describedby')!)?.textContent).toBe('Email')
    await input.setValue(false)
    expect(w.emitted('update:modelValue')?.[0]).toEqual([false])
    expect(w.emitted('change')?.[0]).toEqual([false])
    w.unmount()
  })
  it('keeps a controlled value when consumer rejects change', async () => {
    const w = mount(GlassSwitch, { props: { modelValue: false, ariaLabel: 'x' } })
    await w.get('input').setValue(true)
    expect(w.emitted('update:modelValue')?.[0]).toEqual([true])
    expect((w.get('input').element as HTMLInputElement).checked).toBe(false)
    w.unmount()
  })
  it('does not toggle disabled, loading or readonly controls', async () => {
    for (const props of [{ disabled: true }, { loading: true }]) {
      const w = mount(GlassSwitch, { props: { ...props, ariaLabel: 'x' } })
      ;(w.get('input').element as HTMLInputElement).click()
      expect(w.emitted('update:modelValue')).toBeUndefined()
      expect(w.get('label').classes()).toContain('opacity-60')
      w.unmount()
    }
    const ro = mount(GlassSwitch, { props: { readonly: true, modelValue: false, ariaLabel: 'x' } })
    await ro.get('input').setValue(true)
    expect(ro.emitted('update:modelValue')).toBeUndefined()
    expect((ro.get('input').element as HTMLInputElement).checked).toBe(false)
    ro.unmount()
  })
  it('cancels a drag without committing and removes drag state', async () => {
    const w = mount(GlassSwitch, { props: { ariaLabel: 'x' }, attachTo: document.body })
    const pointer = (type: string, x: number) => { const e = new Event(type, { bubbles: true }); Object.assign(e, { pointerId: 1, button: 0, clientX: x }); return e }
    w.get('.modo-glass-switch__track').element.dispatchEvent(pointer('pointerdown', 0))
    document.dispatchEvent(pointer('pointermove', 30))
    expect(w.get('.modo-glass-switch__track').attributes('data-modo-dragging')).toBe('')
    document.dispatchEvent(pointer('pointercancel', 30))
    expect(w.emitted('update:modelValue')).toBeUndefined()
    expect(w.get('.modo-glass-switch__track').attributes('data-modo-dragging')).toBeUndefined()
    w.unmount()
  })
  it('uses the Valux primary fill and preserves explicit colors and radii', () => {
    const def = mount(GlassSwitch, { props: { ariaLabel: 'x' } })
    expect(def.get('.modo-glass-switch__fill').classes()).toContain('bg-primary')
    expect(def.get('.modo-glass-switch__track').classes()).toEqual(expect.arrayContaining(['rounded-full', 'peer-focus-visible:ring-ring/60']))
    const primary = mount(GlassSwitch, { props: { ariaLabel: 'x', color: 'primary', radius: 'small' } })
    expect(primary.get('.modo-glass-switch__fill').classes()).toContain('bg-primary')
    expect(primary.get('.modo-glass-switch__track').classes()).toContain('rounded-sm')
  })
  it('renders form field state: required, error and helper', () => {
    const err = mount(GlassSwitch, { props: { label: 'Terms', required: true, errorText: 'Required', helperText: 'Help' } })
    const input = err.get('input')
    expect(err.text()).toContain('*')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toContain(err.get('[role="alert"]').attributes('id'))
    expect(err.get('[role="alert"]').text()).toBe('Required')
    expect(err.text()).not.toContain('Help')
    expect(err.get('.modo-glass-switch__fill').classes()).toContain('bg-destructive')
    const helper = mount(GlassSwitch, { props: { label: 'Terms', helperText: 'Help', labelPosition: 'left' } })
    expect(helper.text()).toContain('Help')
    expect(helper.get('label').classes()).toContain('flex-row-reverse')
  })
  // Like the native Switch, the track stays a pill unless `radius` is set locally.
  it('cascades size and color from ModoProvider', () => {
    const w = mount(ModoProvider, { props: { size: 'large', radius: 'medium', color: 'success' }, slots: { default: () => h(GlassSwitch, { ariaLabel: 'x' }) } })
    expect(w.get('.modo-glass-switch').attributes('data-modo-size')).toBe('large')
    expect(w.get('.modo-glass-switch__track').classes()).toContain('rounded-full')
    expect(w.get('.modo-glass-switch__fill').classes()).toContain('bg-success')
  })
})
