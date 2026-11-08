import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { gsap } from "gsap";
import Modal from "../../../src/components/feedback/Modal.vue";

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

function mountModal(props: Record<string, unknown> = {}) {
  const wrapper = mount(Modal, {
    props: {
      modelValue: true,
      title: "Confirm action",
      description: "Unified content animation.",
      ...props,
    },
    slots: {
      default: "<p>Modal body content</p>",
      footer: "<button type='button'>Confirm</button>",
    },
    attachTo: document.body,
  });
  mounted.push(wrapper as VueWrapper);
  return wrapper;
}

describe("Modal — unified panel and content animation", () => {
  it("renders content immediately inside the panel without a separate opacity-0 stage", () => {
    mountModal();

    const panel = document.querySelector<HTMLElement>("[data-modo-modal-panel]");
    const content = document.querySelector<HTMLElement>("[data-modo-modal-content]");

    expect(panel).not.toBeNull();
    expect(content).not.toBeNull();
    expect(content!.classList.contains("opacity-0")).toBe(false);
    expect(content!.textContent).toContain("Modal body content");
    expect(panel!.className).toContain("focus-visible:outline-none");
  });

  it("supports xsmall size alongside existing sizes without breaking defaults", () => {
    mountModal({ size: "xsmall" });
    const panel = document.querySelector<HTMLElement>("[data-modo-modal-panel]")!;
    expect(panel.classList.contains("max-w-xs")).toBe(true);
  });

  it("emits update:modelValue(false) and close on Escape keydown and backdrop click", async () => {
    const wrapper = mountModal();
    const overlay = document.querySelector<HTMLElement>(".modo-modal-overlay")!;
    const panel = document.querySelector<HTMLElement>("[data-modo-modal-panel]")!;

    panel.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
    expect(wrapper.emitted("close")).toHaveLength(1);

    // Re-open and test backdrop click
    await wrapper.setProps({ modelValue: true });
    const reopenedOverlay = document.querySelector<HTMLElement>(".modo-modal-overlay")!;
    reopenedOverlay.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    reopenedOverlay.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")).toHaveLength(2);
    expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([false]);
    expect(overlay).not.toBeNull();
  });

  it("animates the modal panel back to its origin element on leave with content intact", async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;

    const originBtn = document.createElement("button");
    document.body.appendChild(originBtn);
    vi.spyOn(originBtn, "getBoundingClientRect").mockReturnValue({
      left: 40,
      top: 50,
      width: 120,
      height: 36,
      right: 160,
      bottom: 86,
      x: 40,
      y: 50,
      toJSON: () => ({}),
    });

    const timelineSpy = vi.spyOn(gsap, "timeline");

    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
        title: "Confirm action",
        origin: originBtn,
      },
      slots: {
        default: "<p>Modal body content</p>",
      },
      global: {
        stubs: { transition: false },
      },
      attachTo: document.body,
    });
    mounted.push(wrapper);
    const panel = document.querySelector<HTMLElement>("[data-modo-modal-panel]")!;
    vi.spyOn(panel, "getBoundingClientRect").mockReturnValue({
      left: 400,
      top: 200,
      width: 448,
      height: 300,
      right: 848,
      bottom: 500,
      x: 400,
      y: 200,
      toJSON: () => ({}),
    });

    timelineSpy.mockClear();
    await wrapper.setProps({ modelValue: false });

    expect(timelineSpy).toHaveBeenCalled();
    const leaveTl = timelineSpy.mock.results[0]?.value as gsap.core.Timeline;
    const children = leaveTl.getChildren(false, true, false) as gsap.core.Tween[];

    // Panel tween translates & scales back to originBtn center without separate content fade
    const panelTween = children.find((tw) => tw.targets().includes(panel));
    expect(panelTween).toBeDefined();
    expect(panelTween!.vars.x).toBe(40 + 60 - (400 + 224));
    expect(panelTween!.vars.y).toBe(50 + 18 - (200 + 150));
    expect(panelTween!.vars.opacity).toBeUndefined();

    timelineSpy.mockRestore();
    window.matchMedia = originalMatchMedia;
  });
});
