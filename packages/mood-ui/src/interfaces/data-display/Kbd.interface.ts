import type { ModoSize } from '../../config/ModoConfig';
export interface Kbd {
    /** Size scale. Inherits from `ModoProvider` if omitted. */
    size?: ModoSize;
    /** Visual variant. */
    variant?: 'subtle' | 'outline' | 'solid';
    /** Corner radius. Inherits from `ModoProvider` if omitted. */
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
}
