import { afterEach, beforeAll, afterAll, describe, expect, it } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import ModoProvider from "../../../src/components/ModoProvider.vue";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "../../../src/components/feedback/sheet";

// Sheet advances its phase on `animationend`; with reduced motion it skips
// straight to the next phase, which is what jsdom needs.
let originalMatchMedia: typeof window.matchMedia;
beforeAll(() => {
  originalMatchMedia = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    ...originalMatchMedia(query),
    matches: query.includes("reduce"),
  })) as typeof window.matchMedia;
});
afterAll(() => {
  window.matchMedia = originalMatchMedia;
});

let mounted: VueWrapper[] = [];

afterEach(() => {
  mounted.forEach((w) => w.unmount());
  mounted = [];
  document.body.innerHTML = "";
});

function mountSheet({
  provider = {},
  root = {},
  content = {},
  withTitle = true,
}: {
  provider?: Record<string, unknown>;
  root?: Record<string, unknown>;
  content?: Record<string, unknown>;
  withTitle?: boolean;
} = {}) {
  const Harness = defineComponent({
    setup() {
      return () =>
        h(ModoProvider, provider, () =>
          h(Sheet, root, () => [
            h(SheetTrigger, { label: "Open sheet" }),
            h(SheetContent, content, () => [
              withTitle ? h(SheetTitle, null, () => "Filters") : null,
              h(SheetClose, { label: "Done" }),
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
  await wrapper.get("button.modo-sheet-trigger").trigger("click");
  await nextTick();
  await nextTick();
}

const panel = () => document.querySelector<HTMLElement>("[data-modo-sheet]");

describe("Sheet", () => {
  it("renders the default trigger as a native Button with the sheet color", () => {
    const wrapper = mountSheet({ root: { color: "success" } });
    const trigger = wrapper.get("button.modo-sheet-trigger");
    expect(trigger.text()).toBe("Open sheet");
    expect(trigger.classes()).toContain("bg-success");
  });

  it("opens, labels from the title, and closes from the native X", async () => {
    const wrapper = mountSheet({ root: { color: "primary" } });
    await open(wrapper);
    const p = panel()!;
    expect(p.getAttribute("role")).toBe("dialog");
    expect(document.getElementById(p.getAttribute("aria-labelledby")!)?.textContent).toBe("Filters");

    const x = document.querySelector<HTMLButtonElement>(".modo-sheet__x button")!;
    expect(x.getAttribute("aria-label")).toBe("Close");
    expect(x.className).toContain("text-primary");
    x.click();
    await nextTick();
    expect(wrapper.get("button.modo-sheet-trigger").attributes("aria-expanded")).toBe("false");
  });

  it("uses locale strings for the fallback name and the X", async () => {
    const wrapper = mountSheet({
      withTitle: false,
      provider: { locale: { common: { close: "Cerrar" }, sheet: { label: "Panel" } } },
    });
    await open(wrapper);
    expect(panel()!.getAttribute("aria-label")).toBe("Panel");
    expect(document.querySelector(".modo-sheet__x button")!.getAttribute("aria-label")).toBe("Cerrar");
  });

  it("renders SheetClose as a native Button and closes", async () => {
    const wrapper = mountSheet();
    await open(wrapper);
    const done = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-modo-sheet] button"))
      .find((b) => b.textContent?.trim() === "Done")!;
    expect(done.className).toContain("border");
    done.click();
    await nextTick();
    expect(wrapper.get("button.modo-sheet-trigger").attributes("aria-expanded")).toBe("false");
  });

  it("forwards local radius and density to the teleported panel", async () => {
    const wrapper = mountSheet({ content: { radius: "none", size: "xsmall" } });
    await open(wrapper);
    const root = document.querySelector<HTMLElement>("[data-modo-sheet-root]")!;
    expect(root.style.getPropertyValue("--modo-dialog-radius")).toBe("0px");
    expect(root.style.getPropertyValue("--modo-dialog-padding")).toBe("0.875rem");
  });
});
