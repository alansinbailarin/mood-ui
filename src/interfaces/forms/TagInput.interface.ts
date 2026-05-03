export interface TagInput {
    /** Current array of tags (v-model). */
    modelValue?: string[];
    /** Placeholder shown when the input is empty. */
    placeholder?: string;
    /** Optional max number of tags. Further input is ignored. */
    max?: number;
    /** Forbid duplicate tags (case-insensitive comparison). */
    unique?: boolean;
    /** Optional validator. Return false to reject the tag. */
    validator?: (tag: string) => boolean;
    /** Characters that, when typed, also commit the current tag. */
    delimiters?: string[];
    /** Disable interaction. */
    disabled?: boolean;
    /** Mark as readonly (display, no edits). */
    readonly?: boolean;
    /** Semantic color family for the chips. */
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
    /** Visual variant for the chips. */
    variant?: 'subtle' | 'outline' | 'solid';
    /** Size scale. Inherits from `ModoProvider` if omitted. */
    size?: 'small' | 'medium' | 'large';
    /** Corner radius. Inherits from `ModoProvider` if omitted. */
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
    /** Optional accessible name for the input. */
    ariaLabel?: string;
}
