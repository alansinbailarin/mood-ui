import { describe, it, expect } from "vitest";
import { h } from "vue";
import { mount } from "@vue/test-utils";
import Avatar from "../../../src/components/data-display/avatar/Avatar.vue";
import AvatarGroup from "../../../src/components/data-display/avatar/AvatarGroup.vue";
import { defaultPalettes, semanticTokensFromPalettes } from "../../../src/config/palettes";
import { hexToOklchString, pickForegroundOklch } from "../../../src/config/colorPrimitives";

describe("Avatar & AvatarGroup — opacity and size alignment", () => {
  it("generates an opaque --primary-subtle token mixed against var(--background) instead of transparent", () => {
    const tokens = semanticTokensFromPalettes(
      defaultPalettes,
      hexToOklchString,
      pickForegroundOklch,
    );
    expect(tokens["--primary-subtle"]).toContain("var(--background)");
    expect(tokens["--primary-subtle"]).not.toContain("transparent");
  });

  it("gives Avatar root an opaque bg-background surface so overlapped siblings do not show through", () => {
    const wrapper = mount(Avatar, {
      props: { color: "primary" },
    });
    expect(wrapper.find("div").classes()).toContain("bg-background");
  });

  it("aligns the +N overflow counter size with Avatar across all sizes", () => {
    const expectedClasses: Record<string, [string, string]> = {
      xsmall: ["h-8", "w-8"],
      small: ["h-9", "w-9"],
      medium: ["h-10", "w-10"],
      large: ["h-12", "w-12"],
      xl: ["w-20", "h-20"],
    };

    for (const [size, [cls1, cls2]] of Object.entries(expectedClasses)) {
      const wrapper = mount(AvatarGroup, {
        props: { size: size as any, max: 2 },
        slots: {
          default: () => [
            h(Avatar, { initials: "A" }),
            h(Avatar, { initials: "B" }),
            h(Avatar, { initials: "C" }),
          ],
        },
      });
      const counter = wrapper.find('[aria-label="1 more"]');
      expect(counter.classes()).toContain(cls1);
      expect(counter.classes()).toContain(cls2);
    }
  });
});
