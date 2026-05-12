import type { Component } from 'vue'; 
 
/** Formato de display del valor en el input. */ 
export type DateDisplayFormat = 
    | 'short'    // 4/23/2026 
    | 'medium'   // Apr 23, 2026 
    | 'long'     // April 23, 2026 
    | 'iso'      // 2026-04-23 
    | ((value: Date) => string); 
 
export interface DateField { 
    modelValue?: Date | null; 
 
    /** Formato del texto en el trigger. @default 'medium' */ 
    displayFormat?: DateDisplayFormat; 
    locale?: string; 
    firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6; 
    minDate?: Date; 
    maxDate?: Date; 
    disabledDates?: Date[]; 
    showOutsideDays?: boolean; 
 
    /** Campo estándar. */ 
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
 
    /** Cierra el popover al seleccionar una fecha. @default true */ 
    closeOnSelect?: boolean; 
 
    /** Icono a la izquierda. @default CalendarIcon */ 
    iconLeft?: Component; 
 
    id?: string; 
    name?: string; 
    autofocus?: boolean; 
    ariaLabel?: string; 
}
