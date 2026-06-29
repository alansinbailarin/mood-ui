import type { ModoSize } from '../../config/ModoConfig';

export interface Switch { 
    /** v-model (boolean). */ 
    modelValue?: boolean; 
 
    /** Etiqueta visible a la derecha del control. */ 
    label?: string; 
    /** Texto descriptivo secundario bajo el label. */ 
    description?: string; 
    /** Texto de ayuda bajo el control (oculto si hay `errorText`). */ 
    helperText?: string; 
    /** Mensaje de error bajo el control. */ 
    errorText?: string; 
 
    /** Familia semántica para el estado "on". */ 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    /** Tamaño. */
    size?: ModoSize; 
    /** Track radius. Cascades from `ModoProvider`. @default 'full' (pill) */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
 
    disabled?: boolean; 
    readonly?: boolean; 
    required?: boolean; 
    loading?: boolean; 
 
    /** Posición del label respecto al control. */ 
    labelPosition?: 'left' | 'right'; 
 
    /** id del input (autogenerado si se omite). */ 
    id?: string; 
    /** name HTML. */ 
    name?: string; 
 
    /** Accessible name cuando no hay `label` visible. */ 
    ariaLabel?: string; 
}
