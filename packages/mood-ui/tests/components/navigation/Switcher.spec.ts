import { describe, it, expect, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import Switcher from "../../../src/components/navigation/Switcher.vue";
import type { SwitcherItem } from "../../../src/interfaces/navigation/Switcher.interface";

const items: SwitcherItem[] = [
  { value: "a", title: "Studio Office", subtitle: "05064005868" },
  { value: "b", title: "Sweet Home", subtitle: "05064005214" },
  { value: "c", title: "Cake Shop", subtitle: "05064004220" },
];

const HouseStub = defineComponent({
  setup() {
    return () => h("svg", { "data-testid": "house-icon" });
  },
});

function pressKey(el: Element, key: string) {
  el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

describe("Switcher (slots)", () => {
  it("renders #item-trailing for each item with item + active + close", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a" },
      slots: {
        "item-trailing": `<template #item-trailing="{ item, active }">
                            <span data-testid="trail" :data-active="String(active)">{{ item.value }}</span>
                          </template>`,
      },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();
    const trails = document.querySelectorAll('[data-testid="trail"]');
    expect(trails.length).toBe(3);
    expect(trails[0].textContent).toBe("a");
    expect(trails[0].getAttribute("data-active")).toBe("true");
    expect(trails[1].getAttribute("data-active")).toBe("false");
    wrapper.unmount();
  });

  it("renders #footer below items with a separator and exposes close()", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a" },
      slots: {
        footer: `<template #footer="{ close }">
                   <button data-testid="footer-btn" @click="close()">Add</button>
                 </template>`,
      },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();
    const panel = document.querySelector("[data-modo-switcher-panel]")!;
    expect(panel.querySelector("[data-modo-switcher-footer-sep]")).not.toBeNull();
    const btn = document.querySelector('[data-testid="footer-btn"]') as HTMLElement;
    btn.click();
    await nextTick();
    expect(document.querySelector("[data-modo-switcher-panel]")).toBeNull();
    wrapper.unmount();
  });
});

describe("Switcher (#trigger slot)", () => {
  it("renders custom trigger when #trigger slot is provided and skips the default pill", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "b" },
      slots: {
        trigger: `<template #trigger="{ activeItem, isOpen, toggle }">
                    <button data-testid="custom-trigger" @click="toggle">
                      {{ activeItem?.title }} - {{ isOpen ? 'OPEN' : 'CLOSED' }}
                    </button>
                  </template>`,
      },
    });
    expect(document.querySelector("[data-modo-switcher-trigger]")).toBeNull();
    const custom = wrapper.get('[data-testid="custom-trigger"]');
    expect(custom.text()).toContain("Sweet Home");
    expect(custom.text()).toContain("CLOSED");
    await custom.trigger("click");
    await nextTick();
    expect(document.querySelector("[data-modo-switcher-panel]")).not.toBeNull();
    wrapper.unmount();
  });
});

describe("Switcher (keyboard, searchable)", () => {
  it("on open with searchable, focus goes to the search input", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a", searchable: true },
    });
    const trigger = wrapper.get("[data-modo-switcher-trigger]").element;
    pressKey(trigger, "ArrowDown");
    await flushPromises();
    const input = document.querySelector('[role="searchbox"]')!;
    expect(document.activeElement).toBe(input);
    wrapper.unmount();
  });

  it("ArrowDown on the search input moves aria-activedescendant through options", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a", searchable: true },
    });
    const trigger = wrapper.get("[data-modo-switcher-trigger]").element;
    pressKey(trigger, "ArrowDown");
    await flushPromises();
    const input = document.querySelector('[role="searchbox"]') as HTMLElement;
    expect(input.getAttribute("aria-activedescendant")).toMatch(/-opt-0$/);
    pressKey(input, "ArrowDown");
    await flushPromises();
    expect(input.getAttribute("aria-activedescendant")).toMatch(/-opt-1$/);
    wrapper.unmount();
  });

  it("Enter on input selects the option pointed to by aria-activedescendant", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a", searchable: true },
    });
    const trigger = wrapper.get("[data-modo-switcher-trigger]").element;
    pressKey(trigger, "ArrowDown");
    await flushPromises();
    const input = document.querySelector('[role="searchbox"]') as HTMLElement;
    pressKey(input, "ArrowDown");
    await flushPromises();
    pressKey(input, "Enter");
    await flushPromises();
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["b"]);
    wrapper.unmount();
  });

  it("Escape closes the panel and returns focus to the trigger (searchable)", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a", searchable: true },
    });
    const triggerEl = wrapper.get("[data-modo-switcher-trigger]").element as HTMLElement;
    pressKey(triggerEl, "ArrowDown");
    await flushPromises();
    const input = document.querySelector('[role="searchbox"]') as HTMLElement;
    pressKey(input, "Escape");
    await flushPromises();
    expect(document.querySelector("[data-modo-switcher-panel]")).toBeNull();
    expect(document.activeElement).toBe(triggerEl);
    wrapper.unmount();
  });
});

describe("Switcher (keyboard, non-searchable)", () => {
  it("opens the panel and focuses the active option on ArrowDown from trigger", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "b" },
    });
    const trigger = wrapper.get("[data-modo-switcher-trigger]").element;
    pressKey(trigger, "ArrowDown");
    await flushPromises();
    const options = document.querySelectorAll('[role="option"]');
    expect(document.activeElement).toBe(options[1]);
    wrapper.unmount();
  });

  it("arrow keys move focus through options and skip disabled", async () => {
    const its: SwitcherItem[] = [
      { value: "a", title: "A" },
      { value: "b", title: "B", disabled: true },
      { value: "c", title: "C" },
    ];
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items: its, modelValue: "a" },
    });
    const trigger = wrapper.get("[data-modo-switcher-trigger]").element;
    pressKey(trigger, "ArrowDown");
    await flushPromises();
    const options = document.querySelectorAll('[role="option"]');
    expect(document.activeElement).toBe(options[0]);

    pressKey(options[0], "ArrowDown");
    await flushPromises();
    expect(document.activeElement).toBe(options[2]);
    wrapper.unmount();
  });

  it("Home/End jump to first/last focusable", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "b" },
    });
    const trigger = wrapper.get("[data-modo-switcher-trigger]").element;
    pressKey(trigger, "ArrowDown");
    await flushPromises();
    const options = document.querySelectorAll('[role="option"]');
    pressKey(options[1], "End");
    await flushPromises();
    expect(document.activeElement).toBe(options[2]);
    pressKey(options[2], "Home");
    await flushPromises();
    expect(document.activeElement).toBe(options[0]);
    wrapper.unmount();
  });

  it("Enter on focused option selects it and closes the panel", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a" },
    });
    const trigger = wrapper.get("[data-modo-switcher-trigger]").element;
    pressKey(trigger, "ArrowDown");
    await flushPromises();
    const options = document.querySelectorAll('[role="option"]');
    pressKey(options[0], "ArrowDown");
    await flushPromises();
    pressKey(document.activeElement!, "Enter");
    await flushPromises();
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["b"]);
    expect(document.querySelector("[data-modo-switcher-panel]")).toBeNull();
    wrapper.unmount();
  });

  it("Escape closes the panel and returns focus to the trigger", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a" },
    });
    const triggerEl = wrapper.get("[data-modo-switcher-trigger]").element as HTMLElement;
    pressKey(triggerEl, "ArrowDown");
    await flushPromises();
    const options = document.querySelectorAll('[role="option"]');
    pressKey(options[0], "Escape");
    await flushPromises();
    expect(document.querySelector("[data-modo-switcher-panel]")).toBeNull();
    expect(document.activeElement).toBe(triggerEl);
    wrapper.unmount();
  });

  it("type-ahead: pressing a letter focuses the first option whose title starts with it", async () => {
    const its: SwitcherItem[] = [
      { value: "a", title: "Alpha" },
      { value: "b", title: "Bravo" },
      { value: "c", title: "Charlie" },
    ];
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items: its, modelValue: "a" },
    });
    const trigger = wrapper.get("[data-modo-switcher-trigger]").element;
    pressKey(trigger, "ArrowDown");
    await flushPromises();
    const options = document.querySelectorAll('[role="option"]');
    pressKey(options[0], "c");
    await flushPromises();
    expect(document.activeElement).toBe(options[2]);
    wrapper.unmount();
  });
});

describe("Switcher (search)", () => {
  it("renders a search input when searchable=true", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a", searchable: true },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();
    expect(document.querySelector('[role="searchbox"]')).not.toBeNull();
    wrapper.unmount();
  });

  it("filters items by title (case-insensitive contains) on input", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a", searchable: true },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();

    const input = document.querySelector('[role="searchbox"]') as HTMLInputElement;
    input.value = "sweet";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();

    const options = document.querySelectorAll('[role="option"]');
    expect(options.length).toBe(1);
    expect(options[0].textContent).toContain("Sweet Home");

    wrapper.unmount();
  });

  it("filters by subtitle as well by default", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a", searchable: true },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();

    const input = document.querySelector('[role="searchbox"]') as HTMLInputElement;
    input.value = "4220";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();

    const options = document.querySelectorAll('[role="option"]');
    expect(options.length).toBe(1);
    expect(options[0].textContent).toContain("Cake Shop");

    wrapper.unmount();
  });

  it("emits @search on every keystroke", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a", searchable: true },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();

    const input = document.querySelector('[role="searchbox"]') as HTMLInputElement;
    input.value = "ab";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();

    expect(wrapper.emitted("search")?.[0]).toEqual(["ab"]);
    wrapper.unmount();
  });

  it("shows noResultsText when filter returns no items", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: {
        items,
        modelValue: "a",
        searchable: true,
        noResultsText: "Nada",
      },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();

    const input = document.querySelector('[role="searchbox"]') as HTMLInputElement;
    input.value = "zzz_no_match";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();

    const panel = document.querySelector("[data-modo-switcher-panel]")!;
    expect(panel.textContent).toContain("Nada");
    expect(document.querySelectorAll('[role="option"]').length).toBe(0);

    wrapper.unmount();
  });

  it("clears the search query when the panel closes", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a", searchable: true },
    });
    const trigger = wrapper.get("[data-modo-switcher-trigger]");
    await trigger.trigger("click");
    await nextTick();
    const input = document.querySelector('[role="searchbox"]') as HTMLInputElement;
    input.value = "sweet";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();
    await trigger.trigger("click");
    await nextTick();
    await trigger.trigger("click");
    await nextTick();
    const reopened = document.querySelector('[role="searchbox"]') as HTMLInputElement;
    expect(reopened.value).toBe("");
    expect(document.querySelectorAll('[role="option"]').length).toBe(3);
    wrapper.unmount();
  });
});

describe("Switcher (loading & empty)", () => {
  it("renders 3 Skeleton placeholders when loading=true", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a", loading: true },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();
    expect(document.querySelectorAll("[data-modo-switcher-skeleton]").length).toBe(3);
    expect(document.querySelectorAll('[role="option"]').length).toBe(0);
    wrapper.unmount();
  });

  it("renders emptyText when items is empty", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items: [], modelValue: null, emptyText: "Nothing yet" },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();
    expect(document.querySelector("[data-modo-switcher-panel]")!.textContent).toContain("Nothing yet");
    wrapper.unmount();
  });

  it("falls back to locale.empty when emptyText prop is omitted", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items: [], modelValue: null },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();
    expect(document.querySelector("[data-modo-switcher-panel]")!.textContent).toContain("No options.");
    wrapper.unmount();
  });

  it("renders #empty slot override when items is empty", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items: [], modelValue: null },
      slots: { empty: '<div data-testid="custom-empty">Custom empty</div>' },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();
    expect(document.querySelector('[data-testid="custom-empty"]')).not.toBeNull();
    wrapper.unmount();
  });

  it("renders #loading slot override when loading=true", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a", loading: true },
      slots: { loading: '<div data-testid="custom-loading">Loading…</div>' },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();
    expect(document.querySelector('[data-testid="custom-loading"]')).not.toBeNull();
    expect(document.querySelectorAll("[data-modo-switcher-skeleton]").length).toBe(0);
    wrapper.unmount();
  });
});

describe("Switcher (selection)", () => {
  it("emits update:modelValue and change on item click, closes the panel", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a" },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();

    const second = document.querySelectorAll('[role="option"]')[1] as HTMLElement;
    second.click();
    await nextTick();

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["b"]);
    expect(wrapper.emitted("change")?.[0]).toEqual(["b", items[1]]);
    expect(document.querySelector("[data-modo-switcher-panel]")).toBeNull();

    wrapper.unmount();
  });

  it("emits open and close as the panel toggles", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a" },
    });
    const trigger = wrapper.get("[data-modo-switcher-trigger]");
    await trigger.trigger("click");
    await nextTick();
    expect(wrapper.emitted("open")?.length).toBe(1);
    await trigger.trigger("click");
    await nextTick();
    expect(wrapper.emitted("close")?.length).toBe(1);
    wrapper.unmount();
  });

  it("ignores clicks on disabled items", async () => {
    const its: SwitcherItem[] = [
      { value: "a", title: "A" },
      { value: "b", title: "B", disabled: true },
    ];
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items: its, modelValue: "a" },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();

    const disabled = document.querySelectorAll('[role="option"]')[1] as HTMLElement;
    disabled.click();
    await nextTick();

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(document.querySelector("[data-modo-switcher-panel]")).not.toBeNull();
    wrapper.unmount();
  });

  it("when the entire switcher is disabled, click on trigger does nothing", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a", disabled: true },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();
    expect(document.querySelector("[data-modo-switcher-panel]")).toBeNull();
    wrapper.unmount();
  });
});

describe("Switcher (item visuals)", () => {
  it("renders the item's icon component inside a tinted container when icon is set", async () => {
    const itemsWithIcon: SwitcherItem[] = [
      { value: "x", title: "Studio Office", icon: HouseStub },
    ];
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items: itemsWithIcon, modelValue: "x" },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();

    const option = document.querySelector('[role="option"]')!;
    expect(option.querySelector('[data-testid="house-icon"]')).not.toBeNull();
    expect(option.querySelector("[data-modo-switcher-iconwrap]")).not.toBeNull();

    wrapper.unmount();
  });

  it("renders <Avatar/> when item has avatar set", async () => {
    const itemsWithAvatar: SwitcherItem[] = [
      { value: "y", title: "Ryan Johnson", avatar: { src: "x.png", initials: "RJ" } },
    ];
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items: itemsWithAvatar, modelValue: "y" },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();

    const option = document.querySelector('[role="option"]')!;
    expect(option.querySelector("img")).not.toBeNull();

    wrapper.unmount();
  });

  it("logs a dev warning when both icon and avatar are set, and prefers avatar", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const bothItems: SwitcherItem[] = [
      {
        value: "z",
        title: "Mixed",
        icon: HouseStub,
        avatar: { initials: "MX" },
      },
    ];
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items: bothItems, modelValue: "z" },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Switcher] item "z"'),
    );
    const option = document.querySelector('[role="option"]')!;
    expect(option.querySelector('[data-testid="house-icon"]')).toBeNull();

    warnSpy.mockRestore();
    wrapper.unmount();
  });
});

describe("Switcher (items)", () => {
  it("renders one option per item with title and subtitle inside the panel", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a" },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();

    const options = document.querySelectorAll('[role="option"]');
    expect(options.length).toBe(3);
    expect(options[0].textContent).toContain("Studio Office");
    expect(options[0].textContent).toContain("05064005868");
    expect(options[1].textContent).toContain("Sweet Home");
    expect(options[2].textContent).toContain("Cake Shop");

    wrapper.unmount();
  });

  it("marks the active option with aria-current and aria-selected", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "b" },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();

    const options = document.querySelectorAll('[role="option"]');
    expect(options[1].getAttribute("aria-current")).toBe("true");
    expect(options[1].getAttribute("aria-selected")).toBe("true");
    expect(options[0].getAttribute("aria-current")).toBeNull();
    expect(options[0].getAttribute("aria-selected")).toBe("false");

    wrapper.unmount();
  });

  it("renders panelTitle when provided", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a", panelTitle: "Switch profile" },
    });
    await wrapper.get("[data-modo-switcher-trigger]").trigger("click");
    await nextTick();

    const panel = document.querySelector("[data-modo-switcher-panel]")!;
    expect(panel.textContent).toContain("Switch profile");

    wrapper.unmount();
  });
});

describe("Switcher (scaffold)", () => {
  it("renders trigger with placeholder when modelValue is null", () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: null, placeholder: "Pick one" },
    });
    const trigger = wrapper.get("[data-modo-switcher-trigger]");
    expect(trigger.text()).toContain("Pick one");
    wrapper.unmount();
  });

  it("renders trigger with active item title when modelValue matches", () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "b" },
    });
    const trigger = wrapper.get("[data-modo-switcher-trigger]");
    expect(trigger.text()).toContain("Sweet Home");
    expect(trigger.text()).toContain("05064005214");
    wrapper.unmount();
  });

  it("toggles the panel open/closed on trigger click", async () => {
    const wrapper = mount(Switcher, {
      attachTo: document.body,
      props: { items, modelValue: "a" },
    });
    const trigger = wrapper.get("[data-modo-switcher-trigger]");

    expect(document.querySelector("[data-modo-switcher-panel]")).toBeNull();

    await trigger.trigger("click");
    await nextTick();
    expect(document.querySelector("[data-modo-switcher-panel]")).not.toBeNull();

    await trigger.trigger("click");
    await nextTick();
    expect(document.querySelector("[data-modo-switcher-panel]")).toBeNull();

    wrapper.unmount();
  });
});
