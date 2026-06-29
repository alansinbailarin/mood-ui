import type { Component } from 'vue';
import type { ModoSize } from '../../config/ModoConfig';

export interface FileInputFile { 
    file: File; 
    id: string; 
    name: string; 
    size: number; 
    type: string; 
    /** URL local creada con URL.createObjectURL (si es imagen). */ 
    previewUrl?: string; 
    /** Progreso 0–100 (cuando se provee externamente). */ 
    progress?: number; 
    /** Error de validación o upload. */ 
    error?: string; 
} 
 
/** Código semántico de rechazo — estable y pensado para i18n. */ 
export type FileInputRejectCode = 'size' | 'type' | 'count'; 
 
/** Contexto pasado al resolver un mensaje de rechazo. */ 
export interface FileInputRejectContext { 
    file: File; 
    code: FileInputRejectCode; 
    /** Para `'size'`: bytes; para `'count'`: número; para `'type'`: string `accept`. */ 
    limit?: number | string; 
    /** Helper para formatear bytes a una cadena legible (e.g. "5.0 MB"). */ 
    formatBytes: (n: number) => string; 
} 
 
/** Payload emitido por `@reject`. */ 
export interface FileInputRejection { 
    file: File; 
    code: FileInputRejectCode; 
    message: string; 
    limit?: number | string; 
} 
 
/** 
 * Override de los mensajes por defecto. Cada entrada puede ser: 
 *  - `string` literal (usa `{limit}` como placeholder opcional). 
 *  - función que recibe el contexto y devuelve el string. 
 */ 
export type FileInputRejectMessages = Partial< 
    Record<FileInputRejectCode, string | ((ctx: FileInputRejectContext) => string)> 
>; 
 
export interface FileInput { 
    /** Lista actual de archivos. v-model. */ 
    modelValue?: File[] | null; 
 
    /** Permite selección múltiple. @default false */ 
    multiple?: boolean; 
 
    /** MIME types / extensiones aceptadas (ej. 'image/*', '.pdf'). */ 
    accept?: string; 
 
    /** Tamaño máximo por archivo en bytes. */ 
    maxSize?: number; 
 
    /** Cantidad máxima de archivos cuando `multiple`. */ 
    maxFiles?: number; 
 
    /** 
     * Mensajes custom para los rechazos (i18n). El componente emite también 
     * un `code` semántico en `@reject`, así que los consumidores pueden 
     * ignorar estos textos si usan vue-i18n u otro mecanismo. 
     */ 
    rejectMessages?: FileInputRejectMessages; 
 
    /** Muestra preview de thumbnails para imágenes. @default true */ 
    previews?: boolean; 
 
    /** Habilita drag & drop sobre el área. @default true */ 
    dropzone?: boolean; 
 
    /** 
     * Presentación del área de drop. 
     * - `'inline'` (default): fila compacta estilo input con botón Browse. 
     * - `'area'`: área prominente tipo "drop zone" con icono grande y call-to-action. 
     * @default 'inline' 
     */ 
    dropzoneVariant?: 'inline' | 'area'; 
 
    /** Altura mínima del área cuando `dropzoneVariant='area'`. @default 'medium' */
    dropzoneHeight?: ModoSize; 
 
    /** 
     * Usa borde punteado en el área. Ideal para hacer evidente la 
     * "drop zone". @default false 
     */ 
    dashed?: boolean; 
 
    /** Texto principal del área (solo `dropzoneVariant='area'`). */ 
    dropzoneLabel?: string; 
 
    /** Texto secundario del área (solo `dropzoneVariant='area'`). */ 
    dropzoneHint?: string; 
 
    /** Al hacer click en el área completa abre el picker. @default true */ 
    clickToSelect?: boolean; 
 
    /** Progreso externo por archivo (0–100). Mapa id → progress. */ 
    progress?: Record<string, number>; 
 
    /** Error externo por archivo. Mapa id → mensaje. */ 
    errors?: Record<string, string>; 
 
    /** Campo estándar. */ 
    label?: string; 
    placeholder?: string; 
    helperText?: string; 
    errorText?: string; 
 
    variant?: 'outline' | 'filled' | 'ghost'; 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    size?: ModoSize;
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
    /** Estilo del halo persistente. Hereda del ModoProvider si se omite. */
    halo?: 'tinted' | 'neutral' | 'off'; 
 
    fullWidth?: boolean; 
    disabled?: boolean; 
    readonly?: boolean; 
    required?: boolean; 
    loading?: boolean; 
 
    iconLeft?: Component; 
 
    id?: string; 
    name?: string; 
    autofocus?: boolean; 
    ariaLabel?: string; 
}
