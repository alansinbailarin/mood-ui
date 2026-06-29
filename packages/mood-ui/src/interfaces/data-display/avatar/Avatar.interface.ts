import type { ModoSize } from '../../../config/ModoConfig';

export interface Avatar { 
    src?: string; 
    alt?: string; 
    initials?: string; 
    size?: ModoSize | 'xl'; 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    status?: 'online' | 'offline' | 'away' | 'busy'; 
    bordered?: boolean; 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    /** 
     * Accessible name applied to the avatar root when it falls back to 
     * initials/icon (no image). Takes priority over `alt`/`initials` for 
     * the ARIA label. The `<img>` element keeps `alt` for screen readers. 
     */ 
    ariaLabel?: string; 
    /** 
     * When true, renders a `Skeleton` placeholder with the same footprint 
     * (size + radius) instead of the real avatar content. Use this while 
     * the avatar data is loading so the layout does not shift when the 
     * image/initials arrive. 
     * @default false 
     */ 
    skeleton?: boolean; 
}
