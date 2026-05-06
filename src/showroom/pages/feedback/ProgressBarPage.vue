<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import ProgressBar from '../../../components/feedback/ProgressBar.vue';
import type { PropDoc, EmitDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue         = ref<number>(50);
const pgColor         = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize          = ref<'small' | 'medium' | 'large'>('medium');
const pgIndeterminate = ref(false);

function resetPlayground() {
    pgValue.value         = 50;
    pgColor.value         = 'primary';
    pgSize.value          = 'medium';
    pgIndeterminate.value = false;
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
    if (!pgIndeterminate.value) parts.push(`:value="${pgValue.value}"`);
    if (pgColor.value !== 'primary') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value  !== 'medium')  parts.push(`size="${pgSize.value}"`);
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<ProgressBar${attrs} />`;
});

// ── Animated demo ─────────────────────────────────────────────────────────────
const animValue = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
    timer = setInterval(() => {
        animValue.value = (animValue.value + 7) % 105;
    }, 700);
});
onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
});

// ── Example code strings ──────────────────────────────────────────────────────
const labelCode = `<ProgressBar :value="33" label="Subiendo archivo" show-value />`;

const indeterminateCode = `<ProgressBar color="primary" />
<ProgressBar color="success" />`;

const colorsCode = `<ProgressBar :value="40" color="primary" />
<ProgressBar :value="60" color="success" />
<ProgressBar :value="75" color="warning" />
<ProgressBar :value="90" color="danger"  />`;

const sizesCode = `<ProgressBar :value="50" size="small"  />
<ProgressBar :value="50" size="medium" />
<ProgressBar :value="50" size="large"  />`;

const stripedCode = `<ProgressBar :value="65" striped color="primary" show-value />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'value',     type: 'number',                                                                            description: 'Valor actual entre min y max. Omitir para modo indeterminado.' },
    { name: 'min',       type: 'number',                                          default: '0',                     description: 'Valor mínimo del rango.' },
    { name: 'max',       type: 'number',                                          default: '100',                   description: 'Valor máximo del rango.' },
    { name: 'color',     type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'primary'",    description: 'Color de la barra.' },
    { name: 'size',      type: "'small' | 'medium' | 'large'",                    default: "'medium'",              description: 'Grosor de la barra.' },
    { name: 'radius',    type: "'none' | 'small' | 'medium' | 'large' | 'full'",  default: "'full'",                description: 'Radio del track. Cascada desde ModoProvider.' },
    { name: 'showValue', type: 'boolean',                                          default: 'false',                description: 'Muestra el porcentaje numérico junto a la barra.' },
    { name: 'label',     type: 'string',                                                                             description: 'Etiqueta opcional renderizada encima de la barra.' },
    { name: 'ariaLabel', type: 'string',                                                                             description: 'Label accesible cuando se omite la prop label.' },
    { name: 'striped',   type: 'boolean',                                          default: 'false',                description: 'Activa la animación de stripes (útil para "subiendo…").' },
];

const emitsList: EmitDoc[] = [];
</script>

<template>
    <ComponentDoc
        title="ProgressBar"
        category="Feedback"
        import-path="import { ProgressBar } from 'mood-ui'"
        description="Barra de progreso lineal determinada o indeterminada. Soporta etiqueta, valor numérico, colores, tamaños y animación striped."
        :props-list="propsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="180px" @reset="resetPlayground">
                <template #controls>
                    <!-- Value presets -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Valor</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in [0, 25, 50, 75, 100]"
                                :key="v"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgValue === v && !pgIndeterminate
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgValue = v; pgIndeterminate = false"
                            >{{ v }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <!-- Color dots -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Color</span>
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
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Tamaño</span>
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
                        :class="pgIndeterminate
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgIndeterminate = !pgIndeterminate"
                    >Indeterminado</button>
                </template>

                <ProgressBar
                    class="w-72"
                    :value="pgIndeterminate ? undefined : pgValue"
                    :color="pgColor"
                    :size="pgSize"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Con label y valor"
                description="Combina label encima y showValue para mostrar el porcentaje numérico."
                :code="labelCode"
            >
                <ProgressBar class="w-72" :value="animValue" label="Subiendo archivo" show-value />
            </ComponentPreview>

            <ComponentPreview
                title="Indeterminado"
                description="Omite la prop value para mostrar la animación deslizante."
                :code="indeterminateCode"
            >
                <div class="flex flex-col gap-3 w-72">
                    <ProgressBar color="primary" />
                    <ProgressBar color="success" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Colores"
                description="Cinco colores semánticos para reflejar el estado del proceso."
                :code="colorsCode"
            >
                <div class="flex flex-col gap-2 w-72">
                    <ProgressBar :value="40" color="primary" />
                    <ProgressBar :value="60" color="success" />
                    <ProgressBar :value="75" color="warning" />
                    <ProgressBar :value="90" color="danger"  />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres grosores: small, medium (default) y large."
                :code="sizesCode"
            >
                <div class="flex flex-col gap-3 w-72">
                    <ProgressBar :value="50" size="small"  />
                    <ProgressBar :value="50" size="medium" />
                    <ProgressBar :value="50" size="large"  />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Striped"
                description="Activa stripes animadas para procesos en curso."
                :code="stripedCode"
            >
                <ProgressBar class="w-72" :value="65" striped color="primary" show-value />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
