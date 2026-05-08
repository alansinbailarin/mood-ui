<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Kbd from '../../../components/data-display/Kbd.vue';
import type { PropDoc, SlotDoc } from '../../types';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbSep from '../../components/toolbar/TbSep.vue';

const { t } = useI18n();

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<'subtle' | 'outline' | 'solid'>('subtle');
const pgSize    = ref<'small' | 'medium' | 'large'>('medium');
const pgRadius  = ref<'none' | 'small' | 'medium' | 'large' | 'full'>('medium');

function resetPlayground() {
    pgVariant.value = 'subtle';
    pgSize.value = 'medium';
    pgRadius.value = 'medium';
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgVariant.value !== 'subtle') parts.push(`variant="${pgVariant.value}"`);
    if (pgSize.value    !== 'medium') parts.push(`size="${pgSize.value}"`);
    if (pgRadius.value  !== 'medium') parts.push(`radius="${pgRadius.value}"`);
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Kbd${attrs}>⌘K</Kbd>`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const basicCode = `<Kbd>Enter</Kbd>
<Kbd>Esc</Kbd>
<Kbd>Tab</Kbd>`;

const comboCode = `<Kbd>⌘</Kbd>
<span class="text-muted-foreground">+</span>
<Kbd>Shift</Kbd>
<span class="text-muted-foreground">+</span>
<Kbd>P</Kbd>`;

const variantsCode = `<Kbd variant="subtle">Esc</Kbd>
<Kbd variant="outline">Esc</Kbd>
<Kbd variant="solid">Esc</Kbd>`;

const sizesCode = `<Kbd size="small">Tab</Kbd>
<Kbd size="medium">Tab</Kbd>
<Kbd size="large">Tab</Kbd>`;

const inlineCode = `<p>Pulsa <Kbd>⌘K</Kbd> para abrir la búsqueda rápida.</p>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
    { name: 'size',    type: "'small' | 'medium' | 'large'",                     default: "'medium'", description: t('pages.dataDisplay.kbd.props.size') },
    { name: 'variant', type: "'subtle' | 'outline' | 'solid'",                   default: "'subtle'", description: t('pages.dataDisplay.kbd.props.variant') },
    { name: 'radius',  type: "'none' | 'small' | 'medium' | 'large' | 'full'",                        description: t('pages.dataDisplay.kbd.props.radius') },
]);

const slotsList = computed<SlotDoc[]>(() => [
    { name: 'default', description: t('pages.dataDisplay.kbd.slots.default') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.dataDisplay.kbd.title')"
        category="Data Display"
        import-path="import { Kbd } from 'mood-ui'"
        :description="t('pages.dataDisplay.kbd.description')"
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="160px" @reset="resetPlayground">
                <template #controls>
                    <TbPills :label="t('pages.dataDisplay.kbd.controls.variant')" :options="[{value:'subtle'},{value:'outline'},{value:'solid'}]" v-model="pgVariant" />
                    <TbSep />
                    <TbPills :label="t('pages.dataDisplay.kbd.controls.size')" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbPills :label="t('pages.dataDisplay.kbd.controls.radius')" :options="[{value:'none'},{value:'small'},{value:'medium'},{value:'large'},{value:'full'}]" v-model="pgRadius" />
                </template>

                <Kbd :variant="pgVariant" :size="pgSize" :radius="pgRadius">⌘K</Kbd>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                :title="t('pages.dataDisplay.kbd.examples.basic.title')"
                :description="t('pages.dataDisplay.kbd.examples.basic.desc')"
                :code="basicCode"
            >
                <Kbd>Enter</Kbd>
                <Kbd>Esc</Kbd>
                <Kbd>Tab</Kbd>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.dataDisplay.kbd.examples.combo.title')"
                :description="t('pages.dataDisplay.kbd.examples.combo.desc')"
                :code="comboCode"
            >
                <div class="inline-flex items-center gap-1">
                    <Kbd>⌘</Kbd>
                    <span class="text-muted-foreground">+</span>
                    <Kbd>Shift</Kbd>
                    <span class="text-muted-foreground">+</span>
                    <Kbd>P</Kbd>
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.dataDisplay.kbd.examples.variants.title')"
                :description="t('pages.dataDisplay.kbd.examples.variants.desc')"
                :code="variantsCode"
            >
                <Kbd variant="subtle">Esc</Kbd>
                <Kbd variant="outline">Esc</Kbd>
                <Kbd variant="solid">Esc</Kbd>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.dataDisplay.kbd.examples.sizes.title')"
                :description="t('pages.dataDisplay.kbd.examples.sizes.desc')"
                :code="sizesCode"
            >
                <Kbd size="small">Tab</Kbd>
                <Kbd size="medium">Tab</Kbd>
                <Kbd size="large">Tab</Kbd>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.dataDisplay.kbd.examples.inline.title')"
                :description="t('pages.dataDisplay.kbd.examples.inline.desc')"
                :code="inlineCode"
            >
                <p class="text-sm">
                    Pulsa <Kbd>⌘K</Kbd> para abrir la búsqueda rápida.
                </p>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
