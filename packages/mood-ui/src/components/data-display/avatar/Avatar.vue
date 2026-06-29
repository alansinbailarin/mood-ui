<template> 
    <!-- Skeleton placeholder — mirrors the real avatar's footprint so the 
         layout does not shift when the data resolves. We map the Avatar 
         size scale (xs/small/medium/large/xl) to explicit pixel sizes so 
         `Skeleton`'s three-size scale is not a limitation. Shape controls 
         the radius: circle → full (via shape="avatar"), square → rounded, 
         sharp → none. --> 
    <Skeleton 
        v-if="skeleton" 
        shape="avatar" 
        :size="skeletonBaseSize" 
        :width="skeletonDimension" 
        :height="skeletonDimension" 
        :radius="skeletonRadiusOverride" 
    /> 
 
    <div 
        v-else 
        :class="['relative inline-flex shrink-0', shapeClasses]" 
        :role="!src || imgError ? 'img' : undefined" 
        :aria-label="!src || imgError ? accessibleName : undefined" 
    > 
        <img 
            v-if="src && !imgError" 
            :src="src" 
            :alt="accessibleName" 
            @error="imgError = true" 
            :class="['object-cover', squareSize, shapeClasses, bordered ? borderClasses : '']" 
        /> 
 
        <span 
            v-else-if="initials" 
            aria-hidden="true" 
            :class="['inline-flex items-center justify-center font-medium uppercase', squareSize, shapeClasses, initialsBgClasses, bordered ? borderClasses : '', initialsFontClasses]" 
        > 
            {{ initials }} 
        </span> 
 
        <span
            v-else
            aria-hidden="true"
            :class="['inline-flex items-center justify-center', iconFallbackColorClasses, squareSize, shapeClasses, bordered ? borderClasses : '']"
        > 
            <svg :class="iconFallbackClasses" fill="currentColor" viewBox="0 0 24 24"> 
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v1.2c0 .66.54 1.2 1.2 1.2h16.8c.66 0 1.2-.54 1.2-1.2v-1.2c0-3.2-6.4-4.8-9.6-4.8z" /> 
            </svg> 
        </span> 
 
        <span 
            v-if="status" 
            :class="['absolute border-2 border-card rounded-full', statusSizeClasses, statusColorClasses, statusPositionClasses]" 
            :aria-label="`Status: ${status}`" 
            role="status" 
        /> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { ref, computed, inject } from 'vue';
import type { Avatar } from '../../../interfaces/data-display/avatar/Avatar.interface';
import type { ModoSize } from '../../../config/ModoConfig';
import { useResolvedColor, useResolvedRadius, useSizeTokens } from '../../../composables/useModoConfig'; 
import Skeleton from '../../feedback/Skeleton.vue'; 
 
const groupProps = inject<{ 
    size?: { value: string | undefined }; 
    radius?: { value: string | undefined }; 
    bordered?: { value: boolean | undefined }; 
    grouped?: boolean; 
}>('avatarGroup', {}); 
 
const props = withDefaults(defineProps<Avatar>(), { 
    size: 'medium', 
    bordered: false, 
    color: 'default', 
    skeleton: false, 
}); 
 
const imgError = ref(false); 
 
// Accessible name priority: explicit `ariaLabel` > `alt` > `initials` > generic. 
// Used for <img alt> AND as the ARIA label when we render initials / fallback. 
const accessibleName = computed(() => props.ariaLabel || props.alt || props.initials || 'Avatar'); 
 
const size = computed(() => (groupProps.size?.value as Avatar['size']) ?? props.size);
const bordered = computed(() => groupProps.bordered?.value ?? props.bordered);
const color = useResolvedColor(() => props.color);
const resolvedRadius = useResolvedRadius(() => (groupProps.radius?.value as Avatar['radius']) ?? props.radius);
// 'xl' is Avatar-only — normalizeSize maps it to 'large'; cast to ModoSize for useSizeTokens.
const sz = useSizeTokens(() => (size.value === 'xl' ? 'large' : size.value) as ModoSize | undefined);
 
/* ---------------- Skeleton placeholder ---------------- 
 * Mirrors the avatar's pixel footprint. We compute an explicit CSS length 
 * per Avatar `size` (since Skeleton only ships 3 sizes natively) and pick a 
 * radius override that matches the avatar's visual shape. 
 */ 
const skeletonDimension = computed(() => {
    if (size.value === 'xl') return '5rem';
    // Mirror the token-driven square size: xsmall=2rem, small=2.25rem, medium=2.5rem, large=3rem.
    const h = sz.value.control; // e.g. "h-8", "h-9", "h-10", "h-12"
    const n = parseFloat(h.replace('h-', ''));
    return `${n * 0.25}rem`;
}); 
// Skeleton's own `size` prop is used only as a hint (e.g. track thickness) 
// — for avatar the explicit width/height wins. Map to the nearest bucket. 
const skeletonBaseSize = computed<'small' | 'medium' | 'large'>(() => {
    if (size.value === 'xsmall' || size.value === 'small') return 'small';
    if (size.value === 'large' || size.value === 'xl') return 'large';
    return 'medium';
});
// `shape="avatar"` already forces full radius. Pass through the resolved 
// radius so the skeleton matches the real avatar's corner shape. 
const skeletonRadiusOverride = computed<Avatar['radius'] | undefined>(() => resolvedRadius.value); 
 
const squareSize = computed(() => {
    // xl is an Avatar-only extra size not in the standard token scale.
    if (size.value === 'xl') return 'w-20 h-20';
    return `${sz.value.control} ${sz.value.control.replace('h-', 'w-')}`;
}); 
 
const shapeClasses = computed(() => { 
    switch (resolvedRadius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-sm'; 
        case 'medium': return 'rounded-md'; 
        case 'large': return 'rounded-lg'; 
        default: return 'rounded-full'; 
    } 
}); 
 
const borderClasses = computed(() => 'ring-2 ring-card'); 
 
const initialsBgClasses = computed(() => { 
    switch (color.value) { 
        case 'primary': return 'bg-primary-subtle text-primary'; 
        case 'danger': return 'bg-destructive-subtle text-destructive'; 
        case 'success': return 'bg-success-subtle text-success'; 
        case 'warning': return 'bg-warning-subtle text-warning'; 
        default: return 'bg-muted text-muted-foreground'; 
    } 
}); 
 
const initialsFontClasses = computed(() => {
    switch (size.value) {
        case 'xsmall': return 'text-[10px]';
        case 'small': return 'text-xs';
        case 'large': return 'text-lg';
        case 'xl': return 'text-2xl';
        default: return 'text-sm';
    }
});
 
const iconFallbackColorClasses = computed(() => {
    switch (color.value) {
        case 'primary': return 'bg-primary-subtle text-primary';
        case 'danger': return 'bg-destructive-subtle text-destructive';
        case 'success': return 'bg-success-subtle text-success';
        case 'warning': return 'bg-warning-subtle text-warning';
        default: return 'bg-muted text-muted-foreground';
    }
});

const iconFallbackClasses = computed(() => {
    switch (size.value) {
        case 'xsmall': return 'w-3.5 h-3.5';
        case 'small': return 'w-4 h-4';
        case 'large': return 'w-7 h-7';
        case 'xl': return 'w-10 h-10';
        default: return 'w-5 h-5';
    }
});

const statusSizeClasses = computed(() => {
    switch (size.value) {
        case 'xsmall': return 'w-1.5 h-1.5';
        case 'small': return 'w-2 h-2';
        case 'large': return 'w-3.5 h-3.5';
        case 'xl': return 'w-4 h-4';
        default: return 'w-2.5 h-2.5';
    }
});
 
const statusColorClasses = computed(() => { 
    switch (props.status) { 
        case 'online': return 'bg-success'; 
        case 'offline': return 'bg-muted-foreground'; 
        case 'away': return 'bg-warning'; 
        case 'busy': return 'bg-destructive'; 
        default: return ''; 
    } 
}); 
 
const statusPositionClasses = computed(() => { 
    const isRound = resolvedRadius.value === undefined || resolvedRadius.value === 'full' || resolvedRadius.value === 'large'; 
    if (!isRound) return 'bottom-0 right-0 translate-x-1/4 translate-y-1/4'; 
    return 'bottom-0 right-0'; 
}); 
</script>
