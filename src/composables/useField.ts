import { computed, useId, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'; 
import { useResolvedHalo } from './useModoConfig'; 
import type { ModoHalo } from '../config/ModoConfig'; 
import { useResolvedColor, useResolvedRadius } from './useModoConfig'; 
 
/** 
 * Props del campo de formulario que necesita `useFieldState`. 
 * Se definen aquí para que cualquier componente (Input, Textarea, Password…) 
 * pueda extenderlas y pasar su reactive `props` directamente. 
 */ 
export interface FieldStateSource { 
    modelValue?: unknown; 
    id?: string; 
    label?: string; 
    ariaLabel?: string; 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    errorText?: string; 
    helperText?: string; 
    /** Cuando es true, fuerza estado inválido sin renderizar errorText. Útil al envolver con FormField. */ 
    invalid?: boolean; 
    /** IDs adicionales para concatenar en aria-describedby (ej. provistos por un wrapper). */ 
    ariaDescribedBy?: string; 
    maxLength?: number; 
    showCounter?: boolean; 
    disabled?: boolean; 
    loading?: boolean; 
} 
 
export interface UseFieldStateOptions { 
    /** Nombre del componente para el warning DEV. */ 
    componentName: string; 
    /** Prefijo para el id autogenerado (ej. 'modo-input'). */ 
    idPrefix: string; 
} 
 
/** 
 * Estado compartido entre campos de formulario (Input, Textarea, Password…). 
 * 
 * Resuelve: 
 * - `fieldId` (prop.id o autogenerado). 
 * - Color/radius resueltos desde el provider. 
 * - `stateColor` (danger si hay error, si no el color resuelto). 
 * - `describedBy` con los IDs de helper/error/counter. 
 * - Contador y flags derivadas. 
 * - Warning DEV cuando falta label/ariaLabel. 
 */ 
export function useFieldState( 
    props: FieldStateSource, 
    options: UseFieldStateOptions, 
) { 
    const autoId = useId(); 
    const fieldId = computed(() => props.id ?? `${options.idPrefix}-${autoId}`); 
 
    const color = useResolvedColor(() => props.color); 
    const radius = useResolvedRadius(() => props.radius); 
 
    const hasError = computed(() => !!props.errorText || !!props.invalid); 
    const isDisabled = computed(() => !!props.disabled || !!props.loading); 
 
    const stateColor = computed(() => 
        hasError.value ? 'danger' : color.value, 
    ) as ComputedRef<'default' | 'primary' | 'danger' | 'success' | 'warning'>; 
 
    const hasValue = computed(() => { 
        const v = props.modelValue; 
        return v !== null && v !== undefined && String(v).length > 0; 
    }); 
 
    const currentLength = computed(() => String(props.modelValue ?? '').length); 
    const showCounterEffective = computed( 
        () => !!props.showCounter && !!props.maxLength, 
    ); 
    const counterOverflow = computed( 
        () => !!props.maxLength && currentLength.value >= props.maxLength, 
    ); 
 
    const errorId = computed(() => `${fieldId.value}-error`); 
    const helperId = computed(() => `${fieldId.value}-helper`); 
    const counterId = computed(() => `${fieldId.value}-counter`); 
 
    const describedBy = computed(() => { 
        const ids: string[] = []; 
        if (hasError.value && props.errorText) ids.push(errorId.value); 
        else if (props.helperText) ids.push(helperId.value); 
        if (showCounterEffective.value) ids.push(counterId.value); 
        if (props.ariaDescribedBy) ids.push(props.ariaDescribedBy); 
        return ids.length ? ids.join(' ') : undefined; 
    }); 
 
    if (import.meta.env.DEV && !props.label && !props.ariaLabel && !props.id) { 
        console.warn( 
            `[modo-ui ${options.componentName}] Se requiere \`label\` o \`ariaLabel\` para accesibilidad.`, 
        ); 
    } 
 
    return { 
        fieldId, 
        color, 
        radius, 
        stateColor, 
        hasError, 
        hasValue, 
        isDisabled, 
        currentLength, 
        showCounterEffective, 
        counterOverflow, 
        errorId, 
        helperId, 
        counterId, 
        describedBy, 
    }; 
} 
 
export type FieldVariant = 'outline' | 'filled' | 'ghost'; 
 
export interface UseFieldClassesSource { 
    variant: MaybeRefOrGetter<FieldVariant>; 
    stateColor: MaybeRefOrGetter<'default' | 'primary' | 'danger' | 'success' | 'warning'>; 
    hasError: MaybeRefOrGetter<boolean>; 
    radius: MaybeRefOrGetter<'none' | 'small' | 'medium' | 'large' | 'full'>; 
    /** radius utility para 'full' (Input usa 'full', Textarea usa '2xl'). */ 
    fullRadiusClass?: string; 
    /** 
     * Cuando es true, fuerza los estilos de focus (halo + borde) aunque 
     * el foco esté fuera del wrapper. Útil para Select/Combobox cuando 
     * el popover teleportado roba el foco pero el campo sigue "activo". 
     */ 
    forceFocus?: MaybeRefOrGetter<boolean>; 
    /** 
     * Estilo del halo del campo. Si no se pasa, se usa el valor resuelto 
     * vía ModoProvider/useResolvedHalo. 
     * - `'tinted'`: tintado al color (default) 
     * - `'neutral'`: siempre gris 
     * - `'off'`: sin halo persistente (solo focus-visible ring a11y) 
     */ 
    halo?: MaybeRefOrGetter<ModoHalo | undefined>; 
} 
 
const FOCUS_RING_BY_COLOR: Record<string, string> = { 
    default: 'focus-within:ring-ring/10', 
    primary: 'focus-within:ring-primary/12', 
    danger: 'focus-within:ring-destructive/12', 
    success: 'focus-within:ring-success/12', 
    warning: 'focus-within:ring-warning/12', 
}; 
 
const FORCED_RING_BY_COLOR: Record<string, string> = { 
    default: 'ring-ring/10', 
    primary: 'ring-primary/12', 
    danger: 'ring-destructive/12', 
    success: 'ring-success/12', 
    warning: 'ring-warning/12', 
}; 
 
const FOCUS_BORDER_BY_COLOR: Record<string, string> = { 
    default: 'focus-within:border-foreground/50', 
    primary: 'focus-within:border-primary/60', 
    danger: 'focus-within:border-destructive/60', 
    success: 'focus-within:border-success/60', 
    warning: 'focus-within:border-warning/60', 
}; 
 
const FORCED_BORDER_BY_COLOR: Record<string, string> = { 
    default: 'border-foreground/50', 
    primary: 'border-primary/60', 
    danger: 'border-destructive/60', 
    success: 'border-success/60', 
    warning: 'border-warning/60', 
}; 
 
/** 
 * Resuelve las clases de wrapper (variante + halo + error) y el radius 
 * para cualquier campo de formulario que siga el patrón Input/Textarea. 
 */ 
export function useFieldClasses(source: UseFieldClassesSource) { 
    const resolvedHalo = useResolvedHalo(() => { 
        const local = source.halo ? toValue(source.halo) : undefined; 
        return local; 
    }); 
 
    const wrapperVariantClasses = computed(() => { 
        const variant = toValue(source.variant); 
        const stateColor = toValue(source.stateColor); 
        const hasError = toValue(source.hasError); 
        const forceFocus = source.forceFocus ? toValue(source.forceFocus) : false; 
        const halo = resolvedHalo.value; 
        const errBorder = hasError ? 'border-destructive' : ''; 
        // En modo `neutral` el focus también queda gris; en `tinted` toma color. 
        const focusRing = halo === 'neutral' ? 'focus-within:ring-ring/12' : FOCUS_RING_BY_COLOR[stateColor]; 
        const focusBorder = FOCUS_BORDER_BY_COLOR[stateColor]; 
        const forcedRing = forceFocus 
            ? (halo === 'neutral' ? 'ring-ring/12' : FORCED_RING_BY_COLOR[stateColor]) 
            : ''; 
        const forcedBorder = forceFocus ? FORCED_BORDER_BY_COLOR[stateColor] : ''; 
        const forcedBg = forceFocus ? 'bg-background' : ''; 
 
        // Halo persistente (ring idle) — se omite cuando halo === 'off'. 
        // En 'off' aparece solo en focus-within, neutro (no tintado al color). 
        const idleRing = halo === 'off' ? '' : 'ring-4 ring-border/25'; 
        const offFocusRingUtil = 'focus-within:ring-4 focus-within:ring-ring/15'; 
        const focusRingUtil = halo === 'off' ? offFocusRingUtil : `focus-within:ring-4 ${focusRing}`; 
        const offForcedRing = 'ring-4 ring-ring/15'; 
        const forcedRingUtil = halo === 'off' 
            ? (forceFocus ? offForcedRing : '') 
            : (forceFocus ? `ring-4 ${forcedRing}` : ''); 
 
        switch (variant) { 
            case 'filled': 
                return [ 
                    'bg-muted border border-transparent', 
                    idleRing, 
                    'focus-within:bg-background', 
                    focusRingUtil, 
                    forceFocus ? `${forcedRingUtil} ${forcedBg}` : forcedBg, 
                    errBorder, 
                ].join(' '); 
            case 'ghost': 
                return [ 
                    'bg-transparent border-b border-border rounded-none', 
                    focusBorder, 
                    forcedBorder, 
                    hasError ? 'border-destructive' : '', 
                ].join(' '); 
            case 'outline': 
            default: 
                return [ 
                    'bg-background border border-input', 
                    idleRing, 
                    focusRingUtil, 
                    forcedRingUtil, 
                    errBorder, 
                ].join(' '); 
        } 
    }); 
 
    const radiusClasses = computed(() => { 
        const variant = toValue(source.variant); 
        if (variant === 'ghost') return ''; 
        const radius = toValue(source.radius); 
        switch (radius) { 
            case 'none': return 'rounded-none'; 
            case 'small': return 'rounded-sm'; 
            case 'large': return 'rounded-xl'; 
            case 'full': return source.fullRadiusClass ?? 'rounded-full'; 
            case 'medium': 
            default: return 'rounded-md'; 
        } 
    }); 
 
    return { wrapperVariantClasses, radiusClasses }; 
}
