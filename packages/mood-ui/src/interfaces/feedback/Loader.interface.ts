import type { ModoSize } from '../../config/ModoConfig';
export interface Loader { 
    variant?: 'normal' | 'outline' | 'ghost' | 'text'; 
    size?: ModoSize; 
    color?: string; 
    /** Visually-hidden screen-reader label. Defaults to "Loading". */ 
    label?: string; 
}
