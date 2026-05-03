<template> 
    <Teleport to="body"> 
        <div 
            v-if="state" 
            class="fixed z-9999 pointer-events-none" 
            :style="(style as StyleValue)" 
        > 
            <slot :event="state.event" :allDay="state.allDay"> 
                <div class="bg-foreground text-background text-xs rounded-md shadow-lg px-3 py-2 max-w-xs"> 
                    <div class="font-semibold mb-0.5">{{ state.event.title }}</div> 
                    <div class="text-muted-foreground/60 text-[11px]"> 
                        <template v-if="state.allDay">All day</template> 
                        <template v-else>{{ formatTime(state.event.start) }}<template v-if="state.event.end"> – {{ formatTime(state.event.end) }}</template></template> 
                    </div> 
                    <div v-if="state.event.description" class="text-muted-foreground/60 mt-1 text-[11px] leading-snug"> 
                        {{ state.event.description }} 
                    </div> 
                </div> 
            </slot> 
        </div> 
    </Teleport> 
</template> 
 
<script setup lang="ts" generic="E extends { title?: string; start: Date; end?: Date; description?: string }"> 
import type { CSSProperties, StyleValue } from 'vue'; 
import type { HoverState } from '../../../composables/useEventHover'; 
 
defineProps<{ 
    state: HoverState<E> | null; 
    style: CSSProperties; 
    formatTime: (d: Date) => string; 
}>(); 
 
defineSlots<{ 
    default?: (props: { event: E; allDay: boolean }) => unknown; 
}>(); 
</script>
