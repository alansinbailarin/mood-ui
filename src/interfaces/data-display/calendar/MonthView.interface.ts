export interface CalendarEvent { 
    id: string | number; 
    title: string; 
    start: Date; 
    end?: Date; 
    allDay?: boolean; 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning' | 'info' | 'purple' | 'pink'; 
    colorHex?: string; 
    resourceId?: string | number; 
    readonly?: boolean; 
    description?: string; 
    meta?: Record<string, unknown>; 
} 
 
export interface MonthView { 
    modelValue?: Date; 
    events?: CalendarEvent[]; 
    locale?: string; 
    firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6; 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    maxEventsPerDay?: number; 
    showWeekNumbers?: boolean; 
    fixedWeeks?: boolean; 
    showHeader?: boolean; 
    bordered?: boolean; 
    keyboardNavigation?: boolean; 
    minDate?: Date; 
    maxDate?: Date; 
    minYear?: number; 
    maxYear?: number; 
    disabledDates?: Date[]; 
    disabledDaysOfWeek?: number[]; 
    dayNameFormat?: 'narrow' | 'short' | 'long'; 
    dayNameCase?: 'upper' | 'lower' | 'capitalize' | 'normal'; 
    highlightWeekends?: boolean; 
    showOutsideDays?: boolean; 
    showMonthYearSelects?: boolean; 
    showYearJump?: boolean; 
    draggableEvents?: boolean; 
    laneHeight?: number; 
}
