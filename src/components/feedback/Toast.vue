<template> 
    <div 
        :class="[ 
            'modo-toast pointer-events-auto relative flex items-start gap-3 p-3 pr-8 shadow-md', 
            colorClasses, 
            radiusClasses, 
            'min-w-72 max-w-sm', 
        ]" 
        role="status" 
        aria-live="polite" 
        @mouseenter="$emit('pointer-enter')" 
        @mouseleave="$emit('pointer-leave')" 
    > 
        <div v-if="!entry.hideIcon" :class="['shrink-0 mt-0.5', iconColorClasses]"> 
            <component :is="resolvedIcon" class="w-5 h-5" aria-hidden="true" /> 
        </div> 
 
        <div class="flex-1 min-w-0"> 
            <p v-if="entry.title" :class="['font-semibold text-body break-words', titleColorClasses]"> 
                {{ entry.title }} 
            </p> 
            <p 
                v-if="entry.description" 
                :class="[ 
                    entry.title ? 'mt-0.5' : '', 
                    'text-body break-words', 
                    bodyColorClasses, 
                ]" 
            > 
                {{ entry.description }} 
            </p> 
 
            <div v-if="entry.action" class="mt-2"> 
                <button 
                    type="button" 
                    :class="['inline-flex items-center text-caption font-semibold underline-offset-2 hover:underline focus:outline-none focus-visible:underline', actionColorClasses]" 
                    @click="onAction" 
                > 
                    {{ entry.action.label }} 
                </button> 
            </div> 
        </div> 
 
        <button 
            v-if="entry.dismissable" 
            type="button" 
            :class="['absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors duration-fast ease-standard focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1', dismissClasses]" 
            aria-label="Dismiss notification" 
            @click="$emit('dismiss')" 
        > 
            <XMarkIcon class="w-4 h-4" aria-hidden="true" /> 
        </button> 
 
        <!-- Progress bar (auto-dismiss countdown) --> 
        <div 
            v-if="entry.duration > 0" 
            class="absolute left-0 bottom-0 h-0.5 origin-left" 
            :class="progressColorClasses" 
            :style="progressStyle" 
        /> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { computed } from 'vue'; 
import { 
    XMarkIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon, 
    XCircleIcon, 
    InformationCircleIcon, 
} from '@heroicons/vue/24/outline'; 
import type { ToastEntry } from '../../interfaces/feedback/Toast.interface'; 
import { useResolvedRadius } from '../../composables/useModoConfig'; 
 
const props = defineProps<{ 
    entry: ToastEntry; 
    /** Time elapsed in ms since push (driven by the container). */ 
    elapsed: number; 
    /** Whether the auto-dismiss timer is currently paused. */ 
    paused: boolean; 
}>(); 
 
const emit = defineEmits<{ 
    dismiss: []; 
    'pointer-enter': []; 
    'pointer-leave': []; 
}>(); 
 
const resolvedRadius = useResolvedRadius(() => props.entry.radius); 
 
const radiusClasses = computed(() => { 
    switch (resolvedRadius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-sm'; 
        case 'large': return 'rounded-xl'; 
        case 'full': return 'rounded-full'; 
        case 'medium': 
        default: return 'rounded-md'; 
    } 
}); 
 
const resolvedIcon = computed(() => { 
    if (props.entry.icon) return props.entry.icon; 
    switch (props.entry.color) { 
        case 'success': return CheckCircleIcon; 
        case 'warning': return ExclamationTriangleIcon; 
        case 'danger': return XCircleIcon; 
        case 'info': 
        default: return InformationCircleIcon; 
    } 
}); 
 
const colorClasses = computed(() => { 
    const map: Record<string, Record<string, string>> = { 
        info: { 
            filled: 'bg-info text-info-foreground', 
            subtle: 'bg-info-subtle border border-info/20', 
            outline: 'bg-card border border-info/30', 
        }, 
        warning: { 
            filled: 'bg-warning text-warning-foreground', 
            subtle: 'bg-warning-subtle border border-warning/20', 
            outline: 'bg-card border border-warning/30', 
        }, 
        danger: { 
            filled: 'bg-destructive text-destructive-foreground', 
            subtle: 'bg-destructive-subtle border border-destructive/20', 
            outline: 'bg-card border border-destructive/30', 
        }, 
        success: { 
            filled: 'bg-success text-success-foreground', 
            subtle: 'bg-success-subtle border border-success/20', 
            outline: 'bg-card border border-success/30', 
        }, 
    }; 
    return map[props.entry.color][props.entry.variant]; 
}); 
 
const iconColorClasses = computed(() => { 
    if (props.entry.variant === 'filled') return 'text-current/85'; 
    const map: Record<string, string> = { 
        info: 'text-info', 
        warning: 'text-warning', 
        danger: 'text-destructive', 
        success: 'text-success', 
    }; 
    return map[props.entry.color]; 
}); 
 
const titleColorClasses = computed(() => { 
    if (props.entry.variant === 'filled') return ''; 
    const map: Record<string, string> = { 
        info: 'text-info', 
        warning: 'text-warning', 
        danger: 'text-destructive', 
        success: 'text-success', 
    }; 
    return map[props.entry.color]; 
}); 
 
const bodyColorClasses = computed(() => { 
    if (props.entry.variant === 'filled') return 'text-current/90'; 
    const map: Record<string, string> = { 
        info: 'text-info/90', 
        warning: 'text-warning/90', 
        danger: 'text-destructive/90', 
        success: 'text-success/90', 
    }; 
    return map[props.entry.color]; 
}); 
 
const actionColorClasses = computed(() => { 
    if (props.entry.variant === 'filled') return 'text-current'; 
    const map: Record<string, string> = { 
        info: 'text-info hover:text-info-hover', 
        warning: 'text-warning hover:text-warning-hover', 
        danger: 'text-destructive hover:text-destructive-hover', 
        success: 'text-success hover:text-success-hover', 
    }; 
    return map[props.entry.color]; 
}); 
 
const dismissClasses = computed(() => { 
    if (props.entry.variant === 'filled') return 'text-current/70 hover:text-current hover:bg-current/10'; 
    return 'text-muted-foreground hover:text-foreground hover:bg-muted'; 
}); 
 
const progressColorClasses = computed(() => { 
    if (props.entry.variant === 'filled') return 'bg-current/40'; 
    const map: Record<string, string> = { 
        info: 'bg-info/60', 
        warning: 'bg-warning/60', 
        danger: 'bg-destructive/60', 
        success: 'bg-success/60', 
    }; 
    return map[props.entry.color]; 
}); 
 
const progressStyle = computed(() => { 
    const total = props.entry.duration; 
    if (!total) return { width: '0%' }; 
    const remaining = Math.max(0, total - props.elapsed) / total; 
    return { 
        width: `${remaining * 100}%`, 
        transition: props.paused ? 'none' : `width 100ms linear`, 
    }; 
}); 
 
function onAction() { 
    const action = props.entry.action; 
    if (!action) return; 
    const close = () => emit('dismiss'); 
    action.onClick?.(close); 
    if (!action.keepOpen) close(); 
} 
</script> 
 
<style scoped> 
@media (prefers-reduced-motion: reduce) { 
    .modo-toast { 
        transition: none !important; 
    } 
} 
</style>
