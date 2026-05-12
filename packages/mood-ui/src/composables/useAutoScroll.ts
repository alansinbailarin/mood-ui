import { ref, type Ref } from 'vue'; 
 
export interface UseAutoScrollInput { 
    scrollRef: Ref<HTMLElement | null>; 
    enabled: () => boolean; 
    zone?: number; 
    maxSpeed?: number; 
} 
 
export function useAutoScroll({ scrollRef, enabled, zone = 40, maxSpeed = 12 }: UseAutoScrollInput) { 
    const autoScrollRAF = ref<number | null>(null); 
    let autoScrollSpeed = 0; 
 
    const startAutoScroll = () => { 
        if (autoScrollRAF.value !== null) return; 
        const tick = () => { 
            if (scrollRef.value && autoScrollSpeed !== 0) { 
                scrollRef.value.scrollTop += autoScrollSpeed; 
                autoScrollRAF.value = requestAnimationFrame(tick); 
            } else { 
                autoScrollRAF.value = null; 
            } 
        }; 
        autoScrollRAF.value = requestAnimationFrame(tick); 
    }; 
 
    const stopAutoScroll = () => { 
        autoScrollSpeed = 0; 
        if (autoScrollRAF.value !== null) { 
            cancelAnimationFrame(autoScrollRAF.value); 
            autoScrollRAF.value = null; 
        } 
    }; 
 
    const handleAutoScroll = (clientY: number) => { 
        if (!enabled() || !scrollRef.value) return; 
        const rect = scrollRef.value.getBoundingClientRect(); 
        const distTop = clientY - rect.top; 
        const distBottom = rect.bottom - clientY; 
        if (distTop < zone) { 
            autoScrollSpeed = -Math.round(maxSpeed * (1 - distTop / zone)); 
            startAutoScroll(); 
        } else if (distBottom < zone) { 
            autoScrollSpeed = Math.round(maxSpeed * (1 - distBottom / zone)); 
            startAutoScroll(); 
        } else { 
            stopAutoScroll(); 
        } 
    }; 
 
    return { handleAutoScroll, stopAutoScroll }; 
}
