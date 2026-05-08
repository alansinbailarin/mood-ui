<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Select from '../../../components/forms/Select.vue';
import type { PropDoc, EmitDoc } from '../../types';
import TbPills  from '../../components/toolbar/TbPills.vue';
import TbDots   from '../../components/toolbar/TbDots.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep    from '../../components/toolbar/TbSep.vue';

const { t } = useI18n();

const countries = [
    { value: 'es', label: 'España' },
    { value: 'mx', label: 'México' },
    { value: 'ar', label: 'Argentina' },
    { value: 'co', label: 'Colombia' },
    { value: 'cl', label: 'Chile' },
    { value: 'pe', label: 'Perú' },
];

const grouped = [
    { value: 'es', label: 'Español',   group: 'Europa' },
    { value: 'fr', label: 'Francés',   group: 'Europa' },
    { value: 'de', label: 'Alemán',    group: 'Europa' },
    { value: 'en', label: 'Inglés',    group: 'América' },
    { value: 'pt', label: 'Portugués', group: 'América' },
    { value: 'ja', label: 'Japonés',   group: 'Asia' },
    { value: 'zh', label: 'Chino',     group: 'Asia' },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue      = ref<string | number | null>('mx');
const pgVariant    = ref<'outline' | 'filled' | 'ghost'>('outline');
const pgColor      = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize       = ref<'small' | 'medium' | 'large'>('medium');
const pgClearable  = ref(true);
const pgSearchable = ref(false);
const pgDisabled   = ref(false);

function resetPlayground() {
    pgValue.value      = 'mx';
    pgVariant.value    = 'outline';
    pgColor.value      = 'primary';
    pgSize.value       = 'medium';
    pgClearable.value  = true;
    pgSearchable.value = false;
    pgDisabled.value   = false;
}

const colorDots = [
    { value: 'default' as const, bg: 'var(--color-slate-400)',   label: 'Default' },
    { value: 'primary' as const, bg: 'var(--primary)',            label: 'Primary' },
    { value: 'success' as const, bg: 'var(--color-emerald-500)', label: 'Success' },
    { value: 'warning' as const, bg: 'var(--color-amber-500)',   label: 'Warning' },
    { value: 'danger'  as const, bg: 'var(--color-red-500)',     label: 'Danger'  },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgVariant.value   !== 'outline') parts.push(`variant="${pgVariant.value}"`);
    if (pgColor.value     !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value      !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgClearable.value)               parts.push('clearable');
    if (pgSearchable.value)              parts.push('searchable');
    if (pgDisabled.value)                parts.push(':disabled="true"');
    const attrs = parts.length ? '\n    ' + parts.join('\n    ') : '';
    return `<Select\n    v-model="value"\n    :options="countries"\n    label="País"${attrs}\n/>`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<Select v-model="country" :options="countries" label="País" placeholder="Elige un país" />`;

const searchableCode = `<Select
    v-model="lang"
    :options="grouped"
    label="Idioma"
    searchable
    placeholder="Buscar idioma…"
/>`;

const groupedCode = `<Select
    v-model="lang"
    :options="grouped"
    label="Idioma"
/>`;

const sizesCode = `<Select :options="countries" size="small"  placeholder="Small" />
<Select :options="countries" size="medium" placeholder="Medium" />
<Select :options="countries" size="large"  placeholder="Large" />`;

const statesCode = `<Select :options="countries" label="Loading" loading  placeholder="Cargando…" />
<Select :options="countries" label="Disabled" disabled placeholder="No editable" />
<Select :options="countries" label="Error" error-text="Selecciona un país" />`;

const ex1 = ref<string | number | null>(null);
const ex2 = ref<string | number | null>(null);
const ex3 = ref<string | number | null>('es');

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
    { name: 'modelValue',    type: 'string | number | null',                                           description: t('pages.forms.select.props.modelValue') },
    { name: 'options',       type: 'SelectOption[]',                                                   description: t('pages.forms.select.props.options'), required: true },
    { name: 'label',         type: 'string',                                                           description: t('pages.forms.select.props.label') },
    { name: 'placeholder',   type: 'string',                                  default: "'Select…'",    description: t('pages.forms.select.props.placeholder') },
    { name: 'helperText',    type: 'string',                                                           description: t('pages.forms.select.props.helperText') },
    { name: 'errorText',     type: 'string',                                                           description: t('pages.forms.select.props.errorText') },
    { name: 'variant',       type: "'outline' | 'filled' | 'ghost'",          default: "'outline'",    description: t('pages.forms.select.props.variant') },
    { name: 'color',         type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: t('pages.forms.select.props.color') },
    { name: 'size',          type: "'small' | 'medium' | 'large'",            default: "'medium'",     description: t('pages.forms.select.props.size') },
    { name: 'radius',        type: "'none' | 'small' | 'medium' | 'large' | 'full'", default: "'medium'", description: t('pages.forms.select.props.radius') },
    { name: 'clearable',     type: 'boolean',                                 default: 'false',        description: t('pages.forms.select.props.clearable') },
    { name: 'searchable',    type: 'boolean',                                 default: 'false',        description: t('pages.forms.select.props.searchable') },
    { name: 'disabled',      type: 'boolean',                                 default: 'false',        description: t('pages.forms.select.props.disabled') },
    { name: 'readonly',      type: 'boolean',                                 default: 'false',        description: t('pages.forms.select.props.readonly') },
    { name: 'required',      type: 'boolean',                                 default: 'false',        description: t('pages.forms.select.props.required') },
    { name: 'loading',       type: 'boolean',                                 default: 'false',        description: t('pages.forms.select.props.loading') },
    { name: 'fullWidth',     type: 'boolean',                                 default: 'false',        description: t('pages.forms.select.props.fullWidth') },
    { name: 'iconLeft',      type: 'Component',                                                        description: t('pages.forms.select.props.iconLeft') },
    { name: 'panelWidth',    type: "'trigger' | 'auto'",                      default: "'trigger'",    description: t('pages.forms.select.props.panelWidth') },
    { name: 'name',          type: 'string',                                                           description: t('pages.forms.select.props.name') },
    { name: 'id',            type: 'string',                                                           description: t('pages.forms.select.props.id') },
    { name: 'ariaLabel',     type: 'string',                                                           description: t('pages.forms.select.props.ariaLabel') },
]);

const emitsList = computed<EmitDoc[]>(() => [
    { name: 'update:modelValue', payload: 'string | number | null', description: t('pages.forms.select.emits.updateModelValue') },
    { name: 'change',            payload: 'string | number | null', description: t('pages.forms.select.emits.change') },
    { name: 'open',              payload: 'void',                   description: t('pages.forms.select.emits.open') },
    { name: 'close',             payload: 'void',                   description: t('pages.forms.select.emits.close') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.forms.select.title')"
        category="Forms"
        import-path="import { Select } from 'mood-ui'"
        :description="t('pages.forms.select.description')"
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="240px" @reset="resetPlayground">
                <template #controls>
                    <TbPills :label="t('pages.forms.select.controls.variant')" :options="[{value:'outline'},{value:'filled'},{value:'ghost'}]" v-model="pgVariant" />
                    <TbSep />
                    <TbDots :label="t('pages.forms.select.controls.color')" :options="colorDots" v-model="pgColor" />
                    <TbSep />
                    <TbPills :label="t('pages.forms.select.controls.size')" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbToggle :label="t('pages.forms.select.controls.clearable')" v-model="pgClearable" />
                    <TbToggle :label="t('pages.forms.select.controls.searchable')" v-model="pgSearchable" />
                    <TbToggle :label="t('pages.forms.select.controls.disabled')" v-model="pgDisabled" />
                </template>

                <Select
                    v-model="pgValue"
                    :options="countries"
                    :label="t('pages.forms.select.playground.label')"
                    :variant="pgVariant"
                    :color="pgColor"
                    :size="pgSize"
                    :clearable="pgClearable"
                    :searchable="pgSearchable"
                    :disabled="pgDisabled"
                    class="w-64"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                :title="t('pages.forms.select.examples.basic.title')"
                :description="t('pages.forms.select.examples.basic.desc')"
                :code="basicCode"
            >
                <Select v-model="ex1" :options="countries"
                    :label="t('pages.forms.select.examples.basic.label')"
                    :placeholder="t('pages.forms.select.examples.basic.placeholder')"
                    class="w-64"
                />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.select.examples.searchable.title')"
                :description="t('pages.forms.select.examples.searchable.desc')"
                :code="searchableCode"
            >
                <Select v-model="ex2" :options="grouped"
                    :label="t('pages.forms.select.examples.searchable.label')"
                    searchable
                    :placeholder="t('pages.forms.select.examples.searchable.placeholder')"
                    class="w-64"
                />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.select.examples.grouped.title')"
                :description="t('pages.forms.select.examples.grouped.desc')"
                :code="groupedCode"
            >
                <Select v-model="ex3" :options="grouped" :label="t('pages.forms.select.examples.grouped.label')" class="w-64" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.select.examples.sizes.title')"
                :description="t('pages.forms.select.examples.sizes.desc')"
                :code="sizesCode"
            >
                <Select :options="countries" size="small"  placeholder="Small"  class="w-40" />
                <Select :options="countries" size="medium" placeholder="Medium" class="w-40" />
                <Select :options="countries" size="large"  placeholder="Large"  class="w-40" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.select.examples.states.title')"
                :description="t('pages.forms.select.examples.states.desc')"
                :code="statesCode"
            >
                <Select :options="countries"
                    :label="t('pages.forms.select.examples.states.loadingLabel')"
                    loading
                    :placeholder="t('pages.forms.select.examples.states.loadingPh')"
                    class="w-48"
                />
                <Select :options="countries"
                    :label="t('pages.forms.select.examples.states.disabledLabel')"
                    disabled
                    :placeholder="t('pages.forms.select.examples.states.disabledPh')"
                    class="w-48"
                />
                <Select :options="countries"
                    :label="t('pages.forms.select.examples.states.errorLabel')"
                    :error-text="t('pages.forms.select.examples.states.errorText')"
                    class="w-48"
                />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
