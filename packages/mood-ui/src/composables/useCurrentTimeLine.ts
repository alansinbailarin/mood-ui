import { computed } from 'vue'; 
 
export type CurrentTimeColor = 'red' | 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
 
const PALETTE: Record<CurrentTimeColor, { solid: string; faded: string }> = { 
    red: { solid: 'bg-red-500', faded: 'bg-red-500/30' }, 
    default: { solid: 'bg-gray-900', faded: 'bg-gray-900/30' }, 
    primary: { solid: 'bg-blue-600', faded: 'bg-blue-600/30' }, 
    danger: { solid: 'bg-red-600', faded: 'bg-red-600/30' }, 
    success: { solid: 'bg-green-600', faded: 'bg-green-600/30' }, 
    warning: { solid: 'bg-amber-500', faded: 'bg-amber-500/30' }, 
}; 
 
export function useCurrentTimeLine(color: () => CurrentTimeColor | string) { 
    const currentTimeSolidClass = computed(() => PALETTE[color() as CurrentTimeColor]?.solid ?? 'bg-red-500'); 
    const currentTimeFadedClass = computed(() => PALETTE[color() as CurrentTimeColor]?.faded ?? 'bg-red-500/30'); 
    return { currentTimeSolidClass, currentTimeFadedClass }; 
}
