<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import ColorPicker from '../../../components/forms/ColorPicker.vue';
import type { PropDoc, EmitDoc } from '../../types';
import TbPills  from '../../components/toolbar/TbPills.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep    from '../../components/toolbar/TbSep.vue';

const { t } = useI18n();

const brandSwatches = [
    '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
    '#ec4899', '#ef4444', '#f59e0b', '#22c55e',
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue    = ref('#6366f1');
const pgSize     = ref<'small' | 'medium' | 'large'>('medium');
const pgVariant  = ref<'outline' | 'filled'>('outline');
const pgAdvanced = ref(true);
const pgShowHex  = ref(true);
const pgSwatches = ref(true);
const pgDisabled = ref(false);

function resetPlayground() {
    pgValue.value    = '#6366f1';
    pgSize.value     = 'medium';
    pgVariant.value  = 'outline';
    pgAdvanced.value = true;
    pgShowHex.value  = true;
    pgSwatches.value = true;
    pgDisabled.value = false;
}

const overviewCode = computed(() => {
    const parts: string[] = ['v-model="color"'];
    if (pgSize.value !== 'medium')    parts.push(`size="${pgSize.value}"`);
    if (pgVariant.value !== 'outline') parts.push(`variant="${pgVariant.value}"`);
    if (pgSwatches.value)             parts.push(':swatches="brandSwatches"');
    if (pgAdvanced.value)             parts.push(':advanced="true"');
    if (pgShowHex.value)              parts.push(':show-hex="true"');
    if (pgDisabled.value)             parts.push(':disabled="true"');
    return `<ColorPicker ${parts.join(' ')} />`;
});

// ── Example state ─────────────────────────────────────────────────────────────
const exBasic    = ref('#3b82f6');
const exAdvanced = ref('#6366f1');
const exSwatches = ref('#22c55e');
const exSm       = ref('#3b82f6');
const exMd       = ref('#3b82f6');
const exLg       = ref('#3b82f6');

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<ColorPicker v-model="color" />`;

const advancedCode = `<ColorPicker
    v-model="color"
    :advanced="true"
    :show-hex="true"
/>`;

const swatchesCode = `<ColorPicker
    v-model="color"
    :swatches="['#ef4444','#f59e0b','#22c55e','#3b82f6','#8b5cf6','#ec4899']"
    :show-hex="true"
    :advanced="true"
/>`;

const sizesCode = `<ColorPicker v-model="color" size="small" />
<ColorPicker v-model="color" size="medium" />
<ColorPicker v-model="color" size="large" />`;

const disabledCode = `<ColorPicker :model-value="'#3b82f6'" disabled />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
    { name: 'modelValue', type: 'string',                                                                           description: t('pages.forms.colorPicker.props.modelValue') },
    { name: 'swatches',   type: 'string[]',                                                                         description: t('pages.forms.colorPicker.props.swatches') },
    { name: 'showHex',    type: 'boolean',              default: 'true',                                            description: t('pages.forms.colorPicker.props.showHex') },
    { name: 'advanced',   type: 'boolean',              default: 'false',                                           description: t('pages.forms.colorPicker.props.advanced') },
    { name: 'disabled',   type: 'boolean',              default: 'false',                                           description: t('pages.forms.colorPicker.props.disabled') },
    { name: 'variant',    type: "'outline' | 'filled' | 'ghost'",   default: "'outline'",                           description: t('pages.forms.colorPicker.props.variant') },
    { name: 'color',      type: "'default' | 'primary' | 'danger' | 'success' | 'warning'", default: "'default'",  description: t('pages.forms.colorPicker.props.color') },
    { name: 'size',       type: "'small' | 'medium' | 'large'",     default: "'medium'",                           description: t('pages.forms.colorPicker.props.size') },
    { name: 'radius',     type: "'none' | 'small' | 'medium' | 'large' | 'full'", default: "'medium'",             description: t('pages.forms.colorPicker.props.radius') },
    { name: 'label',      type: 'string',                                                                           description: t('pages.forms.colorPicker.props.label') },
    { name: 'placement',  type: "'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'", default: "'bottom-start'", description: t('pages.forms.colorPicker.props.placement') },
    { name: 'ariaLabel',  type: 'string',                                                                           description: t('pages.forms.colorPicker.props.ariaLabel') },
]);

const emitsList = computed<EmitDoc[]>(() => [
    { name: 'update:modelValue', payload: 'string', description: t('pages.forms.colorPicker.emits.updateModelValue') },
    { name: 'change',            payload: 'string', description: t('pages.forms.colorPicker.emits.change') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.forms.colorPicker.title')"
        :category="t('pages.forms.colorPicker.category')"
        import-path="import { ColorPicker } from 'mood-ui'"
        :description="t('pages.forms.colorPicker.description')"
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="240px" @reset="resetPlayground">
                <template #controls>
                    <TbPills :label="t('pages.forms.colorPicker.controls.size')"    :options="[{value:'small'},{value:'medium'},{value:'large'}]"    v-model="pgSize" />
                    <TbPills :label="t('pages.forms.colorPicker.controls.variant')" :options="[{value:'outline'},{value:'filled'}]"                  v-model="pgVariant" />
                    <TbSep />
                    <TbToggle :label="t('pages.forms.colorPicker.controls.advanced')" v-model="pgAdvanced" />
                    <TbToggle :label="t('pages.forms.colorPicker.controls.hex')"      v-model="pgShowHex" />
                    <TbToggle :label="t('pages.forms.colorPicker.controls.swatches')" v-model="pgSwatches" />
                    <TbToggle :label="t('pages.forms.colorPicker.controls.disabled')" v-model="pgDisabled" />
                </template>

                <ColorPicker
                    v-model="pgValue"
                    :size="pgSize"
                    :variant="pgVariant"
                    :swatches="pgSwatches ? brandSwatches : []"
                    :advanced="pgAdvanced"
                    :show-hex="pgShowHex"
                    :disabled="pgDisabled"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                :title="t('pages.forms.colorPicker.examples.basic.title')"
                :description="t('pages.forms.colorPicker.examples.basic.desc')"
                :code="basicCode"
            >
                <ColorPicker v-model="exBasic" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.colorPicker.examples.advanced.title')"
                :description="t('pages.forms.colorPicker.examples.advanced.desc')"
                :code="advancedCode"
            >
                <ColorPicker
                    v-model="exAdvanced"
                    :advanced="true"
                    :show-hex="true"
                />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.colorPicker.examples.swatches.title')"
                :description="t('pages.forms.colorPicker.examples.swatches.desc')"
                :code="swatchesCode"
            >
                <ColorPicker
                    v-model="exSwatches"
                    :swatches="['#ef4444','#f59e0b','#22c55e','#3b82f6','#8b5cf6','#ec4899']"
                    :show-hex="true"
                    :advanced="true"
                />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.colorPicker.examples.sizes.title')"
                :description="t('pages.forms.colorPicker.examples.sizes.desc')"
                :code="sizesCode"
            >
                <div class="flex items-center gap-3">
                    <ColorPicker v-model="exSm" size="small" />
                    <ColorPicker v-model="exMd" size="medium" />
                    <ColorPicker v-model="exLg" size="large" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.colorPicker.examples.disabled.title')"
                :description="t('pages.forms.colorPicker.examples.disabled.desc')"
                :code="disabledCode"
            >
                <ColorPicker :model-value="'#3b82f6'" disabled />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
