import type { Component } from 'vue';

export interface StepperStep {
    /** Unique identifier. */
    id: string | number;
    /** Visible step title. */
    label: string;
    /** Optional secondary description shown under the label. */
    description?: string;
    /** Optional custom icon. Defaults to step index when not completed. */
    icon?: Component;
    /** Mark step as disabled (non-interactive). */
    disabled?: boolean;
    /** Optional state override; otherwise computed from `current`. */
    state?: 'pending' | 'active' | 'completed' | 'error';
}

export interface Stepper {
    /** Steps to render in order. */
    steps: StepperStep[];
    /** Current active step index (0-based). Steps before are `completed`, after are `pending`. */
    current?: number;
    /** Visual variant. */
    variant?: 'numbered' | 'dots' | 'progress';
    /** Orientation. */
    orientation?: 'horizontal' | 'vertical';
    /** Semantic color family for active/completed states. */
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
    /** Size scale. Inherits from `ModoProvider` if omitted. */
    size?: 'small' | 'medium' | 'large';
    /** Allow clicking on completed steps to emit `step-click`. */
    clickable?: boolean;
}
