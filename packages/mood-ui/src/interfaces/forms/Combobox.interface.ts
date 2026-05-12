import type { Component } from 'vue'; 
import type { SelectOption } from './Select.interface'; 
 
export type { SelectOption }; 
 
export interface Combobox { 
    /** v-model — texto actual del input. Puede coincidir o no con un option.value. */ 
    modelValue?: string | null; 
 
    /** Opciones estáticas. Si se define `loadOptions`, se ignora. */ 
    options?: SelectOption[]; 
 
    /** 
     * Fuente async de opciones. Se invoca en cada cambio del query (debounceado). 
     * Devuelve una promesa con la lista filtrada por el backend. 
     */ 
    loadOptions?: (query: string) => Promise<SelectOption[]>; 
 
    /** Delay del loadOptions (ms). */ 
    debounce?: number; 
 
    /** Mínimo de caracteres antes de disparar la búsqueda async. */ 
    minChars?: number; 
 
    /** 
     * Si true, acepta cualquier texto como valor (combobox real). 
     * Si false, sólo acepta values de `options` (autocomplete estricto) — 
     * al blur el texto se resetea al último valor válido. 
     */ 
    freeSolo?: boolean; 
 
    /** Etiqueta, placeholder, helper, error (estándar). */ 
    label?: string; 
    placeholder?: string; 
    helperText?: string; 
    errorText?: string; 
 
    /** Texto cuando no hay opciones que mostrar. */ 
    emptyText?: string; 
    /** Texto mientras carga async. */ 
    loadingText?: string; 
 
    /** Estilo visual. */ 
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
 
    /** Botón "X" para limpiar. */ 
    clearable?: boolean; 
 
    /** Máximo de caracteres. */ 
    maxLength?: number; 
    showCounter?: boolean; 
 
    /** Icono a la izquierda del input. */ 
    iconLeft?: Component; 
 
    id?: string; 
    name?: string; 
    autocomplete?: string; 
    autofocus?: boolean; 
 
    ariaLabel?: string; 
}
