<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Banner from '../../../components/feedback/Banner.vue';
import Button from '../../../components/forms/Button.vue';
import { SparklesIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbDots from '../../components/toolbar/TbDots.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep from '../../components/toolbar/TbSep.vue';

const { t } = useI18n();

const pgColor       = ref<'info' | 'success' | 'warning' | 'danger'>('info');
const pgVariant     = ref<'subtle' | 'filled' | 'outline'>('subtle');
const pgDismissable = ref(false);
const pgShowIcon    = ref(true);
const pgVisible     = ref(true);

function resetPlayground() {
    pgColor.value       = 'info';
    pgVariant.value     = 'subtle';
    pgDismissable.value = false;
    pgShowIcon.value    = true;
    pgVisible.value     = true;
}

const colorDots = [
    { value: 'info'    as const, bg: 'var(--color-blue-500)',    label: 'Info'    },
    { value: 'success' as const, bg: 'var(--color-emerald-500)', label: 'Success' },
    { value: 'warning' as const, bg: 'var(--color-amber-500)',   label: 'Warning' },
    { value: 'danger'  as const, bg: 'var(--color-red-500)',     label: 'Danger'  },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgColor.value   !== 'info')   parts.push(`color="${pgColor.value}"`);
    if (pgVariant.value !== 'subtle') parts.push(`variant="${pgVariant.value}"`);
    if (pgDismissable.value)          parts.push('dismissable');
    if (!pgShowIcon.value)            parts.push(':show-icon="false"');
    parts.push(`title="${t('pages.feedback.banner.demo.infoTitle')}"`);
    parts.push(`description="${t('pages.feedback.banner.demo.infoDesc')}"`);
    return `<Banner ${parts.join(' ')} />`;
});

const colorsCode = `<Banner color="info"    title="…" description="…" />
<Banner color="success" title="…" description="…" />
<Banner color="warning" title="…" description="…" />
<Banner color="danger"  title="…" description="…" />`;

const variantsCode = `<Banner color="info" variant="filled"  title="Filled"  />
<Banner color="info" variant="subtle"  title="Subtle"  />
<Banner color="info" variant="outline" title="Outline" />`;

const actionCode = `<Banner color="warning" title="…" description="…">
  <template #actions>
    <Button color="warning" size="small">…</Button>
  </template>
</Banner>`;

const dismissCode = `<Banner color="info" title="…" description="…" dismissable />`;

const iconCode = `<Banner color="info" :icon="SparklesIcon" title="…" description="…" />`;

const propsList = computed<PropDoc[]>(() => [
    { name: 'color',            type: "'info' | 'success' | 'warning' | 'danger'",       default: "'info'",     description: t('pages.feedback.banner.props.color') },
    { name: 'variant',          type: "'filled' | 'subtle' | 'outline'",                  default: "'subtle'",   description: t('pages.feedback.banner.props.variant') },
    { name: 'title',            type: 'string',                                                                   description: t('pages.feedback.banner.props.title') },
    { name: 'description',      type: 'string',                                                                   description: t('pages.feedback.banner.props.description') },
    { name: 'dismissable',      type: 'boolean',                                          default: 'false',       description: t('pages.feedback.banner.props.dismissable') },
    { name: 'dismissAnimation', type: "'collapse' | 'shrink'",                            default: "'collapse'",  description: t('pages.feedback.banner.props.dismissAnimation') },
    { name: 'icon',             type: 'Component',                                                                description: t('pages.feedback.banner.props.icon') },
    { name: 'showIcon',         type: 'boolean',                                          default: 'true',        description: t('pages.feedback.banner.props.showIcon') },
    { name: 'position',         type: "'inline' | 'sticky-top' | 'sticky-bottom'",        default: "'inline'",    description: t('pages.feedback.banner.props.position') },
    { name: 'fullWidth',        type: 'boolean',                                          default: 'false',       description: t('pages.feedback.banner.props.fullWidth') },
    { name: 'radius',           type: "'none' | 'small' | 'medium' | 'large' | 'full'",                          description: t('pages.feedback.banner.props.radius') },
]);

const emitsList = computed<EmitDoc[]>(() => [
    { name: 'dismiss', payload: '—', description: t('pages.feedback.banner.emits.dismiss') },
]);

const slotsList = computed<SlotDoc[]>(() => [
    { name: 'default', description: t('pages.feedback.banner.slots.default') },
    { name: 'actions', description: t('pages.feedback.banner.slots.actions') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.feedback.banner.title')"
        :category="t('pages.feedback.banner.category')"
        import-path="import { Banner } from 'mood-ui'"
        :description="t('pages.feedback.banner.description')"
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <TbDots label="Color" :options="colorDots" v-model="pgColor" />
                    <TbSep />
                    <TbPills label="Variant" :options="[{value:'subtle'},{value:'filled'},{value:'outline'}]" v-model="pgVariant" />
                    <TbSep />
                    <TbToggle label="Dismissable" v-model="pgDismissable" />
                    <TbToggle label="Icon" v-model="pgShowIcon" />
                </template>

                <Banner
                    v-if="pgVisible"
                    class="w-full max-w-md"
                    :color="pgColor"
                    :variant="pgVariant"
                    :dismissable="pgDismissable"
                    :show-icon="pgShowIcon"
                    :title="t('pages.feedback.banner.demo.infoTitle')"
                    :description="t('pages.feedback.banner.demo.infoDesc')"
                    @dismiss="pgVisible = false"
                />
                <button
                    v-else
                    type="button"
                    class="text-sm text-primary underline"
                    @click="pgVisible = true"
                >{{ t('pages.feedback.banner.demo.showAgain') }}</button>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                :title="t('pages.feedback.banner.examples.colors.title')"
                :description="t('pages.feedback.banner.examples.colors.desc')"
                :code="colorsCode"
            >
                <div class="flex flex-col gap-2 w-full max-w-md">
                    <Banner color="info"    :title="t('pages.feedback.banner.demo.infoTitle')"    :description="t('pages.feedback.banner.demo.infoDesc')" />
                    <Banner color="success" :title="t('pages.feedback.banner.demo.successTitle')" :description="t('pages.feedback.banner.demo.successDesc')" />
                    <Banner color="warning" :title="t('pages.feedback.banner.demo.warnTitle')"    :description="t('pages.feedback.banner.demo.warnDesc')" />
                    <Banner color="danger"  :title="t('pages.feedback.banner.demo.errTitle')"     :description="t('pages.feedback.banner.demo.errDesc')" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.banner.examples.variants.title')"
                :description="t('pages.feedback.banner.examples.variants.desc')"
                :code="variantsCode"
            >
                <div class="flex flex-col gap-2 w-full max-w-md">
                    <Banner color="info" variant="filled"  :title="t('pages.feedback.banner.demo.filledTitle')"  :description="t('pages.feedback.banner.demo.filledDesc')" />
                    <Banner color="info" variant="subtle"  :title="t('pages.feedback.banner.demo.subtleTitle')"  :description="t('pages.feedback.banner.demo.subtleDesc')" />
                    <Banner color="info" variant="outline" :title="t('pages.feedback.banner.demo.outlineTitle')" :description="t('pages.feedback.banner.demo.outlineDesc')" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.banner.examples.action.title')"
                :description="t('pages.feedback.banner.examples.action.desc')"
                :code="actionCode"
            >
                <Banner
                    class="w-full max-w-md"
                    color="warning"
                    :title="t('pages.feedback.banner.demo.renewTitle')"
                    :description="t('pages.feedback.banner.demo.renewDesc')"
                >
                    <template #actions>
                        <Button color="warning" size="small">{{ t('pages.feedback.banner.demo.renewBtn') }}</Button>
                    </template>
                </Banner>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.banner.examples.dismiss.title')"
                :description="t('pages.feedback.banner.examples.dismiss.desc')"
                :code="dismissCode"
            >
                <Banner
                    class="w-full max-w-md"
                    color="info"
                    :title="t('pages.feedback.banner.demo.tipTitle')"
                    :description="t('pages.feedback.banner.demo.tipDesc')"
                    dismissable
                />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.banner.examples.icon.title')"
                :description="t('pages.feedback.banner.examples.icon.desc')"
                :code="iconCode"
            >
                <Banner
                    class="w-full max-w-md"
                    color="info"
                    :icon="SparklesIcon"
                    :title="t('pages.feedback.banner.demo.newTitle')"
                    :description="t('pages.feedback.banner.demo.newDesc')"
                />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
