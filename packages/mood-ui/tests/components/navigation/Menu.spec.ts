import { describe, it, expect, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import {
  ContextMenu,
  ContextMenuTrigger,
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
} from "../../../src/components/navigation/menu";
import { MODO_CONFIG, defaultModoConfig, type ModoConfig } from "../../../src/config/ModoConfig";

let mounted: VueWrapper[] = [];

afterEach(() => {
  mounted.forEach((w) => w.unmount());
  mounted = [];
  document.body.innerHTML = "";
});

const panel = () => document.querySelector<HTMLElement>("[data-modo-menu]");
const items = () => Array.from(document.querySelectorAll<HTMLElement>("[data-modo-menu-item]"));

async function flush() {
  for (let i = 0; i < 4; i++) await nextTick();
}

const Icon = defineComponent({ render: () => h("svg", { "data-test-icon": "" }) });

function mountMenu(options: {
  rootProps?: Record<string, unknown>;
  contentProps?: Record<string, unknown>;
  asChild?: boolean | "span";
  provider?: Partial<ModoConfig>;
  onSelect?: () => void;
} = {}) {
  const Harness = defineComponent({
    setup() {
      return () =>
        h(Menu, { ...options.rootProps }, () => [
          h(MenuTrigger, { asChild: !!options.asChild }, () =>
            options.asChild === "span"
              ? h("span", { role: "button", tabindex: 0, class: "custom" }, "Open")
              : options.asChild
                ? h("button", { type: "button", class: "custom" }, "Open")
                : "Open",
          ),
          h(MenuContent, options.contentProps ?? {}, () => [
            h(MenuLabel, null, () => "Actions"),
            h(MenuItem, { icon: Icon, shortcut: "⌘D", onSelect: options.onSelect }, () => "Duplicate"),
            h(MenuItem, { color: "danger" }, () => "Delete"),
            h(MenuSeparator),
            h(MenuItem, { disabled: true }, () => "Archive"),
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

async function open(wrapper: VueWrapper, selector = "button") {
  await wrapper.get(selector).trigger("click");
  await flush();
}

describe("Menu", () => {
  it("renders the default trigger as a native Button", () => {
    const wrapper = mountMenu();
    const trigger = wrapper.get("button");
    expect(trigger.classes()).toContain("modo-morph-trigger");
    expect(trigger.classes()).toContain("!border-border");
    expect(trigger.attributes("aria-haspopup")).toBe("menu");
  });

  it("opens with a panel labelled by the trigger", async () => {
    const wrapper = mountMenu();
    await open(wrapper);
    const p = panel()!;
    expect(p.getAttribute("role")).toBe("menu");
    const labelledBy = p.getAttribute("aria-labelledby");
    expect(document.getElementById(labelledBy!)).toBe(wrapper.get("button").element);
  });

  it("asChild: labelledby points to an element that exists", async () => {
    const wrapper = mountMenu({ asChild: true });
    await open(wrapper, "button.custom");
    const labelledBy = panel()!.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)).toBe(wrapper.get("button.custom").element);
  });

  it("asChild on a non-native element opens with Enter and Space", async () => {
    for (const key of ["Enter", " "]) {
      const wrapper = mountMenu({ asChild: "span" });
      await wrapper.get("span.custom").trigger("keydown", { key });
      await flush();
      expect(panel(), `key ${JSON.stringify(key)}`).not.toBeNull();
      wrapper.unmount();
      mounted = mounted.filter((w) => w !== wrapper);
      document.body.innerHTML = "";
    }
  });

  it("asChild on a native button leaves Enter to the browser's click", async () => {
    const wrapper = mountMenu({ asChild: true });
    await wrapper.get("button.custom").trigger("keydown", { key: "Enter" });
    await flush();
    expect(panel()).toBeNull();
  });

  it("rows use color, text and size tokens", async () => {
    const wrapper = mountMenu();
    await open(wrapper);
    const [duplicate, del, archive] = items();
    expect(duplicate.getAttribute("data-modo-color")).toBe("default");
    expect(duplicate.classList.contains("text-body")).toBe(true);
    expect(del.getAttribute("data-modo-color")).toBe("danger");
    expect(archive.hasAttribute("disabled")).toBe(true);

    const icon = duplicate.querySelector(".modo-menu-item__icon")!;
    // medium size token
    expect(icon.className).toContain("h-[18px]");
    expect(icon.classList.contains("modo-affordance-icon")).toBe(true);

    const shortcut = duplicate.querySelector(".modo-menu-item__shortcut")!;
    expect(shortcut.classList.contains("text-caption")).toBe(true);
    expect(shortcut.classList.contains("text-muted-foreground")).toBe(true);

    const label = document.querySelector("[data-modo-menu-label]")!;
    expect(label.className).toContain("text-caption");
    expect(label.className).toContain("font-semibold");
    expect(label.className).toContain("text-muted-foreground");

    const sep = document.querySelector("[data-modo-menu-separator]")!;
    expect(sep.classList.contains("bg-border")).toBe(true);
  });

  it("an explicit danger menu turns uncolored rows into danger rows; provider color does not", async () => {
    const wrapper = mountMenu({ rootProps: { color: "danger" } });
    await open(wrapper);
    expect(items()[0].getAttribute("data-modo-color")).toBe("danger");
    wrapper.unmount();
    mounted = [];

    const second = mountMenu({ provider: { color: "primary" } });
    await open(second);
    expect(items()[0].getAttribute("data-modo-color")).toBe("default");
  });

  it("radius and size flow from root to panel and rows; content overrides win", async () => {
    const wrapper = mountMenu({ rootProps: { radius: "full", size: "large" } });
    await open(wrapper);
    expect(panel()!.style.getPropertyValue("--modo-menu-radius")).toBe("1rem");
    expect(panel()!.style.getPropertyValue("--modo-menu-item-padding")).toBe("0.75rem 1rem");
    expect(items()[0].querySelector(".modo-menu-item__icon")!.className).toContain("h-5");
    wrapper.unmount();
    mounted = [];

    const second = mountMenu({ rootProps: { size: "large" }, contentProps: { size: "xsmall" } });
    await open(second);
    expect(items()[0].querySelector(".modo-menu-item__icon")!.className).toContain("h-3.5");
  });

  it("selecting an item emits select and closes", async () => {
    let selected = 0;
    const wrapper = mountMenu({ onSelect: () => selected++ });
    await open(wrapper);
    items()[0].click();
    await flush();
    expect(selected).toBe(1);
    expect(panel()).toBeNull();
  });

  it("disabled items do not select", async () => {
    const wrapper = mountMenu();
    await open(wrapper);
    items()[2].click();
    await flush();
    expect(panel()).not.toBeNull();
  });

  it("arrow keys move focus between enabled rows", async () => {
    const wrapper = mountMenu();
    await open(wrapper);
    const [first, second] = items();
    expect(document.activeElement).toBe(first);
    panel()!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(document.activeElement).toBe(second);
    // the disabled row is skipped
    panel()!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(document.activeElement).toBe(first);
  });
});

describe("ContextMenu", () => {
  function mountContext(rootProps: Record<string, unknown> = {}) {
    const Harness = defineComponent({
      setup() {
        return () =>
          h(ContextMenu, rootProps, () => [
            h(ContextMenuTrigger, null, () => h("div", { class: "area" }, "Right click")),
            h(MenuContent, null, () => [h(MenuItem, null, () => "Copy")]),
          ]);
      },
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    mounted.push(wrapper as VueWrapper);
    return wrapper;
  }

  it("opens at the pointer with radius/size/color from its own props", async () => {
    const wrapper = mountContext({ radius: "none", size: "small", color: "danger" });
    await wrapper.get("[data-modo-context-trigger]").trigger("contextmenu", {
      clientX: 40,
      clientY: 50,
    });
    await flush();
    const p = panel()!;
    expect(p).not.toBeNull();
    expect(p.hasAttribute("aria-labelledby")).toBe(false);
    expect(p.style.getPropertyValue("--modo-menu-radius")).toBe("0px");
    expect(p.style.getPropertyValue("--modo-menu-item-padding")).toBe("0.5rem 0.75rem");
    expect(items()[0].getAttribute("data-modo-color")).toBe("danger");
  });
});
