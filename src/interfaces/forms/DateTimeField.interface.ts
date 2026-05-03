import type { Component } from 'vue'; 
import type { DateDisplayFormat } from './DateField.interface'; 
 
export type TimeDisplayFormat = 
    | 'short'     // 14:05 
    | 'medium'    // 14:05:00 
    | ((d: Date) => string); 
 
export interface DateTimeField { 
    modelValue?: Date | null; 
 
    /** Formato del bloque de fecha. @default 'medium' */ 
    dateFormat?: DateDisplayFormat; 
    /** Formato del bloque de hora. @default 'short' */ 
    timeFormat?: TimeDisplayFormat; 
    /** Separador entre fecha y hora. @default ' · ' */ 
    separator?: string; 
 
    locale?: string; 
    firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6; 
    minDate?: Date; 
    maxDate?: Date; 
    disabledDates?: Date[]; 
    /** '12h' | '24h' */ 
    format?: '12h' | '24h'; 
    step?: number; 
    showSeconds?: boolean; 
    minTime?: string; 
    maxTime?: string; 
 
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
