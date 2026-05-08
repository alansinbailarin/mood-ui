<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Container from '../../../components/layout/Container.vue';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep from '../../components/toolbar/TbSep.vue';
import type { PropDoc, SlotDoc } from '../../types';

const { t } = useI18n();

const pgMaxWidth = ref<'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none'>('lg');
const pgPadding = ref<'none' | 'small' | 'medium' | 'large'>('medium');
const pgCentered = ref(true);
const pgCenterContent = ref(false);

function resetPlayground() {
    pgMaxWidth.value = 'lg';
    pgPadding.value = 'medium';
    pgCentered.value = true;
    pgCenterContent.value = false;
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgMaxWidth.value !== 'lg') parts.push(`max-width="${pgMaxWidth.value}"`);
    if (pgPadding.value !== 'medium') parts.push(`padding="${pgPadding.value}"`);
    if (!pgCentered.value) parts.push(':centered="false"');
    if (pgCenterContent.value) parts.push('center-content');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Container${attrs}>
    <p>${t('pages.layout.container.overviewSample')}</p>
</Container>`;
});

const sizesCode = `<Container max-width="sm" centered>sm — 640px</Container>
<Container max-width="md" centered>md — 768px</Container>
<Container max-width="lg" centered>lg — 1024px</Container>
<Container max-width="xl" centered>xl — 1280px</Container>`;

const fluidCode = `<Container max-width="full" padding="large">
    ${t('pages.layout.container.fluidSample')}
</Container>`;

const paddingCode = `<Container max-width="md" padding="none"  centered>${t('pages.layout.container.paddingSamples.none')}</Container>
<Container max-width="md" padding="small" centered>${t('pages.layout.container.paddingSamples.small')}</Container>
<Container max-width="md" padding="large" centered>${t('pages.layout.container.paddingSamples.large')}</Container>`;

const propsList = computed<PropDoc[]>(() => [
    { name: 'maxWidth',      type: "'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none'", default: "'lg'",     description: t('pages.layout.container.props.maxWidth') },
    { name: 'padding',       type: "'none' | 'small' | 'medium' | 'large'",                default: "'medium'", description: t('pages.layout.container.props.padding') },
    { name: 'centered',      type: 'boolean',                                              default: 'true',     description: t('pages.layout.container.props.centered') },
    { name: 'centerContent', type: 'boolean',                                              default: 'false',    description: t('pages.layout.container.props.centerContent') },
    { name: 'height',        type: "'auto' | 'screen' | 'fill' | 'full'",                  default: "'auto'",   description: t('pages.layout.container.props.height') },
    { name: 'as',            type: "'div' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer' | 'nav'", default: "'div'", description: t('pages.layout.container.props.as') },
]);

const slotsList = computed<SlotDoc[]>(() => [
    { name: 'default', description: t('pages.layout.container.slots.default') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.layout.container.title')"
        :category="t('pages.layout.container.category')"
        import-path="import { Container } from 'mood-ui'"
        :description="t('pages.layout.container.description')"
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <TbPills label="Max-width" :options="[{value:'sm'},{value:'md'},{value:'lg'},{value:'xl'},{value:'full'}]" v-model="pgMaxWidth" />
                    <TbSep />
                    <TbPills label="Padding" :options="[{value:'none'},{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgPadding" />
                    <TbSep />
                    <TbToggle label="Centered" v-model="pgCentered" />
                    <TbToggle label="Center content" v-model="pgCenterContent" />
                </template>

                <div class="w-full">
                    <Container
                        :max-width="pgMaxWidth"
                        :padding="pgPadding"
                        :centered="pgCentered"
                        :center-content="pgCenterContent"
                        class="bg-primary/5 rounded-md border border-dashed border-primary/30"
                    >
                        <p class="text-sm text-foreground text-center">{{ t('pages.layout.container.overviewSample') }}</p>
                    </Container>
                </div>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                :title="t('pages.layout.container.examples.sizes.title')"
                :description="t('pages.layout.container.examples.sizes.desc')"
                :code="sizesCode"
            >
                <div class="w-full flex flex-col gap-2">
                    <Container max-width="sm" centered class="bg-primary/5 rounded-md py-2 px-4 text-center text-sm">sm — 640px</Container>
                    <Container max-width="md" centered class="bg-primary/5 rounded-md py-2 px-4 text-center text-sm">md — 768px</Container>
                    <Container max-width="lg" centered class="bg-primary/5 rounded-md py-2 px-4 text-center text-sm">lg — 1024px</Container>
                    <Container max-width="xl" centered class="bg-primary/5 rounded-md py-2 px-4 text-center text-sm">xl — 1280px</Container>
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.layout.container.examples.fluid.title')"
                :description="t('pages.layout.container.examples.fluid.desc')"
                :code="fluidCode"
            >
                <Container max-width="full" padding="large" class="w-full bg-primary/5 rounded-md text-center text-sm">
                    {{ t('pages.layout.container.fluidSample') }}
                </Container>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.layout.container.examples.padding.title')"
                :description="t('pages.layout.container.examples.padding.desc')"
                :code="paddingCode"
            >
                <div class="w-full flex flex-col gap-2">
                    <Container max-width="md" padding="none"  centered class="bg-primary/5 rounded-md text-sm text-center">{{ t('pages.layout.container.paddingSamples.none') }}</Container>
                    <Container max-width="md" padding="small" centered class="bg-primary/5 rounded-md text-sm text-center">{{ t('pages.layout.container.paddingSamples.small') }}</Container>
                    <Container max-width="md" padding="large" centered class="bg-primary/5 rounded-md text-sm text-center">{{ t('pages.layout.container.paddingSamples.large') }}</Container>
                </div>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
