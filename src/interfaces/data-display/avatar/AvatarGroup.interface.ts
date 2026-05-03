export interface AvatarGroup { 
    max?: number; 
    size?: 'xs' | 'small' | 'medium' | 'large' | 'xl'; 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    bordered?: boolean; 
    /** Accessible label for the group. Falls back to "Group of N users". */ 
    ariaLabel?: string; 
}
