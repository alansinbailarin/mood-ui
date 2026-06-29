import type { ModoSize } from '../../config/ModoConfig';

export interface Slider { 
    /** Valor actual. v-model. */ 
    modelValue?: number; 
 
    /** Valor mínimo. @default 0 */ 
    min?: number; 
    /** Valor máximo. @default 100 */ 
    max?: number; 
    /** Paso. @default 1 */ 
    step?: number; 
 
    /** Muestra el valor actual como tooltip/label flotante. */ 
    showValue?: boolean; 
    /** Formatea el valor mostrado. */ 
    formatValue?: (v: number) => string; 
 
    /** Marcas discretas. True usa step; array usa valores específicos. */ 
    marks?: boolean | number[] | { value: number; label?: string }[]; 
 
    /** Orientación del slider. @default 'horizontal' */ 
    orientation?: 'horizontal' | 'vertical'; 
 
    /** Campo estándar. */ 
    label?: string; 
    helperText?: string; 
    errorText?: string; 
 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    size?: ModoSize; 
    /** Track radius. Cascades from `ModoProvider`. @default 'full' (pill) */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
 
    fullWidth?: boolean; 
    disabled?: boolean; 
    readonly?: boolean; 
    required?: boolean; 
 
    id?: string; 
    name?: string; 
    ariaLabel?: string; 
}
