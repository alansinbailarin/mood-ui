import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Sidebar from '../../../src/components/layout/Sidebar.vue';
import type { SidebarItem } from '../../../src/interfaces/layout/Sidebar.interface';

const items: SidebarItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'inbox', label: 'Inbox' },
];

describe('Sidebar toggle button', () => {
  it('does NOT render toggle button by default', () => {
    const wrapper = mount(Sidebar, { props: { items } });
    expect(wrapper.find('[data-modo-sidebar-toggle]').exists()).toBe(false);
  });

  it('renders toggle button when showToggle=true', () => {
    const wrapper = mount(Sidebar, { props: { items, showToggle: true } });
    expect(wrapper.find('[data-modo-sidebar-toggle]').exists()).toBe(true);
  });

  it('emits update:collapsed with true when expanded and toggle clicked', async () => {
    const wrapper = mount(Sidebar, {
      props: { items, showToggle: true, collapsed: false },
    });
    await wrapper.find('[data-modo-sidebar-toggle]').trigger('click');
    expect(wrapper.emitted('update:collapsed')).toEqual([[true]]);
  });

  it('emits update:collapsed with false when collapsed and toggle clicked', async () => {
    const wrapper = mount(Sidebar, {
      props: { items, showToggle: true, collapsed: true },
    });
    await wrapper.find('[data-modo-sidebar-toggle]').trigger('click');
    expect(wrapper.emitted('update:collapsed')).toEqual([[false]]);
  });

  it('applies -right-3 class (end side) by default', () => {
    const wrapper = mount(Sidebar, { props: { items, showToggle: true } });
    const btn = wrapper.find('[data-modo-sidebar-toggle]');
    expect(btn.classes()).toContain('-right-3');
  });

  it('applies -left-3 class when toggleSide=start', () => {
    const wrapper = mount(Sidebar, {
      props: { items, showToggle: true, toggleSide: 'start' },
    });
    const btn = wrapper.find('[data-modo-sidebar-toggle]');
    expect(btn.classes()).toContain('-left-3');
  });
});
