import type { Component } from 'vue';
import type { ModoSize } from '../../config/ModoConfig';

export type SelectValue = string | number; 
 
export interface SelectOption { 
    value: SelectValue; 
    label: string; 
    /** Texto secundario debajo del label. */ 
    description?: string; 
    /** Icono a la izquierda de la opción. */ 
    icon?: Component; 
    /** Opción no seleccionable. */ 
    disabled?: boolean; 
    /** Nombre del grupo (las opciones con el mismo valor se agrupan). */ 
    group?: string; 
} 
 
export interface Select { 
    /** v-model */ 
    modelValue?: SelectValue | null; 
 
    /** Opciones disponibles. */ 
    options: SelectOption[]; 
 
    /** Etiqueta visible. */ 
    label?: string; 
    /** Placeholder mostrado cuando no hay valor. @default 'Select…' */ 
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
    /** Requerido. */
    required?: boolean;
    /** Estado cargando (muestra spinner en lugar del chevron). */
    loading?: boolean;

    /** Muestra botón X para limpiar el valor seleccionado. */
    clearable?: boolean;

    /** Muestra un input de búsqueda dentro del panel. */
    searchable?: boolean; 
    /** Placeholder del input de búsqueda. @default 'Search…' */ 
    searchPlaceholder?: string; 
    /** Mensaje cuando no hay resultados. @default 'No results.' */ 
    emptyText?: string; 
 
    /** Icono a la izquierda del trigger. */ 
    iconLeft?: Component; 
 
    /** 
     * Cómo se calcula el ancho del panel desplegable. 
     * - `'trigger'` (por defecto): el panel iguala el ancho del trigger. 
     * - `'auto'`: el panel se dimensiona a su contenido, independiente del trigger. 
     * @default 'trigger' 
     */ 
    panelWidth?: 'trigger' | 'auto'; 
    /** Ancho mínimo del panel (px o cualquier unidad CSS). Útil con `panelWidth='auto'`. */ 
    panelMinWidth?: number | string; 
 
    /** id (autogenerado si se omite). */ 
    id?: string; 
    /** name HTML (oculto para integrarse con forms si se necesita). */ 
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
 
export interface MultiSelect { 
    /** v-model (array). */ 
    modelValue?: SelectValue[]; 
 
    /** Opciones disponibles. */ 
    options: SelectOption[]; 
 
    /** Etiqueta visible. */ 
    label?: string; 
    /** Placeholder mostrado cuando no hay valores. @default 'Select…' */ 
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
    /** Requerido. */
    required?: boolean;
    /** Estado cargando. */
    loading?: boolean; 
 
    /** Muestra botón X para limpiar todas las selecciones. */ 
    clearable?: boolean; 
 
    /** Muestra un toggle "Select all" en el panel. */ 
    showSelectAll?: boolean; 
    /** Texto del botón select all. @default 'Select all' */ 
    selectAllLabel?: string; 
    /** Texto cuando todo está seleccionado. @default 'Deselect all' */ 
    deselectAllLabel?: string; 
 
    /** Máximo de opciones seleccionables. */ 
    maxSelected?: number; 
 
    /** Muestra un input de búsqueda dentro del panel. */ 
    searchable?: boolean; 
    /** Placeholder del input de búsqueda. @default 'Search…' */ 
    searchPlaceholder?: string; 
    /** Mensaje cuando no hay resultados. @default 'No results.' */ 
    emptyText?: string; 
 
    /** Icono a la izquierda del trigger. */ 
    iconLeft?: Component; 
 
    /** Número máximo de chips a mostrar antes de colapsar en "+N". */ 
    maxVisibleChips?: number; 
 
    /** id (autogenerado si se omite). */ 
    id?: string; 
    /** name HTML (oculto para integrarse con forms, se emite 1 input por valor). */ 
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
