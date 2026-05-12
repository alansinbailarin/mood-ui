export interface RangePreset { 
    label: string; 
    range: () => [Date, Date]; 
} 
 
export interface DateRangePicker { 
    modelValue?: [Date | null, Date | null]; 
    locale?: string; 
    firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6; 
    minDate?: Date; 
    maxDate?: Date; 
    disabledDates?: Date[]; 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    variant?: 'filled' | 'outline'; 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    months?: 1 | 2; 
    showPresets?: boolean; 
    presets?: RangePreset[]; 
    minRange?: number; 
    maxRange?: number; 
}
