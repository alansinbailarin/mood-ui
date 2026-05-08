<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Button from '../../../components/forms/Button.vue';
import { HeartIcon, ArrowRightIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';
import TbPills  from '../../components/toolbar/TbPills.vue';
import TbDots   from '../../components/toolbar/TbDots.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep    from '../../components/toolbar/TbSep.vue';

const { t } = useI18n();

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant  = ref<'normal' | 'outline' | 'ghost' | 'text'>('normal');
const pgColor    = ref<'default' | 'primary' | 'danger' | 'success' | 'warning'>('primary');
const pgSize     = ref<'xs' | 'small' | 'medium' | 'large'>('medium');
const pgLoading  = ref(false);
const pgDisabled  = ref(false);
const pgFullWidth = ref(false);

function resetPlayground() {
    pgVariant.value   = 'normal';
    pgColor.value     = 'primary';
    pgSize.value      = 'medium';
    pgLoading.value   = false;
    pgDisabled.value  = false;
    pgFullWidth.value = false;
}

const colorDots = [
    { value: 'default'  as const, bg: 'var(--color-slate-400)',   label: 'Default'  },
    { value: 'primary'  as const, bg: 'var(--primary)',            label: 'Primary'  },
    { value: 'success'  as const, bg: 'var(--color-emerald-500)', label: 'Success'  },
    { value: 'warning'  as const, bg: 'var(--color-amber-500)',   label: 'Warning'  },
    { value: 'danger'   as const, bg: 'var(--color-red-500)',     label: 'Danger'   },
];

// Reactive code — only non-default attrs appear
const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgVariant.value  !== 'normal')  parts.push(`variant="${pgVariant.value}"`);
    if (pgColor.value    !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value     !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgLoading.value)                parts.push(':loading="true"');
    if (pgDisabled.value)               parts.push(':disabled="true"');
    if (pgFullWidth.value)              parts.push(':full-width="true"');

    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Button${attrs}>Click me</Button>`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const variantsCode = `<Button variant="normal"  color="primary">Normal</Button>
<Button variant="outline" color="primary">Outline</Button>
<Button variant="ghost"   color="primary">Ghost</Button>
<Button variant="text"    color="primary">Text</Button>`;

const colorsCode = `<Button color="default">Default</Button>
<Button color="primary">Primary</Button>
<Button color="success">Success</Button>
<Button color="warning">Warning</Button>
<Button color="danger">Danger</Button>`;

const sizesCode = `<Button size="xs"     color="primary">XS</Button>
<Button size="small"  color="primary">Small</Button>
<Button size="medium" color="primary">Medium</Button>
<Button size="large"  color="primary">Large</Button>`;

const iconsCode = `<Button :icon="HeartIcon"     color="danger"   variant="outline">Me gusta</Button>
<Button :icon="ArrowRightIcon" icon-position="right" color="primary">Continuar</Button>
<Button :icon="HeartIcon"      color="primary" aria-label="Like" />`;

const statesCode = `<Button loading                          color="primary">Guardando…</Button>
<Button loading loading-text="Procesando" color="primary">Enviar</Button>
<Button disabled                          color="primary">Disabled</Button>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
    { name: 'variant',      type: "'normal' | 'outline' | 'ghost' | 'text'",                   default: "'normal'",  description: t('pages.forms.button.props.variant') },
    { name: 'color',        type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",  default: "'default'", description: t('pages.forms.button.props.color') },
    { name: 'size',         type: "'xs' | 'small' | 'medium' | 'large'",                       default: "'medium'",  description: t('pages.forms.button.props.size') },
    { name: 'label',        type: 'string',                                                                           description: t('pages.forms.button.props.label') },
    { name: 'loading',      type: 'boolean',                                                    default: 'false',     description: t('pages.forms.button.props.loading') },
    { name: 'loadingText',  type: 'string',                                                                           description: t('pages.forms.button.props.loadingText') },
    { name: 'disabled',     type: 'boolean',                                                    default: 'false',     description: t('pages.forms.button.props.disabled') },
    { name: 'icon',         type: 'Component',                                                                        description: t('pages.forms.button.props.icon') },
    { name: 'iconPosition', type: "'left' | 'right'",                                          default: "'left'",    description: t('pages.forms.button.props.iconPosition') },
    { name: 'fullWidth',    type: 'boolean',                                                    default: 'false',     description: t('pages.forms.button.props.fullWidth') },
    { name: 'as',           type: 'string | Component',                                         default: "'button'",  description: t('pages.forms.button.props.as') },
    { name: 'ariaLabel',    type: 'string',                                                                           description: t('pages.forms.button.props.ariaLabel') },
]);

const emitsList = computed<EmitDoc[]>(() => [
    { name: 'click', payload: 'MouseEvent', description: t('pages.forms.button.emits.click') },
]);

const slotsList = computed<SlotDoc[]>(() => [
    { name: 'default', description: t('pages.forms.button.slots.default') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.forms.button.title')"
        :category="t('pages.forms.button.category')"
        import-path="import { Button } from 'mood-ui'"
        :description="t('pages.forms.button.description')"
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" @reset="resetPlayground">
                <template #controls>
                    <TbPills label="Variant" :options="[{value:'normal'},{value:'outline'},{value:'ghost'},{value:'text'}]" v-model="pgVariant" />
                    <TbSep />
                    <TbDots label="Color" :options="colorDots" v-model="pgColor" />
                    <TbSep />
                    <TbPills label="Size" :options="[{value:'xs'},{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbToggle label="Loading" v-model="pgLoading" />
                    <TbToggle label="Disabled" v-model="pgDisabled" />
                    <TbToggle label="Full width" v-model="pgFullWidth" />
                </template>

                <Button
                    :variant="pgVariant"
                    :color="pgColor"
                    :size="pgSize"
                    :loading="pgLoading"
                    :disabled="pgDisabled"
                    :full-width="pgFullWidth"
                >
                    Click me
                </Button>
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                :title="t('pages.forms.button.examples.variants.title')"
                :description="t('pages.forms.button.examples.variants.desc')"
                :code="variantsCode"
            >
                <Button variant="normal"  color="primary">Normal</Button>
                <Button variant="outline" color="primary">Outline</Button>
                <Button variant="ghost"   color="primary">Ghost</Button>
                <Button variant="text"    color="primary">Text</Button>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.button.examples.colors.title')"
                :description="t('pages.forms.button.examples.colors.desc')"
                :code="colorsCode"
            >
                <Button color="default">Default</Button>
                <Button color="primary">Primary</Button>
                <Button color="success">Success</Button>
                <Button color="warning">Warning</Button>
                <Button color="danger">Danger</Button>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.button.examples.sizes.title')"
                :description="t('pages.forms.button.examples.sizes.desc')"
                :code="sizesCode"
            >
                <Button size="xs"     color="primary">XS</Button>
                <Button size="small"  color="primary">Small</Button>
                <Button size="medium" color="primary">Medium</Button>
                <Button size="large"  color="primary">Large</Button>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.button.examples.icons.title')"
                :description="t('pages.forms.button.examples.icons.desc')"
                :code="iconsCode"
            >
                <Button :icon="HeartIcon"      color="danger"   variant="outline">Me gusta</Button>
                <Button :icon="ArrowRightIcon" icon-position="right" color="primary">Continuar</Button>
                <Button :icon="HeartIcon"      color="primary"  aria-label="Like" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.button.examples.states.title')"
                :description="t('pages.forms.button.examples.states.desc')"
                :code="statesCode"
            >
                <Button loading                           color="primary">Guardando…</Button>
                <Button loading loading-text="Procesando" color="primary">Enviar</Button>
                <Button disabled                          color="primary">Disabled</Button>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
