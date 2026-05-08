/**
 * Scroll reveal directive helper.
 *
 * Usage:
 *   <script setup>
 *     import { vReveal } from '../composables/useScrollReveal';
 *   </script>
 *   <template>
 *     <section v-reveal>…</section>
 *     <section v-reveal="'left'">…</section>
 *     <div v-reveal-children>
 *       <Card v-for="…" />
 *     </div>
 *   </template>
 */
import type { Directive } from 'vue';

const observer: IntersectionObserver | null = (typeof window !== 'undefined')
    ? new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    (entry.target as HTMLElement).dataset.revealed = 'true';
                    observer!.unobserve(entry.target);
                }
            }
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    )
    : null;

// Delay must be >= view-transition fade-in duration (340ms) so that
// reveal animations don't conflict with the crossfade between routes.
const REVEAL_DELAY = 380;

export const vReveal: Directive<HTMLElement, string | undefined> = {
    mounted(el, binding) {
        el.setAttribute('data-reveal', binding.value ?? '');
        setTimeout(() => observer?.observe(el), REVEAL_DELAY);
    },
    unmounted(el) {
        observer?.unobserve(el);
    },
};

export const vRevealChildren: Directive<HTMLElement> = {
    mounted(el) {
        el.setAttribute('data-reveal-children', '');
        for (const child of Array.from(el.children) as HTMLElement[]) {
            child.setAttribute('data-reveal', '');
            setTimeout(() => observer?.observe(child), REVEAL_DELAY);
        }
    },
    unmounted(el) {
        for (const child of Array.from(el.children) as HTMLElement[]) {
            observer?.unobserve(child);
        }
    },
};
