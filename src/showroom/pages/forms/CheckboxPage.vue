<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Checkbox from '../../../components/forms/Checkbox.vue';
import type { PropDoc, EmitDoc } from '../../types';
import TbPills  from '../../components/toolbar/TbPills.vue';
import TbDots   from '../../components/toolbar/TbDots.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep    from '../../components/toolbar/TbSep.vue';

const { t } = useI18n();

// ── Overview playground state ─────────────────────────────────────────────────
const pgChecked       = ref(true);
const pgColor         = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize          = ref<'small' | 'medium' | 'large'>('medium');
const pgIndeterminate = ref(false);
const pgDisabled      = ref(false);
const pgLoading       = ref(false);

function resetPlayground() {
    pgChecked.value       = true;
    pgColor.value         = 'primary';
    pgSize.value          = 'medium';
    pgIndeterminate.value = false;
    pgDisabled.value      = false;
    pgLoading.value       = false;
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
    if (pgColor.value !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value  !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgIndeterminate.value)       parts.push(':indeterminate="true"');
    if (pgDisabled.value)            parts.push(':disabled="true"');
    if (pgLoading.value)             parts.push(':loading="true"');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Checkbox v-model="checked" label="Acepto los términos"${attrs} />`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<Checkbox v-model="terms"      label="Acepto los términos" />
<Checkbox v-model="newsletter" label="Suscribirme al newsletter" />`;

const descriptionCode = `<Checkbox
    label="Notificaciones"
    description="Recibe alertas por email cuando hay actividad."
/>`;

const indeterminateCode = `<Checkbox :indeterminate="true" :model-value="false" label="Selección parcial" />`;

const colorsCode = `<Checkbox :model-value="true" color="primary" label="primary" />
<Checkbox :model-value="true" color="success" label="success" />
<Checkbox :model-value="true" color="warning" label="warning" />
<Checkbox :model-value="true" color="danger"  label="danger" />`;

const sizesCode = `<Checkbox :model-value="true" size="small"  label="small" />
<Checkbox :model-value="true" size="medium" label="medium" />
<Checkbox :model-value="true" size="large"  label="large" />`;

const disabledCode = `<Checkbox :model-value="true"  disabled label="Disabled marcado" />
<Checkbox :model-value="false" disabled label="Disabled vacío" />`;

// Example state
const ex1A = ref(true);
const ex1B = ref(false);

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
    { name: 'modelValue',    type: 'boolean',                                                            default: 'false',    description: t('pages.forms.checkbox.props.modelValue') },
    { name: 'label',         type: 'string',                                                                                  description: t('pages.forms.checkbox.props.label') },
    { name: 'description',   type: 'string',                                                                                  description: t('pages.forms.checkbox.props.description') },
    { name: 'helperText',    type: 'string',                                                                                  description: t('pages.forms.checkbox.props.helperText') },
    { name: 'errorText',     type: 'string',                                                                                  description: t('pages.forms.checkbox.props.errorText') },
    { name: 'color',         type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",           default: "'default'", description: t('pages.forms.checkbox.props.color') },
    { name: 'size',          type: "'small' | 'medium' | 'large'",                                       default: "'medium'", description: t('pages.forms.checkbox.props.size') },
    { name: 'radius',        type: "'none' | 'small' | 'medium' | 'large' | 'full'",                     default: "'small'",  description: t('pages.forms.checkbox.props.radius') },
    { name: 'indeterminate', type: 'boolean',                                                            default: 'false',    description: t('pages.forms.checkbox.props.indeterminate') },
    { name: 'disabled',      type: 'boolean',                                                            default: 'false',    description: t('pages.forms.checkbox.props.disabled') },
    { name: 'readonly',      type: 'boolean',                                                            default: 'false',    description: t('pages.forms.checkbox.props.readonly') },
    { name: 'required',      type: 'boolean',                                                            default: 'false',    description: t('pages.forms.checkbox.props.required') },
    { name: 'loading',       type: 'boolean',                                                            default: 'false',    description: t('pages.forms.checkbox.props.loading') },
    { name: 'name',          type: 'string',                                                                                  description: t('pages.forms.checkbox.props.name') },
    { name: 'value',         type: 'string | number',                                                                         description: t('pages.forms.checkbox.props.value') },
    { name: 'id',            type: 'string',                                                                                  description: t('pages.forms.checkbox.props.id') },
    { name: 'ariaLabel',     type: 'string',                                                                                  description: t('pages.forms.checkbox.props.ariaLabel') },
]);

const emitsList = computed<EmitDoc[]>(() => [
    { name: 'update:modelValue', payload: 'boolean', description: t('pages.forms.checkbox.emits.updateModelValue') },
    { name: 'change',            payload: 'boolean', description: t('pages.forms.checkbox.emits.change') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.forms.checkbox.title')"
        category="Forms"
        import-path="import { Checkbox } from 'mood-ui'"
        :description="t('pages.forms.checkbox.description')"
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="180px" @reset="resetPlayground">
                <template #controls>
                    <TbDots :label="t('pages.forms.checkbox.controls.color')" :options="colorDots" v-model="pgColor" />
                    <TbSep />
                    <TbPills :label="t('pages.forms.checkbox.controls.size')" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbToggle :label="t('pages.forms.checkbox.controls.indeterminate')" v-model="pgIndeterminate" />
                    <TbToggle :label="t('pages.forms.checkbox.controls.loading')" v-model="pgLoading" />
                    <TbToggle :label="t('pages.forms.checkbox.controls.disabled')" v-model="pgDisabled" />
                </template>

                <Checkbox
                    v-model="pgChecked"
                    :label="t('pages.forms.checkbox.playground.label')"
                    :color="pgColor"
                    :size="pgSize"
                    :indeterminate="pgIndeterminate"
                    :loading="pgLoading"
                    :disabled="pgDisabled"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                :title="t('pages.forms.checkbox.examples.basic.title')"
                :description="t('pages.forms.checkbox.examples.basic.desc')"
                :code="basicCode"
            >
                <div class="flex flex-col gap-3">
                    <Checkbox v-model="ex1A" :label="t('pages.forms.checkbox.examples.basic.label1')" />
                    <Checkbox v-model="ex1B" :label="t('pages.forms.checkbox.examples.basic.label2')" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.checkbox.examples.description.title')"
                :description="t('pages.forms.checkbox.examples.description.desc')"
                :code="descriptionCode"
            >
                <Checkbox
                    :label="t('pages.forms.checkbox.examples.description.label')"
                    :description="t('pages.forms.checkbox.examples.description.helpText')"
                />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.checkbox.examples.indeterminate.title')"
                :description="t('pages.forms.checkbox.examples.indeterminate.desc')"
                :code="indeterminateCode"
            >
                <Checkbox :indeterminate="true" :model-value="false" :label="t('pages.forms.checkbox.examples.indeterminate.label')" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.checkbox.examples.colors.title')"
                :description="t('pages.forms.checkbox.examples.colors.desc')"
                :code="colorsCode"
            >
                <Checkbox :model-value="true" color="primary" label="primary" />
                <Checkbox :model-value="true" color="success" label="success" />
                <Checkbox :model-value="true" color="warning" label="warning" />
                <Checkbox :model-value="true" color="danger"  label="danger" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.checkbox.examples.sizes.title')"
                :description="t('pages.forms.checkbox.examples.sizes.desc')"
                :code="sizesCode"
            >
                <Checkbox :model-value="true" size="small"  label="small" />
                <Checkbox :model-value="true" size="medium" label="medium" />
                <Checkbox :model-value="true" size="large"  label="large" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.checkbox.examples.disabled.title')"
                :description="t('pages.forms.checkbox.examples.disabled.desc')"
                :code="disabledCode"
            >
                <Checkbox :model-value="true"  disabled :label="t('pages.forms.checkbox.examples.disabled.checked')" />
                <Checkbox :model-value="false" disabled :label="t('pages.forms.checkbox.examples.disabled.empty')" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
