import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, defineComponent, h, markRaw, nextTick, ref } from "vue";
import { renderToString } from "@vue/server-renderer";
import PressButton from "../../../src/components/forms/PressButton.vue";
import PressButtonGroup from "../../../src/components/forms/PressButtonGroup.vue";
import ButtonGroup from "../../../src/components/forms/ButtonGroup.vue";
import ModoProvider from "../../../src/components/ModoProvider.vue";
import {
  buildHorizontalGroupGeometry,
  buildVerticalGroupGeometry,
} from "../../../src/components/forms/pressButtonGroupGeometry";
import {
  PRESS_DURATION_FALLBACK,
  PRESS_EASING_FALLBACK,
  readDurationToken,
  readEasingToken,
} from "../../../src/components/forms/pressButtonMotion";

// jsdom has no theme stylesheet, so the motion helpers fall back to values
// equal to the --duration-* / --ease-* tokens in style.css.
const FAST = 140;
const SLOW = 320;
const EMPHASIZED = "cubic-bezier(0.3, 0, 0, 1)";
const DECELERATE = "cubic-bezier(0, 0, 0, 1)";

const TestIcon = markRaw(
  defineComponent({
    name: "TestIcon",
    setup() {
      return () => h("svg", { "data-testid": "test-icon", viewBox: "0 0 24 24" });
    },
  }),
);

function installAnimationMock() {
  const animations: Array<{ cancel: ReturnType<typeof vi.fn> }> = [];
  const animate = vi.fn(() => {
    const animation = { cancel: vi.fn() };
    animations.push(animation);
    return animation as unknown as Animation;
  });
  Object.defineProperty(HTMLElement.prototype, "animate", {
    configurable: true,
    value: animate,
  });
  return { animate, animations };
}

function dispatchPointer(
  el: Element,
  type: string,
  init: { button?: number; pointerId?: number; pointerType?: string } = {},
) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: init.button ?? 0,
  });
  Object.defineProperties(event, {
    pointerId: { value: init.pointerId ?? 1 },
    pointerType: { value: init.pointerType ?? "mouse" },
  });
  return el.dispatchEvent(event);
}

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, "animate");
  Reflect.deleteProperty(HTMLElement.prototype, "setPointerCapture");
  vi.restoreAllMocks();
});

describe("PressButton — core semantics & polymorphic anchor", () => {
  it("renders an accessible native button with safe default type='button'", () => {
    const wrapper = mount(PressButton, {
      slots: { default: "Save" },
    });

    const button = wrapper.get("button");
    expect(button.text()).toBe("Save");
    expect(button.attributes("type")).toBe("button");
    expect(button.attributes("data-modo-press-button")).toBe("");
  });

  it("forwards native attributes, consumer class, and exposes root el ref", () => {
    const wrapper = mount(PressButton, {
      props: {
        type: "submit",
        disabled: true,
        ariaLabel: "Submit form",
      },
      attrs: {
        class: "consumer-class",
        "data-purpose": "save",
      },
    });

    const button = wrapper.get("button");
    expect(button.attributes("type")).toBe("submit");
    expect(button.attributes("data-purpose")).toBe("save");
    expect(button.attributes("aria-label")).toBe("Submit form");
    expect((button.element as HTMLButtonElement).disabled).toBe(true);
    expect(button.classes()).toContain("modo-press-button");
    expect(button.classes()).toContain("consumer-class");
    expect((wrapper.vm as { el: HTMLElement | null }).el).toBe(button.element);
  });

  it("renders an anchor when as='a' and forwards link props", () => {
    const wrapper = mount(PressButton, {
      props: {
        as: "a",
        href: "/docs",
        target: "_blank",
        rel: "noreferrer",
      },
      slots: { default: "Documentation" },
    });

    const link = wrapper.get("a");
    expect(link.attributes("href")).toBe("/docs");
    expect(link.attributes("target")).toBe("_blank");
    expect(link.attributes("rel")).toBe("noreferrer");
    expect(link.attributes("role")).toBeUndefined();
    expect((wrapper.vm as { el: HTMLElement | null }).el).toBe(link.element);
  });

  it("disables anchors without navigation or consumer clicks while preserving link role", () => {
    const onClick = vi.fn();
    const wrapper = mount(PressButton, {
      props: {
        as: "a",
        href: "/billing",
        disabled: true,
      },
      attrs: {
        onClick,
      },
      slots: { default: "Billing" },
    });

    const link = wrapper.get("a");
    expect(link.attributes("role")).toBe("link");
    expect(link.attributes("aria-disabled")).toBe("true");
    expect(link.attributes("href")).toBeUndefined();
    expect(link.attributes("tabindex")).toBe("-1");

    const clickAllowed = link.element.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
    expect(clickAllowed).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("merges configurable cursor without discarding consumer inline styles, and forces not-allowed when disabled or loading", () => {
    const active = mount(PressButton, {
      props: { cursor: "grab" },
      attrs: { style: { marginTop: "4px" } },
      slots: { default: "Drag" },
    });
    const activeStyle = (active.get("button").element as HTMLElement).style;
    expect(activeStyle.cursor).toBe("grab");
    expect(activeStyle.marginTop).toBe("4px");

    const disabledBtn = mount(PressButton, {
      props: { disabled: true, cursor: "grab" },
      attrs: { style: { marginTop: "4px" } },
      slots: { default: "Disabled" },
    });
    const disabledStyle = (disabledBtn.get("button").element as HTMLElement).style;
    expect(disabledStyle.cursor).toBe("not-allowed");
    expect(disabledStyle.marginTop).toBe("4px");

    const loadingLink = mount(PressButton, {
      props: { as: "a", href: "/save", loading: true, cursor: "grab" },
      slots: { default: "Save" },
    });
    expect((loadingLink.get("a").element as HTMLElement).style.cursor).toBe(
      "not-allowed",
    );
  });

  it("renders both button and anchor branches cleanly under SSR", async () => {
    const btnHtml = await renderToString(
      createSSRApp({
        render: () => h(PressButton, null, { default: () => "Save" }),
      }),
    );
    expect(btnHtml).toContain("<button");

    const linkHtml = await renderToString(
      createSSRApp({
        render: () =>
          h(PressButton, { as: "a", href: "/docs" }, { default: () => "Docs" }),
      }),
    );
    expect(linkHtml).toContain("<a");
    expect(linkHtml).toContain('href="/docs"');
  });
});

describe("PressButton — WAAPI tactile press & spring rebound motion", () => {
  it("captures the pointer for mouse/pen but NEVER for touch (WebKit tap click safety)", () => {
    installAnimationMock();
    const capture = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
      configurable: true,
      value: capture,
    });

    const wrapper = mount(PressButton, { slots: { default: "Continue" } });
    const button = wrapper.get("button").element;

    dispatchPointer(button, "pointerdown", {
      button: 0,
      pointerId: 7,
      pointerType: "touch",
    });
    expect(capture).not.toHaveBeenCalled();
    dispatchPointer(button, "pointerup", {
      button: 0,
      pointerId: 7,
      pointerType: "touch",
    });

    dispatchPointer(button, "pointerdown", {
      button: 0,
      pointerId: 8,
      pointerType: "mouse",
    });
    expect(capture).toHaveBeenCalledWith(8);
  });

  it.each(["mouse", "touch"])(
    "compresses on %s press and rebounds with 3-stop spring on release",
    (pointerType) => {
      const { animate, animations } = installAnimationMock();
      const wrapper = mount(PressButton, { slots: { default: "Continue" } });
      const button = wrapper.get("button").element;

      dispatchPointer(button, "pointerdown", {
        button: 0,
        pointerId: 1,
        pointerType,
      });
      dispatchPointer(button, "pointerup", {
        button: 0,
        pointerId: 1,
        pointerType,
      });

      expect(animate).toHaveBeenNthCalledWith(
        1,
        [
          { transform: "translateY(0) scale(1)" },
          { transform: "translateY(1px) scaleX(0.982) scaleY(0.955)" },
        ],
        { duration: FAST, easing: EMPHASIZED, fill: "forwards" },
      );
      expect(animate).toHaveBeenNthCalledWith(
        2,
        [
          {
            transform: "translateY(1px) scaleX(0.982) scaleY(0.955)",
            offset: 0,
          },
          {
            transform: "translateY(-0.5px) scaleX(1.008) scaleY(1.012)",
            offset: 0.52,
            easing: DECELERATE,
          },
          { transform: "translateY(0) scale(1)", offset: 1 },
        ],
        { duration: SLOW, easing: "linear" },
      );
      expect(animations[0]?.cancel).toHaveBeenCalledOnce();
    },
  );

  it("preserves consumer pointer handlers and respects preventDefault()", () => {
    const { animate } = installAnimationMock();
    const onPointerdown = vi.fn();
    const onPointerup = vi.fn();
    const wrapper = mount(PressButton, {
      attrs: { onPointerdown, onPointerup },
      slots: { default: "Continue" },
    });
    const button = wrapper.get("button").element;

    dispatchPointer(button, "pointerdown", { button: 0, pointerId: 1 });
    dispatchPointer(button, "pointerup", { button: 0, pointerId: 1 });

    expect(onPointerdown).toHaveBeenCalledOnce();
    expect(onPointerup).toHaveBeenCalledOnce();
    expect(animate).toHaveBeenCalledTimes(2);
  });

  it("skips WAAPI motion when disabled or prefers-reduced-motion: reduce is active", async () => {
    const { animate } = installAnimationMock();
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));

    try {
      const wrapper = mount(PressButton, { slots: { default: "Continue" } });
      const button = wrapper.get("button").element;

      dispatchPointer(button, "pointerdown", { button: 0, pointerId: 1 });
      dispatchPointer(button, "pointerup", { button: 0, pointerId: 1 });

      await wrapper.setProps({ disabled: true });
      dispatchPointer(button, "pointerdown", { button: 0, pointerId: 2 });

      expect(animate).not.toHaveBeenCalled();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it("returns to rest when disabled toggles true during an active press", async () => {
    const { animate } = installAnimationMock();
    const wrapper = mount(PressButton, { slots: { default: "Continue" } });
    const button = wrapper.get("button").element;

    dispatchPointer(button, "pointerdown", { button: 0, pointerId: 7 });
    await wrapper.setProps({ disabled: true });

    expect(animate).toHaveBeenLastCalledWith(
      [{ transform: "translateY(0) scale(1)" }],
      { duration: FAST, easing: EMPHASIZED },
    );
  });

  it("does not trigger pointer WAAPI on keyboard Space/Enter activation", async () => {
    const { animate } = installAnimationMock();
    const wrapper = mount(PressButton, { slots: { default: "Continue" } });
    const button = wrapper.get("button");

    await button.trigger("keydown", { key: " " });
    await button.trigger("keyup", { key: " " });

    expect(animate).not.toHaveBeenCalled();
  });
});

describe("PressButton — content states, zero-shift loading grid & icons", () => {
  it("disables a loading native button, keeps its content for zero-shift width and announces the localized fallback", async () => {
    const onClick = vi.fn();
    const wrapper = mount(PressButton, {
      props: { loading: true },
      attrs: { onClick },
      slots: { default: "Save changes" },
    });

    const button = wrapper.get("button");
    expect((button.element as HTMLButtonElement).disabled).toBe(true);
    expect(button.attributes("aria-busy")).toBe("true");
    expect(button.attributes("data-modo-loading")).toBe("");
    expect(button.find(".modo-press-button__content").text()).toBe("Save changes");
    expect(button.find(".modo-press-button__content").attributes("aria-hidden")).toBe("true");
    expect(button.find(".modo-press-button__loading").attributes("aria-hidden")).toBeUndefined();
    expect(button.find(".sr-only").text()).toBe("Loading");
    const spinner = button.find(".modo-press-button__spinner");
    expect(spinner.attributes("aria-hidden")).toBe("true");
    // Spinner sized by the size token (medium -> sz.icon)
    expect(spinner.classes()).toContain("h-[18px]");
    expect(spinner.classes()).toContain("w-[18px]");

    await button.trigger("click");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("shows loadingText beside spinner and marks original content aria-hidden", () => {
    const wrapper = mount(PressButton, {
      props: {
        loading: true,
        loadingText: "Saving changes...",
      },
      slots: { default: "Save changes" },
    });

    const button = wrapper.get("button");
    expect(button.find(".modo-press-button__loading-text").text()).toBe(
      "Saving changes...",
    );
    expect(button.find(".modo-press-button__content").attributes("aria-hidden")).toBe(
      "true",
    );
    expect(button.find(".modo-press-button__loading").attributes("aria-hidden")).toBeUndefined();
    expect(button.find(".modo-press-button__spinner").attributes("aria-hidden")).toBe(
      "true",
    );
  });

  it("keeps iconOnly loading visually square without rendering loadingText", () => {
    const wrapper = mount(PressButton, {
      props: {
        iconOnly: true,
        loading: true,
        loadingText: "Saving changes...",
      },
      attrs: { "aria-label": "Save changes" },
      slots: { default: () => h(TestIcon) },
    });

    const button = wrapper.get("button");
    expect(button.attributes("aria-label")).toBe("Save changes");
    expect(button.attributes("data-modo-icon-only")).toBe("");
    expect(button.find(".modo-press-button__loading-text").exists()).toBe(false);
    expect(button.find(".modo-press-button__spinner").exists()).toBe(true);
  });

  it("renders decorative startIcon and endIcon props/slots with aria-hidden='true'", () => {
    const wrapper = mount(PressButton, {
      props: {
        startIcon: TestIcon,
        endIcon: TestIcon,
      },
      slots: { default: "Continue" },
    });

    const button = wrapper.get("button");
    expect(button.find(".modo-press-button__icon--start").attributes("aria-hidden")).toBe(
      "true",
    );
    expect(button.find(".modo-press-button__icon--end").attributes("aria-hidden")).toBe(
      "true",
    );
    expect(button.findAll('[data-testid="test-icon"]')).toHaveLength(2);
  });

  it("auto-detects icon-only mode when icon prop is passed with no label or default slot", () => {
    const wrapper = mount(PressButton, {
      props: {
        icon: TestIcon,
        ariaLabel: "Open settings",
      },
    });

    const button = wrapper.get("button");
    expect(button.attributes("data-modo-icon-only")).toBe("");
    expect(button.attributes("aria-label")).toBe("Open settings");
    expect(button.classes()).toContain("aspect-square");
    expect(button.classes()).toContain("h-10");
    // Icon wrapper carries the size token, like the native Button icon
    expect(button.find(".modo-press-button__icon").classes()).toContain("h-[18px]");
  });

  it("sizes slot icons with the size tokens", () => {
    const wrapper = mount(PressButton, {
      props: { size: "large" },
      slots: { default: "Next", startIcon: () => h(TestIcon) },
    });
    const icon = wrapper.get(".modo-press-button__icon--start");
    expect(icon.classes()).toContain("h-5");
    expect(icon.classes()).toContain("w-5");
  });

  it("localizes the loading fallback through ModoProvider", () => {
    const wrapper = mount(ModoProvider, {
      props: { locale: { common: { loading: "Cargando" } } },
      slots: {
        default: () => h(PressButton, { loading: true }, () => "Guardar"),
      },
    });
    expect(wrapper.get("button .sr-only").text()).toBe("Cargando");
  });

  it("renders Skeleton placeholder when skeleton=true", () => {
    const wrapper = mount(PressButton, {
      props: {
        skeleton: true,
        fullWidth: true,
      },
      slots: { default: "Loading" },
    });

    expect(wrapper.find("button").exists()).toBe(false);
    const skeleton = wrapper.get('[role="status"]');
    expect(skeleton.classes()).toContain("modo-skeleton");
    expect((skeleton.element as HTMLElement).style.width).toBe("100%");
  });
});

describe("PressButton — appearance matrix & ModoProvider / ButtonGroup cascade", () => {
  const variants = ["normal", "outline", "ghost", "text"] as const;
  const colors = ["default", "primary", "danger", "success", "warning"] as const;
  const combinations = variants.flatMap((v) =>
    colors.map((c) => [v, c] as const),
  );

  it("defaults to the normal variant with the provider's default color", () => {
    const wrapper = mount(PressButton, { slots: { default: "Continue" } });
    const button = wrapper.get("button");
    expect(button.attributes("data-modo-variant")).toBe("normal");
    expect(button.attributes("data-modo-color")).toBe("default");
    expect(button.classes()).toContain("rounded-md");
  });

  it.each(combinations)("supports %s variant with %s color", (variant, color) => {
    const wrapper = mount(PressButton, {
      props: { variant, color },
      slots: { default: "Continue" },
    });
    const button = wrapper.get("button");
    expect(button.attributes("data-modo-variant")).toBe(variant);
    expect(button.attributes("data-modo-color")).toBe(color);
  });

  it("uses the native focus ring and keeps the halo classes (focus does not wipe the halo)", () => {
    const wrapper = mount(ModoProvider, {
      props: { color: "primary", halo: "tinted" },
      slots: { default: () => h(PressButton, null, () => "Go") },
    });
    const button = wrapper.get("button");
    expect(button.classes()).toEqual(
      expect.arrayContaining([
        "focus-visible:ring-2",
        "focus-visible:ring-ring/60",
        "ring-[3px]",
        "ring-primary/15",
        "hover:ring-primary/25",
      ]),
    );
  });

  it("keeps the halo when disabled (opacity handles the disabled look, like Button)", () => {
    const wrapper = mount(ModoProvider, {
      props: { halo: "neutral" },
      slots: { default: () => h(PressButton, { disabled: true }, () => "Go") },
    });
    const button = wrapper.get("button");
    expect(button.classes()).toContain("ring-foreground/10");
    expect((button.element as HTMLButtonElement).disabled).toBe(true);
  });

  it("cascades color, size, and radius from ModoProvider while an explicit color wins", () => {
    const wrapper = mount(ModoProvider, {
      props: {
        color: "primary",
        size: "small",
        radius: "full",
      },
      slots: {
        default: () => [
          h(PressButton, { "data-testid": "cascaded" }, () => "Cascaded"),
          h(
            PressButton,
            { color: "danger", "data-testid": "explicit" },
            () => "Danger",
          ),
        ],
      },
    });

    const cascaded = wrapper.get('[data-testid="cascaded"]');
    expect(cascaded.attributes("data-modo-color")).toBe("primary");
    expect(cascaded.attributes("data-modo-size")).toBe("small");
    expect(cascaded.classes()).toContain("h-9");
    expect(cascaded.classes()).toContain("rounded-[999px]");

    const explicit = wrapper.get('[data-testid="explicit"]');
    expect(explicit.attributes("data-modo-color")).toBe("danger");
  });

  it("inherits variant, color, size, radius, and disabled from PressButtonGroup, joined at rest and morphing on press", async () => {
    const wrapper = mount(PressButtonGroup, {
      props: {
        variant: "ghost",
        color: "success",
        size: "small",
        radius: "large",
        disabled: false,
      },
      slots: {
        default: () => [
          h(PressButton, null, () => "One"),
          h(PressButton, null, () => "Two"),
          h(PressButton, null, () => "Three"),
        ],
      },
    });

    expect(wrapper.attributes("data-modo-press-button-group")).toBe("");
    expect(wrapper.attributes("data-modo-group-radius")).toBe("large");
    expect(wrapper.attributes("data-modo-group-size")).toBe("small");
    expect(wrapper.attributes("data-modo-variant")).toBe("ghost");
    expect(wrapper.attributes("data-modo-color")).toBe("success");
    expect(wrapper.classes()).toContain("press-group-horizontal");
    expect(wrapper.classes()).toContain("rounded-lg");

    const buttons = wrapper.findAll("button");
    expect(buttons).toHaveLength(3);
    for (const btn of buttons) {
      expect(btn.attributes("data-modo-variant")).toBe("ghost");
      expect(btn.attributes("data-modo-color")).toBe("success");
      expect(btn.attributes("data-modo-size")).toBe("small");
      expect(btn.attributes("data-modo-in-press-group")).toBe("");
      // segments: inset focus ring (the track is clipped), no own halo
      expect(btn.classes()).toContain("focus-visible:ring-inset");
      expect(btn.classes()).not.toContain("ring-[3px]");
    }

    // Pressing middle button animates inner body (without detaching root button) and sets data-modo-pressed
    const { animate } = installAnimationMock();
    dispatchPointer(buttons[1]!.element, "pointerdown", { button: 0, pointerId: 3 });
    await wrapper.vm.$nextTick();
    expect(buttons[1]!.attributes("data-modo-pressed")).toBe("");
    expect(animate).toHaveBeenCalledWith(
      [{ transform: "scale(1)" }, { transform: "scale(0.945)" }],
      expect.objectContaining({ duration: FAST, easing: EMPHASIZED, fill: "forwards" }),
    );

    dispatchPointer(buttons[1]!.element, "pointerup", { button: 0, pointerId: 3 });
    await wrapper.vm.$nextTick();
    expect(buttons[1]!.attributes("data-modo-pressed")).toBeUndefined();
  });

  it.each([
    ["none", "rounded-none"],
    ["small", "rounded-sm"],
    ["medium", "rounded-md"],
    ["large", "rounded-lg"],
    ["full", "rounded-[999px]"],
  ] as const)("group radius %s maps to %s, same as PressButton/Button", (radius, cls) => {
    const group = mount(PressButtonGroup, {
      props: { radius },
      slots: { default: () => [h(PressButton, null, () => "A")] },
    });
    expect(group.classes()).toContain(cls);
    const lone = mount(PressButton, { props: { radius }, slots: { default: "A" } });
    expect(lone.get("button").classes()).toContain(cls);
  });

  it("defaults the group to the normal variant and follows provider color changes reactively", async () => {
    const color = ref<"primary" | "danger">("primary");
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            ModoProvider,
            { color: color.value, halo: "tinted" },
            {
              default: () =>
                h(PressButtonGroup, null, () => [
                  h(PressButton, null, () => "A"),
                  h(PressButton, null, () => "B"),
                ]),
            },
          );
      },
    });
    const wrapper = mount(Host);
    const group = wrapper.get("[data-modo-press-button-group]");
    expect(group.attributes("data-modo-variant")).toBe("normal");
    expect(group.attributes("data-modo-color")).toBe("primary");
    expect(group.attributes("data-modo-halo")).toBe("tinted");
    for (const btn of wrapper.findAll("button")) {
      expect(btn.attributes("data-modo-color")).toBe("primary");
    }

    color.value = "danger";
    await nextTick();
    expect(group.attributes("data-modo-color")).toBe("danger");
    for (const btn of wrapper.findAll("button")) {
      expect(btn.attributes("data-modo-color")).toBe("danger");
    }
  });

  it("only draws the group halo for the normal variant (like ButtonGroup) and flags disabled groups", () => {
    const outline = mount(PressButtonGroup, {
      props: { variant: "outline", disabled: true },
      slots: { default: () => [h(PressButton, null, () => "A")] },
    });
    expect(outline.attributes("data-modo-halo")).toBeUndefined();
    expect(outline.attributes("data-modo-disabled")).toBe("");
  });

  it("generates continuous C1 cubic Bezier S-curve contour without detaching buttons (horizontal & vertical)", () => {    const restH = buildHorizontalGroupGeometry(
      240,
      40,
      10,
      [0, 80, 160, 240],
      [0, 0, 0],
    );
    expect(restH.clipPathD).not.toContain(" C ");
    expect(restH.dividers).toHaveLength(2);

    const pressFirstH = buildHorizontalGroupGeometry(
      240,
      40,
      10,
      [0, 80, 160, 240],
      [1, 0, 0],
    );
    // 1 top S-curve + 1 bottom S-curve across seam x=80
    expect(pressFirstH.clipPathD.match(/ C /g)).toHaveLength(2);
    expect(pressFirstH.strokePathD.match(/ C /g)).toHaveLength(2);

    const pressMiddleH = buildHorizontalGroupGeometry(
      240,
      40,
      10,
      [0, 80, 160, 240],
      [0, 1, 0],
    );
    // 2 top S-curves + 2 bottom S-curves across seams x=80 and x=160
    expect(pressMiddleH.clipPathD.match(/ C /g)).toHaveLength(4);

    const pressMiddleV = buildVerticalGroupGeometry(
      110,
      120,
      12,
      [0, 40, 80, 120],
      [0, 1, 0],
    );
    // 2 right-wall S-curves + 2 left-wall S-curves across seams y=40 and y=80
    expect(pressMiddleV.clipPathD.match(/ C /g)).toHaveLength(4);
    expect(pressMiddleV.dividers).toHaveLength(2);
  });

  it("remains compatible with classic mood-ui ButtonGroup without altering ButtonGroup itself", () => {
    const wrapper = mount(ButtonGroup, {
      props: {
        variant: "outline",
        color: "danger",
        size: "small",
        disabled: true,
      },
      slots: {
        default: () => [
          h(PressButton, null, () => "A"),
          h(PressButton, null, () => "B"),
        ],
      },
    });

    expect(wrapper.classes()).not.toContain("gap-[3px]");
    const buttons = wrapper.findAll("button");
    expect(buttons).toHaveLength(2);
    expect((buttons[0]!.element as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("pressButtonMotion — motion tokens", () => {
  it("falls back to values equal to the style.css tokens", () => {
    expect(PRESS_DURATION_FALLBACK).toEqual({ fast: 140, base: 220, slow: 320 });
    expect(PRESS_EASING_FALLBACK.emphasized).toBe(EMPHASIZED);
    expect(readDurationToken(null, "fast")).toBe(140);
    expect(readEasingToken(null, "decelerate")).toBe(DECELERATE);
  });

  it("reads --duration-* (ms or s, including 0ms under reduced motion) and --ease-* from the element", () => {
    const el = document.createElement("div");
    el.style.setProperty("--duration-fast", "90ms");
    el.style.setProperty("--duration-slow", "0.4s");
    el.style.setProperty("--duration-base", "0ms");
    el.style.setProperty("--ease-emphasized", "cubic-bezier(0.1, 0, 0, 1)");
    document.body.appendChild(el);
    try {
      expect(readDurationToken(el, "fast")).toBe(90);
      expect(readDurationToken(el, "slow")).toBe(400);
      expect(readDurationToken(el, "base")).toBe(0);
      expect(readEasingToken(el, "emphasized")).toBe("cubic-bezier(0.1, 0, 0, 1)");
    } finally {
      el.remove();
    }
  });
});
