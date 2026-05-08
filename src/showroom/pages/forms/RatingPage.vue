<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Rating from '../../../components/forms/Rating.vue';
import type { PropDoc, EmitDoc } from '../../types';
import TbPills  from '../../components/toolbar/TbPills.vue';
import TbDots   from '../../components/toolbar/TbDots.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep    from '../../components/toolbar/TbSep.vue';

const { t } = useI18n();

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue     = ref(3);
const pgMax       = ref('5');
const pgColor     = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('warning');
const pgSize      = ref<'small' | 'medium' | 'large'>('medium');
const pgAllowHalf = ref(false);
const pgReadonly  = ref(false);
const pgDisabled  = ref(false);

function resetPlayground() {
    pgValue.value     = 3;
    pgMax.value       = '5';
    pgColor.value     = 'warning';
    pgSize.value      = 'medium';
    pgAllowHalf.value = false;
    pgReadonly.value  = false;
    pgDisabled.value  = false;
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
    if (pgMax.value   !== '5')        parts.push(`:max="${pgMax.value}"`);
    if (pgColor.value !== 'warning')  parts.push(`color="${pgColor.value}"`);
    if (pgSize.value  !== 'medium')   parts.push(`size="${pgSize.value}"`);
    if (pgAllowHalf.value)            parts.push('allow-half');
    if (pgReadonly.value)             parts.push('readonly');
    if (pgDisabled.value)             parts.push(':disabled="true"');
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
const propsList = computed<PropDoc[]>(() => [
    { name: 'modelValue', type: 'number',                                                     default: '0',         description: t('pages.forms.rating.props.modelValue') },
    { name: 'max',        type: 'number',                                                     default: '5',         description: t('pages.forms.rating.props.max') },
    { name: 'allowHalf',  type: 'boolean',                                                    default: 'false',     description: t('pages.forms.rating.props.allowHalf') },
    { name: 'readonly',   type: 'boolean',                                                    default: 'false',     description: t('pages.forms.rating.props.readonly') },
    { name: 'disabled',   type: 'boolean',                                                    default: 'false',     description: t('pages.forms.rating.props.disabled') },
    { name: 'clearable',  type: 'boolean',                                                    default: 'true',      description: t('pages.forms.rating.props.clearable') },
    { name: 'color',      type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'warning'", description: t('pages.forms.rating.props.color') },
    { name: 'size',       type: "'small' | 'medium' | 'large'",                              default: "'medium'",  description: t('pages.forms.rating.props.size') },
    { name: 'showValue',  type: 'boolean',                                                    default: 'false',     description: t('pages.forms.rating.props.showValue') },
    { name: 'ariaLabel',  type: 'string',                                                                            description: t('pages.forms.rating.props.ariaLabel') },
]);

const emitsList = computed<EmitDoc[]>(() => [
    { name: 'update:modelValue', payload: 'number', description: t('pages.forms.rating.emits.updateModelValue') },
    { name: 'change',            payload: 'number', description: t('pages.forms.rating.emits.change') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.forms.rating.title')"
        category="Forms"
        import-path="import { Rating } from 'mood-ui'"
        :description="t('pages.forms.rating.description')"
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <TbPills :label="t('pages.forms.rating.controls.max')" :options="[{value:'3'},{value:'5'},{value:'10'}]" v-model="pgMax" />
                    <TbSep />
                    <TbDots :label="t('pages.forms.rating.controls.color')" :options="colorDots" v-model="pgColor" />
                    <TbSep />
                    <TbPills :label="t('pages.forms.rating.controls.size')" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbToggle :label="t('pages.forms.rating.controls.half')" v-model="pgAllowHalf" />
                    <TbToggle :label="t('pages.forms.rating.controls.readonly')" v-model="pgReadonly" />
                    <TbToggle :label="t('pages.forms.rating.controls.disabled')" v-model="pgDisabled" />
                </template>

                <Rating
                    v-model="pgValue"
                    :max="(Number(pgMax) as any)"
                    :color="pgColor"
                    :size="pgSize"
                    :allow-half="pgAllowHalf"
                    :readonly="pgReadonly"
                    :disabled="pgDisabled"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                :title="t('pages.forms.rating.examples.basic.title')"
                :description="t('pages.forms.rating.examples.basic.desc')"
                :code="basicCode"
            >
                <Rating v-model="ex1" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.rating.examples.half.title')"
                :description="t('pages.forms.rating.examples.half.desc')"
                :code="halfCode"
            >
                <Rating v-model="ex2" allow-half show-value />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.rating.examples.colors.title')"
                :description="t('pages.forms.rating.examples.colors.desc')"
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
                :title="t('pages.forms.rating.examples.sizes.title')"
                :description="t('pages.forms.rating.examples.sizes.desc')"
                :code="sizesCode"
            >
                <div class="flex flex-col gap-3">
                    <Rating :model-value="4" size="small"  />
                    <Rating :model-value="4" size="medium" />
                    <Rating :model-value="4" size="large"  />
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.rating.examples.readonlyDisabled.title')"
                :description="t('pages.forms.rating.examples.readonlyDisabled.desc')"
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
