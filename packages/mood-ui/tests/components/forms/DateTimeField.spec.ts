import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DateTimeField from "../../../src/components/forms/DateTimeField.vue";

// June 15 2024, 14:30 — a fixed date for stable assertions
const testDate = new Date(2024, 5, 15, 14, 30, 0);

describe("DateTimeField — timeOnly", () => {
  it("shows only time in the trigger when timeOnly is true", () => {
    const wrapper = mount(DateTimeField, {
      props: { modelValue: testDate, timeOnly: true },
    });
    const text = wrapper.find("button").text();
    expect(text).toContain("14:30");
    // Must NOT contain the year (date part should be absent)
    expect(text).not.toMatch(/2024/);
  });

  it("shows date and time in the trigger when timeOnly is false", () => {
    const wrapper = mount(DateTimeField, {
      props: { modelValue: testDate, timeOnly: false },
    });
    const text = wrapper.find("button").text();
    expect(text).toContain("14:30");
    expect(text).toMatch(/2024/);
  });

  it("uses 'Select time' as placeholder when timeOnly is true and no value", () => {
    const wrapper = mount(DateTimeField, {
      props: { modelValue: null, timeOnly: true },
    });
    expect(wrapper.find("button").text()).toContain("Select time");
  });

  it("uses 'Select date and time' as placeholder when timeOnly is false and no value", () => {
    const wrapper = mount(DateTimeField, {
      props: { modelValue: null, timeOnly: false },
    });
    expect(wrapper.find("button").text()).toContain("Select date and time");
  });
});
