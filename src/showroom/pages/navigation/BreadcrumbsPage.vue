<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Breadcrumbs from '../../../components/navigation/Breadcrumbs.vue';
import { HomeIcon, FolderIcon, DocumentIcon } from '@heroicons/vue/24/outline';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep from '../../components/toolbar/TbSep.vue';
import type { PropDoc, EmitDoc } from '../../types';

const { t } = useI18n();

const pgSeparator = ref<'chevron' | 'slash' | 'dot' | 'arrow'>('chevron');
const pgSize      = ref<'small' | 'medium' | 'large'>('medium');
const pgShowHomeIcon = ref(false);

function resetPlayground() {
    pgSeparator.value = 'chevron';
    pgSize.value      = 'medium';
    pgShowHomeIcon.value = false;
}

const playgroundItems = computed(() => [
    { label: t('pages.navigation.breadcrumbs.items.home'),        href: '#' },
    { label: t('pages.navigation.breadcrumbs.items.projects'),    href: '#' },
    { label: t('pages.navigation.breadcrumbs.items.modo'),        href: '#' },
    { label: t('pages.navigation.breadcrumbs.items.breadcrumbs') },
]);

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgSeparator.value !== 'chevron') parts.push(`separator="${pgSeparator.value}"`);
    if (pgSize.value      !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgShowHomeIcon.value) parts.push('show-home-icon');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Breadcrumbs :items="items"${attrs} />`;
});

const basicItems = computed(() => [
    { label: t('pages.navigation.breadcrumbs.items.home'),     href: '#' },
    { label: t('pages.navigation.breadcrumbs.items.products'), href: '#' },
    { label: t('pages.navigation.breadcrumbs.items.detail') },
]);

const iconItems = computed(() => [
    { label: t('pages.navigation.breadcrumbs.items.home'),      href: '#', icon: HomeIcon },
    { label: t('pages.navigation.breadcrumbs.items.documents'), href: '#', icon: FolderIcon },
    { label: t('pages.navigation.breadcrumbs.items.report'),    icon: DocumentIcon },
]);

const longItems = computed(() => [
    { label: t('pages.navigation.breadcrumbs.items.home'),       href: '#' },
    { label: t('pages.navigation.breadcrumbs.items.spaces'),     href: '#' },
    { label: t('pages.navigation.breadcrumbs.items.team'),       href: '#' },
    { label: t('pages.navigation.breadcrumbs.items.projects'),   href: '#' },
    { label: t('pages.navigation.breadcrumbs.items.modo'),       href: '#' },
    { label: t('pages.navigation.breadcrumbs.items.components'), href: '#' },
    { label: t('pages.navigation.breadcrumbs.items.navigation') },
]);

const basicCode = `const items = [
    { label: '${t('pages.navigation.breadcrumbs.items.home')}',     href: '#' },
    { label: '${t('pages.navigation.breadcrumbs.items.products')}', href: '#' },
    { label: '${t('pages.navigation.breadcrumbs.items.detail')}' },
];

<Breadcrumbs :items="items" />`;

const iconsCode = `const items = [
    { label: '${t('pages.navigation.breadcrumbs.items.home')}',      href: '#', icon: HomeIcon },
    { label: '${t('pages.navigation.breadcrumbs.items.documents')}', href: '#', icon: FolderIcon },
    { label: '${t('pages.navigation.breadcrumbs.items.report')}',    icon: DocumentIcon },
];

<Breadcrumbs :items="items" />`;

const homeCode = `<Breadcrumbs :items="items" show-home-icon />`;

const customSepCode = `<Breadcrumbs :items="items" separator="slash" />
<Breadcrumbs :items="items" separator="dot" />
<Breadcrumbs :items="items" separator="arrow" />
<Breadcrumbs :items="items" separator-text="›" />`;

const truncatedCode = `<Breadcrumbs :items="longItems" :max="4" />`;

const propsList = computed<PropDoc[]>(() => [
    { name: 'items',         type: 'BreadcrumbItem[]',                              required: true,          description: t('pages.navigation.breadcrumbs.props.items') },
    { name: 'max',           type: 'number',                                        default: '0',            description: t('pages.navigation.breadcrumbs.props.max') },
    { name: 'separator',     type: "'chevron' | 'slash' | 'dot' | 'arrow'",         default: "'chevron'",    description: t('pages.navigation.breadcrumbs.props.separator') },
    { name: 'separatorText', type: 'string',                                                                  description: t('pages.navigation.breadcrumbs.props.separatorText') },
    { name: 'size',          type: "'small' | 'medium' | 'large'",                  default: "'medium'",     description: t('pages.navigation.breadcrumbs.props.size') },
    { name: 'showHomeIcon',  type: 'boolean',                                       default: 'false',        description: t('pages.navigation.breadcrumbs.props.showHomeIcon') },
    { name: 'ariaLabel',     type: 'string',                                        default: "'Breadcrumb'", description: t('pages.navigation.breadcrumbs.props.ariaLabel') },
]);

const emitsList = computed<EmitDoc[]>(() => [
    { name: 'navigate', payload: '(item: BreadcrumbItem, index: number)', description: t('pages.navigation.breadcrumbs.emits.navigate') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.navigation.breadcrumbs.title')"
        :category="t('pages.navigation.breadcrumbs.category')"
        import-path="import { Breadcrumbs } from 'mood-ui'"
        :description="t('pages.navigation.breadcrumbs.description')"
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="160px" @reset="resetPlayground">
                <template #controls>
                    <TbPills label="Separator" :options="[{value:'chevron'},{value:'slash'},{value:'dot'},{value:'arrow'}]" v-model="pgSeparator" />
                    <TbSep />
                    <TbPills label="Size" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbToggle label="Home icon" v-model="pgShowHomeIcon" />
                </template>

                <Breadcrumbs :items="playgroundItems" :separator="pgSeparator" :size="pgSize" :show-home-icon="pgShowHomeIcon" />
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                :title="t('pages.navigation.breadcrumbs.examples.basic.title')"
                :description="t('pages.navigation.breadcrumbs.examples.basic.desc')"
                :code="basicCode"
            >
                <Breadcrumbs :items="basicItems" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.navigation.breadcrumbs.examples.icons.title')"
                :description="t('pages.navigation.breadcrumbs.examples.icons.desc')"
                :code="iconsCode"
            >
                <Breadcrumbs :items="iconItems" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.navigation.breadcrumbs.examples.homeIcon.title')"
                :description="t('pages.navigation.breadcrumbs.examples.homeIcon.desc')"
                :code="homeCode"
            >
                <Breadcrumbs :items="basicItems" show-home-icon />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.navigation.breadcrumbs.examples.separators.title')"
                :description="t('pages.navigation.breadcrumbs.examples.separators.desc')"
                :code="customSepCode"
            >
                <div class="flex flex-col gap-3 w-full">
                    <Breadcrumbs :items="basicItems" separator="slash" />
                    <Breadcrumbs :items="basicItems" separator="dot" />
                    <Breadcrumbs :items="basicItems" separator="arrow" />
                    <Breadcrumbs :items="basicItems" separator-text="›" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.navigation.breadcrumbs.examples.truncated.title')"
                :description="t('pages.navigation.breadcrumbs.examples.truncated.desc')"
                :code="truncatedCode"
            >
                <Breadcrumbs :items="longItems" :max="4" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
