export type DrawerSide = 'left' | 'right' | 'top' | 'bottom'; 
export type DrawerSize = 'small' | 'medium' | 'large' | 'full'; 
export type DrawerOverlay = 'blur' | 'solid' | 'transparent' | 'dark' | 'dim' | 'glass'; 
 
export interface Drawer { 
    /** Visibilidad. v-model. */ 
    modelValue?: boolean; 
 
    /** 
     * Lado desde el que entra el panel. 
     * @default 'right' 
     */ 
    side?: DrawerSide; 
 
    /** 
     * Tamaño del panel en su eje principal. 
     * - `small | medium | large` se mapean a anchos/altos discretos. 
     * - `full` ocupa el viewport completo en su eje. 
     * @default 'medium' 
     */ 
    size?: DrawerSize; 
 
    /** 
     * Radius del panel. Si se omite cascadea del provider. El lado opuesto 
     * a `side` no se redondea (queda pegado al borde). 
     */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
 
    /** Título accesible (renderizado en header si no hay slot). */ 
    title?: string; 
 
    /** Descripción opcional debajo del título. */ 
    description?: string; 
 
    /** Cierra al hacer click en el backdrop. @default true */ 
    closeOnOverlay?: boolean; 
 
    /** Cierra al presionar Escape. @default true */ 
    closeOnEscape?: boolean; 
 
    /** Muestra botón de cerrar (X) en la esquina del header. @default true */ 
    showClose?: boolean; 
 
    /** Bloquea el scroll del body mientras está abierto. @default true */ 
    lockScroll?: boolean; 
 
    /** Color de acento para borde/ring. Default cascade del provider. */ 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
 
    /** Estilo del backdrop. @default 'blur' */ 
    overlay?: DrawerOverlay; 
 
    /** 
     * Renderiza un borde interior sutil dentro del borde principal. 
     * @default false 
     */ 
    innerBorder?: boolean; 
 
    /** ID opcional. */ 
    id?: string; 
 
    /** aria-label cuando no hay title. */ 
    ariaLabel?: string; 
}
