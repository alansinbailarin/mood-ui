import { ref, computed, watch, onBeforeUnmount } from 'vue';

export interface HoverState<E> {
    event: E;
    allDay: boolean;
    x: number;
    y: number;
}

export function useEventHover<E>(delay = 300) {
    const hoverState = ref<HoverState<E> | null>(null);
    let hoverTimer: ReturnType<typeof setTimeout> | null = null;
    let lastX = 0;
    let lastY = 0;

    const onEventEnter = (ev: E, allDay: boolean, e: MouseEvent) => {
        if (hoverTimer) clearTimeout(hoverTimer);
        lastX = e.clientX;
        lastY = e.clientY;
        hoverTimer = setTimeout(() => {
            hoverState.value = { event: ev, allDay, x: lastX, y: lastY } as HoverState<E>;
        }, delay);
    };

    const onEventMove = (e: MouseEvent) => {
        lastX = e.clientX;
        lastY = e.clientY;
        if (hoverState.value) {
            hoverState.value = { ...hoverState.value, x: e.clientX, y: e.clientY };
        }
    };

    const onEventLeave = () => {
        if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
        }
        hoverState.value = null;
    };

    // On touch devices mouseleave never fires — dismiss the tooltip on any touch.
    function onDocumentTouch() {
        onEventLeave();
    }

    watch(hoverState, (state) => {
        if (state) {
            document.addEventListener('touchstart', onDocumentTouch, { passive: true });
        } else {
            document.removeEventListener('touchstart', onDocumentTouch);
        }
    });

    onBeforeUnmount(() => {
        document.removeEventListener('touchstart', onDocumentTouch);
    });

    const tooltipStyle = computed(() => {
        if (!hoverState.value) return {};
        return {
            left: `${hoverState.value.x + 12}px`,
            top: `${hoverState.value.y + 12}px`,
        };
    });

    return { hoverState, onEventEnter, onEventMove, onEventLeave, tooltipStyle };
}
