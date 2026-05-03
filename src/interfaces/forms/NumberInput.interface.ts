import type { Component } from 'vue'; 
 
export interface NumberInput { 
    /** v-model (number o null cuando el input está vacío). */ 
    modelValue?: number | null; 
 
    /** Etiqueta visible. */ 
    label?: string; 
    /** Placeholder. */ 
    placeholder?: string; 
    /** Texto de ayuda (oculto si hay `errorText`). */ 
    helperText?: string; 
    /** Mensaje de error. */ 
    errorText?: string; 
 
    /** Estilo visual. */ 
    variant?: 'outline' | 'filled' | 'ghost'; 
    /** Familia semántica para foco/acento. */ 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    /** Tamaño. */ 
    size?: 'small' | 'medium' | 'large'; 
    /** Radio de esquinas. */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    /** Estilo del halo persistente. Hereda del ModoProvider si se omite. */ 
    halo?: 'tinted' | 'neutral' | 'off'; 
 
    /** Aplica w-full al root. */ 
    fullWidth?: boolean; 
 
    /** Deshabilitado. */ 
    disabled?: boolean; 
    /** Solo lectura (sin steppers ni edición). */ 
    readonly?: boolean; 
    /** Requerido. */ 
    required?: boolean; 
    /** Estado cargando. */ 
    loading?: boolean; 
 
    /** Mínimo permitido. */ 
    min?: number; 
    /** Máximo permitido. */ 
    max?: number; 
    /** Incremento de los steppers y flechas de teclado. @default 1 */ 
    step?: number; 
    /** Decimales forzados en el display al formatear (blur). */ 
    precision?: number; 
 
    /** 
     * Muestra botones +/- para incrementar/decrementar. 
     * @default true 
     */ 
    steppers?: boolean; 
    /** 
     * Posición de los steppers: 
     * - `right`: ambos apilados a la derecha. 
     * - `split`: `−` a la izquierda y `+` a la derecha. 
     * @default 'right' 
     */ 
    stepperPosition?: 'right' | 'split'; 
 
    /** 
     * Si `true`, permite valores fuera de min/max mientras se escribe 
     * (se clampean al blur). Si `false`, se clampea en tiempo real. 
     * @default false 
     */ 
    allowInvalid?: boolean; 
 
    /** Formatea con separador de miles al blur (solo display). */ 
    thousandSeparator?: boolean; 
 
    /** Texto fijo a la izquierda (ej. `$`). */ 
    prefix?: string; 
    /** Texto fijo a la derecha (ej. `%`, `kg`). */ 
    suffix?: string; 
    /** Icono a la izquierda. */ 
    iconLeft?: Component; 
 
    /** id (autogenerado si se omite). */ 
    id?: string; 
    /** name HTML. */ 
    name?: string; 
    /** autocomplete HTML. */ 
    autocomplete?: string; 
    /** autofocus HTML. */ 
    autofocus?: boolean; 
 
    /** Accessible name cuando no hay `label` visible. */ 
    ariaLabel?: string; 
}
