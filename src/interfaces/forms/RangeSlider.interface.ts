export interface RangeSlider { 
    /** Valor [from, to]. v-model. */ 
    modelValue?: [number, number]; 
 
    min?: number; 
    max?: number; 
    step?: number; 
 
    /** Mínima distancia entre los dos thumbs. */ 
    minDistance?: number; 
 
    showValue?: boolean; 
    formatValue?: (v: number) => string; 
 
    marks?: boolean | number[] | { value: number; label?: string }[]; 
 
    orientation?: 'horizontal' | 'vertical'; 
 
    label?: string; 
    helperText?: string; 
    errorText?: string; 
 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    size?: 'small' | 'medium' | 'large'; 
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
