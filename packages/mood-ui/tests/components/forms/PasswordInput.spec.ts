import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PasswordInput from "../../../src/components/forms/PasswordInput.vue";

describe("PasswordInput — strength meter", () => {
  it("counts emojis as 1 character (Unicode code points) instead of 2 UTF-16 code units", async () => {
    const wrapper = mount(PasswordInput, {
      props: {
        modelValue: "",
        strengthMeter: true,
        ariaLabel: "Password",
      },
    });

    // "Aa1" (3 chars) + 5 emojis (5 chars) = 8 code points (not 13 UTF-16 code units).
    // Score breakdown:
    // - length >= 8 (+1)
    // - length >= 12 (false, 8 < 12)
    // - uppercase + lowercase (+1)
    // - digit + symbol/emoji (+1)
    // Total score = 3 ("Good"), NOT 4 ("Strong")
    await wrapper.setProps({ modelValue: "Aa1😀😀😀😀😀" });
    expect(wrapper.emitted("strength-change")?.at(-1)).toEqual([3]);
    expect(wrapper.find('[role="status"]').text()).toBe("Good");

    // "Aa1" (3 chars) + 4 emojis (4 chars) = 7 code points (< 8).
    // Score breakdown:
    // - length >= 8 (false, 7 < 8)
    // - uppercase + lowercase (+1)
    // - digit + symbol/emoji (+1)
    // Total score = 2 ("Fair")
    await wrapper.setProps({ modelValue: "Aa1😀😀😀😀" });
    expect(wrapper.emitted("strength-change")?.at(-1)).toEqual([2]);
  });

  it("recognizes accented and Unicode uppercase/lowercase letters (e.g. Ñ, É, ñ, é)", async () => {
    const wrapper = mount(PasswordInput, {
      props: {
        modelValue: "",
        strengthMeter: true,
        ariaLabel: "Password",
      },
    });

    // Only Unicode uppercase ("Ñ", "É") + lowercase ("abcde") -> 7 chars, mixed case (+1)
    // Wait: let's test 8 chars with "Ñ" as the ONLY uppercase letter: "Ñabcdefg"
    // - length >= 8 (+1)
    // - uppercase (Ñ) + lowercase (abcdefg) (+1)
    // Total score = 2
    await wrapper.setProps({ modelValue: "Ñabcdefg" });
    expect(wrapper.emitted("strength-change")?.at(-1)).toEqual([2]);

    // With "É" as the only uppercase letter, 12+ chars, digit + symbol -> score 4 ("Strong")
    await wrapper.setProps({ modelValue: "Écontraseña12!" });
    expect(wrapper.emitted("strength-change")?.at(-1)).toEqual([4]);
  });

  it("does not treat accented letters as special symbols when checking digit + symbol", async () => {
    const wrapper = mount(PasswordInput, {
      props: {
        modelValue: "",
        strengthMeter: true,
        ariaLabel: "Password",
      },
    });

    // "contraseña1" has lowercase + digit + length 11 (>= 8), NO uppercase and NO symbol.
    // Previously `/[^A-Za-z0-9]/` treated `ñ` as a symbol and awarded the digit+symbol point.
    // Score should be 1 (only length >= 8).
    await wrapper.setProps({ modelValue: "contraseña1" });
    expect(wrapper.emitted("strength-change")?.at(-1)).toEqual([1]);
  });
});
