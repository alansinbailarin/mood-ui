<template> 
    <div 
        v-if="visible" 
        ref="bannerRef" 
        :role="liveRole" 
        :aria-live="liveness" 
        :class="['overflow-hidden', baseClasses, colorClasses, positionClasses, fullWidth ? 'rounded-none' : radiusClasses]" 
    > 
        <div v-if="showIcon" :class="['shrink-0', iconColorClasses]"> 
            <component :is="icon" v-if="icon" class="w-5 h-5" /> 
            <svg v-else-if="color === 'info'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> 
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> 
            </svg> 
            <svg v-else-if="color === 'warning'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> 
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /> 
            </svg> 
            <svg v-else-if="color === 'danger'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> 
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /> 
            </svg> 
            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> 
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> 
            </svg> 
        </div> 
 
        <div class="flex-1 min-w-0"> 
            <p v-if="title" :class="['font-semibold', titleColorClasses]">{{ title }}</p> 
            <div v-if="description || $slots.default" :class="[title ? 'mt-1' : '', bodyColorClasses]"> 
                <slot>{{ description }}</slot> 
            </div> 
        </div> 
 
        <div v-if="$slots.actions" class="shrink-0 ml-4"> 
            <slot name="actions" /> 
        </div> 
 
        <Button 
            v-if="dismissable" 
            ref="dismissBtnRef" 
            variant="text" 
            size="small" 
            radius="medium" 
            :icon="XMarkIcon" 
            :ariaLabel="loc.banner.dismiss" 
            :class="['shrink-0 ml-2', dismissClasses]" 
            @click="dismiss" 
        /> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { ref, computed, onMounted, nextTick } from 'vue'; 
import gsap from 'gsap'; 
import type { Banner } from '../../interfaces/feedback/Banner.interface'; 
import { useResolvedRadius, useModoLocale } from '../../composables/useModoConfig'; 
import Button from '../forms/Button.vue'; 
import { XMarkIcon } from '@heroicons/vue/24/outline'; 
 
const loc = useModoLocale(); 
 
const emit = defineEmits<{ dismiss: [] }>(); 
 
const props = withDefaults(defineProps<Banner>(), { 
    color: 'info', 
    variant: 'subtle', 
    dismissable: false, 
    dismissAnimation: 'collapse', 
    showIcon: true, 
    position: 'inline', 
    fullWidth: false, 
}); 
 
const radius = useResolvedRadius(() => props.radius); 
const radiusClasses = computed(() => { 
    switch (radius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-sm'; 
        case 'large': return 'rounded-xl'; 
        case 'full': return 'rounded-3xl'; 
        default: return 'rounded-lg'; 
    } 
}); 
 
const visible = ref(true); 
const bannerRef = ref<HTMLElement | null>(null); 
const dismissBtnRef = ref<{ $el: HTMLElement } | null>(null); 
 
/** 
 * Intro animation: collapsed height + fade-in + small translate-y. 
 * Mirrors the reverse of the default `collapse` dismiss so entry and exit 
 * feel symmetrical. Skipped under `prefers-reduced-motion`. 
 */ 
onMounted(async () => { 
    await nextTick(); 
    if (!bannerRef.value) return; 
    const mql = typeof window !== 'undefined' && window.matchMedia 
        ? window.matchMedia('(prefers-reduced-motion: reduce)') 
        : null; 
    if (mql?.matches) return; 
 
    const el = bannerRef.value; 
    gsap.fromTo( 
        el, 
        { opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, marginBottom: 0, y: -4 }, 
        { 
            opacity: 1, 
            height: 'auto', 
            paddingTop: '', 
            paddingBottom: '', 
            marginBottom: '', 
            y: 0, 
            duration: 0.32, 
            ease: 'power2.out', 
            clearProps: 'height,paddingTop,paddingBottom,marginBottom,transform', 
        }, 
    ); 
}); 
 
/** 
 * Accessibility: 
 * - `danger`/`warning` → `role="alert"` + `aria-live="assertive"` (interrupts). 
 * - `info`/`success`   → `role="status"` + `aria-live="polite"` (queued). 
 * This matches WAI-ARIA guidance: assertive only for time-critical or error 
 * messages; polite for informative updates. 
 */ 
const liveRole = computed(() => (props.color === 'danger' || props.color === 'warning' ? 'alert' : 'status')); 
const liveness = computed<'assertive' | 'polite'>(() => (props.color === 'danger' || props.color === 'warning' ? 'assertive' : 'polite')); 
 
const dismiss = () => { 
    if (!bannerRef.value) return; 
 
    if (props.dismissAnimation === 'shrink' && dismissBtnRef.value?.$el) { 
        const bannerRect = bannerRef.value.getBoundingClientRect(); 
        const btnRect = dismissBtnRef.value.$el.getBoundingClientRect(); 
 
        const originX = btnRect.left + btnRect.width / 2 - bannerRect.left; 
        const originY = btnRect.top + btnRect.height / 2 - bannerRect.top; 
        bannerRef.value.style.transformOrigin = `${originX}px ${originY}px`; 
 
        const tl = gsap.timeline({ 
            onComplete: () => { 
                visible.value = false; 
                emit('dismiss'); 
            }, 
        }); 
 
        tl.to(bannerRef.value, { 
            scale: 0, 
            opacity: 0, 
            duration: 0.6, 
            ease: 'power1.in', 
        }); 
    } else { 
        gsap.to(bannerRef.value, { 
            opacity: 0, 
            height: 0, 
            paddingTop: 0, 
            paddingBottom: 0, 
            marginBottom: 0, 
            duration: 0.3, 
            ease: 'power2.inOut', 
            onComplete: () => { 
                visible.value = false; 
                emit('dismiss'); 
            }, 
        }); 
    } 
}; 
 
const baseClasses = 'flex items-start gap-3 px-4 py-3 text-sm'; 
 
const positionClasses = computed(() => { 
    switch (props.position) { 
        case 'sticky-top': return 'sticky top-0 z-50'; 
        case 'sticky-bottom': return 'sticky bottom-0 z-50'; 
        default: return ''; 
    } 
}); 
 
const colorClasses = computed(() => { 
    const map: Record<string, Record<string, string>> = { 
        info: { 
            filled: 'bg-info text-info-foreground', 
            subtle: 'bg-info-subtle', 
            outline: 'border border-info/30 bg-card', 
        }, 
        warning: { 
            filled: 'bg-warning text-warning-foreground', 
            subtle: 'bg-warning-subtle', 
            outline: 'border border-warning/30 bg-card', 
        }, 
        danger: { 
            filled: 'bg-destructive text-destructive-foreground', 
            subtle: 'bg-destructive-subtle', 
            outline: 'border border-destructive/30 bg-card', 
        }, 
        success: { 
            filled: 'bg-success text-success-foreground', 
            subtle: 'bg-success-subtle', 
            outline: 'border border-success/30 bg-card', 
        }, 
    }; 
    return map[props.color]?.[props.variant] ?? map.info.subtle; 
}); 
 
const iconColorClasses = computed(() => { 
    if (props.variant === 'filled') return 'text-current/80'; 
    const map: Record<string, string> = { 
        info: 'text-info', 
        warning: 'text-warning', 
        danger: 'text-destructive', 
        success: 'text-success', 
    }; 
    return map[props.color] ?? 'text-info'; 
}); 
 
const titleColorClasses = computed(() => { 
    if (props.variant === 'filled') return ''; 
    const map: Record<string, string> = { 
        info: 'text-info', 
        warning: 'text-warning', 
        danger: 'text-destructive', 
        success: 'text-success', 
    }; 
    return map[props.color] ?? 'text-info'; 
}); 
 
const bodyColorClasses = computed(() => { 
    if (props.variant === 'filled') return 'text-current/90'; 
    const map: Record<string, string> = { 
        info: 'text-info/90', 
        warning: 'text-warning/90', 
        danger: 'text-destructive/90', 
        success: 'text-success/90', 
    }; 
    return map[props.color] ?? 'text-info/90'; 
}); 
 
const dismissClasses = computed(() => { 
    if (props.variant === 'filled') return 'text-current/70 hover:text-current hover:bg-current/10'; 
    const map: Record<string, string> = { 
        info: 'text-info/60 hover:text-info hover:bg-info/10', 
        warning: 'text-warning/60 hover:text-warning hover:bg-warning/10', 
        danger: 'text-destructive/60 hover:text-destructive hover:bg-destructive/10', 
        success: 'text-success/60 hover:text-success hover:bg-success/10', 
    }; 
    return map[props.color] ?? 'text-info/60 hover:text-info hover:bg-info/10'; 
}); 
</script>
