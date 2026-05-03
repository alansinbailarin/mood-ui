export interface RadioOption { 
    value: string | number; 
    label: string; 
    description?: string; 
    disabled?: boolean; 
} 
 
export interface Radio { 
    /** v-model — se compara contra `value` para determinar checked. */ 
    modelValue?: string | number | null; 
 
    /** Valor que emite este radio al seleccionarse. */ 
    value: string | number; 
 
    /** Etiqueta visible a la derecha del control. */ 
    label?: string; 
    /** Texto descriptivo secundario bajo el label. */ 
    description?: string; 
 
    /** Familia semántica para el estado checked. */ 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    /** Tamaño. */ 
    size?: 'small' | 'medium' | 'large'; 
 
    disabled?: boolean; 
    required?: boolean; 
    loading?: boolean; 
 
    /** id del input (autogenerado si se omite). */ 
    id?: string; 
    /** name HTML. Si está dentro de un `RadioGroup`, se hereda. */ 
    name?: string; 
 
    /** Accessible name cuando no hay `label` visible. */ 
    ariaLabel?: string; 
} 
 
export interface RadioGroup { 
    /** v-model — valor seleccionado. */ 
    modelValue?: string | number | null; 
 
    /** name HTML compartido por los radios del grupo. */ 
    name?: string; 
 
    /** Opciones declarativas (alternativa a slot). */ 
    options?: RadioOption[]; 
 
    /** Etiqueta del grupo (fieldset > legend). */ 
    label?: string; 
    /** Texto de ayuda bajo el grupo (oculto si hay `errorText`). */ 
    helperText?: string; 
    /** Mensaje de error bajo el grupo. */ 
    errorText?: string; 
 
    /** Dirección del grupo. */ 
    orientation?: 'vertical' | 'horizontal'; 
 
    /** Familia semántica aplicada a todos los radios. */ 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    /** Tamaño aplicado a todos los radios. */ 
    size?: 'small' | 'medium' | 'large'; 
 
    disabled?: boolean; 
    required?: boolean; 
    loading?: boolean; 
 
    /** Accessible name cuando no hay `label` visible. */ 
    ariaLabel?: string; 
}
