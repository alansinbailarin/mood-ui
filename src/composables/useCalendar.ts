import { ref, computed, watch, type Ref } from 'vue'; 
 
export interface CalendarDay { 
    date: Date; 
    day: number; 
    isToday: boolean; 
    isSelected: boolean; 
    isOutside: boolean; 
    disabled: boolean; 
    inRange?: boolean; 
    isRangeStart?: boolean; 
    isRangeEnd?: boolean; 
} 
 
export interface UseCalendarOptions { 
    modelValue?: Ref<Date | null | undefined>; 
    rangeValue?: Ref<[Date | null, Date | null] | undefined>; 
    month?: Ref<number | undefined>; 
    year?: Ref<number | undefined>; 
    locale?: Ref<string>; 
    firstDayOfWeek?: Ref<number>; 
    minDate?: Ref<Date | undefined>; 
    maxDate?: Ref<Date | undefined>; 
    disabledDates?: Ref<Date[] | undefined>; 
    disabledDaysOfWeek?: Ref<number[] | undefined>; 
    showOutsideDays?: Ref<boolean>; 
    fixedWeeks?: Ref<boolean>; 
    weekdayFormat?: Ref<'narrow' | 'short' | 'long'>; 
} 
 
export const isSameDay = (a: Date, b: Date) => 
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); 
 
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()); 
 
export const useCalendar = (options: UseCalendarOptions) => { 
    const today = new Date(); 
 
    const initialDate = 
        options.modelValue?.value ?? 
        options.rangeValue?.value?.[0] ?? 
        today; 
 
    const currentMonth = ref(options.month?.value ?? initialDate.getMonth()); 
    const currentYear = ref(options.year?.value ?? initialDate.getFullYear()); 
 
    if (options.month) { 
        watch(options.month, (v) => { if (v !== undefined) currentMonth.value = v; }); 
    } 
    if (options.year) { 
        watch(options.year, (v) => { if (v !== undefined) currentYear.value = v; }); 
    } 
 
    const locale = computed(() => options.locale?.value === 'default' || !options.locale?.value ? undefined : options.locale.value); 
 
    const monthLabel = computed(() => { 
        const d = new Date(currentYear.value, currentMonth.value, 1); 
        return d.toLocaleString(locale.value, { month: 'long' }); 
    }); 
 
    const weekDayLabels = computed(() => { 
        const labels: string[] = []; 
        const firstDow = options.firstDayOfWeek?.value ?? 0; 
        const fmt = options.weekdayFormat?.value ?? 'narrow'; 
        const base = new Date(2024, 0, 7 + firstDow); 
        for (let i = 0; i < 7; i++) { 
            const d = new Date(base); 
            d.setDate(base.getDate() + i); 
            const label = d.toLocaleString(locale.value, { weekday: fmt === 'long' ? 'long' : 'short' }); 
            labels.push(fmt === 'narrow' ? label.slice(0, 2) : label); 
        } 
        return labels; 
    }); 
 
    const isDateDisabled = (date: Date) => { 
        const min = options.minDate?.value; 
        const max = options.maxDate?.value; 
        if (min && date < startOfDay(min)) return true; 
        if (max && date > startOfDay(max)) return true; 
        if (options.disabledDates?.value?.some((d) => isSameDay(d, date))) return true; 
        if (options.disabledDaysOfWeek?.value?.includes(date.getDay())) return true; 
        return false; 
    }; 
 
    const isInRange = (date: Date) => { 
        const range = options.rangeValue?.value; 
        if (!range || !range[0] || !range[1]) return false; 
        const t = startOfDay(date).getTime(); 
        return t >= startOfDay(range[0]).getTime() && t <= startOfDay(range[1]).getTime(); 
    }; 
 
    const calendarDays = computed<CalendarDay[]>(() => { 
        const days: CalendarDay[] = []; 
        const firstOfMonth = new Date(currentYear.value, currentMonth.value, 1); 
        const lastOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0); 
        const firstDow = options.firstDayOfWeek?.value ?? 0; 
        const showOutside = options.showOutsideDays?.value ?? true; 
        const fixed = options.fixedWeeks?.value ?? true; 
        const selected = options.modelValue?.value; 
        const range = options.rangeValue?.value; 
 
        let startDow = firstOfMonth.getDay() - firstDow; 
        if (startDow < 0) startDow += 7; 
 
        const buildDay = (date: Date, isOutside: boolean): CalendarDay => ({ 
            date, 
            day: date.getDate(), 
            isToday: isSameDay(date, today), 
            isSelected: selected ? isSameDay(date, selected) : false, 
            isOutside, 
            disabled: (isOutside && !showOutside) || isDateDisabled(date), 
            inRange: isInRange(date), 
            isRangeStart: range?.[0] ? isSameDay(date, range[0]) : false, 
            isRangeEnd: range?.[1] ? isSameDay(date, range[1]) : false, 
        }); 
 
        for (let i = startDow - 1; i >= 0; i--) { 
            const date = new Date(currentYear.value, currentMonth.value, -i); 
            days.push(buildDay(date, true)); 
        } 
 
        for (let d = 1; d <= lastOfMonth.getDate(); d++) { 
            const date = new Date(currentYear.value, currentMonth.value, d); 
            days.push(buildDay(date, false)); 
        } 
 
        const targetLength = fixed ? 42 : Math.ceil(days.length / 7) * 7; 
        let nextDay = 1; 
        while (days.length < targetLength) { 
            const date = new Date(currentYear.value, currentMonth.value + 1, nextDay++); 
            days.push(buildDay(date, true)); 
        } 
 
        return days; 
    }); 
 
    const prevMonth = () => { 
        if (currentMonth.value === 0) { 
            currentMonth.value = 11; 
            currentYear.value--; 
        } else { 
            currentMonth.value--; 
        } 
    }; 
 
    const nextMonth = () => { 
        if (currentMonth.value === 11) { 
            currentMonth.value = 0; 
            currentYear.value++; 
        } else { 
            currentMonth.value++; 
        } 
    }; 
 
    const prevYear = () => { currentYear.value--; }; 
    const nextYear = () => { currentYear.value++; }; 
 
    const goToToday = () => { 
        const now = new Date(); 
        currentMonth.value = now.getMonth(); 
        currentYear.value = now.getFullYear(); 
        return now; 
    }; 
 
    const goToDate = (date: Date) => { 
        currentMonth.value = date.getMonth(); 
        currentYear.value = date.getFullYear(); 
    }; 
 
    return { 
        today, 
        currentMonth, 
        currentYear, 
        monthLabel, 
        weekDayLabels, 
        calendarDays, 
        isDateDisabled, 
        prevMonth, 
        nextMonth, 
        prevYear, 
        nextYear, 
        goToToday, 
        goToDate, 
    }; 
};
