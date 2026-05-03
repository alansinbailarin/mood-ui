import type { Component } from 'vue'; 
 
export type ChipPlacement = 
    | 'top-left' 
    | 'top-right' 
    | 'bottom-left' 
    | 'bottom-right'; 
 
export interface Chip { 
    /** Contenido visible del chip (número, string corto). Ignorado si `dot`. */ 
    content?: string | number; 
    /** Modo punto: renderiza un indicador pequeño sin contenido. */ 
    dot?: boolean; 
    /** Si hay contenido numérico, cap al superar este valor (ej. 99 → "99+"). */ 
    max?: number; 
    /** Oculta el chip (útil cuando el valor es 0). */ 
    invisible?: boolean; 
    /** Si `true`, mostrar aun si `content` es 0 (por defecto se oculta). */ 
    showZero?: boolean; 
 
    /** Estilo visual. */ 
    variant?: 'solid' | 'outline' | 'subtle'; 
    /** Familia semántica. */ 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    /** Tamaño. */ 
    size?: 'small' | 'medium' | 'large'; 
    /** Radio de esquinas. */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
 
    /** 
     * Si hay `default` slot o children, el chip se posiciona en absolute 
     * sobre el contenido en esta esquina. Si no hay children, se 
     * renderiza en flujo como un pill. 
     */ 
    placement?: ChipPlacement; 
 
    /** Icono decorativo opcional (ignorado en modo `dot`). */ 
    icon?: Component; 
 
    /** 
     * Accessible name del chip. Si solo contiene número/dot conviene 
     * describir su significado (ej. "3 notificaciones sin leer"). 
     */ 
    ariaLabel?: string; 
}
