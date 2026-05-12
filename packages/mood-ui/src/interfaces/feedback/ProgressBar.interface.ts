/** 
 * Linear progress indicator. Supports determinate (with `value`) and 
 * indeterminate (omit `value`) modes. 
 */ 
 
export type ProgressBarColor = 'default' | 'primary' | 'success' | 'warning' | 'danger'; 
 
export type ProgressBarSize = 'small' | 'medium' | 'large'; 
 
export interface ProgressBar { 
    /** 
     * Current progress value, between `min` and `max`. Omit for an 
     * indeterminate animation. 
     */ 
    value?: number; 
    /** @default 0 */ 
    min?: number; 
    /** @default 100 */ 
    max?: number; 
    /** Track color. @default 'primary' */ 
    color?: ProgressBarColor; 
    /** Bar thickness. @default 'medium' */ 
    size?: ProgressBarSize; 
    /** Track radius. Cascades from `ModoProvider`. @default 'full' (pill shape) */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    /** Display the numeric percentage next to the bar. @default false */ 
    showValue?: boolean; 
    /** Optional label rendered above the bar. */ 
    label?: string; 
    /** Accessible label when `label` is omitted. */ 
    ariaLabel?: string; 
    /** Animated stripes — useful for "uploading…" feel. @default false */ 
    striped?: boolean; 
}
