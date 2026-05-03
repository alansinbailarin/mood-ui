import type { Component } from 'vue'; 
import type { DateDisplayFormat } from './DateField.interface'; 
import type { RangePreset } from '../data-display/date-picker/DateRangePicker.interface'; 
 
export type { RangePreset }; 
 
export interface DateRangeField { 
    modelValue?: [Date | null, Date | null]; 
 
    displayFormat?: DateDisplayFormat; 
    /** Separador entre inicio y fin. @default ' → ' */ 
    separator?: string; 
 
    locale?: string; 
    firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6; 
    minDate?: Date; 
    maxDate?: Date; 
    disabledDates?: Date[]; 
    months?: 1 | 2; 
    showPresets?: boolean; 
    presets?: RangePreset[]; 
    minRange?: number; 
    maxRange?: number; 
 
    label?: string; 
    placeholder?: string; 
    helperText?: string; 
    errorText?: string; 
 
    variant?: 'outline' | 'filled' | 'ghost'; 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    size?: 'small' | 'medium' | 'large'; 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    /** Estilo del halo persistente. Hereda del ModoProvider si se omite. */ 
    halo?: 'tinted' | 'neutral' | 'off'; 
 
    fullWidth?: boolean; 
    disabled?: boolean; 
    readonly?: boolean; 
    required?: boolean; 
    loading?: boolean; 
    clearable?: boolean; 
 
    iconLeft?: Component; 
 
    id?: string; 
    name?: string; 
    autofocus?: boolean; 
    ariaLabel?: string; 
}
