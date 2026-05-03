export interface Checkbox { 
    /** v-model (boolean). Cuando `indeterminate` es true, el valor no cambia visualmente. */ 
    modelValue?: boolean; 
 
    /** Etiqueta visible a la derecha del control. */ 
    label?: string; 
    /** Texto descriptivo secundario bajo el label. */ 
    description?: string; 
    /** Texto de ayuda bajo el control (oculto si hay `errorText`). */ 
    helperText?: string; 
    /** Mensaje de error bajo el control. */ 
    errorText?: string; 
 
    /** Familia semántica para el estado checked. */ 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    /** Tamaño. */ 
    size?: 'small' | 'medium' | 'large'; 
    /** Radio del cuadro. */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
 
    /** Estado tri-estado (muestra guión horizontal). */ 
    indeterminate?: boolean; 
 
    disabled?: boolean; 
    readonly?: boolean; 
    required?: boolean; 
    loading?: boolean; 
 
    /** id del input (autogenerado si se omite). */ 
    id?: string; 
    /** name HTML. */ 
    name?: string; 
    /** value HTML — útil cuando es hijo de un grupo. */ 
    value?: string | number; 
 
    /** Accessible name cuando no hay `label` visible. */ 
    ariaLabel?: string; 
}
