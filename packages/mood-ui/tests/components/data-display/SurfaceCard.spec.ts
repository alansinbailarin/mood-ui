import { describe, expect, it, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import {
  ModoProvider,
  PressButton,
  SurfaceCard,
  SurfaceCardMedia,
  SurfaceCardHeader,
  SurfaceCardTitle,
  SurfaceCardSubtitle,
  SurfaceCardBody,
  SurfaceCardFooter,
  SurfaceCardSeparator,
} from "../../../src";

describe("SurfaceCard — composable Valux UI port", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a semantic <article> root by default with concentric framed inner container, outline variant, and default padding", () => {
    const wrapper = mount(SurfaceCard, {
      slots: { default: "Hello surface" },
    });

    expect(wrapper.element.tagName).toBe("ARTICLE");
    expect(wrapper.attributes("data-modo-surface-card")).toBe("");
    expect(wrapper.attributes("data-modo-variant")).toBe("outline");
    expect(wrapper.attributes("data-modo-padding")).toBe("default");
    expect(wrapper.attributes("data-modo-framed")).toBe("");
    expect(wrapper.attributes("data-modo-radius")).toBe("medium");
    expect(wrapper.attributes("data-modo-interactive")).toBeUndefined();
    expect(wrapper.classes()).toContain("modo-surface-card");
    expect(wrapper.classes()).toContain("rounded-lg");
    expect(wrapper.attributes("data-modo-size")).toBe("medium");

    const inner = wrapper.find("[data-modo-surface-card-inner]");
    expect(inner.exists()).toBe(true);
    expect(inner.text()).toBe("Hello surface");
  });

  it("allows disabling the concentric double-frame via :framed='false'", () => {
    const wrapper = mount(SurfaceCard, {
      props: { framed: false },
      slots: { default: "Flat card" },
    });

    expect(wrapper.attributes("data-modo-framed")).toBeUndefined();
    expect(wrapper.find("[data-modo-surface-card-inner]").text()).toBe(
      "Flat card",
    );
  });

  it("normalizes Valux and mood-ui variant names (outline/outlined, elevated, soft/filled)", () => {
    expect(
      mount(SurfaceCard, { props: { variant: "outlined" } }).attributes(
        "data-modo-variant",
      ),
    ).toBe("outline");
    expect(
      mount(SurfaceCard, { props: { variant: "elevated" } }).attributes(
        "data-modo-variant",
      ),
    ).toBe("elevated");
    expect(
      mount(SurfaceCard, { props: { variant: "soft" } }).attributes(
        "data-modo-variant",
      ),
    ).toBe("soft");
    expect(
      mount(SurfaceCard, { props: { variant: "filled" } }).attributes(
        "data-modo-variant",
      ),
    ).toBe("soft");
  });

  it("cascades radius from ModoProvider and allows local radius & padding overrides", () => {
    const wrapper = mount(ModoProvider, {
      props: { radius: "large" },
      slots: {
        default: () =>
          h(
            SurfaceCard,
            { padding: "none" },
            { default: () => "Zero-padding card" },
          ),
      },
    });

    const card = wrapper.find("[data-modo-surface-card]");
    expect(card.classes()).toContain("rounded-xl");
    expect(card.attributes("data-modo-padding")).toBe("none");

    const localOverride = mount(ModoProvider, {
      props: { radius: "large" },
      slots: {
        default: () =>
          h(SurfaceCard, { radius: "none" }, { default: () => "Sharp" }),
      },
    });
    expect(
      localOverride.find("[data-modo-surface-card]").classes(),
    ).toContain("rounded-none");
  });

  it("maps radius tokens onto the native Card scale", () => {
    const cases = [
      ["none", "rounded-none"],
      ["small", "rounded-sm"],
      ["medium", "rounded-lg"],
      ["large", "rounded-xl"],
      ["full", "rounded-3xl"],
    ] as const;
    for (const [radius, cls] of cases) {
      const wrapper = mount(SurfaceCard, { props: { radius } });
      expect(wrapper.classes()).toContain(cls);
      expect(wrapper.attributes("data-modo-radius")).toBe(radius);
    }
  });

  it("resolves size from ModoProvider and lets a local size win", () => {
    const inherited = mount(ModoProvider, {
      props: { size: "small" },
      slots: { default: () => h(SurfaceCard, null, { default: () => "S" }) },
    });
    expect(
      inherited.find("[data-modo-surface-card]").attributes("data-modo-size"),
    ).toBe("small");

    const local = mount(ModoProvider, {
      props: { size: "small" },
      slots: {
        default: () => h(SurfaceCard, { size: "large" }, { default: () => "L" }),
      },
    });
    expect(
      local.find("[data-modo-surface-card]").attributes("data-modo-size"),
    ).toBe("large");
  });

  it("only drops the browser outline on interactive cards (native ring takes over)", () => {
    expect(
      mount(SurfaceCard, { props: { as: "button" } }).classes(),
    ).toContain("focus-visible:outline-none");
    expect(mount(SurfaceCard).classes()).not.toContain(
      "focus-visible:outline-none",
    );
  });

  it("exposes identical subcomponents via compound dot notation (SurfaceCard.*) and flat exports", () => {
    expect(SurfaceCard.Media).toBe(SurfaceCardMedia);
    expect(SurfaceCard.Header).toBe(SurfaceCardHeader);
    expect(SurfaceCard.Title).toBe(SurfaceCardTitle);
    expect(SurfaceCard.Subtitle).toBe(SurfaceCardSubtitle);
    expect(SurfaceCard.Body).toBe(SurfaceCardBody);
    expect(SurfaceCard.Footer).toBe(SurfaceCardFooter);
    expect(SurfaceCard.Separator).toBe(SurfaceCardSeparator);
  });

  it("renders full composable anatomy via both SurfaceCard.* dot notation and flat template tags", () => {
    const wrapper = mount({
      components: {
        SurfaceCard,
        SurfaceCardMedia,
        SurfaceCardHeader,
        SurfaceCardTitle,
        SurfaceCardSubtitle,
        SurfaceCardBody,
        SurfaceCardFooter,
        SurfaceCardSeparator,
      },
      template: `
        <SurfaceCard variant="elevated">
          <SurfaceCardMedia
            src="/cover.jpg"
            alt="Architecture preview"
            :ratio="4 / 3"
            :imgProps="{ loading: 'lazy', decoding: 'async' }"
          >
            <span class="badge">FEATURED</span>
          </SurfaceCardMedia>
          <SurfaceCardHeader as="hgroup" surface="subtle">
            <SurfaceCardTitle as="h2">Design tokens at scale</SurfaceCardTitle>
            <SurfaceCardSubtitle>5 min read · Engineering</SurfaceCardSubtitle>
          </SurfaceCardHeader>
          <SurfaceCardSeparator inset="content" />
          <SurfaceCardBody>
            How semantic OKLCH variables keep dark mode coherent.
          </SurfaceCardBody>
          <SurfaceCardSeparator />
          <SurfaceCardFooter align="between" surface="subtle" padding="none">
            <span>Updated today</span>
            <button type="button">Read</button>
          </SurfaceCardFooter>
        </SurfaceCard>
      `,
    });

    const media = wrapper.find("[data-modo-surface-card-media]");
    expect(media.attributes("style")).toContain("aspect-ratio:");
    const img = media.find("img");
    expect(img.attributes("src")).toBe("/cover.jpg");
    expect(img.attributes("alt")).toBe("Architecture preview");
    expect(img.attributes("loading")).toBe("lazy");
    expect(media.find(".modo-surface-card__media-overlay").text()).toBe(
      "FEATURED",
    );

    const header = wrapper.find("[data-modo-surface-card-header]");
    expect(header.element.tagName).toBe("HGROUP");
    expect(header.attributes("data-modo-surface")).toBe("subtle");

    const title = wrapper.find("[data-modo-surface-card-title]");
    expect(title.element.tagName).toBe("H2");
    expect(title.text()).toBe("Design tokens at scale");

    const subtitle = wrapper.find("[data-modo-surface-card-subtitle]");
    expect(subtitle.element.tagName).toBe("P");

    const separators = wrapper.findAll("[data-modo-surface-card-separator]");
    expect(separators).toHaveLength(2);
    expect(separators[0]?.element.tagName).toBe("HR");
    expect(separators[0]?.attributes("data-modo-inset")).toBe("content");
    expect(separators[1]?.attributes("data-modo-inset")).toBe("none");

    const footer = wrapper.find("[data-modo-surface-card-footer]");
    expect(footer.element.tagName).toBe("FOOTER");
    expect(footer.attributes("data-modo-align")).toBe("between");
    expect(footer.attributes("data-modo-surface")).toBe("subtle");
    expect(footer.attributes("data-modo-padding")).toBe("none");
  });

  it("renders interactive button and anchor cards with proper disabled semantics", async () => {
    const onClick = vi.fn();
    const btnCard = mount(SurfaceCard, {
      props: { as: "button", variant: "soft" },
      attrs: { onClick },
      slots: { default: "Action card" },
    });

    expect(btnCard.element.tagName).toBe("BUTTON");
    expect(btnCard.attributes("type")).toBe("button");
    expect(btnCard.attributes("data-modo-interactive")).toBe("");
    await btnCard.trigger("click");
    expect(onClick).toHaveBeenCalledTimes(1);

    // Auto-promotes to <a> when href is provided and protects disabled links
    const onLinkClick = vi.fn();
    const linkCard = mount(SurfaceCard, {
      props: { href: "/billing", disabled: true },
      attrs: { onClick: onLinkClick },
      slots: { default: "Billing" },
    });

    expect(linkCard.element.tagName).toBe("A");
    expect(linkCard.attributes("href")).toBeUndefined();
    expect(linkCard.attributes("role")).toBe("link");
    expect(linkCard.attributes("aria-disabled")).toBe("true");
    expect(linkCard.attributes("tabindex")).toBe("-1");

    const clickEvt = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    linkCard.element.dispatchEvent(clickEvt);
    expect(clickEvt.defaultPrevented).toBe(true);
    expect(onLinkClick).not.toHaveBeenCalled();
  });

  it("plays WAAPI tactile press & spring rebound on interactive cards and skips pointer capture on touch", () => {
    const animateMock = vi.fn(() => ({ cancel: vi.fn() }) as unknown as Animation);
    const captureMock = vi.fn();

    const wrapper = mount(SurfaceCard, {
      props: { as: "button" },
      slots: { default: "Press me" },
    });

    const el = wrapper.element as HTMLElement;
    el.animate = animateMock;
    el.setPointerCapture = captureMock;

    el.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        pointerId: 7,
        pointerType: "mouse",
      }),
    );

    expect(captureMock).toHaveBeenCalledWith(7);
    expect(animateMock).toHaveBeenCalledTimes(1);
    expect(animateMock.mock.calls[0]?.[0]).toEqual([
      { transform: "translateY(0) scale(1)" },
      { transform: "translateY(1px) scale(0.986)" },
    ]);

    el.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        pointerId: 7,
        pointerType: "mouse",
      }),
    );

    expect(animateMock).toHaveBeenCalledTimes(2);
    expect(animateMock.mock.calls[1]?.[0]).toMatchObject([
      { transform: "translateY(1px) scale(0.986)", offset: 0 },
      { transform: "translateY(-0.5px) scale(1.004)", offset: 0.52 },
      { transform: "translateY(0) scale(1)", offset: 1 },
    ]);

    // Touch pointers must never call setPointerCapture (WebKit click bug)
    captureMock.mockClear();
    el.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        pointerId: 9,
        pointerType: "touch",
      }),
    );
    expect(captureMock).not.toHaveBeenCalled();
  });

  it("supports stretchedLink on SurfaceCard.Title while keeping nested footer PressButton actions independent", () => {
    const cardAnimate = vi.fn(() => ({ cancel: vi.fn() }) as unknown as Animation);
    const captureMock = vi.fn();

    const wrapper = mount({
      render: () =>
        h(
          SurfaceCard,
          { variant: "elevated" },
          {
            default: () => [
              h(SurfaceCard.Header, null, {
                default: () =>
                  h(
                    SurfaceCard.Title,
                    { href: "/posts/tokens", stretchedLink: true },
                    { default: () => "Tokens Guide" },
                  ),
              }),
              h(SurfaceCard.Body, null, {
                default: () => "Card body paragraph",
              }),
              h(SurfaceCard.Footer, null, {
                default: () =>
                  h(
                    PressButton,
                    { size: "sm", variant: "soft" },
                    { default: () => "Bookmark" },
                  ),
              }),
            ],
          },
        ),
    });

    const cardEl = wrapper.find("[data-modo-surface-card]")
      .element as HTMLElement;
    cardEl.animate = cardAnimate;
    cardEl.setPointerCapture = captureMock;

    const titleLink = wrapper.find(".modo-surface-card__stretched-link");
    expect(titleLink.exists()).toBe(true);
    expect(titleLink.attributes("href")).toBe("/posts/tokens");

    // Pressing on the nested PressButton in Footer must NOT compress the whole card
    const footerBtn = wrapper.find("button").element;
    footerBtn.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        pointerId: 1,
        pointerType: "mouse",
      }),
    );
    expect(cardAnimate).not.toHaveBeenCalled();

    // Pressing on the card body or stretched link DOES play tactile card press without stealing pointer capture from the <a>
    const bodyEl = wrapper.find("[data-modo-surface-card-body]").element;
    bodyEl.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        pointerId: 2,
        pointerType: "mouse",
      }),
    );
    expect(cardAnimate).toHaveBeenCalledTimes(1);
    expect(captureMock).not.toHaveBeenCalled();
  });

  it("honors prefers-reduced-motion: reduce by skipping WAAPI card transforms", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("prefers-reduced-motion: reduce"),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    const animateMock = vi.fn(() => ({ cancel: vi.fn() }) as unknown as Animation);
    const wrapper = mount(SurfaceCard, {
      props: { as: "button" },
      slots: { default: "Reduced motion" },
    });

    const el = wrapper.element as HTMLElement;
    el.animate = animateMock;
    el.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        pointerId: 3,
      }),
    );

    expect(animateMock).not.toHaveBeenCalled();
  });

  it("renders cleanly in SSR via renderToString without window/document errors", async () => {
    const app = createSSRApp({
      render: () =>
        h(
          ModoProvider,
          { radius: "medium" },
          {
            default: () =>
              h(
                SurfaceCard,
                { variant: "elevated" },
                {
                  default: () => [
                    h(SurfaceCard.Header, null, {
                      default: () => [
                        h(
                          SurfaceCard.Title,
                          { href: "/docs", stretchedLink: true },
                          { default: () => "SSR Card" },
                        ),
                        h(SurfaceCard.Subtitle, null, {
                          default: () => "Hydration safe",
                        }),
                      ],
                    }),
                    h(SurfaceCard.Separator),
                    h(SurfaceCard.Body, null, {
                      default: () => "Rendered on server",
                    }),
                  ],
                },
              ),
          },
        ),
    });

    const html = await renderToString(app);
    expect(html).toContain("data-modo-surface-card");
    expect(html).toContain('data-modo-variant="elevated"');
    expect(html).toContain("modo-surface-card__stretched-link");
    expect(html).toContain("SSR Card");
  });
});
