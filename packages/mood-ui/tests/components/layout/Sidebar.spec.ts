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

describe('Sidebar collapse continuity', () => {
  it('keeps the same focused row and label across collapse and expansion', async () => {
    const wrapper = mount(Sidebar, { props: { items }, attachTo: document.body });
    try {
      const row = wrapper.find('button').element;
      const label = Array.from(row.querySelectorAll('span')).find((el) => el.textContent?.trim() === 'Home');
      row.focus();

      await wrapper.setProps({ collapsed: true });
      expect(wrapper.find('button').element).toBe(row);
      expect(document.activeElement).toBe(row);
      expect(row.contains(label!)).toBe(true);
      expect(row.getAttribute('aria-label')).toBe('Home');

      await wrapper.setProps({ collapsed: false });
      expect(wrapper.find('button').element).toBe(row);
      expect(document.activeElement).toBe(row);
    } finally {
      wrapper.unmount();
    }
  });

  it('preserves section headings and valid group names while collapsed', async () => {
    const wrapper = mount(Sidebar, {
      props: { sections: [{ id: 'workspace', title: 'Workspace', items }] },
    });
    const heading = wrapper.find('p').element;
    await wrapper.setProps({ collapsed: true });
    expect(wrapper.find('p').element).toBe(heading);
    const group = wrapper.find('[role="group"]');
    expect(group.attributes('aria-label')).toBe('Workspace');
    expect(group.attributes('aria-labelledby')).toBeUndefined();
    wrapper.unmount();
  });

  it('makes hidden sub-items inert and restores their open state', async () => {
    const wrapper = mount(Sidebar, { props: { items: [
      { id: 'projects', label: 'Projects', defaultExpanded: true, children: items },
    ] } });
    await wrapper.setProps({ collapsed: true });
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false');
    expect(wrapper.find('[aria-hidden="true"][inert]').exists()).toBe(true);
    await wrapper.setProps({ collapsed: false });
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('[inert]').exists()).toBe(false);
    wrapper.unmount();
  });
});
