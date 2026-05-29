import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DateTimePicker from "../../../src/components/data-display/date-picker/DateTimePicker.vue";

describe("DateTimePicker — timeOnly", () => {
  it("hides the calendar when timeOnly is true", () => {
    const wrapper = mount(DateTimePicker, { props: { timeOnly: true } });
    // Calendar renders day/nav buttons without data-col.
    // In timeOnly mode only the 'Now' footer button has no data-col.
    const buttonsWithoutDataCol = wrapper.findAll("button:not([data-col])");
    expect(buttonsWithoutDataCol.length).toBe(1);
  });

  it("renders the calendar when timeOnly is not set", () => {
    const wrapper = mount(DateTimePicker, { props: {} });
    // Calendar renders many buttons (day cells + navigation) without data-col
    const buttonsWithoutDataCol = wrapper.findAll("button:not([data-col])");
    expect(buttonsWithoutDataCol.length).toBeGreaterThan(5);
  });

  it("renders hour and minute columns when timeOnly is true", () => {
    const wrapper = mount(DateTimePicker, { props: { timeOnly: true } });
    expect(wrapper.findAll("button[data-col='hour']").length).toBeGreaterThan(0);
    expect(wrapper.findAll("button[data-col='minute']").length).toBeGreaterThan(0);
  });
});
