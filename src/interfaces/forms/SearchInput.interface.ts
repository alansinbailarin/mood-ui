export interface SearchInput { 
    /** v-model */ 
    modelValue?: string | null; 
 
    /** Etiqueta visible. */ 
    label?: string; 
    /** Placeholder. @default 'Search…' */ 
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
    /** Solo lectura. */ 
    readonly?: boolean; 
    /** Requerido. */ 
    required?: boolean; 
    /** Estado cargando (muestra spinner en lugar del clear). */ 
    loading?: boolean; 
 
    /** Longitud máxima. */ 
    maxLength?: number; 
    /** Muestra contador (requiere `maxLength`). */ 
    showCounter?: boolean; 
 
    /** 
     * Tiempo (ms) de debounce antes de emitir `search` mientras se escribe. 
     * - `0` o `undefined` = solo emite `search` al presionar Enter. 
     * @default 0 
     */ 
    debounce?: number; 
 
    /** 
     * Atajo de teclado global que enfoca el input. Se muestra como hint `<kbd>` 
     * a la derecha cuando el input no tiene foco ni valor. 
     * 
     * Formatos aceptados: 
     * - Tecla única: `'/'`, `'k'` 
     * - Combinación: `'cmd+k'` (auto-traduce a Ctrl+K en Windows) 
     */ 
    shortcut?: string; 
 
    /** id (autogenerado si se omite). */ 
    id?: string; 
    /** name HTML. */ 
    name?: string; 
    /** autofocus HTML. */ 
    autofocus?: boolean; 
 
    /** Accessible name cuando no hay `label` visible. */ 
    ariaLabel?: string; 
}
