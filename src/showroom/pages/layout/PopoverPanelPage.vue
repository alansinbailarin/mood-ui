<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Tooltip from '../../../components/feedback/Tooltip.vue';
import DropdownMenu from '../../../components/navigation/DropdownMenu.vue';
import Select from '../../../components/forms/Select.vue';
import Button from '../../../components/forms/Button.vue';
import PopoverPanel from '../../../components/layout/PopoverPanel.vue';
import { usePopover } from '../../../composables/usePopover';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

const { t } = useI18n();

const v = ref<string | number | null>('vue');
const opts = [
    { value: 'vue', label: 'Vue' },
    { value: 'react', label: 'React' },
    { value: 'svelte', label: 'Svelte' },
];

const dropdownItems = computed(() => [
    { id: 1, label: t('pages.layout.popoverPanel.demo.edit') },
    { id: 2, label: t('pages.layout.popoverPanel.demo.duplicate') },
    { type: 'divider' as const },
    { id: 3, label: t('pages.layout.popoverPanel.demo.delete'), danger: true },
]);

const {
    isOpen: overviewOpen,
    panelStyle: overviewPanelStyle,
    panelRef: overviewPanelRef,
    triggerRef: overviewTriggerRef,
    toggle: overviewToggle,
    close: overviewClose,
} = usePopover({ placement: 'bottom-start' });

const overviewCode = `<script setup lang="ts">
import { ref } from 'vue';
import { usePopover, PopoverPanel } from 'mood-ui';

const triggerRef = ref(null);
const { open, panelStyle, panelRef, toggle } = usePopover({ placement: 'bottom-start' });
<\/script>

<template>
    <Button ref="triggerRef" variant="outline" @click="toggle">…</Button>
    <PopoverPanel :open="open" :style="panelStyle" @update:panel-ref="panelRef = $event">
        <div class="p-4">…</div>
    </PopoverPanel>
</template>`;

const tooltipCode = `<Tooltip text="…" color="inverted" trigger="click">
    <Button variant="outline">…</Button>
</Tooltip>`;

const selectCode = `<Select v-model="value" :options="[…]" class="w-56" />`;

const dropdownCode = `<DropdownMenu trigger-label="…" :items="[…]" />`;

const directCode = `<script setup lang="ts">
import { ref } from 'vue';
import { usePopover, PopoverPanel } from 'mood-ui';

const { open, panelStyle, panelRef, toggle } = usePopover({ placement: 'bottom-start' });
<\/script>`;

const propsList = computed<PropDoc[]>(() => [
    { name: 'open',       type: 'boolean',                                            required: true,  description: t('pages.layout.popoverPanel.props.open') },
    { name: 'style',      type: 'Record<string, string>',                                              description: t('pages.layout.popoverPanel.props.style') },
    { name: 'radius',     type: "'none' | 'small' | 'medium' | 'large' | 'full'",                     description: t('pages.layout.popoverPanel.props.radius') },
    { name: 'role',       type: 'string',                                              default: "'dialog'", description: t('pages.layout.popoverPanel.props.role') },
    { name: 'labelledBy', type: 'string',                                                              description: t('pages.layout.popoverPanel.props.labelledBy') },
]);

const emitsList = computed<EmitDoc[]>(() => [
    { name: 'update:panelRef', payload: 'HTMLElement | null', description: t('pages.layout.popoverPanel.emits.updatePanelRef') },
]);

const slotsList = computed<SlotDoc[]>(() => [
    { name: 'default', description: t('pages.layout.popoverPanel.slots.default') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.layout.popoverPanel.title')"
        :category="t('pages.layout.popoverPanel.category')"
        import-path="import { PopoverPanel } from 'mood-ui'"
        :description="t('pages.layout.popoverPanel.description')"
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px">
                <div class="relative">
                    <Button
                        :ref="(el: any) => { overviewTriggerRef = el?.$el ?? el; }"
                        variant="outline"
                        @click="overviewToggle"
                    >
                        {{ t('pages.layout.popoverPanel.demo.openPanel') }}
                    </Button>
                    <PopoverPanel
                        :open="overviewOpen"
                        :style="overviewPanelStyle"
                        @update:panel-ref="overviewPanelRef = $event"
                    >
                        <div class="p-4 flex flex-col gap-3 min-w-52">
                            <p class="text-sm font-medium text-foreground">{{ t('pages.layout.popoverPanel.demo.customTitle') }}</p>
                            <p class="text-xs text-muted-foreground">{{ t('pages.layout.popoverPanel.demo.customBody') }}</p>
                            <Button size="small" variant="outline" @click="overviewClose">{{ t('pages.layout.popoverPanel.demo.close') }}</Button>
                        </div>
                    </PopoverPanel>
                </div>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                :title="t('pages.layout.popoverPanel.examples.tooltip.title')"
                :description="t('pages.layout.popoverPanel.examples.tooltip.desc')"
                :code="tooltipCode"
            >
                <Tooltip :text="t('pages.layout.popoverPanel.demo.tooltipText')" color="inverted" trigger="click">
                    <Button variant="outline">{{ t('pages.layout.popoverPanel.demo.click') }}</Button>
                </Tooltip>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.layout.popoverPanel.examples.select.title')"
                :description="t('pages.layout.popoverPanel.examples.select.desc')"
                :code="selectCode"
            >
                <Select v-model="v" :options="opts" class="w-56" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.layout.popoverPanel.examples.dropdown.title')"
                :description="t('pages.layout.popoverPanel.examples.dropdown.desc')"
                :code="dropdownCode"
            >
                <DropdownMenu
                    :trigger-label="t('pages.layout.popoverPanel.demo.actions')"
                    :items="dropdownItems"
                />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.layout.popoverPanel.examples.direct.title')"
                :description="t('pages.layout.popoverPanel.examples.direct.desc')"
                :code="directCode"
            >
                <p class="text-sm text-muted-foreground text-center max-w-md">
                    {{ t('pages.layout.popoverPanel.demo.directNote') }} <code class="font-mono text-foreground">PopoverPanel</code>.
                </p>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
