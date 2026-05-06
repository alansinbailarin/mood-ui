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

export const vReveal: Directive<HTMLElement, string | undefined> = {
    mounted(el, binding) {
        el.setAttribute('data-reveal', binding.value ?? '');
        observer?.observe(el);
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
            observer?.observe(child);
        }
    },
    unmounted(el) {
        for (const child of Array.from(el.children) as HTMLElement[]) {
            observer?.unobserve(child);
        }
    },
};
