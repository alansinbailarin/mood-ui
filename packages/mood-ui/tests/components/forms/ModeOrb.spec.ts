import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import ModeOrb from "../../../src/components/forms/ModeOrb.vue";
import ModoProvider from "../../../src/components/ModoProvider.vue";
import { useColorMode } from "../../../src/composables/useColorMode";

function mountInProvider(providerProps: Record<string, unknown>, orbProps: Record<string, unknown> = {}) {
  return mount({
    render: () => h(ModoProvider, providerProps, () => h(ModeOrb, orbProps)),
  }, { attachTo: document.body });
}

describe("ModeOrb", () => {
  beforeEach(() => {
    useColorMode().set("light");
  });

  it("toggles the global color mode when clicked (no view transition support)", async () => {
    const wrapper = mount(ModeOrb, { attachTo: document.body });
    await wrapper.find("button").trigger("click");
    expect(useColorMode().resolved.value).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    await wrapper.find("button").trigger("click");
    expect(useColorMode().resolved.value).toBe("light");
    wrapper.unmount();
  });

  it("reports the current mode through aria-pressed", async () => {
    const wrapper = mount(ModeOrb);
    await wrapper.vm.$nextTick();
    expect(wrapper.find("button").attributes("aria-pressed")).toBe("false");
    useColorMode().set("dark");
    await wrapper.vm.$nextTick();
    expect(wrapper.find("button").attributes("aria-pressed")).toBe("true");
  });

  it("sizes the orb with the shared control height and follows the provider size", () => {
    expect(mount(ModeOrb).find("button").classes()).toEqual(expect.arrayContaining(["h-10", "w-10"]));
    const wrapper = mountInProvider({ size: "large" });
    expect(wrapper.find("button").classes()).toEqual(expect.arrayContaining(["h-12", "w-12"]));
    wrapper.unmount();
  });

  it("resolves its color from the provider", () => {
    const wrapper = mountInProvider({ color: "primary" });
    expect(wrapper.find("button").attributes("data-modo-color")).toBe("primary");
    wrapper.unmount();
  });

  it("uses the provider locale for its accessible name", () => {
    const wrapper = mountInProvider({ locale: { modeOrb: { toggle: "Cambiar modo de color" } } });
    expect(wrapper.find("button").attributes("aria-label")).toBe("Cambiar modo de color");
    wrapper.unmount();
  });

  it("does nothing while disabled", async () => {
    const wrapper = mount(ModeOrb, { props: { disabled: true } });
    await wrapper.find("button").trigger("click");
    expect(useColorMode().resolved.value).toBe("light");
    expect(wrapper.find("button").classes()).toContain("opacity-40");
  });
});
