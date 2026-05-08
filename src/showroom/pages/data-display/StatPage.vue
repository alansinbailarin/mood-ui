<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
    UsersIcon, BanknotesIcon, ShoppingCartIcon, ArrowTrendingUpIcon,
} from '@heroicons/vue/24/outline';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Stat from '../../../components/data-display/Stat.vue';
import type { PropDoc } from '../../types';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbDots from '../../components/toolbar/TbDots.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep from '../../components/toolbar/TbSep.vue';

const { t } = useI18n();

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<'plain' | 'outlined' | 'filled'>('outlined');
const pgSize    = ref<'small' | 'medium' | 'large'>('medium');
const pgColor   = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgTrend   = ref<'up' | 'down' | 'none'>('up');
const pgLoading = ref(false);

function resetPlayground() {
    pgVariant.value = 'outlined';
    pgSize.value = 'medium';
    pgColor.value = 'primary';
    pgTrend.value = 'up';
    pgLoading.value = false;
}

const colorDots = [
    { value: 'default'  as const, bg: 'var(--color-slate-400)',  label: 'Default'  },
    { value: 'primary'  as const, bg: 'var(--primary)',           label: 'Primary'  },
    { value: 'success'  as const, bg: 'var(--color-emerald-500)', label: 'Success'  },
    { value: 'warning'  as const, bg: 'var(--color-amber-500)',   label: 'Warning'  },
    { value: 'danger'   as const, bg: 'var(--color-red-500)',     label: 'Danger'   },
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
    if (pgLoading.value)               parts.push('loading');
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
const propsList = computed<PropDoc[]>(() => [
    { name: 'label',       type: 'string',                                                                  required: true, description: t('pages.dataDisplay.stat.props.label') },
    { name: 'value',       type: 'string | number',                                                          required: true, description: t('pages.dataDisplay.stat.props.value') },
    { name: 'description', type: 'string',                                                                                    description: t('pages.dataDisplay.stat.props.description') },
    { name: 'icon',        type: 'Component',                                                                                 description: t('pages.dataDisplay.stat.props.icon') },
    { name: 'trend',       type: "{ value: number; label?: string; direction?: 'up' | 'down' | 'neutral' }",                  description: t('pages.dataDisplay.stat.props.trend') },
    { name: 'variant',     type: "'plain' | 'outlined' | 'filled'",                                          default: "'plain'",   description: t('pages.dataDisplay.stat.props.variant') },
    { name: 'color',       type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",                 default: "'default'", description: t('pages.dataDisplay.stat.props.color') },
    { name: 'size',        type: "'small' | 'medium' | 'large'",                                                              description: t('pages.dataDisplay.stat.props.size') },
    { name: 'loading',     type: 'boolean',                                                                  default: 'false',     description: t('pages.dataDisplay.stat.props.loading') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.dataDisplay.stat.title')"
        category="Data Display"
        import-path="import { Stat } from 'mood-ui'"
        :description="t('pages.dataDisplay.stat.description')"
        :props-list="propsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" @reset="resetPlayground">
                <template #controls>
                    <TbPills :label="t('pages.dataDisplay.stat.controls.variant')" :options="[{value:'plain'},{value:'outlined'},{value:'filled'}]" v-model="pgVariant" />
                    <TbSep />
                    <TbDots :label="t('pages.dataDisplay.stat.controls.color')" :options="colorDots" v-model="pgColor" />
                    <TbSep />
                    <TbPills :label="t('pages.dataDisplay.stat.controls.size')" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbPills :label="t('pages.dataDisplay.stat.controls.trend')" :options="[{value:'up'},{value:'down'},{value:'none'}]" v-model="pgTrend" />
                    <TbSep />
                    <TbToggle :label="t('pages.dataDisplay.stat.controls.loading')" v-model="pgLoading" />
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
                    :loading="pgLoading"
                />
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                :title="t('pages.dataDisplay.stat.examples.basic.title')"
                :description="t('pages.dataDisplay.stat.examples.basic.desc')"
                :code="basicCode"
            >
                <Stat label="Revenue" value="$48,592" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.dataDisplay.stat.examples.trend.title')"
                :description="t('pages.dataDisplay.stat.examples.trend.desc')"
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
                :title="t('pages.dataDisplay.stat.examples.icon.title')"
                :description="t('pages.dataDisplay.stat.examples.icon.desc')"
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
                :title="t('pages.dataDisplay.stat.examples.sizes.title')"
                :description="t('pages.dataDisplay.stat.examples.sizes.desc')"
                :code="sizesCode"
            >
                <div class="grid sm:grid-cols-3 gap-4 w-full">
                    <Stat label="Small"  value="123" size="small"  variant="outlined" :trend="{ value: 5 }" />
                    <Stat label="Medium" value="123" size="medium" variant="outlined" :trend="{ value: 5 }" />
                    <Stat label="Large"  value="123" size="large"  variant="outlined" :trend="{ value: 5 }" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.dataDisplay.stat.examples.grid.title')"
                :description="t('pages.dataDisplay.stat.examples.grid.desc')"
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
