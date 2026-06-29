import type { Component } from 'vue';
import type { ModoSize } from '../../config/ModoConfig';

export interface Input { 
    /** v-model */ 
    modelValue?: string | number | null; 
 
    /** Etiqueta visible encima del input. */ 
    label?: string; 
    /** Texto de placeholder. */ 
    placeholder?: string; 
    /** Texto de ayuda bajo el input (oculto si hay `errorText`). */ 
    helperText?: string; 
    /** Mensaje de error bajo el input. Si se provee, el input se marca como inválido. */ 
    errorText?: string; 
 
    /** Tipo HTML del input. */ 
    type?: 'text' | 'email' | 'url' | 'tel' | 'search'; 
 
    /** Estilo visual. */ 
    variant?: 'outline' | 'filled' | 'ghost'; 
    /** Familia semántica para el estado de foco/acento. */ 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    /** Tamaño. */
    size?: ModoSize; 
    /** Radio de esquinas. */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    /** 
     * Estilo del halo persistente (ring). Si se omite, hereda del ModoProvider. 
     * - `'tinted'`: gris en idle, tintado al color en focus (default) 
     * - `'neutral'`: gris en idle y focus (más discreto) 
     * - `'off'`: sin halo persistente 
     */ 
    halo?: 'tinted' | 'neutral' | 'off'; 
 
    /** Aplica w-full al root. */ 
    fullWidth?: boolean; 
 
    /** Deshabilitado. */ 
    disabled?: boolean; 
    /** Solo lectura (mantiene color normal, no se puede editar). */ 
    readonly?: boolean; 
    /** Requerido (añade indicador visual y atributo). */ 
    required?: boolean; 
    /** Estado cargando (muestra loader a la derecha, input deshabilitado). */ 
    loading?: boolean; 
 
    /** Muestra botón "X" para limpiar el valor cuando hay contenido. */ 
    clearable?: boolean; 
 
    /** Longitud máxima. Activa el contador si `showCounter`. */ 
    maxLength?: number; 
    /** Muestra contador de caracteres (requiere `maxLength`). */ 
    showCounter?: boolean; 
 
    /** Icono a la izquierda del input (componente Vue). */ 
    iconLeft?: Component; 
    /** Icono a la derecha del input (componente Vue). */ 
    iconRight?: Component; 
    /** Texto fijo a la izquierda del input (ej. "$", "https://"). */ 
    prefix?: string; 
    /** Texto fijo a la derecha del input (ej. ".com", "kg"). */ 
    suffix?: string; 
 
    /** id del input (autogenerado si se omite). */ 
    id?: string; 
    /** name HTML. */ 
    name?: string; 
    /** autocomplete HTML. */ 
    autocomplete?: string; 
    /** autofocus HTML. */ 
    autofocus?: boolean; 
 
    /** Accessible name cuando no hay `label` visible. */ 
    ariaLabel?: string; 
 
    /** Fuerza el estado inválido sin renderizar `errorText`. Útil al envolver con `FormField`. */ 
    invalid?: boolean; 
    /** IDs adicionales para concatenar en `aria-describedby` (ej. provistos por `FormField`). */ 
    ariaDescribedBy?: string; 
}
