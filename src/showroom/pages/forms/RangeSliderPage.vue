<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import RangeSlider from '../../../components/forms/RangeSlider.vue';
import type { PropDoc, EmitDoc } from '../../types';
import TbPills  from '../../components/toolbar/TbPills.vue';
import TbDots   from '../../components/toolbar/TbDots.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep    from '../../components/toolbar/TbSep.vue';

const { t } = useI18n();

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue    = ref<[number, number]>([20, 70]);
const pgColor    = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize     = ref<'small' | 'medium' | 'large'>('medium');
const pgMarks    = ref(false);
const pgDisabled = ref(false);
const pgReadonly = ref(false);

function resetPlayground() {
    pgValue.value    = [20, 70];
    pgColor.value    = 'primary';
    pgSize.value     = 'medium';
    pgMarks.value    = false;
    pgDisabled.value = false;
    pgReadonly.value = false;
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
    if (pgMarks.value)               parts.push(':marks="true"');
    if (pgDisabled.value)            parts.push(':disabled="true"');
    if (pgReadonly.value)            parts.push(':readonly="true"');
    const attrs = parts.length ? '\n    ' + parts.join('\n    ') : '';
    return `<RangeSlider
    v-model="range"
    :min="0"
    :max="100"
    show-value${attrs}
/>`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<RangeSlider v-model="range" show-value label="Rango" />`;

const marksCode = `<RangeSlider
    v-model="range"
    :min="0"
    :max="100"
    :step="20"
    :marks="true"
    label="Edad"
    show-value
/>`;

const formattedCode = `<RangeSlider
    v-model="price"
    :min="0"
    :max="1000"
    :step="10"
    :format-value="(v) => '€' + v"
    show-value
    label="Precio"
/>`;

const colorCode = `<RangeSlider v-model="range" color="success" show-value label="Success" />
<RangeSlider v-model="range" color="warning" show-value label="Warning" />
<RangeSlider v-model="range" color="danger"  show-value label="Danger" />`;

const disabledCode = `<RangeSlider :model-value="[30, 70]" disabled show-value label="Disabled" />`;

const ex1 = ref<[number, number]>([20, 80]);
const ex2 = ref<[number, number]>([20, 80]);
const ex3 = ref<[number, number]>([100, 600]);
const ex4a = ref<[number, number]>([20, 70]);
const ex4b = ref<[number, number]>([20, 70]);
const ex4c = ref<[number, number]>([20, 70]);

const formatPrice = (v: number) => '€' + v;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
    { name: 'modelValue',  type: '[number, number]',                                                    description: t('pages.forms.rangeSlider.props.modelValue') },
    { name: 'min',         type: 'number',                                              default: '0',  description: t('pages.forms.rangeSlider.props.min') },
    { name: 'max',         type: 'number',                                              default: '100',description: t('pages.forms.rangeSlider.props.max') },
    { name: 'step',        type: 'number',                                              default: '1',  description: t('pages.forms.rangeSlider.props.step') },
    { name: 'minDistance', type: 'number',                                                              description: t('pages.forms.rangeSlider.props.minDistance') },
    { name: 'showValue',   type: 'boolean',                                             default: 'false', description: t('pages.forms.rangeSlider.props.showValue') },
    { name: 'formatValue', type: '(v: number) => string',                                              description: t('pages.forms.rangeSlider.props.formatValue') },
    { name: 'marks',       type: 'boolean | number[] | { value, label? }[]',                           description: t('pages.forms.rangeSlider.props.marks') },
    { name: 'orientation', type: "'horizontal' | 'vertical'",                          default: "'horizontal'", description: t('pages.forms.rangeSlider.props.orientation') },
    { name: 'label',       type: 'string',                                                             description: t('pages.forms.rangeSlider.props.label') },
    { name: 'helperText',  type: 'string',                                                             description: t('pages.forms.rangeSlider.props.helperText') },
    { name: 'errorText',   type: 'string',                                                             description: t('pages.forms.rangeSlider.props.errorText') },
    { name: 'color',       type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: t('pages.forms.rangeSlider.props.color') },
    { name: 'size',        type: "'small' | 'medium' | 'large'",                        default: "'medium'", description: t('pages.forms.rangeSlider.props.size') },
    { name: 'radius',      type: "'none' | 'small' | 'medium' | 'large' | 'full'",      default: "'full'",   description: t('pages.forms.rangeSlider.props.radius') },
    { name: 'fullWidth',   type: 'boolean',                                             default: 'false', description: t('pages.forms.rangeSlider.props.fullWidth') },
    { name: 'disabled',    type: 'boolean',                                             default: 'false', description: t('pages.forms.rangeSlider.props.disabled') },
    { name: 'readonly',    type: 'boolean',                                             default: 'false', description: t('pages.forms.rangeSlider.props.readonly') },
    { name: 'required',    type: 'boolean',                                             default: 'false', description: t('pages.forms.rangeSlider.props.required') },
]);

const emitsList = computed<EmitDoc[]>(() => [
    { name: 'update:modelValue', payload: '[number, number]', description: t('pages.forms.rangeSlider.emits.updateModelValue') },
    { name: 'change',            payload: '[number, number]', description: t('pages.forms.rangeSlider.emits.change') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.forms.rangeSlider.title')"
        category="Forms"
        import-path="import { RangeSlider } from 'mood-ui'"
        :description="t('pages.forms.rangeSlider.description')"
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <TbDots :label="t('pages.forms.rangeSlider.controls.color')" :options="colorDots" v-model="pgColor" />
                    <TbSep />
                    <TbPills :label="t('pages.forms.rangeSlider.controls.size')" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbToggle :label="t('pages.forms.rangeSlider.controls.marks')" v-model="pgMarks" />
                    <TbToggle :label="t('pages.forms.rangeSlider.controls.disabled')" v-model="pgDisabled" />
                    <TbToggle :label="t('pages.forms.rangeSlider.controls.readonly')" v-model="pgReadonly" />
                </template>

                <RangeSlider
                    v-model="pgValue"
                    :min="0"
                    :max="100"
                    :color="pgColor"
                    :size="pgSize"
                    :marks="pgMarks"
                    :disabled="pgDisabled"
                    :readonly="pgReadonly"
                    show-value
                    :label="t('pages.forms.rangeSlider.playground.label')"
                    class="w-72"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                :title="t('pages.forms.rangeSlider.examples.basic.title')"
                :description="t('pages.forms.rangeSlider.examples.basic.desc')"
                :code="basicCode"
            >
                <RangeSlider v-model="ex1" show-value :label="t('pages.forms.rangeSlider.examples.basic.label')" class="w-72" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.rangeSlider.examples.marks.title')"
                :description="t('pages.forms.rangeSlider.examples.marks.desc')"
                :code="marksCode"
            >
                <RangeSlider v-model="ex2" :min="0" :max="100" :step="20" :marks="true" :label="t('pages.forms.rangeSlider.examples.marks.label')" show-value class="w-72" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.rangeSlider.examples.formatted.title')"
                :description="t('pages.forms.rangeSlider.examples.formatted.desc')"
                :code="formattedCode"
            >
                <RangeSlider
                    v-model="ex3"
                    :min="0"
                    :max="1000"
                    :step="10"
                    :format-value="formatPrice"
                    show-value
                    :label="t('pages.forms.rangeSlider.examples.formatted.label')"
                    class="w-72"
                />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.rangeSlider.examples.colors.title')"
                :description="t('pages.forms.rangeSlider.examples.colors.desc')"
                :code="colorCode"
            >
                <div class="flex flex-col gap-4">
                    <RangeSlider v-model="ex4a" color="success" show-value label="Success" class="w-72" />
                    <RangeSlider v-model="ex4b" color="warning" show-value label="Warning" class="w-72" />
                    <RangeSlider v-model="ex4c" color="danger"  show-value label="Danger"  class="w-72" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.rangeSlider.examples.disabled.title')"
                :description="t('pages.forms.rangeSlider.examples.disabled.desc')"
                :code="disabledCode"
            >
                <RangeSlider :model-value="[30, 70]" disabled show-value :label="t('pages.forms.rangeSlider.examples.disabled.label')" class="w-72" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
