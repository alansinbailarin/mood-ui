export interface DateTimePicker { 
    modelValue?: Date | null; 
    locale?: string; 
    firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6; 
    minDate?: Date; 
    maxDate?: Date; 
    disabledDates?: Date[]; 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    variant?: 'filled' | 'outline'; 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    format?: '12h' | '24h'; 
    step?: number; 
    showSeconds?: boolean; 
    minTime?: string; 
    maxTime?: string;
    /** When true, hides the calendar panel and shows only the time columns. @default false */
    timeOnly?: boolean;
}
