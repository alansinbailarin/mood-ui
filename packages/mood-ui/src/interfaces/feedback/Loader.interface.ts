export interface Loader { 
    variant?: 'normal' | 'outline' | 'ghost' | 'text'; 
    size?: 'small' | 'medium' | 'large'; 
    color?: string; 
    /** Visually-hidden screen-reader label. Defaults to "Loading". */ 
    label?: string; 
}
