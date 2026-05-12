export type EventColor = 'default' | 'primary' | 'danger' | 'success' | 'warning' | 'info' | 'purple' | 'pink'; 
 
/** 
 * Soft variant used in timed grids (WeekView, DayView, Scheduler). 
 * Translucent fills (`/15`) so the underlying grid lines stay visible — 
 * matches the look of `colorHex` events that use `rgba(..., 0.12)`. 
 */ 
export const eventColorClass = (c?: EventColor | null) => ({ 
    default: 'bg-foreground/10 text-foreground border-l-2 border-muted-foreground', 
    primary: 'bg-primary/15 text-primary border-l-2 border-primary', 
    danger: 'bg-destructive/15 text-destructive border-l-2 border-destructive', 
    success: 'bg-success/15 text-success border-l-2 border-success', 
    warning: 'bg-warning/15 text-warning border-l-2 border-warning', 
    info: 'bg-info/15 text-info border-l-2 border-info', 
    purple: 'bg-purple/15 text-purple border-l-2 border-purple', 
    pink: 'bg-pink/15 text-pink border-l-2 border-pink', 
}[c ?? 'primary']); 
 
/** 
 * Stronger variant used in MonthView (pill-like events) — slightly more 
 * opaque to stay readable in compact pills. 
 */ 
export const eventColorClassStrong = (c?: EventColor | null) => ({ 
    default: 'bg-foreground/15 text-foreground border-l-2 border-muted-foreground', 
    primary: 'bg-primary/20 text-primary border-l-2 border-primary', 
    danger: 'bg-destructive/20 text-destructive border-l-2 border-destructive', 
    success: 'bg-success/20 text-success border-l-2 border-success', 
    warning: 'bg-warning/20 text-warning border-l-2 border-warning', 
    info: 'bg-info/20 text-info border-l-2 border-info', 
    purple: 'bg-purple/20 text-purple border-l-2 border-purple', 
    pink: 'bg-pink/20 text-pink border-l-2 border-pink', 
}[c ?? 'primary']); 
 
export const hexToRgba = (hex: string, alpha: number) => { 
    const h = hex.replace('#', ''); 
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h; 
    const r = parseInt(full.slice(0, 2), 16); 
    const g = parseInt(full.slice(2, 4), 16); 
    const b = parseInt(full.slice(4, 6), 16); 
    return `rgba(${r}, ${g}, ${b}, ${alpha})`; 
};
