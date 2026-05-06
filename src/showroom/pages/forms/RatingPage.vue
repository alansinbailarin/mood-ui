<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Rating from '../../../components/forms/Rating.vue';
import type { PropDoc, EmitDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue     = ref(3);
const pgMax       = ref<3 | 5 | 10>(5);
const pgColor     = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('warning');
const pgSize      = ref<'small' | 'medium' | 'large'>('medium');
const pgAllowHalf = ref(false);
const pgReadonly  = ref(false);

function resetPlayground() {
    pgValue.value     = 3;
    pgMax.value       = 5;
    pgColor.value     = 'warning';
    pgSize.value      = 'medium';
    pgAllowHalf.value = false;
    pgReadonly.value  = false;
}

const colorDots = [
    { value: 'default' as const, bg: '#64748b',        label: 'Default' },
    { value: 'primary' as const, bg: 'var(--primary)', label: 'Primary' },
    { value: 'success' as const, bg: '#22c55e',        label: 'Success' },
    { value: 'warning' as const, bg: '#f59e0b',        label: 'Warning' },
    { value: 'danger'  as const, bg: '#ef4444',        label: 'Danger'  },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgMax.value   !== 5)         parts.push(`:max="${pgMax.value}"`);
    if (pgColor.value !== 'warning') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value  !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgAllowHalf.value)           parts.push('allow-half');
    if (pgReadonly.value)            parts.push('readonly');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Rating v-model="rating"${attrs} />`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<Rating v-model="rating" />`;

const halfCode = `<Rating v-model="rating" allow-half show-value />`;

const colorsCode = `<Rating :model-value="4" color="primary" />
<Rating :model-value="4" color="success" />
<Rating :model-value="4" color="warning" />
<Rating :model-value="4" color="danger"  />`;

const sizesCode = `<Rating :model-value="4" size="small"  />
<Rating :model-value="4" size="medium" />
<Rating :model-value="4" size="large"  />`;

const readonlyCode = `<Rating :model-value="3.5" allow-half readonly show-value />
<Rating :model-value="2"   disabled />`;

const ex1 = ref(3);
const ex2 = ref(3.5);

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue', type: 'number',                                                     default: '0',         description: 'Valor actual (v-model).' },
    { name: 'max',        type: 'number',                                                     default: '5',         description: 'Total de elementos (estrellas) renderizados.' },
    { name: 'allowHalf',  type: 'boolean',                                                    default: 'false',     description: 'Permite valores en pasos de 0.5.' },
    { name: 'readonly',   type: 'boolean',                                                    default: 'false',     description: 'Modo solo lectura — no acepta interacción.' },
    { name: 'disabled',   type: 'boolean',                                                    default: 'false',     description: 'Deshabilita y reduce la opacidad.' },
    { name: 'clearable',  type: 'boolean',                                                    default: 'true',      description: 'Re-clic sobre el valor activo lo resetea a 0.' },
    { name: 'color',      type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'warning'", description: 'Color semántico de las estrellas rellenas.' },
    { name: 'size',       type: "'small' | 'medium' | 'large'",                              default: "'medium'",  description: 'Tamaño de las estrellas.' },
    { name: 'showValue',  type: 'boolean',                                                    default: 'false',     description: 'Muestra el valor numérico junto al rating.' },
    { name: 'ariaLabel',  type: 'string',                                                                            description: 'Nombre accesible.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'number', description: 'Emitido al cambiar el valor (sincroniza v-model).' },
    { name: 'change',            payload: 'number', description: 'Emitido tras cada cambio confirmado por el usuario.' },
];
</script>

<template>
    <ComponentDoc
        title="Rating"
        category="Forms"
        import-path="import { Rating } from 'mood-ui'"
        description="Control de puntuación con estrellas. Soporta medios pasos, modo solo lectura y todas las variantes de color y tamaño."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <!-- Max -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">MAX</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="m in [3, 5, 10] as const"
                                :key="m"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgMax === m
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgMax = m"
                            >{{ m }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <!-- Color dots -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">COLOR</span>
                        <div class="flex items-center gap-1">
                            <button
                                v-for="c in colorDots"
                                :key="c.value"
                                type="button"
                                class="size-4 rounded-full transition-all duration-150"
                                :class="pgColor === c.value
                                    ? 'ring-2 ring-offset-1 ring-foreground/30 scale-125'
                                    : 'hover:scale-110 opacity-70 hover:opacity-100'"
                                :style="`background: ${c.bg}`"
                                :title="c.label"
                                @click="pgColor = c.value"
                            />
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

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
                        :class="pgAllowHalf
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgAllowHalf = !pgAllowHalf"
                    >Allow half</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgReadonly
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgReadonly = !pgReadonly"
                    >Readonly</button>
                </template>

                <Rating
                    v-model="pgValue"
                    :max="pgMax"
                    :color="pgColor"
                    :size="pgSize"
                    :allow-half="pgAllowHalf"
                    :readonly="pgReadonly"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Uso básico"
                description="Cinco estrellas, color warning por defecto. Click sobre el valor activo lo resetea."
                :code="basicCode"
            >
                <Rating v-model="ex1" />
            </ComponentPreview>

            <ComponentPreview
                title="Medias estrellas"
                description="Activa allow-half para puntuaciones en pasos de 0.5 y muestra el valor numérico."
                :code="halfCode"
            >
                <Rating v-model="ex2" allow-half show-value />
            </ComponentPreview>

            <ComponentPreview
                title="Colores"
                description="Variantes semánticas para distintos contextos."
                :code="colorsCode"
            >
                <div class="flex flex-col gap-3">
                    <Rating :model-value="4" color="primary" />
                    <Rating :model-value="4" color="success" />
                    <Rating :model-value="4" color="warning" />
                    <Rating :model-value="4" color="danger"  />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres tamaños disponibles."
                :code="sizesCode"
            >
                <div class="flex flex-col gap-3">
                    <Rating :model-value="4" size="small"  />
                    <Rating :model-value="4" size="medium" />
                    <Rating :model-value="4" size="large"  />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Solo lectura y deshabilitado"
                description="readonly preserva los estilos activos; disabled añade opacidad."
                :code="readonlyCode"
            >
                <div class="flex flex-col gap-3">
                    <Rating :model-value="3.5" allow-half readonly show-value />
                    <Rating :model-value="2"   disabled />
                </div>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
