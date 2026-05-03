export interface Calendar { 
    modelValue?: Date | null; 
    month?: number; 
    year?: number; 
    locale?: string; 
    firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6; 
    minDate?: Date; 
    maxDate?: Date; 
    disabledDates?: Date[]; 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    variant?: 'filled' | 'outline'; 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    showOutsideDays?: boolean; 
    showHeader?: boolean; 
    fixedWeeks?: boolean; 
}
