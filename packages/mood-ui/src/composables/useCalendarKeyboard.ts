import { onMounted, onBeforeUnmount, type Ref } from 'vue'; 
 
export interface CalendarKeyboardHandlers { 
    onArrowLeft?: () => void; 
    onArrowRight?: () => void; 
    onArrowUp?: () => void; 
    onArrowDown?: () => void; 
    onEnter?: () => void; 
    onEscape?: () => void; 
    onPageUp?: () => void; 
    onPageDown?: () => void; 
    onShiftPageUp?: () => void; 
    onShiftPageDown?: () => void; 
    onHome?: () => void; 
    onEnd?: () => void; 
    onToday?: () => void; 
} 
 
export const useCalendarKeyboard = ( 
    target: Ref<HTMLElement | null>, 
    handlers: CalendarKeyboardHandlers, 
    enabled: Ref<boolean> | boolean = true, 
) => { 
    const isEnabled = () => (typeof enabled === 'boolean' ? enabled : enabled.value); 
 
    const onKeyDown = (e: KeyboardEvent) => { 
        if (!isEnabled()) return; 
        const el = target.value; 
        if (!el) return; 
        if (!el.contains(document.activeElement)) return; 
 
        let handled = true; 
        switch (e.key) { 
            case 'ArrowLeft': handlers.onArrowLeft?.(); break; 
            case 'ArrowRight': handlers.onArrowRight?.(); break; 
            case 'ArrowUp': handlers.onArrowUp?.(); break; 
            case 'ArrowDown': handlers.onArrowDown?.(); break; 
            case 'Enter': 
            case ' ': handlers.onEnter?.(); break; 
            case 'Escape': handlers.onEscape?.(); break; 
            case 'PageUp': 
                if (e.shiftKey) handlers.onShiftPageUp?.(); 
                else handlers.onPageUp?.(); 
                break; 
            case 'PageDown': 
                if (e.shiftKey) handlers.onShiftPageDown?.(); 
                else handlers.onPageDown?.(); 
                break; 
            case 'Home': handlers.onHome?.(); break; 
            case 'End': handlers.onEnd?.(); break; 
            case 't': 
            case 'T': handlers.onToday?.(); break; 
            default: handled = false; 
        } 
        if (handled) e.preventDefault(); 
    }; 
 
    onMounted(() => window.addEventListener('keydown', onKeyDown)); 
    onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown)); 
};
