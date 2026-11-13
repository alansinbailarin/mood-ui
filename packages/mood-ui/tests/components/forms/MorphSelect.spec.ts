import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { MorphSelect } from '../../../src/components/forms/morph-select'
import FormField from '../../../src/components/forms/FormField.vue'
import Input from '../../../src/components/forms/Input.vue'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
const OPTIONS = `[{value:'mx',label:'Mexico',description:'North'}, {value:'br',label:'Brazil',disabled:true},{value:'us',label:'USA'}]`
const fixture = (rootAttrs = '', contentAttrs = '') => defineComponent({
  components: { MorphSelect, MorphSelectTrigger: MorphSelect.Trigger, MorphSelectContent: MorphSelect.Content },
  template: `<form><MorphSelect name="country" default-value="mx" label="Country" ${rootAttrs} :options="${OPTIONS}"><MorphSelectTrigger/><MorphSelectContent ${contentAttrs} /></MorphSelect></form>`,
})
const panel = () => document.querySelector<HTMLElement>('[data-modo-morph-select-panel]')
describe('MorphSelect', () => {
  it.each(['none', 'small', 'medium', 'large', 'full'] as const)('matches Input radius and label at radius=%s', (radius) => {
    const select = mount(fixture(`radius="${radius}"`))
    const input = mount(Input, { props: { label: 'Country', radius } })
    const rounded = (classes: string[]) => classes.filter(c => c.startsWith('rounded'))
    expect(rounded(select.get('.modo-morph-select__field').classes())).toEqual(rounded(input.get('.modo-field-wrapper').classes()))
    expect(select.get('label').classes()).toEqual(expect.arrayContaining(input.get('label').classes()))
    expect(select.get('.modo-morph-select').classes()).toContain('gap-1.5')
    select.unmount(); input.unmount()
  })
  it('has no stylesheet override of the provider radius', () => {
    const css = readFileSync(resolve(__dirname, '../../../src/components/forms/morph-select/morph-select.css'), 'utf8')
    expect(css).not.toMatch(/data-modo-radius/)
    expect(css).not.toMatch(/border-radius:\s*999px/)
  })
  it('opens at selected option, skips disabled and submits selected value', async () => {
    const w = mount(fixture(), { attachTo: document.body })
    await w.get('[role="combobox"]').trigger('keydown', { key: 'ArrowDown' }); await flushPromises()
    expect(document.activeElement?.textContent).toContain('Mexico')
    document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); await flushPromises()
    expect(document.activeElement?.textContent).toContain('USA')
    ;(document.activeElement as HTMLButtonElement).click(); await flushPromises()
    expect(new FormData(w.get('form').element as HTMLFormElement).get('country')).toBe('us')
    expect(document.activeElement).toBe(w.get('[role="combobox"]').element); w.unmount()
  })
  it('filters and shows the localized empty state', async () => {
    const w = mount(fixture('', ':searchable="true"'), { attachTo: document.body }); await w.get('[role="combobox"]').trigger('click'); await flushPromises()
    const input = document.querySelector('.modo-morph-select__search input') as HTMLInputElement
    expect(document.activeElement).toBe(input)
    expect(input.placeholder).toBe('Search…')
    input.value = 'zzz'; input.dispatchEvent(new Event('input', { bubbles: true })); await flushPromises()
    const empty = document.querySelector('[role="status"]')!
    expect(empty.textContent).toBe('No results.')
    expect(empty.classList).toContain('text-muted-foreground'); w.unmount()
  })
  it('does not open or submit when disabled', async () => {
    const w = mount(fixture(':disabled="true"'), { attachTo: document.body }); await w.get('[role="combobox"]').trigger('keydown', { key: 'ArrowDown' }); await flushPromises()
    expect(document.querySelector('[role="listbox"]')).toBeNull()
    expect(w.get('.modo-morph-select__field').classes()).toContain('opacity-60')
    expect(new FormData(w.get('form').element as HTMLFormElement).has('country')).toBe(false); w.unmount()
  })
  it('does not open when readonly', async () => {
    const w = mount(fixture(':readonly="true"'), { attachTo: document.body }); await w.get('[role="combobox"]').trigger('click'); await flushPromises()
    expect(panel()).toBeNull()
    expect(w.get('[role="combobox"]').attributes('aria-readonly')).toBe('true'); w.unmount()
  })
  it('renders native field state: label, required, error, helper, ids', () => {
    const w = mount(fixture('id="c1" required error-text="Pick one" helper-text="Help"'))
    const button = w.get('[role="combobox"]')
    expect(button.attributes('id')).toBe('c1')
    expect(w.get('label').attributes('for')).toBe('c1')
    expect(w.get('label').text()).toContain('*')
    expect(button.attributes('aria-invalid')).toBe('true')
    expect(button.attributes('aria-required')).toBe('true')
    expect(button.attributes('aria-describedby')).toBe('c1-error')
    expect(w.get('#c1-error').text()).toBe('Pick one')
    expect(w.text()).not.toContain('Help')
    expect(w.get('.modo-morph-select__field').classes()).toContain('border-destructive')
    const helper = mount(fixture('id="c2" helper-text="Help"'))
    expect(helper.get('#c2-helper').text()).toBe('Help')
  })
  it('maps radius and size like the native Select field', () => {
    const w = mount(fixture('radius="large" size="large"'))
    const field = w.get('.modo-morph-select__field')
    expect(field.classes()).toEqual(expect.arrayContaining(['rounded-xl', 'h-12', 'border-input', 'focus-within:ring-ring/60']))
    expect(w.get('[role="combobox"]').classes()).toEqual(expect.arrayContaining(['px-4', 'text-base']))
  })
  it('tints options and check by color and forwards menu tokens to the panel', async () => {
    const w = mount(fixture('color="primary" radius="full" size="small"'), { attachTo: document.body }); await w.get('[role="combobox"]').trigger('click'); await flushPromises()
    const p = panel()!
    expect(p.style.getPropertyValue('--modo-menu-item-radius')).toBe('999px')
    expect(p.style.getPropertyValue('--modo-menu-padding')).toBe('0.3125rem')
    const selected = p.querySelector('[role="option"][aria-selected="true"]')!
    expect(selected.classList).toContain('hover:bg-primary/10')
    expect(selected.querySelector('svg')!.classList).toContain('text-primary')
    expect(p.querySelector('.modo-morph-select__option-desc')?.textContent).toBe('North'); w.unmount()
  })
  it('uses the FormField id and the error color when invalid', async () => {
    const Wrapped = defineComponent({
      components: { FormField, MorphSelect, MorphSelectTrigger: MorphSelect.Trigger },
      template: `<FormField label="Country" id="ff1"><MorphSelect invalid color="primary" :options="${OPTIONS}"><MorphSelectTrigger /></MorphSelect></FormField>`,
    })
    const w = mount(Wrapped)
    const button = w.get('[role="combobox"]')
    expect(button.attributes('id')).toBe('ff1')
    expect(button.attributes('aria-invalid')).toBe('true')
    expect(button.text()).toContain('Select…')
  })
  it('multiple: toggles options, keeps the panel open and submits every value', async () => {
    const w = mount(fixture('multiple :default-value="[\'mx\']"'), { attachTo: document.body })
    await w.get('[role="combobox"]').trigger('click'); await flushPromises()
    expect(document.querySelector('[role="listbox"]')!.getAttribute('aria-multiselectable')).toBe('true')
    const usa = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="option"]')).find(o => o.textContent?.includes('USA'))!
    usa.click(); await flushPromises()
    expect(panel()).not.toBeNull()
    expect(usa.getAttribute('aria-selected')).toBe('true')
    expect(new FormData(w.get('form').element as HTMLFormElement).getAll('country')).toEqual(['mx', 'us'])
    expect(w.get('.modo-morph-select__value').text()).toBe('Mexico, USA')
    const mexico = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="option"]')).find(o => o.textContent?.includes('Mexico'))!
    mexico.click(); await flushPromises()
    expect(new FormData(w.get('form').element as HTMLFormElement).getAll('country')).toEqual(['us'])
    w.unmount()
  })
  it('multiple: v-model is an array in option order', async () => {
    const Host = defineComponent({
      components: { MorphSelect, MorphSelectTrigger: MorphSelect.Trigger, MorphSelectContent: MorphSelect.Content },
      data: () => ({ picked: [] as string[] }),
      template: `<MorphSelect v-model="picked" multiple :options="${OPTIONS}"><MorphSelectTrigger/><MorphSelectContent /></MorphSelect>`,
    })
    const w = mount(Host, { attachTo: document.body })
    await w.get('[role="combobox"]').trigger('click'); await flushPromises()
    const opts = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="option"]'))
    opts.find(o => o.textContent?.includes('USA'))!.click(); await flushPromises()
    opts.find(o => o.textContent?.includes('Mexico'))!.click(); await flushPromises()
    expect((w.vm as unknown as { picked: string[] }).picked).toEqual(['mx', 'us'])
    w.unmount()
  })
  it('renders a leading icon from the prop or the slot', () => {
    const Icon = defineComponent({ template: '<svg data-test-icon />' })
    const w = mount(defineComponent({
      components: { MorphSelect, MorphSelectTrigger: MorphSelect.Trigger },
      setup: () => ({ Icon }),
      template: `<MorphSelect :options="${OPTIONS}"><MorphSelectTrigger :icon="Icon" /></MorphSelect>`,
    }))
    expect(w.find('.modo-morph-select__icon [data-test-icon]').exists()).toBe(true)
    const slotted = mount(defineComponent({
      components: { MorphSelect, MorphSelectTrigger: MorphSelect.Trigger },
      template: `<MorphSelect :options="${OPTIONS}"><MorphSelectTrigger><template #icon><i data-slot-icon /></template></MorphSelectTrigger></MorphSelect>`,
    }))
    expect(slotted.find('.modo-morph-select__icon [data-slot-icon]').exists()).toBe(true)
  })
  it('stays open when the phone keyboard resizes or scrolls the page while searching', async () => {
    const w = mount(fixture('', ':searchable="true"'), { attachTo: document.body })
    await w.get('[role="combobox"]').trigger('click'); await flushPromises()
    const input = document.querySelector('.modo-morph-select__search input') as HTMLInputElement
    input.focus()
    window.dispatchEvent(new Event('resize')); document.dispatchEvent(new Event('scroll')); await flushPromises()
    expect(panel()).not.toBeNull()
    expect(w.get('[role="combobox"]').attributes('aria-expanded')).toBe('true')
    w.unmount()
  })
})
