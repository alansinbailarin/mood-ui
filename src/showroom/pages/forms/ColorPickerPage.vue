<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import ColorPicker from '../../../components/forms/ColorPicker.vue';
import type { PropDoc, EmitDoc } from '../../types';

const brandSwatches = [
    '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
    '#ec4899', '#ef4444', '#f59e0b', '#22c55e',
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue       = ref('#3b82f6');
const pgSize        = ref<'small' | 'medium' | 'large'>('medium');
const pgSwatches    = ref(true);
const pgShowHex     = ref(true);
const pgShowNative  = ref(false);
const pgDisabled    = ref(false);

function resetPlayground() {
    pgValue.value      = '#3b82f6';
    pgSize.value       = 'medium';
    pgSwatches.value   = true;
    pgShowHex.value    = true;
    pgShowNative.value = false;
    pgDisabled.value   = false;
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgSize.value !== 'medium') parts.push(`size="${pgSize.value}"`);
    if (pgSwatches.value)          parts.push(':swatches="brandSwatches"');
    if (pgShowHex.value)           parts.push(':show-hex="true"');
    if (pgShowNative.value)        parts.push(':show-native="true"');
    if (pgDisabled.value)          parts.push(':disabled="true"');
    const attrs = parts.length ? '\n    ' + parts.join('\n    ') : '';
    return `<ColorPicker v-model="color"${attrs} />`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<ColorPicker v-model="color" />`;

const swatchesCode = `<ColorPicker
    v-model="color"
    :swatches="['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']"
/>`;

const hexInputCode = `<ColorPicker v-model="color" :show-hex="true" />`;

const nativeCode = `<ColorPicker v-model="color" :show-native="true" :show-hex="true" />`;

const sizesCode = `<ColorPicker v-model="color" size="small" />
<ColorPicker v-model="color" size="medium" />
<ColorPicker v-model="color" size="large" />`;

const disabledCode = `<ColorPicker :model-value="'#3b82f6'" disabled />`;

const ex1 = ref('#3b82f6');
const ex2 = ref('#22c55e');
const ex3 = ref('#ec4899');
const ex4 = ref('#f59e0b');
const ex5a = ref('#3b82f6');
const ex5b = ref('#3b82f6');
const ex5c = ref('#3b82f6');

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue', type: 'string',                                                                description: 'Color hex actual (v-model). Por ejemplo "#3b82f6".' },
    { name: 'swatches',   type: 'string[]',                                                              description: 'Lista opcional de colores hex preseleccionables en el panel.' },
    { name: 'showHex',    type: 'boolean',                              default: 'false',                description: 'Muestra el input de texto para introducir un valor hex.' },
    { name: 'showNative', type: 'boolean',                              default: 'false',                description: 'Muestra el picker nativo del navegador como fallback avanzado.' },
    { name: 'disabled',   type: 'boolean',                              default: 'false',                description: 'Deshabilita el picker.' },
    { name: 'size',       type: "'small' | 'medium' | 'large'",         default: "'medium'",             description: 'Tamaño del trigger y del swatch interno.' },
    { name: 'radius',     type: "'none' | 'small' | 'medium' | 'large' | 'full'", default: "'medium'",  description: 'Radio del trigger y del panel.' },
    { name: 'placement',  type: "'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'", default: "'bottom-start'", description: 'Posición del popover relativa al trigger.' },
    { name: 'ariaLabel',  type: 'string',                                                                description: 'Nombre accesible del trigger.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'string', description: 'Emitido al cambiar el color seleccionado (sincroniza v-model).' },
    { name: 'change',            payload: 'string', description: 'Emitido tras una selección confirmada por el usuario.' },
];
</script>

<template>
    <ComponentDoc
        title="ColorPicker"
        category="Forms"
        import-path="import { ColorPicker } from 'mood-ui'"
        description="Selector de color con popover, swatches preconfigurables, input hex y soporte opcional para el picker nativo del navegador."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="240px" @reset="resetPlayground">
                <template #controls>
                    <!-- Size -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">SIZE</span>
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

                    <span class="w-px h-4 bg-border shrink-0" />

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgSwatches
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgSwatches = !pgSwatches"
                    >Swatches</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgShowHex
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgShowHex = !pgShowHex"
                    >Hex input</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgShowNative
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgShowNative = !pgShowNative"
                    >Native</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDisabled
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDisabled = !pgDisabled"
                    >Disabled</button>
                </template>

                <ColorPicker
                    v-model="pgValue"
                    :size="pgSize"
                    :swatches="pgSwatches ? brandSwatches : undefined"
                    :show-hex="pgShowHex"
                    :show-native="pgShowNative"
                    :disabled="pgDisabled"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Uso básico"
                description="Trigger con el color actual visible y popover básico."
                :code="basicCode"
            >
                <ColorPicker v-model="ex1" />
            </ComponentPreview>

            <ComponentPreview
                title="Con swatches"
                description="Pre-define una paleta de colores mostrada como cuadrícula dentro del popover."
                :code="swatchesCode"
            >
                <ColorPicker
                    v-model="ex2"
                    :swatches="['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']"
                />
            </ComponentPreview>

            <ComponentPreview
                title="Input hex"
                description="Permite introducir el valor hex manualmente para mayor precisión."
                :code="hexInputCode"
            >
                <ColorPicker v-model="ex3" :show-hex="true" />
            </ComponentPreview>

            <ComponentPreview
                title="Picker nativo"
                description="Activa show-native para añadir el color picker del navegador como fallback."
                :code="nativeCode"
            >
                <ColorPicker v-model="ex4" :show-native="true" :show-hex="true" />
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres tamaños disponibles para encajar con la densidad del formulario."
                :code="sizesCode"
            >
                <div class="flex items-center gap-3">
                    <ColorPicker v-model="ex5a" size="small" />
                    <ColorPicker v-model="ex5b" size="medium" />
                    <ColorPicker v-model="ex5c" size="large" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Disabled"
                description="Estado deshabilitado preservando el color visible."
                :code="disabledCode"
            >
                <ColorPicker :model-value="'#3b82f6'" disabled />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
