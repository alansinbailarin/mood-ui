import type { ModoSize } from '../../config/ModoConfig';

export interface Textarea { 
    /** v-model */ 
    modelValue?: string | null; 
 
    /** Etiqueta visible encima del textarea. */ 
    label?: string; 
    /** Texto de placeholder. */ 
    placeholder?: string; 
    /** Texto de ayuda bajo el textarea (oculto si hay `errorText`). */ 
    helperText?: string; 
    /** Mensaje de error bajo el textarea. Si se provee, se marca como inválido. */ 
    errorText?: string; 
 
    /** Estilo visual. */ 
    variant?: 'outline' | 'filled' | 'ghost'; 
    /** Familia semántica para el estado de foco/acento. */ 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    /** Tamaño (afecta padding y tipografía). */
    size?: ModoSize; 
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
    /** Requerido (añade indicador visual y atributo). */ 
    required?: boolean; 
    /** Estado cargando (muestra loader, textarea deshabilitado). */ 
    loading?: boolean; 
 
    /** Muestra botón "X" para limpiar el valor cuando hay contenido. */ 
    clearable?: boolean; 
 
    /** Longitud máxima. Activa el contador si `showCounter`. */ 
    maxLength?: number; 
    /** Muestra contador de caracteres (requiere `maxLength`). */ 
    showCounter?: boolean; 
 
    /** Número mínimo de filas visibles. */ 
    rows?: number; 
    /** 
     * Si `true`, el textarea crece automáticamente con el contenido hasta 
     * `maxRows`. Cuando se alcanza, aparece scroll interno. 
     */ 
    autoresize?: boolean; 
    /** Máximo de filas cuando `autoresize=true`. */ 
    maxRows?: number; 
    /** 
     * Dirección permitida de redimensionamiento manual del navegador. 
     * Se ignora cuando `autoresize=true` (se fuerza a `none`). 
     */ 
    resize?: 'none' | 'vertical' | 'horizontal' | 'both'; 
 
    /** id del textarea (autogenerado si se omite). */ 
    id?: string; 
    /** name HTML. */ 
    name?: string; 
    /** autofocus HTML. */ 
    autofocus?: boolean; 
 
    /** Accessible name cuando no hay `label` visible. */ 
    ariaLabel?: string; 
 
    /** Fuerza el estado inválido sin renderizar `errorText`. Útil al envolver con `FormField`. */ 
    invalid?: boolean; 
    /** IDs adicionales para concatenar en `aria-describedby` (ej. provistos por `FormField`). */ 
    ariaDescribedBy?: string; 
}
