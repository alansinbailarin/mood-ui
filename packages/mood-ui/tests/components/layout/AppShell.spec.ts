import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppShell from '../../../src/components/layout/AppShell.vue';

function makeShell(topbarSpan?: 'full' | 'content') {
  return mount(AppShell, {
    props: topbarSpan ? { topbarSpan } : {},
    slots: {
      topbar: '<div data-testid="topbar">Topbar</div>',
      sidebar: '<div data-testid="sidebar">Sidebar</div>',
      default: '<div data-testid="main-content">Main</div>',
    },
    attachTo: document.body,
  });
}

describe('AppShell topbarSpan', () => {
  it('renders topbar before sidebar in document order in full mode (default)', () => {
    const wrapper = makeShell();
    const topbar = wrapper.find('[data-testid="topbar"]');
    const sidebar = wrapper.find('[data-testid="sidebar"]');
    // In full mode, topbar is rendered BEFORE sidebar in the DOM
    expect(
      topbar.element.compareDocumentPosition(sidebar.element) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    wrapper.unmount();
  });

  it('renders sidebar before topbar in document order when topbarSpan=content', () => {
    const wrapper = makeShell('content');
    const topbar = wrapper.find('[data-testid="topbar"]');
    const sidebar = wrapper.find('[data-testid="sidebar"]');
    // In content mode, sidebar is rendered BEFORE topbar in DOM
    expect(
      sidebar.element.compareDocumentPosition(topbar.element) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    wrapper.unmount();
  });

  it('topbar and main-content share the same grandparent in content mode', () => {
    const wrapper = makeShell('content');
    const topbar = wrapper.find('[data-testid="topbar"]');
    const main = wrapper.find('[data-testid="main-content"]');
    // Both topbar and main are in the same content column div
    expect(topbar.element.parentElement?.parentElement).toBe(
      main.element.parentElement?.parentElement,
    );
    wrapper.unmount();
  });

  it('sidebar and topbar have different grandparents in content mode (different columns)', () => {
    const wrapper = makeShell('content');
    const topbar = wrapper.find('[data-testid="topbar"]');
    const sidebar = wrapper.find('[data-testid="sidebar"]');
    // sidebar is in a different column than topbar
    expect(topbar.element.parentElement?.parentElement).not.toBe(
      sidebar.element.parentElement?.parentElement,
    );
    wrapper.unmount();
  });
});
