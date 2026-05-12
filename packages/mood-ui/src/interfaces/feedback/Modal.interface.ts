export type ModalSize = 'small' | 'medium' | 'large' | 'xlarge' | 'full'; 
export type ModalPosition = 'center' | 'top'; 
export type ModalOverlay = 'blur' | 'solid' | 'transparent' | 'dark' | 'dim' | 'glass'; 
 
export interface Modal { 
    /** Visibilidad. v-model. */ 
    modelValue?: boolean; 
 
    /** Tamaño del panel. @default 'medium' */ 
    size?: ModalSize; 
 
    /** Posición vertical. @default 'center' */ 
    position?: ModalPosition; 
 
    /** Radius. Si no se pasa, cascadea del provider. */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
 
    /** Título accesible (se renderiza en header si no hay slot). */ 
    title?: string; 
 
    /** Descripción opcional debajo del título. */ 
    description?: string; 
 
    /** Cierra al hacer click en el backdrop. @default true */ 
    closeOnOverlay?: boolean; 
 
    /** Cierra al presionar Escape. @default true */ 
    closeOnEscape?: boolean; 
 
    /** Muestra botón de cerrar (X) en la esquina. @default true */ 
    showClose?: boolean; 
 
    /** 
     * Bloquea el scroll del body mientras está abierto. @default true 
     */ 
    lockScroll?: boolean; 
 
    /** Color de acento para borde/ring. Default cascade del provider. */ 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
 
    /** Estilo del backdrop. @default 'blur' */ 
    overlay?: ModalOverlay; 
 
    /** 
     * Renderiza un borde interior sutil dentro del borde principal. @default true 
     */ 
    innerBorder?: boolean; 
 
    /** 
     * Elemento de origen para la animación "emergente" (FLIP-style). 
     * Si no se provee, se usa `document.activeElement` al momento de abrir 
     * (normalmente el botón que abrió el modal). 
     */ 
    origin?: HTMLElement | null; 
 
    /** 
     * Deshabilita la animación origen→modal y usa un fade+scale genérico. 
     * @default false 
     */ 
    disableOriginAnimation?: boolean; 
 
    /** ID opcional del modal. */ 
    id?: string; 
 
    /** aria-label cuando no hay title. */ 
    ariaLabel?: string; 
}
