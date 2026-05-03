/** 
 * Types for the modo-ui showroom (Phase 1+2). 
 * 
 * Pages declare a list of `ControlDef`s and the playground builds the 
 * controls panel automatically. Keep this file dependency-light so any 
 * page can import it without dragging the playground in. 
 */ 
 
import type { Component } from 'vue'; 
 
export type ControlValue = string | number | boolean | null | undefined; 
 
export interface SelectOptionDef { 
    value: ControlValue; 
    label: string; 
} 
 
interface BaseControl { 
    /** Prop name that this control mutates on the playground state. */ 
    key: string; 
    /** Visible label. */ 
    label: string; 
    /** Optional helper line under the control. */ 
    description?: string; 
} 
 
export type ControlDef = 
    | (BaseControl & { kind: 'select'; options: SelectOptionDef[] }) 
    | (BaseControl & { kind: 'switch' }) 
    | (BaseControl & { kind: 'text'; placeholder?: string }) 
    | (BaseControl & { kind: 'number'; min?: number; max?: number; step?: number }); 
 
/** Group of controls rendered under a sub-heading inside the playground. */ 
export interface ControlGroup { 
    title: string; 
    controls: ControlDef[]; 
} 
 
/** Row in the API · Props table. */ 
export interface PropDoc { 
    name: string; 
    type: string; 
    default?: string; 
    description?: string; 
    required?: boolean; 
} 
 
export interface EmitDoc { 
    name: string; 
    payload: string; 
    description?: string; 
} 
 
export interface SlotDoc { 
    name: string; 
    description?: string; 
    /** Slot props (scoped slot bindings). */ 
    bindings?: string; 
} 
 
/* ------------------------------------------------------------------ */ 
/* Sidebar registry                                                    */ 
/* ------------------------------------------------------------------ */ 
 
export interface NavEntry { 
    id: string; 
    label: string; 
    /** Lazy-loaded page component. */ 
    page: () => Promise<{ default: Component }>; 
    /** Optional badge (e.g. "New", "Beta"). */ 
    badge?: string; 
} 
 
export interface NavCategory { 
    id: string; 
    title: string; 
    entries: NavEntry[]; 
}
