<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import EmptyState from '../../../components/feedback/EmptyState.vue';
import Button from '../../../components/forms/Button.vue';
import { InboxIcon, MagnifyingGlassIcon, ExclamationTriangleIcon, FolderOpenIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep from '../../components/toolbar/TbSep.vue';

const { t } = useI18n();

// ── Overview playground state ─────────────────────────────────────────────────
const pgSize     = ref<'small' | 'medium' | 'large'>('medium');
const pgVariant  = ref<'subtle' | 'solid' | 'outline'>('subtle');
const pgCentered = ref(true);

function resetPlayground() {
    pgSize.value     = 'medium';
    pgVariant.value  = 'subtle';
    pgCentered.value = true;
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgVariant.value  !== 'subtle') parts.push(`variant="${pgVariant.value}"`);
    if (pgSize.value     !== 'medium') parts.push(`size="${pgSize.value}"`);
    if (!pgCentered.value)             parts.push(':centered="false"');
    parts.push(':icon="InboxIcon"');
    parts.push('title="Sin notificaciones"');
    parts.push('description="Cuando recibas algo aparecerá aquí."');
    return `<EmptyState ${parts.join(' ')} />`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const actionCode = `<EmptyState
  :icon="MagnifyingGlassIcon"
  title="Sin resultados"
  description="Intenta con otra búsqueda o limpia los filtros."
>
  <template #actions>
    <Button color="primary">Limpiar filtros</Button>
  </template>
</EmptyState>`;

const variantsCode = `<EmptyState :icon="InboxIcon" title="Subtle"  description="Sin borde."        variant="subtle"  />
<EmptyState :icon="InboxIcon" title="Solid"   description="Con superficie."   variant="solid"   />
<EmptyState :icon="InboxIcon" title="Outline" description="Borde discontinuo." variant="outline" />`;

const noResultsCode = `<EmptyState
  :icon="MagnifyingGlassIcon"
  title="Sin resultados"
  description="No encontramos nada que coincida con \\"facturas 2025\\". Prueba otros términos."
/>`;

const errorCode = `<EmptyState
  :icon="ExclamationTriangleIcon"
  title="Algo salió mal"
  description="Reintenta en unos segundos."
  variant="outline"
>
  <template #actions>
    <Button color="primary" variant="outline">Reintentar</Button>
  </template>
</EmptyState>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
    { name: 'title',       type: 'string',                                                                       description: t('pages.feedback.emptyState.props.title') },
    { name: 'description', type: 'string',                                                                       description: t('pages.feedback.emptyState.props.description') },
    { name: 'icon',        type: 'Component',                                                                    description: t('pages.feedback.emptyState.props.icon') },
    { name: 'size',        type: "'small' | 'medium' | 'large'",                       default: "'medium'",      description: t('pages.feedback.emptyState.props.size') },
    { name: 'variant',     type: "'subtle' | 'solid' | 'outline'",                     default: "'subtle'",      description: t('pages.feedback.emptyState.props.variant') },
    { name: 'centered',    type: 'boolean',                                            default: 'true',          description: t('pages.feedback.emptyState.props.centered') },
    { name: 'radius',      type: "'none' | 'small' | 'medium' | 'large' | 'full'",                              description: t('pages.feedback.emptyState.props.radius') },
]);

const emitsList: EmitDoc[] = [];

const slotsList = computed<SlotDoc[]>(() => [
    { name: 'actions', description: t('pages.feedback.emptyState.slots.actions') },
    { name: 'default', description: t('pages.feedback.emptyState.slots.default') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.feedback.emptyState.title')"
        category="Feedback"
        import-path="import { EmptyState } from 'mood-ui'"
        :description="t('pages.feedback.emptyState.description')"
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="280px" @reset="resetPlayground">
                <template #controls>
                    <TbPills :label="t('pages.feedback.emptyState.controls.variant')" :options="[{value:'subtle'},{value:'solid'},{value:'outline'}]" v-model="pgVariant" />
                    <TbSep />
                    <TbPills :label="t('pages.feedback.emptyState.controls.size')" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbToggle :label="t('pages.feedback.emptyState.controls.centered')" v-model="pgCentered" />
                </template>

                <EmptyState
                    class="w-full max-w-md"
                    :icon="InboxIcon"
                    :size="pgSize"
                    :variant="pgVariant"
                    :centered="pgCentered"
                    :title="t('pages.feedback.emptyState.playground.title')"
                    :description="t('pages.feedback.emptyState.playground.description')"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                :title="t('pages.feedback.emptyState.examples.action.title')"
                :description="t('pages.feedback.emptyState.examples.action.desc')"
                :code="actionCode"
            >
                <EmptyState
                    class="w-full max-w-md"
                    :icon="MagnifyingGlassIcon"
                    :title="t('pages.feedback.emptyState.examples.action.emptyTitle')"
                    :description="t('pages.feedback.emptyState.examples.action.emptyDesc')"
                >
                    <template #actions>
                        <Button color="primary">{{ t('pages.feedback.emptyState.examples.action.cta') }}</Button>
                    </template>
                </EmptyState>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.emptyState.examples.variants.title')"
                :description="t('pages.feedback.emptyState.examples.variants.desc')"
                :code="variantsCode"
            >
                <div class="flex flex-col gap-3 w-full max-w-md">
                    <EmptyState :icon="FolderOpenIcon" title="Subtle"  :description="t('pages.feedback.emptyState.examples.variants.subtleDesc')"  variant="subtle"  />
                    <EmptyState :icon="FolderOpenIcon" title="Solid"   :description="t('pages.feedback.emptyState.examples.variants.solidDesc')"   variant="solid"   />
                    <EmptyState :icon="FolderOpenIcon" title="Outline" :description="t('pages.feedback.emptyState.examples.variants.outlineDesc')" variant="outline" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.emptyState.examples.noResults.title')"
                :description="t('pages.feedback.emptyState.examples.noResults.desc')"
                :code="noResultsCode"
            >
                <EmptyState
                    class="w-full max-w-md"
                    :icon="MagnifyingGlassIcon"
                    :title="t('pages.feedback.emptyState.examples.noResults.emptyTitle')"
                    :description="t('pages.feedback.emptyState.examples.noResults.emptyDesc')"
                />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.emptyState.examples.error.title')"
                :description="t('pages.feedback.emptyState.examples.error.desc')"
                :code="errorCode"
            >
                <EmptyState
                    class="w-full max-w-md"
                    :icon="ExclamationTriangleIcon"
                    :title="t('pages.feedback.emptyState.examples.error.emptyTitle')"
                    :description="t('pages.feedback.emptyState.examples.error.emptyDesc')"
                    variant="outline"
                >
                    <template #actions>
                        <Button color="primary" variant="outline">{{ t('pages.feedback.emptyState.examples.error.cta') }}</Button>
                    </template>
                </EmptyState>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
