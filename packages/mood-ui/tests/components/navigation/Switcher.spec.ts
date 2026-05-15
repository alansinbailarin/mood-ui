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
