<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import HStack from '../../../components/layout/HStack.vue';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep from '../../components/toolbar/TbSep.vue';
import type { PropDoc, SlotDoc } from '../../types';

const { t } = useI18n();

const pgSpacing = ref<'none' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'>('medium');
const pgAlign = ref<'start' | 'center' | 'end' | 'stretch' | 'baseline'>('center');
const pgJustify = ref<'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>('start');
const pgWrap = ref<'nowrap' | 'wrap' | 'wrap-reverse'>('nowrap');
const pgDivider = ref(false);

function resetPlayground() {
    pgSpacing.value = 'medium';
    pgAlign.value = 'center';
    pgJustify.value = 'start';
    pgWrap.value = 'nowrap';
    pgDivider.value = false;
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgSpacing.value !== 'medium') parts.push(`spacing="${pgSpacing.value}"`);
    if (pgAlign.value !== 'stretch') parts.push(`align="${pgAlign.value}"`);
    if (pgJustify.value !== 'start') parts.push(`justify="${pgJustify.value}"`);
    if (pgWrap.value !== 'nowrap') parts.push(`wrap="${pgWrap.value}"`);
    if (pgDivider.value) parts.push('divider');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<HStack${attrs}>
    <div>1</div>
    <div>2</div>
    <div>3</div>
</HStack>`;
});

const basicCode = `<HStack spacing="medium">
    <div>1</div>
    <div>2</div>
    <div>3</div>
</HStack>`;

const gapCode = `<HStack spacing="xsmall"><!-- ... --></HStack>
<HStack spacing="small"><!-- ... --></HStack>
<HStack spacing="medium"><!-- ... --></HStack>
<HStack spacing="large"><!-- ... --></HStack>`;

const alignmentsCode = `<HStack justify="start"   align="center">…</HStack>
<HStack justify="center"  align="center">…</HStack>
<HStack justify="end"     align="center">…</HStack>
<HStack justify="between" align="center">…</HStack>`;

const wrapCode = `<HStack spacing="small" wrap="wrap">
    <div v-for="n in 8" :key="n">{{ n }}</div>
</HStack>`;

const propsList = computed<PropDoc[]>(() => [
    { name: 'spacing',    type: "'none' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'", default: "'medium'", description: t('pages.layout.hstack.props.spacing') },
    { name: 'align',      type: "'start' | 'center' | 'end' | 'stretch' | 'baseline'",          default: "'stretch'", description: t('pages.layout.hstack.props.align') },
    { name: 'justify',    type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'", default: "'start'",   description: t('pages.layout.hstack.props.justify') },
    { name: 'wrap',       type: "'nowrap' | 'wrap' | 'wrap-reverse'",                          default: "'nowrap'",  description: t('pages.layout.hstack.props.wrap') },
    { name: 'divider',    type: 'boolean',                                                      default: 'false',     description: t('pages.layout.hstack.props.divider') },
    { name: 'fullWidth',  type: 'boolean',                                                      default: 'false',     description: t('pages.layout.hstack.props.fullWidth') },
    { name: 'fullHeight', type: 'boolean',                                                      default: 'false',     description: t('pages.layout.hstack.props.fullHeight') },
    { name: 'as',         type: 'string',                                                       default: "'div'",     description: t('pages.layout.hstack.props.as') },
]);

const slotsList = computed<SlotDoc[]>(() => [
    { name: 'default', description: t('pages.layout.hstack.slots.default') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.layout.hstack.title')"
        :category="t('pages.layout.hstack.category')"
        import-path="import { HStack } from 'mood-ui'"
        :description="t('pages.layout.hstack.description')"
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <TbPills label="Gap" :options="[{value:'none'},{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSpacing" />
                    <TbSep />
                    <TbPills label="Align" :options="[{value:'start'},{value:'center'},{value:'end'},{value:'stretch'}]" v-model="pgAlign" />
                    <TbSep />
                    <TbPills label="Justify" :options="[{value:'start'},{value:'center'},{value:'end'},{value:'between'}]" v-model="pgJustify" />
                    <TbSep />
                    <TbPills label="Wrap" :options="[{value:'nowrap'},{value:'wrap'},{value:'wrap-reverse',label:'wrap-rev'}]" v-model="pgWrap" />
                    <TbSep />
                    <TbToggle label="Divider" v-model="pgDivider" />
                </template>

                <HStack
                    :spacing="pgSpacing"
                    :align="pgAlign"
                    :justify="pgJustify"
                    :wrap="pgWrap"
                    :divider="pgDivider"
                    class="w-full p-4 border border-dashed border-border rounded-md min-h-[120px]"
                >
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">1</div>
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">2</div>
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">3</div>
                </HStack>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                :title="t('pages.layout.hstack.examples.basic.title')"
                :description="t('pages.layout.hstack.examples.basic.desc')"
                :code="basicCode"
            >
                <HStack spacing="medium">
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">1</div>
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">2</div>
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">3</div>
                </HStack>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.layout.hstack.examples.spacings.title')"
                :description="t('pages.layout.hstack.examples.spacings.desc')"
                :code="gapCode"
            >
                <div class="flex flex-col gap-3 w-full">
                    <HStack spacing="xsmall"><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /></HStack>
                    <HStack spacing="small"><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /></HStack>
                    <HStack spacing="medium"><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /></HStack>
                    <HStack spacing="large"><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /></HStack>
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.layout.hstack.examples.alignments.title')"
                :description="t('pages.layout.hstack.examples.alignments.desc')"
                :code="alignmentsCode"
            >
                <div class="flex flex-col gap-2 w-full">
                    <HStack justify="start"   align="center" class="border border-dashed border-border rounded-md p-2"><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /></HStack>
                    <HStack justify="center"  align="center" class="border border-dashed border-border rounded-md p-2"><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /></HStack>
                    <HStack justify="end"     align="center" class="border border-dashed border-border rounded-md p-2"><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /></HStack>
                    <HStack justify="between" align="center" class="border border-dashed border-border rounded-md p-2"><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /></HStack>
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.layout.hstack.examples.wrapping.title')"
                :description="t('pages.layout.hstack.examples.wrapping.desc')"
                :code="wrapCode"
            >
                <HStack spacing="small" wrap="wrap" class="max-w-[260px]">
                    <div v-for="n in 8" :key="n" class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">{{ n }}</div>
                </HStack>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
