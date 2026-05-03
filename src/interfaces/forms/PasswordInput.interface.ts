import type { Component } from 'vue'; 
 
/** Score heurístico expuesto por `PasswordInput` (0 = vacío · 4 = strong). */ 
export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4; 
 
/** 
 * Labels para cada nivel del strength meter. Todos son opcionales — 
 * las claves que falten usan el fallback en inglés. El score `0` se 
 * reserva para estado vacío y normalmente se deja como string vacío. 
 */ 
export type PasswordStrengthLabels = Partial<Record<PasswordStrengthScore, string>>; 
 
export interface PasswordInput { 
    /** v-model */ 
    modelValue?: string | null; 
 
    /** Etiqueta visible encima del input. */ 
    label?: string; 
    /** Texto de placeholder. */ 
    placeholder?: string; 
    /** Texto de ayuda bajo el input (oculto si hay `errorText`). */ 
    helperText?: string; 
    /** Mensaje de error bajo el input. */ 
    errorText?: string; 
 
    /** Estilo visual. */ 
    variant?: 'outline' | 'filled' | 'ghost'; 
    /** Familia semántica para el estado de foco/acento. */ 
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
    /** Solo lectura. */ 
    readonly?: boolean; 
    /** Requerido. */ 
    required?: boolean; 
    /** Estado cargando. */ 
    loading?: boolean; 
 
    /** Longitud máxima. */ 
    maxLength?: number; 
    /** Muestra contador de caracteres (requiere `maxLength`). */ 
    showCounter?: boolean; 
 
    /** 
     * Muestra botón para alternar la visibilidad del password. 
     * @default true 
     */ 
    toggleVisibility?: boolean; 
    /** Si el contenido arranca visible. */ 
    defaultVisible?: boolean; 
 
    /** 
     * Muestra barra de fortaleza debajo del input. 
     * Calcula score heurístico (longitud + clases de caracteres). 
     */ 
    strengthMeter?: boolean; 
 
    /** 
     * Labels custom para el strength meter (i18n). Si no se provee o alguna 
     * clave falta, se usa el fallback en inglés 
     * (`'' | 'Weak' | 'Fair' | 'Good' | 'Strong'`). 
     * 
     * El score numérico también se emite vía `@strength-change`, así que 
     * los consumidores con i18n externo pueden ignorar este prop y traducir 
     * ellos mismos basándose en el evento. 
     */ 
    strengthLabels?: PasswordStrengthLabels; 
 
    /** Icono a la izquierda del input (componente Vue). */ 
    iconLeft?: Component; 
    /** Texto fijo a la izquierda del input. */ 
    prefix?: string; 
 
    /** id (autogenerado si se omite). */ 
    id?: string; 
    /** name HTML. */ 
    name?: string; 
    /** 
     * autocomplete HTML. 
     * @default 'current-password' 
     */ 
    autocomplete?: string; 
    /** autofocus HTML. */ 
    autofocus?: boolean; 
 
    /** Accessible name cuando no hay `label` visible. */ 
    ariaLabel?: string; 
}
