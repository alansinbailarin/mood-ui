import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import Button from "../../../src/components/forms/Button.vue";

const IconStub = defineComponent({
  setup() {
    return () => h("svg", { "data-testid": "icon" });
  },
});

describe("Button sizeClasses — icon+text vs icon-only", () => {
  it("applies text-button x-padding when icon and slot text are both present", () => {
    const wrapper = mount(Button, {
      props: { icon: IconStub },
      slots: { default: "Continue" },
    });
    // medium text-button: px-5 py-1.5 — NOT p-2 (icon-only)
    const button = wrapper.find("button");
    expect(button.classes()).toContain("px-5");
    expect(button.classes()).toContain("py-1.5");
    expect(button.classes()).not.toContain("p-2");
  });

  it("applies icon-only padding when icon is present but no label and no slot", () => {
    const wrapper = mount(Button, {
      props: { icon: IconStub, ariaLabel: "Submit" },
    });
    // medium icon-only: p-2
    const button = wrapper.find("button");
    expect(button.classes()).toContain("p-2");
    expect(button.classes()).not.toContain("px-5");
  });

  it("applies text-button padding when label prop and icon are both present", () => {
    const wrapper = mount(Button, {
      props: { label: "Continue", icon: IconStub },
    });
    const button = wrapper.find("button");
    expect(button.classes()).toContain("px-5");
    expect(button.classes()).not.toContain("p-2");
  });
});
