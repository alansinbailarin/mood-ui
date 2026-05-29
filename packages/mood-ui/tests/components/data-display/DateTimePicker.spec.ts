import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DateTimePicker from "../../../src/components/data-display/date-picker/DateTimePicker.vue";
import Calendar from "../../../src/components/data-display/calendar/Calendar.vue";

describe("DateTimePicker — timeOnly", () => {
  it("hides the calendar when timeOnly is true", () => {
    const wrapper = mount(DateTimePicker, { props: { timeOnly: true } });
    expect(wrapper.findComponent(Calendar).exists()).toBe(false);
  });

  it("renders the calendar when timeOnly is not set", () => {
    const wrapper = mount(DateTimePicker, { props: {} });
    expect(wrapper.findComponent(Calendar).exists()).toBe(true);
  });

  it("renders hour and minute columns when timeOnly is true", () => {
    const wrapper = mount(DateTimePicker, { props: { timeOnly: true } });
    expect(wrapper.findAll("button[data-col='hour']").length).toBeGreaterThan(0);
    expect(wrapper.findAll("button[data-col='minute']").length).toBeGreaterThan(0);
  });
});
