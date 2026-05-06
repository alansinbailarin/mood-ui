<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Kbd from '../../../components/data-display/Kbd.vue';
import type { PropDoc, SlotDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<'subtle' | 'outline' | 'solid'>('subtle');
const pgSize    = ref<'small' | 'medium' | 'large'>('medium');

function resetPlayground() {
    pgVariant.value = 'subtle';
    pgSize.value = 'medium';
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgVariant.value !== 'subtle') parts.push(`variant="${pgVariant.value}"`);
    if (pgSize.value    !== 'medium') parts.push(`size="${pgSize.value}"`);
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Kbd${attrs}>⌘K</Kbd>`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const basicCode = `<Kbd>Enter</Kbd>
<Kbd>Esc</Kbd>
<Kbd>Tab</Kbd>`;

const comboCode = `<Kbd>⌘</Kbd>
<span class="text-muted-foreground">+</span>
<Kbd>Shift</Kbd>
<span class="text-muted-foreground">+</span>
<Kbd>P</Kbd>`;

const variantsCode = `<Kbd variant="subtle">Esc</Kbd>
<Kbd variant="outline">Esc</Kbd>
<Kbd variant="solid">Esc</Kbd>`;

const sizesCode = `<Kbd size="small">Tab</Kbd>
<Kbd size="medium">Tab</Kbd>
<Kbd size="large">Tab</Kbd>`;

const inlineCode = `<p>Pulsa <Kbd>⌘K</Kbd> para abrir la búsqueda rápida.</p>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'size',    type: "'small' | 'medium' | 'large'",                     default: "'medium'", description: 'Tamaño de la tecla.' },
    { name: 'variant', type: "'subtle' | 'outline' | 'solid'",                   default: "'subtle'", description: 'Estilo visual de la tecla.' },
    { name: 'radius',  type: "'none' | 'small' | 'medium' | 'large' | 'full'",                        description: 'Radio de borde. Hereda del ModoProvider si se omite.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Texto o glifo de la tecla (Enter, ⌘, ↑, etc.).' },
];
</script>

<template>
    <ComponentDoc
        title="Kbd"
        category="Data Display"
        import-path="import { Kbd } from 'mood-ui'"
        description="Representación visual de teclas o atajos de teclado. Útil en docs, tooltips y command palettes."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="160px" @reset="resetPlayground">
                <template #controls>
                    <!-- Variant -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Variant</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in ['subtle', 'outline', 'solid']"
                                :key="v"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgVariant === v
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgVariant = (v as typeof pgVariant)"
                            >{{ v }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <!-- Size -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Size</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in ['small', 'medium', 'large']"
                                :key="s"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgSize === s
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgSize = (s as typeof pgSize)"
                            >{{ s }}</button>
                        </div>
                    </div>
                </template>

                <Kbd :variant="pgVariant" :size="pgSize">⌘K</Kbd>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Una sola tecla."
                :code="basicCode"
            >
                <Kbd>Enter</Kbd>
                <Kbd>Esc</Kbd>
                <Kbd>Tab</Kbd>
            </ComponentPreview>

            <ComponentPreview
                title="Combinación"
                description="Une varias Kbd con un separador."
                :code="comboCode"
            >
                <div class="inline-flex items-center gap-1">
                    <Kbd>⌘</Kbd>
                    <span class="text-muted-foreground">+</span>
                    <Kbd>Shift</Kbd>
                    <span class="text-muted-foreground">+</span>
                    <Kbd>P</Kbd>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Variantes"
                description="Tres estilos visuales: subtle (por defecto), outline y solid."
                :code="variantsCode"
            >
                <Kbd variant="subtle">Esc</Kbd>
                <Kbd variant="outline">Esc</Kbd>
                <Kbd variant="solid">Esc</Kbd>
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres escalas para alinear con texto en distintos contextos."
                :code="sizesCode"
            >
                <Kbd size="small">Tab</Kbd>
                <Kbd size="medium">Tab</Kbd>
                <Kbd size="large">Tab</Kbd>
            </ComponentPreview>

            <ComponentPreview
                title="Inline en texto"
                description="Se alinea verticalmente con el texto que lo rodea."
                :code="inlineCode"
            >
                <p class="text-sm">
                    Pulsa <Kbd>⌘K</Kbd> para abrir la búsqueda rápida.
                </p>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
