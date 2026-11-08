import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { h } from "vue";
import Drawer from "../../../src/components/feedback/Drawer.vue";
import ModoProvider from "../../../src/components/ModoProvider.vue";

beforeAll(() => {
  if (typeof window !== "undefined" && !window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: query.includes("reduce"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }
});

let mounted: VueWrapper[] = [];

afterEach(() => {
  mounted.forEach((w) => w.unmount());
  mounted = [];
  document.body.innerHTML = "";
});

function mountDrawer(props: Record<string, unknown> = {}) {
  const wrapper = mount(Drawer, {
    props: {
      modelValue: true,
      title: "Filters",
      description: "Interactive preview.",
      ...props,
    },
    slots: {
      default: "<p>Drawer content.</p>",
    },
    attachTo: document.body,
  });
  mounted.push(wrapper as VueWrapper);
  return wrapper;
}

describe("Drawer — floating inset design & backwards compatibility", () => {
  it("detaches from all viewport edges by default (inset=true) with 4-sided border and 4-corner radius", () => {
    mountDrawer({ side: "right" });

    const overlay = document.querySelector<HTMLElement>(".modo-drawer-overlay");
    const panel = document.querySelector<HTMLElement>("[data-modo-drawer-panel]");
    const content = document.querySelector<HTMLElement>("[data-modo-drawer-content]");

    expect(overlay).not.toBeNull();
    expect(panel).not.toBeNull();
    expect(content).not.toBeNull();

    // Floating margin around all 4 viewport edges
    expect(overlay!.className).toContain("p-2.5");

    // Full 4-sided border & 4-corner radius (default medium -> rounded-[0.875rem], same scale as Sheet/Dialog)
    expect(panel!.classList.contains("border")).toBe(true);
    expect(panel!.classList.contains("rounded-[0.875rem]")).toBe(true);
    expect(panel!.classList.contains("rounded-l-xl")).toBe(false);

    // Content is immediately visible as part of the panel (no delayed opacity-0)
    expect(content!.classList.contains("opacity-0")).toBe(false);
  });

  it("keeps floating inset margin and 4 rounded corners on left, top, and bottom sides", () => {
    for (const side of ["left", "top", "bottom"] as const) {
      const w = mountDrawer({ side, radius: "large" });
      const overlay = document.querySelector<HTMLElement>(".modo-drawer-overlay");
      const panel = document.querySelector<HTMLElement>("[data-modo-drawer-panel]");

      expect(overlay!.className).toContain("p-2.5");
      expect(panel!.classList.contains("border")).toBe(true);
      expect(panel!.classList.contains("rounded-[1.25rem]")).toBe(true);

      w.unmount();
      document.body.innerHTML = "";
    }
  });

  it("responds to ModoProvider radius cascade across all radius tokens", () => {
    const expectedMap = {
      none: "rounded-none",
      small: "rounded-[0.5rem]",
      medium: "rounded-[0.875rem]",
      large: "rounded-[1.25rem]",
      full: "rounded-[1.75rem]",
    } as const;

    for (const [radius, expectedClass] of Object.entries(expectedMap)) {
      const wrapper = mount(ModoProvider, {
        props: { radius: radius as keyof typeof expectedMap },
        slots: {
          default: () =>
            h(Drawer, { modelValue: true, title: "Radius check" }, () => "Body"),
        },
        attachTo: document.body,
      });
      mounted.push(wrapper);

      const panel = document.querySelector<HTMLElement>("[data-modo-drawer-panel]");
      expect(panel!.classList.contains(expectedClass)).toBe(true);

      wrapper.unmount();
      document.body.innerHTML = "";
    }
  });

  it("supports xsmall through full sizes without overflowing the padded overlay", () => {
    mountDrawer({ side: "right", size: "xsmall" });
    let panel = document.querySelector<HTMLElement>("[data-modo-drawer-panel]");
    expect(panel!.className).toContain("w-[16rem]");

    mounted.pop()?.unmount();
    document.body.innerHTML = "";

    mountDrawer({ side: "right", size: "full" });
    panel = document.querySelector<HTMLElement>("[data-modo-drawer-panel]");
    expect(panel!.className).toContain("w-full");
    expect(panel!.className).not.toContain("w-screen");
  });

  it("preserves legacy flush edge mode when inset=false is explicitly passed", () => {
    mountDrawer({ side: "right", inset: false });

    const overlay = document.querySelector<HTMLElement>(".modo-drawer-overlay");
    const panel = document.querySelector<HTMLElement>("[data-modo-drawer-panel]");

    expect(overlay!.className).not.toContain("p-2.5");
    expect(panel!.classList.contains("border-l")).toBe(true);
    expect(panel!.classList.contains("rounded-l-xl")).toBe(true);
  });

  it("emits update:modelValue(false) and close on Escape keydown", async () => {
    const wrapper = mountDrawer({ side: "right" });
    const panel = document.querySelector<HTMLElement>("[data-modo-drawer-panel]")!;

    panel.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});
