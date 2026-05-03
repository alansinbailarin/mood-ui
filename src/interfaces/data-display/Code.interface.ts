export interface Code {
    /** Size scale. Inherits from `ModoProvider` if omitted. */
    size?: 'small' | 'medium' | 'large';
    /** Visual variant. */
    variant?: 'subtle' | 'outline' | 'ghost';
    /** Semantic color family. */
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
    /** Corner radius. Inherits from `ModoProvider` if omitted. */
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
}
