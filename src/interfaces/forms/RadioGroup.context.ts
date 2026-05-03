import type { InjectionKey, Ref, ComputedRef } from 'vue'; 
 
export interface RadioGroupContext { 
    name: Ref<string>; 
    value: Ref<string | number | null>; 
    color: ComputedRef<'default' | 'primary' | 'danger' | 'success' | 'warning'>; 
    size: ComputedRef<'small' | 'medium' | 'large'>; 
    disabled: ComputedRef<boolean>; 
    required: ComputedRef<boolean>; 
    hasError: ComputedRef<boolean>; 
    describedBy: ComputedRef<string | undefined>; 
    select: (value: string | number) => void; 
} 
 
export const RADIO_GROUP_KEY: InjectionKey<RadioGroupContext> = Symbol('modo-radio-group');
