import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import ModoProvider from "../../../src/components/ModoProvider.vue";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogIcon,
  DialogTitle,
  DialogTrigger,
} from "../../../src/components/feedback/dialog";
import { compositeBackground } from "../../../src/utils/morph/morphEngine";

let mounted: VueWrapper[] = [];

afterEach(() => {
  mounted.forEach((w) => w.unmount());
  mounted = [];
  document.body.innerHTML = "";
});

interface Setup {
  provider?: Record<string, unknown>;
  root?: Record<string, unknown>;
  content?: Record<string, unknown>;
  icon?: Record<string, unknown>;
  withTitle?: boolean;
}

function mountDialog({
  provider = {},
  root = {},
  content = {},
  icon,
  withTitle = true,
}: Setup = {}) {
  const Harness = defineComponent({
    setup() {
      return () =>
        h(ModoProvider, provider, () =>
          h(Dialog, root, () => [
            h(DialogTrigger, { label: "Open dialog" }),
            h(DialogContent, content, () => [
              icon ? h(DialogIcon, icon, () => h("svg")) : null,
              withTitle ? h(DialogTitle, null, () => "Delete project") : null,
              withTitle ? h(DialogDescription, null, () => "This cannot be undone.") : null,
              h(DialogClose),
            ]),
          ]),
        );
    },
  });
  const wrapper = mount(Harness, { attachTo: document.body });
  mounted.push(wrapper as VueWrapper);
  return wrapper;
}

async function open(wrapper: VueWrapper) {
  await wrapper.get("button.modo-morph-trigger").trigger("click");
  await nextTick();
  await nextTick();
}

const panel = () => document.querySelector<HTMLElement>("[data-modo-dialog]");

describe("Dialog — native trigger and close", () => {
  it("renders the default trigger as a native Button with the dialog color", () => {
    const wrapper = mountDialog({ root: { color: "primary" } });
    const trigger = wrapper.get("button.modo-morph-trigger");
    expect(trigger.text()).toBe("Open dialog");
    expect(trigger.attributes("aria-haspopup")).toBe("dialog");
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(trigger.classes()).toContain("bg-primary");
  });

  it("opens on trigger click and closes from the native X with the locale label", async () => {
    const wrapper = mountDialog({ root: { color: "danger" } });
    await open(wrapper);
    expect(panel()).not.toBeNull();

    const x = document.querySelector<HTMLButtonElement>(".modo-dialog__x button");
    expect(x).not.toBeNull();
    expect(x!.getAttribute("aria-label")).toBe("Close");
    expect(x!.className).toContain("text-destructive");

    x!.click();
    await nextTick();
    expect(wrapper.get("button.modo-morph-trigger").attributes("aria-expanded")).toBe("false");
  });

  it("takes close / fallback labels from the provider locale", async () => {
    const wrapper = mountDialog({
      withTitle: false,
      provider: { locale: { common: { close: "Cerrar" }, dialog: { label: "Diálogo" } } },
    });
    await open(wrapper);
    expect(panel()!.getAttribute("aria-label")).toBe("Diálogo");
    expect(
      document.querySelector(".modo-dialog__x button")!.getAttribute("aria-label"),
    ).toBe("Cerrar");
    const closeButtons = Array.from(document.querySelectorAll("[data-modo-dialog] button"));
    expect(closeButtons.some((b) => b.textContent?.trim() === "Cerrar")).toBe(true);
  });

  it("wires title and description through aria and native typography", async () => {
    const wrapper = mountDialog();
    await open(wrapper);
    const p = panel()!;
    const title = document.getElementById(p.getAttribute("aria-labelledby")!);
    const desc = document.getElementById(p.getAttribute("aria-describedby")!);
    expect(title?.textContent).toBe("Delete project");
    expect(title?.tagName).toBe("H2");
    expect(desc?.className).toContain("text-muted-foreground");
    expect(p.hasAttribute("aria-label")).toBe(false);
  });

  it("uses the Modal width steps and defaults to medium", async () => {
    const wrapper = mountDialog();
    await open(wrapper);
    expect(panel()!.getAttribute("data-modo-width")).toBe("medium");
  });

  it("alert mode switches role and hides the X", async () => {
    const wrapper = mountDialog({ content: { alert: true } });
    await open(wrapper);
    expect(panel()!.getAttribute("role")).toBe("alertdialog");
    expect(document.querySelector(".modo-dialog__x")).toBeNull();
  });

  it("forwards the provider radius and density to the teleported panel", async () => {
    const wrapper = mountDialog({ provider: { radius: "large", size: "large" } });
    await open(wrapper);
    const root = document.querySelector<HTMLElement>("[data-modo-dialog-root]")!;
    expect(root.style.getPropertyValue("--modo-dialog-radius")).toBe("1rem");
    expect(root.style.getPropertyValue("--modo-dialog-padding")).toBe("1.5rem");
  });
});

describe("DialogIcon", () => {
  it("defaults to the provider color, size and radius", async () => {
    const wrapper = mountDialog({
      provider: { color: "danger", radius: "full", size: "small" },
      icon: {},
    });
    await open(wrapper);
    const icon = document.querySelector<HTMLElement>(".modo-dialog__icon")!;
    expect(icon.getAttribute("data-modo-color")).toBe("danger");
    expect(icon.className).toContain("bg-destructive-subtle");
    expect(icon.className).toContain("h-9");
    expect(icon.className).toContain("rounded-full");
  });

  it("follows the content color and lets its own props win", async () => {
    const wrapper = mountDialog({
      content: { color: "success" },
      icon: { size: "large", radius: "none" },
    });
    await open(wrapper);
    const icon = document.querySelector<HTMLElement>(".modo-dialog__icon")!;
    expect(icon.className).toContain("bg-success-subtle");
    expect(icon.className).toContain("h-12");
    expect(icon.className).toContain("rounded-none");
  });
});

describe("morphEngine compositeBackground", () => {
  it("composites over the element's own dark theme root, not <html>", () => {
    const scope = document.createElement("div");
    scope.setAttribute("data-modo-theme", "dark");
    const el = document.createElement("div");
    el.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
    scope.appendChild(el);
    document.body.appendChild(scope);

    // jsdom cannot resolve --background, so the dark fallback canvas is used.
    expect(compositeBackground(el)).toBe("rgb(134, 135, 138)");
  });

  it("uses the panel theme hint when the element sits under no theme root", () => {
    const el = document.createElement("div");
    el.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
    document.body.appendChild(el);
    const hint = document.createElement("div");
    hint.setAttribute("data-modo-theme", "dark");
    document.body.appendChild(hint);

    expect(compositeBackground(el)).toBe("rgb(255, 255, 255)");
    expect(compositeBackground(el, hint)).toBe("rgb(134, 135, 138)");
  });
});
