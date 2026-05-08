<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import DropdownMenu from '../../../components/navigation/DropdownMenu.vue';
import {
    PencilSquareIcon,
    DocumentDuplicateIcon,
    ArrowDownTrayIcon,
    TrashIcon,
    ArrowTopRightOnSquareIcon,
    UserIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep from '../../components/toolbar/TbSep.vue';
import type { DropdownMenuEntry } from '../../../interfaces/navigation/DropdownMenu.interface';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

const { t } = useI18n();

const pgPlacement = ref<'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'>('bottom-start');
const pgSize      = ref<'small' | 'medium' | 'large'>('medium');
const pgTriggerVariant = ref<'normal' | 'outline' | 'ghost' | 'text'>('outline');
const pgDisabled  = ref(false);

function resetPlayground() {
    pgPlacement.value = 'bottom-start';
    pgSize.value      = 'medium';
    pgTriggerVariant.value = 'outline';
    pgDisabled.value  = false;
}

const playgroundItems = computed<DropdownMenuEntry[]>(() => [
    { id: 'edit',   label: t('pages.navigation.dropdownMenu.items.edit'),      icon: PencilSquareIcon },
    { id: 'dup',    label: t('pages.navigation.dropdownMenu.items.duplicate'), icon: DocumentDuplicateIcon },
    { id: 'export', label: t('pages.navigation.dropdownMenu.items.export'),    icon: ArrowDownTrayIcon },
]);

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgPlacement.value !== 'bottom-start') parts.push(`placement="${pgPlacement.value}"`);
    if (pgSize.value      !== 'medium')       parts.push(`size="${pgSize.value}"`);
    if (pgTriggerVariant.value !== 'outline') parts.push(`trigger-variant="${pgTriggerVariant.value}"`);
    if (pgDisabled.value) parts.push('disabled');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<DropdownMenu trigger-label="${t('pages.navigation.dropdownMenu.trigger.actions')}" :items="items"${attrs} />`;
});

const basicItems = computed<DropdownMenuEntry[]>(() => [
    { id: 'edit',   label: t('pages.navigation.dropdownMenu.items.edit') },
    { id: 'dup',    label: t('pages.navigation.dropdownMenu.items.duplicate') },
    { id: 'export', label: t('pages.navigation.dropdownMenu.items.export') },
]);

const iconItems = computed<DropdownMenuEntry[]>(() => [
    { id: 'edit',   label: t('pages.navigation.dropdownMenu.items.edit'),      icon: PencilSquareIcon, shortcut: '⌘E' },
    { id: 'dup',    label: t('pages.navigation.dropdownMenu.items.duplicate'), icon: DocumentDuplicateIcon, shortcut: '⌘D' },
    { id: 'export', label: t('pages.navigation.dropdownMenu.items.export'),    icon: ArrowDownTrayIcon, description: t('pages.navigation.dropdownMenu.items.exportDesc') },
]);

const dividerItems = computed<DropdownMenuEntry[]>(() => [
    { type: 'header', label: t('pages.navigation.dropdownMenu.items.actionsHeader') },
    { id: 'edit',   label: t('pages.navigation.dropdownMenu.items.edit'),      icon: PencilSquareIcon },
    { id: 'dup',    label: t('pages.navigation.dropdownMenu.items.duplicate'), icon: DocumentDuplicateIcon },
    { type: 'divider' },
    { id: 'open',   label: t('pages.navigation.dropdownMenu.items.openTab'),   icon: ArrowTopRightOnSquareIcon, href: '#', external: true },
]);

const userMenuItems = computed<DropdownMenuEntry[]>(() => [
    { type: 'header', label: t('pages.navigation.dropdownMenu.items.userEmail') },
    { id: 'profile',  label: t('pages.navigation.dropdownMenu.items.profile'),     icon: UserIcon },
    { id: 'settings', label: t('pages.navigation.dropdownMenu.items.preferences'), icon: Cog6ToothIcon },
    { type: 'divider' },
    { id: 'logout',   label: t('pages.navigation.dropdownMenu.items.logout'),      icon: ArrowRightOnRectangleIcon },
]);

const dangerItems = computed<DropdownMenuEntry[]>(() => [
    { id: 'edit',   label: t('pages.navigation.dropdownMenu.items.edit'),      icon: PencilSquareIcon },
    { id: 'dup',    label: t('pages.navigation.dropdownMenu.items.duplicate'), icon: DocumentDuplicateIcon },
    { type: 'divider' },
    { id: 'delete', label: t('pages.navigation.dropdownMenu.items.delete'),    icon: TrashIcon, danger: true, shortcut: '⌫' },
]);

const basicCode = `<DropdownMenu trigger-label="…" :items="items" />`;
const iconsCode = `<DropdownMenu trigger-label="…" :items="items" />`;
const dividersCode = `<DropdownMenu trigger-label="…" :items="items" />`;
const userMenuCode = `<DropdownMenu trigger-label="…" :items="items" trigger-variant="ghost" />`;
const dangerCode = `<DropdownMenu trigger-label="…" :items="items" />`;

const propsList = computed<PropDoc[]>(() => [
    { name: 'items',             type: 'DropdownMenuEntry[]',                                       required: true,         description: t('pages.navigation.dropdownMenu.props.items') },
    { name: 'triggerLabel',      type: 'string',                                                                            description: t('pages.navigation.dropdownMenu.props.triggerLabel') },
    { name: 'triggerIcon',       type: 'Component',                                                                         description: t('pages.navigation.dropdownMenu.props.triggerIcon') },
    { name: 'triggerVariant',    type: "'normal' | 'outline' | 'ghost' | 'text'",                   default: "'outline'",   description: t('pages.navigation.dropdownMenu.props.triggerVariant') },
    { name: 'color',             type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",  default: "'default'",   description: t('pages.navigation.dropdownMenu.props.color') },
    { name: 'size',              type: "'small' | 'medium' | 'large'",                              default: "'medium'",    description: t('pages.navigation.dropdownMenu.props.size') },
    { name: 'radius',            type: "'none' | 'small' | 'medium' | 'large' | 'full'",                                    description: t('pages.navigation.dropdownMenu.props.radius') },
    { name: 'showChevron',       type: 'boolean',                                                   default: 'true',        description: t('pages.navigation.dropdownMenu.props.showChevron') },
    { name: 'placement',         type: "'bottom-start' | 'bottom-end' | 'bottom-center' | 'top-start' | 'top-end' | 'top-center'", default: "'bottom-start'", description: t('pages.navigation.dropdownMenu.props.placement') },
    { name: 'matchTriggerWidth', type: 'boolean',                                                   default: 'false',       description: t('pages.navigation.dropdownMenu.props.matchTriggerWidth') },
    { name: 'minWidth',          type: 'string',                                                    default: "'12rem'",     description: t('pages.navigation.dropdownMenu.props.minWidth') },
    { name: 'disabled',          type: 'boolean',                                                   default: 'false',       description: t('pages.navigation.dropdownMenu.props.disabled') },
    { name: 'closeOnSelect',     type: 'boolean',                                                   default: 'true',        description: t('pages.navigation.dropdownMenu.props.closeOnSelect') },
    { name: 'ariaLabel',         type: 'string',                                                                            description: t('pages.navigation.dropdownMenu.props.ariaLabel') },
]);

const emitsList = computed<EmitDoc[]>(() => [
    { name: 'update:open', payload: 'boolean',          description: t('pages.navigation.dropdownMenu.emits.updateOpen') },
    { name: 'select',      payload: 'DropdownMenuItem', description: t('pages.navigation.dropdownMenu.emits.select') },
]);

const slotsList = computed<SlotDoc[]>(() => [
    { name: 'trigger', bindings: '{ open, toggle }', description: t('pages.navigation.dropdownMenu.slots.trigger') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.navigation.dropdownMenu.title')"
        :category="t('pages.navigation.dropdownMenu.category')"
        import-path="import { DropdownMenu } from 'mood-ui'"
        :description="t('pages.navigation.dropdownMenu.description')"
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="260px" @reset="resetPlayground">
                <template #controls>
                    <TbPills label="Placement" :options="[{value:'bottom-start',label:'↙ start'},{value:'bottom-end',label:'↘ end'},{value:'top-start',label:'↖ top-start'},{value:'top-end',label:'↗ top-end'}]" v-model="pgPlacement" />
                    <TbSep />
                    <TbPills label="Size" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbPills label="Trigger" :options="[{value:'normal'},{value:'outline'},{value:'ghost'},{value:'text'}]" v-model="pgTriggerVariant" />
                    <TbSep />
                    <TbToggle label="Disabled" v-model="pgDisabled" />
                </template>

                <DropdownMenu
                    :trigger-label="t('pages.navigation.dropdownMenu.trigger.actions')"
                    :items="playgroundItems"
                    :placement="pgPlacement"
                    :size="pgSize"
                    :trigger-variant="pgTriggerVariant"
                    :disabled="pgDisabled"
                />
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                :title="t('pages.navigation.dropdownMenu.examples.basic.title')"
                :description="t('pages.navigation.dropdownMenu.examples.basic.desc')"
                :code="basicCode"
                min-height="220px"
            >
                <DropdownMenu :trigger-label="t('pages.navigation.dropdownMenu.trigger.actions')" :items="basicItems" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.navigation.dropdownMenu.examples.icons.title')"
                :description="t('pages.navigation.dropdownMenu.examples.icons.desc')"
                :code="iconsCode"
                min-height="240px"
            >
                <DropdownMenu :trigger-label="t('pages.navigation.dropdownMenu.trigger.actions')" :items="iconItems" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.navigation.dropdownMenu.examples.dividers.title')"
                :description="t('pages.navigation.dropdownMenu.examples.dividers.desc')"
                :code="dividersCode"
                min-height="260px"
            >
                <DropdownMenu :trigger-label="t('pages.navigation.dropdownMenu.trigger.more')" :items="dividerItems" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.navigation.dropdownMenu.examples.user.title')"
                :description="t('pages.navigation.dropdownMenu.examples.user.desc')"
                :code="userMenuCode"
                min-height="280px"
            >
                <DropdownMenu
                    :trigger-label="t('pages.navigation.dropdownMenu.items.userEmail')"
                    :items="userMenuItems"
                    trigger-variant="ghost"
                />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.navigation.dropdownMenu.examples.danger.title')"
                :description="t('pages.navigation.dropdownMenu.examples.danger.desc')"
                :code="dangerCode"
                min-height="240px"
            >
                <DropdownMenu :trigger-label="t('pages.navigation.dropdownMenu.trigger.actions')" :items="dangerItems" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
