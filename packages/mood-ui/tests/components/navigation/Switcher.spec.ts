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
