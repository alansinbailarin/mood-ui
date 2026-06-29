import type { ModoSize } from '../../../config/ModoConfig';

export interface AvatarGroup { 
    max?: number; 
    size?: ModoSize | 'xl'; 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    bordered?: boolean; 
    /** Accessible label for the group. Falls back to "Group of N users". */ 
    ariaLabel?: string; 
}
