import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Card from "../../../src/components/data-display/Card.vue";

describe("Card — variant surfaces & layout stability", () => {
  it("renders variant='outlined' (default) with transparent background and border, without bg-card tint", () => {
    const wrapper = mount(Card, {
      slots: { default: "Outlined content" },
    });

    expect(wrapper.classes()).toContain("bg-transparent");
    expect(wrapper.classes()).toContain("border");
    expect(wrapper.classes()).toContain("border-border");
    expect(wrapper.classes()).not.toContain("bg-card");
    expect(wrapper.classes()).not.toContain("bg-muted");
  });

  it("renders variant='filled' with subtle card surface fill (modo-card--filled) instead of heavy bg-muted, and transparent border for zero shift", () => {
    const wrapper = mount(Card, {
      props: { variant: "filled", hoverable: true },
      slots: {
        header: "Header",
        default: "Filled content",
        footer: "Footer",
      },
    });

    expect(wrapper.classes()).toContain("modo-card--filled");
    expect(wrapper.classes()).toContain("modo-card--filled-hover");
    expect(wrapper.classes()).toContain("text-card-foreground");
    expect(wrapper.classes()).toContain("border");
    expect(wrapper.classes()).toContain("border-transparent");
    expect(wrapper.classes()).not.toContain("bg-muted");
    // Header and footer dividers remain visible via explicit border-border
    const children = wrapper.findAll(":scope > div");
    expect(children[0]?.classes()).toContain("border-border");
    expect(children[2]?.classes()).toContain("border-border");
  });

  it("renders variant='elevated' with bg-card, border, and shadow-sm", () => {
    const wrapper = mount(Card, {
      props: { variant: "elevated" },
      slots: { default: "Elevated content" },
    });

    expect(wrapper.classes()).toContain("bg-card");
    expect(wrapper.classes()).toContain("border");
    expect(wrapper.classes()).toContain("shadow-sm");
  });

  it("renders a native button with type='button' and single focus ring when clickable=true", () => {
    const wrapper = mount(Card, {
      props: { clickable: true },
      slots: { default: "Action card" },
    });

    expect(wrapper.element.tagName).toBe("BUTTON");
    expect(wrapper.attributes("type")).toBe("button");
    expect(wrapper.classes()).toContain("focus-visible:outline-none");
  });
});
