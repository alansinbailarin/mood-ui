import type { ModoSize } from '../../config/ModoConfig';

export interface Rating {
    /** Current value (v-model). */
    modelValue?: number;
    /** Total number of items (stars). */
    max?: number;
    /** Allow half-step values (0.5 increments). */
    allowHalf?: boolean;
    /** Read-only mode (display, no interaction). */
    readonly?: boolean;
    /** Disable interaction completely (lower opacity). */
    disabled?: boolean;
    /** Allow clicking the active item again to clear back to 0. */
    clearable?: boolean;
    /** Semantic color family. */
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
    /** Size scale. Inherits from `ModoProvider` if omitted. */
    size?: ModoSize;
    /** Show numeric value next to the rating. */
    showValue?: boolean;
    /** Optional accessible name. */
    ariaLabel?: string;
}
