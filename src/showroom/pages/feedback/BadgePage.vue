<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Badge from '../../../components/feedback/Badge.vue';
import { CheckCircleIcon, StarIcon, BoltIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbDots from '../../components/toolbar/TbDots.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep from '../../components/toolbar/TbSep.vue';

const { t } = useI18n();

const pgVariant   = ref<'solid' | 'subtle' | 'outline'>('subtle');
const pgColor     = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize      = ref<'small' | 'medium' | 'large'>('medium');
const pgDot       = ref(false);
const pgRemovable = ref(false);
const pgGradient  = ref(false);

function resetPlayground() {
    pgVariant.value   = 'subtle';
    pgColor.value     = 'primary';
    pgSize.value      = 'medium';
    pgDot.value       = false;
    pgRemovable.value = false;
    pgGradient.value  = false;
}

const colorDots = [
    { value: 'default' as const, bg: 'var(--color-slate-400)',   label: 'Default' },
    { value: 'primary' as const, bg: 'var(--primary)',           label: 'Primary' },
    { value: 'success' as const, bg: 'var(--color-emerald-500)', label: 'Success' },
    { value: 'warning' as const, bg: 'var(--color-amber-500)',   label: 'Warning' },
    { value: 'danger'  as const, bg: 'var(--color-red-500)',     label: 'Danger'  },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgVariant.value  !== 'subtle')  parts.push(`variant="${pgVariant.value}"`);
    if (pgColor.value    !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value     !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgDot.value)                    parts.push('dot');
    if (pgRemovable.value)              parts.push('removable');
    if (pgGradient.value)               parts.push('gradient');
    parts.push(`label="${t('pages.feedback.badge.demo.label')}"`);
    return `<Badge ${parts.join(' ')} />`;
});

const variantsCode = `<Badge label="Solid"   variant="solid"   color="primary" />
<Badge label="Subtle"  variant="subtle"  color="primary" />
<Badge label="Outline" variant="outline" color="primary" />`;

const colorsCode = `<Badge label="default" color="default" />
<Badge label="primary" color="primary" />
<Badge label="success" color="success" />
<Badge label="warning" color="warning" />
<Badge label="danger"  color="danger"  />`;

const iconCode = `<Badge :label="t('pages.feedback.badge.demo.active')"   :icon="CheckCircleIcon" color="success" />
<Badge :label="t('pages.feedback.badge.demo.featured')" :icon="StarIcon"        color="warning" />
<Badge :label="t('pages.feedback.badge.demo.pro')"      :icon="BoltIcon"        color="primary" variant="solid" />`;

const dotCode = `<Badge :label="t('pages.feedback.badge.demo.online')"  dot color="success" />
<Badge :label="t('pages.feedback.badge.demo.away')"    dot color="warning" />
<Badge :label="t('pages.feedback.badge.demo.offline')" dot color="default" />`;

const propsList = computed<PropDoc[]>(() => [
    { name: 'label',           type: 'string',                                                                  description: t('pages.feedback.badge.props.label') },
    { name: 'variant',         type: "'solid' | 'subtle' | 'outline'",                  default: "'subtle'",     description: t('pages.feedback.badge.props.variant') },
    { name: 'color',           type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: t('pages.feedback.badge.props.color') },
    { name: 'gradient',        type: 'boolean',                                          default: 'false',       description: t('pages.feedback.badge.props.gradient') },
    { name: 'size',            type: "'small' | 'medium' | 'large'",                                             description: t('pages.feedback.badge.props.size') },
    { name: 'radius',          type: "'none' | 'small' | 'medium' | 'large' | 'full'",                          description: t('pages.feedback.badge.props.radius') },
    { name: 'icon',            type: 'Component',                                                                description: t('pages.feedback.badge.props.icon') },
    { name: 'removable',       type: 'boolean',                                          default: 'false',       description: t('pages.feedback.badge.props.removable') },
    { name: 'dot',             type: 'boolean',                                          default: 'false',       description: t('pages.feedback.badge.props.dot') },
    { name: 'removeAriaLabel', type: 'string',                                                                   description: t('pages.feedback.badge.props.removeAriaLabel') },
]);

const emitsList = computed<EmitDoc[]>(() => [
    { name: 'remove', payload: '—', description: t('pages.feedback.badge.emits.remove') },
]);

const slotsList = computed<SlotDoc[]>(() => [
    { name: 'default', description: t('pages.feedback.badge.slots.default') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.feedback.badge.title')"
        :category="t('pages.feedback.badge.category')"
        import-path="import { Badge } from 'mood-ui'"
        :description="t('pages.feedback.badge.description')"
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="180px" @reset="resetPlayground">
                <template #controls>
                    <TbPills label="Variant" :options="[{value:'solid'},{value:'subtle'},{value:'outline'}]" v-model="pgVariant" />
                    <TbSep />
                    <TbDots label="Color" :options="colorDots" v-model="pgColor" />
                    <TbSep />
                    <TbPills label="Size" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbToggle label="Dot" v-model="pgDot" />
                    <TbToggle label="Removable" v-model="pgRemovable" />
                    <TbToggle label="Gradient" v-model="pgGradient" />
                </template>

                <Badge :variant="pgVariant" :color="pgColor" :size="pgSize" :dot="pgDot" :removable="pgRemovable" :gradient="pgGradient" :label="t('pages.feedback.badge.demo.label')" />
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                :title="t('pages.feedback.badge.examples.variants.title')"
                :description="t('pages.feedback.badge.examples.variants.desc')"
                :code="variantsCode"
            >
                <Badge label="Solid"   variant="solid"   color="primary" />
                <Badge label="Subtle"  variant="subtle"  color="primary" />
                <Badge label="Outline" variant="outline" color="primary" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.badge.examples.colors.title')"
                :description="t('pages.feedback.badge.examples.colors.desc')"
                :code="colorsCode"
            >
                <Badge label="default" color="default" variant="subtle" />
                <Badge label="primary" color="primary" variant="subtle" />
                <Badge label="success" color="success" variant="subtle" />
                <Badge label="warning" color="warning" variant="subtle" />
                <Badge label="danger"  color="danger"  variant="subtle" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.badge.examples.icon.title')"
                :description="t('pages.feedback.badge.examples.icon.desc')"
                :code="iconCode"
            >
                <Badge :label="t('pages.feedback.badge.demo.active')"   :icon="CheckCircleIcon" color="success" variant="subtle" />
                <Badge :label="t('pages.feedback.badge.demo.featured')" :icon="StarIcon"        color="warning" variant="subtle" />
                <Badge :label="t('pages.feedback.badge.demo.pro')"      :icon="BoltIcon"        color="primary" variant="solid"  />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.badge.examples.dot.title')"
                :description="t('pages.feedback.badge.examples.dot.desc')"
                :code="dotCode"
            >
                <Badge :label="t('pages.feedback.badge.demo.online')"  dot color="success" variant="subtle" />
                <Badge :label="t('pages.feedback.badge.demo.away')"    dot color="warning" variant="subtle" />
                <Badge :label="t('pages.feedback.badge.demo.offline')" dot color="default" variant="subtle" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
