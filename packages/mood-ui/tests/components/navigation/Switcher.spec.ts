import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
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
