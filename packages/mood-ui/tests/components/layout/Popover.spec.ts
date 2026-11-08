import { describe, it, expect, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "../../../src/components/layout/popover";
import { MODO_CONFIG, defaultModoConfig, type ModoConfig } from "../../../src/config/ModoConfig";

let mounted: VueWrapper[] = [];

afterEach(() => {
  mounted.forEach((w) => w.unmount());
  mounted = [];
  document.body.innerHTML = "";
});

const panel = () => document.querySelector<HTMLElement>("[data-modo-popover]");

async function flush() {
  for (let i = 0; i < 4; i++) await nextTick();
}

function mountPopover(options: {
  rootProps?: Record<string, unknown>;
  contentProps?: Record<string, unknown>;
  asChild?: boolean;
  childId?: string;
  provider?: Partial<ModoConfig>;
  closeSlot?: boolean;
} = {}) {
  const Harness = defineComponent({
    setup() {
      return () =>
        h(Popover, { defaultOpen: false, ...options.rootProps }, () => [
          h(PopoverTrigger, { asChild: options.asChild }, () =>
            options.asChild
              ? h("button", { type: "button", class: "custom", id: options.childId }, "Open")
              : "Open",
          ),
          h(PopoverContent, options.contentProps ?? {}, () => [
            h("p", "Body"),
            options.closeSlot
              ? h(PopoverClose, null, () => "Done")
              : h(PopoverClose),
          ]),
        ]);
    },
  });
  const wrapper = mount(Harness, {
    attachTo: document.body,
    global: options.provider
      ? { provide: { [MODO_CONFIG as symbol]: ref({ ...defaultModoConfig, ...options.provider }) } }
      : undefined,
  });
  mounted.push(wrapper as VueWrapper);
  return wrapper;
}

describe("Popover", () => {
  it("renders the default trigger as a native Button", () => {
    const wrapper = mountPopover();
    const trigger = wrapper.get("button");
    expect(trigger.classes()).toContain("modo-morph-trigger");
    expect(trigger.attributes("aria-haspopup")).toBe("dialog");
    expect(trigger.attributes("aria-expanded")).toBe("false");
    // Native Button outline look, neutralised like DropdownMenu's trigger.
    expect(trigger.classes()).toContain("!border-border");
  });

  it("opens on click and labels the panel with the trigger id", async () => {
    const wrapper = mountPopover();
    const trigger = wrapper.get("button");
    await trigger.trigger("click");
    await flush();
    const p = panel();
    expect(p).not.toBeNull();
    expect(p!.getAttribute("role")).toBe("dialog");
    expect(p!.classList.contains("text-body")).toBe(true);
    const labelledBy = p!.getAttribute("aria-labelledby");
    expect(labelledBy).toBe(trigger.attributes("id"));
    expect(document.getElementById(labelledBy!)).not.toBeNull();
  });

  it("asChild: the panel is labelled by an id that exists on the child", async () => {
    const wrapper = mountPopover({ asChild: true });
    const child = wrapper.get("button.custom");
    await child.trigger("click");
    await flush();
    const labelledBy = panel()!.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)).toBe(child.element);
    expect(child.attributes("aria-haspopup")).toBe("dialog");
    expect(child.attributes("aria-expanded")).toBe("true");
  });

  it("asChild: keeps the consumer's own id", async () => {
    const wrapper = mountPopover({ asChild: true, childId: "mine" });
    await wrapper.get("button.custom").trigger("click");
    await flush();
    expect(panel()!.getAttribute("aria-labelledby")).toBe("mine");
  });

  it("default close renders an icon Button with the localized label and closes", async () => {
    const wrapper = mountPopover();
    await wrapper.get("button").trigger("click");
    await flush();
    const close = panel()!.querySelector<HTMLButtonElement>('button[aria-label="Close"]');
    expect(close).not.toBeNull();
    close!.click();
    await flush();
    expect(panel()).toBeNull();
  });

  it("close with slot content renders a labelled Button", async () => {
    const wrapper = mountPopover({ closeSlot: true });
    await wrapper.get("button").trigger("click");
    await flush();
    const close = Array.from(panel()!.querySelectorAll("button")).find(
      (b) => b.textContent?.trim() === "Done",
    );
    expect(close).toBeTruthy();
  });

  it("forwards radius and size from the root, local content props win", async () => {
    const wrapper = mountPopover({
      rootProps: { radius: "large", size: "large" },
    });
    await wrapper.get("button").trigger("click");
    await flush();
    expect(panel()!.style.getPropertyValue("--modo-menu-radius")).toBe("0.75rem");
    expect(panel()!.style.getPropertyValue("--modo-popover-padding")).toBe("1.25rem 1.375rem");
    wrapper.unmount();
    mounted = [];

    const second = mountPopover({
      rootProps: { radius: "large" },
      contentProps: { radius: "none" },
    });
    await second.get("button").trigger("click");
    await flush();
    expect(panel()!.style.getPropertyValue("--modo-menu-radius")).toBe("0px");
  });

  it("inherits radius from the provider", async () => {
    const wrapper = mountPopover({ provider: { radius: "small" } });
    await wrapper.get("button").trigger("click");
    await flush();
    expect(panel()!.style.getPropertyValue("--modo-menu-radius")).toBe("0.25rem");
  });

  it("colors the default trigger from the root color", () => {
    const wrapper = mountPopover({ rootProps: { color: "danger" } });
    const classes = wrapper.get("button").classes();
    // danger keeps the destructive outline (no neutral override)
    expect(classes).not.toContain("!border-border");
    expect(classes.some((c) => c.includes("destructive"))).toBe(true);
  });

  it("closes on Escape", async () => {
    const wrapper = mountPopover();
    await wrapper.get("button").trigger("click");
    await flush();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await flush();
    expect(panel()).toBeNull();
    expect(wrapper.get("button").attributes("aria-expanded")).toBe("false");
  });
});
