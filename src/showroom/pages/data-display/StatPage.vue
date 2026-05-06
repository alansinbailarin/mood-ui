<script setup lang="ts">
import { ref, computed } from 'vue';
import {
    UsersIcon, BanknotesIcon, ShoppingCartIcon, ArrowTrendingUpIcon,
} from '@heroicons/vue/24/outline';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Stat from '../../../components/data-display/Stat.vue';
import type { PropDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<'plain' | 'outlined' | 'filled'>('outlined');
const pgSize    = ref<'small' | 'medium' | 'large'>('medium');
const pgColor   = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgTrend   = ref<'up' | 'down' | 'none'>('up');

function resetPlayground() {
    pgVariant.value = 'outlined';
    pgSize.value = 'medium';
    pgColor.value = 'primary';
    pgTrend.value = 'up';
}

const colorDots = [
    { value: 'default'  as const, bg: '#64748b',        label: 'Default'  },
    { value: 'primary'  as const, bg: 'var(--primary)', label: 'Primary'  },
    { value: 'success'  as const, bg: '#22c55e',        label: 'Success'  },
    { value: 'warning'  as const, bg: '#f59e0b',        label: 'Warning'  },
    { value: 'danger'   as const, bg: '#ef4444',        label: 'Danger'   },
];

const playgroundTrend = computed(() => {
    if (pgTrend.value === 'up')   return { value: 12.5 };
    if (pgTrend.value === 'down') return { value: -8.3 };
    return undefined;
});

const overviewCode = computed(() => {
    const parts: string[] = ['label="Revenue"', 'value="$48,592"'];
    if (pgVariant.value !== 'plain')   parts.push(`variant="${pgVariant.value}"`);
    if (pgSize.value    !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgColor.value   !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgTrend.value === 'up')        parts.push(':trend="{ value: 12.5 }"');
    if (pgTrend.value === 'down')      parts.push(':trend="{ value: -8.3 }"');
    return `<Stat ${parts.join(' ')} />`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const basicCode = `<Stat label="Revenue" value="$48,592" />`;

const trendCode = `<Stat
  label="Active users"
  value="12,403"
  :trend="{ value: 12.5 }"
  description="vs. mes pasado"
/>`;

const iconCode = `<Stat
  label="Revenue"
  value="$48,592"
  :icon="BanknotesIcon"
  color="success"
  variant="outlined"
  :trend="{ value: 12.5 }"
/>`;

const sizesCode = `<Stat label="Small"  value="123" size="small"  variant="outlined" :trend="{ value: 5 }" />
<Stat label="Medium" value="123" size="medium" variant="outlined" :trend="{ value: 5 }" />
<Stat label="Large"  value="123" size="large"  variant="outlined" :trend="{ value: 5 }" />`;

const gridCode = `<div class="grid sm:grid-cols-2 gap-4">
  <Stat label="Revenue"    value="$48,592" :icon="BanknotesIcon"      color="success" variant="outlined" :trend="{ value: 12.5 }" />
  <Stat label="Users"      value="12,403"  :icon="UsersIcon"          color="primary" variant="outlined" :trend="{ value: 8.2 }" />
  <Stat label="Orders"     value="3,201"   :icon="ShoppingCartIcon"   color="warning" variant="outlined" :trend="{ value: -3.1 }" />
  <Stat label="Conversion" value="3.42%"   :icon="ArrowTrendingUpIcon" color="danger"  variant="outlined" :trend="{ value: -1.5, label: '-1.5pp' }" />
</div>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'label',       type: 'string',                                                                  required: true, description: 'Etiqueta corta de la métrica (“Revenue”, “Users”).' },
    { name: 'value',       type: 'string | number',                                                          required: true, description: 'Valor principal pre-formateado por el consumidor.' },
    { name: 'description', type: 'string',                                                                                    description: 'Texto auxiliar mostrado debajo del valor.' },
    { name: 'icon',        type: 'Component',                                                                                 description: 'Componente de icono opcional (heroicons u otro).' },
    { name: 'trend',       type: "{ value: number; label?: string; direction?: 'up' | 'down' | 'neutral' }",                  description: 'Metadatos de tendencia. Renderiza una flecha y el delta.' },
    { name: 'variant',     type: "'plain' | 'outlined' | 'filled'",                                          default: "'plain'",   description: 'Estilo visual del card.' },
    { name: 'color',       type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",                 default: "'default'", description: 'Color semántico aplicado al icono y a la tendencia.' },
    { name: 'size',        type: "'small' | 'medium' | 'large'",                                                              description: 'Escala de tamaño. Hereda del ModoProvider si se omite.' },
    { name: 'loading',     type: 'boolean',                                                                  default: 'false',     description: 'Muestra un skeleton en el valor mientras se carga.' },
];
</script>

<template>
    <ComponentDoc
        title="Stat"
        category="Data Display"
        import-path="import { Stat } from 'mood-ui'"
        description="Tarjeta KPI compacta para mostrar métricas con tendencia, icono y color semántico. Ideal para dashboards y resumenes."
        :props-list="propsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" @reset="resetPlayground">
                <template #controls>
                    <!-- Variant -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Variant</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in ['plain', 'outlined', 'filled']"
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

                    <span class="w-px h-4 bg-border shrink-0" />

                    <!-- Trend -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Trend</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="t in ['up', 'down', 'none']"
                                :key="t"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgTrend === t
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgTrend = (t as typeof pgTrend)"
                            >{{ t }}</button>
                        </div>
                    </div>
                </template>

                <Stat
                    label="Revenue"
                    value="$48,592"
                    :variant="pgVariant"
                    :color="pgColor"
                    :size="pgSize"
                    :icon="BanknotesIcon"
                    :trend="playgroundTrend"
                    description="vs. mes pasado"
                />
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Etiqueta y valor principal sin extras."
                :code="basicCode"
            >
                <Stat label="Revenue" value="$48,592" />
            </ComponentPreview>

            <ComponentPreview
                title="Con tendencia"
                description="La prop trend muestra una flecha y el delta porcentual."
                :code="trendCode"
            >
                <Stat
                    label="Active users"
                    value="12,403"
                    :trend="{ value: 12.5 }"
                    description="vs. mes pasado"
                />
            </ComponentPreview>

            <ComponentPreview
                title="Con icono y color"
                description="Combina icono, color semántico y variante outlined."
                :code="iconCode"
            >
                <Stat
                    label="Revenue"
                    value="$48,592"
                    :icon="BanknotesIcon"
                    color="success"
                    variant="outlined"
                    :trend="{ value: 12.5 }"
                />
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres escalas para alinear con la jerarquía de la página."
                :code="sizesCode"
            >
                <div class="grid sm:grid-cols-3 gap-4 w-full">
                    <Stat label="Small"  value="123" size="small"  variant="outlined" :trend="{ value: 5 }" />
                    <Stat label="Medium" value="123" size="medium" variant="outlined" :trend="{ value: 5 }" />
                    <Stat label="Large"  value="123" size="large"  variant="outlined" :trend="{ value: 5 }" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Grid de métricas"
                description="Cuatro Stat en un grid simulando un dashboard."
                :code="gridCode"
            >
                <div class="grid sm:grid-cols-2 gap-4 w-full">
                    <Stat label="Revenue"    value="$48,592" :icon="BanknotesIcon"      color="success" variant="outlined" :trend="{ value: 12.5 }" />
                    <Stat label="Users"      value="12,403"  :icon="UsersIcon"          color="primary" variant="outlined" :trend="{ value: 8.2 }" />
                    <Stat label="Orders"     value="3,201"   :icon="ShoppingCartIcon"   color="warning" variant="outlined" :trend="{ value: -3.1 }" />
                    <Stat label="Conversion" value="3.42%"   :icon="ArrowTrendingUpIcon" color="danger"  variant="outlined" :trend="{ value: -1.5, label: '-1.5pp' }" />
                </div>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
