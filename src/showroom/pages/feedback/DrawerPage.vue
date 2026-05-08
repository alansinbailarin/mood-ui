<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Drawer from '../../../components/feedback/Drawer.vue';
import Button from '../../../components/forms/Button.vue';
import Typography from '../../../components/data-display/Typography.vue';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep from '../../components/toolbar/TbSep.vue';

const { t } = useI18n();

type Side = 'left' | 'right' | 'top' | 'bottom';
type Size = 'small' | 'medium' | 'large' | 'full';

const pgSide        = ref<Side>('right');
const pgSize        = ref<Size>('medium');
const pgDismissable = ref(true);

const pgOpen  = ref(false);
const open1   = ref(false);
const open2   = ref(false);
const open3   = ref(false);
const open4   = ref(false);
const open5   = ref(false);

function resetPlayground() {
    pgSide.value        = 'right';
    pgSize.value        = 'medium';
    pgDismissable.value = true;
}

const overviewCode = computed(() => {
    const parts: string[] = ['v-model="open"', 'title="Filtros"'];
    if (pgSide.value !== 'right')   parts.push(`side="${pgSide.value}"`);
    if (pgSize.value !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (!pgDismissable.value)       parts.push(':close-on-overlay="false"', ':close-on-escape="false"');
    return `<Drawer ${parts.join(' ')}>
  <p>Contenido del drawer.</p>
</Drawer>`;
});

const sidesCode = `<Drawer v-model="open" side="right" title="Derecho" />
<Drawer v-model="open" side="left"   title="Izquierdo" />
<Drawer v-model="open" side="top"    title="Superior" />
<Drawer v-model="open" side="bottom" title="Bottom sheet" />`;

const contentCode = `<Drawer v-model="open" side="right" size="large" title="Detalles" description="Edición rápida del proyecto seleccionado.">
  <div class="flex flex-col gap-3">
    <input class="border border-border rounded-md px-3 py-2" placeholder="Nombre" />
    <textarea class="border border-border rounded-md px-3 py-2" placeholder="Notas" />
  </div>
</Drawer>`;

const persistentCode = `<Drawer
  v-model="open"
  side="right"
  title="Asistente"
  :close-on-overlay="false"
  :close-on-escape="false"
>
  <Typography>Solo se cierra con el botón explícito.</Typography>
</Drawer>`;

const propsList = computed<PropDoc[]>(() => [
    { name: 'modelValue',     type: 'boolean',                                                                                                description: t('pages.feedback.drawer.props.modelValue') },
    { name: 'side',           type: "'left' | 'right' | 'top' | 'bottom'",            default: "'right'",                                     description: t('pages.feedback.drawer.props.side') },
    { name: 'size',           type: "'small' | 'medium' | 'large' | 'full'",          default: "'medium'",                                    description: t('pages.feedback.drawer.props.size') },
    { name: 'radius',         type: "'none' | 'small' | 'medium' | 'large' | 'full'",                                                          description: t('pages.feedback.drawer.props.radius') },
    { name: 'title',          type: 'string',                                                                                                  description: t('pages.feedback.drawer.props.title') },
    { name: 'description',    type: 'string',                                                                                                  description: t('pages.feedback.drawer.props.description') },
    { name: 'closeOnOverlay', type: 'boolean',                                         default: 'true',                                        description: t('pages.feedback.drawer.props.closeOnOverlay') },
    { name: 'closeOnEscape',  type: 'boolean',                                         default: 'true',                                        description: t('pages.feedback.drawer.props.closeOnEscape') },
    { name: 'showClose',      type: 'boolean',                                         default: 'true',                                        description: t('pages.feedback.drawer.props.showClose') },
    { name: 'lockScroll',     type: 'boolean',                                         default: 'true',                                        description: t('pages.feedback.drawer.props.lockScroll') },
    { name: 'color',          type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",                                                description: t('pages.feedback.drawer.props.color') },
    { name: 'overlay',        type: "'blur' | 'solid' | 'transparent' | 'dark' | 'dim' | 'glass'", default: "'blur'",                          description: t('pages.feedback.drawer.props.overlay') },
    { name: 'innerBorder',    type: 'boolean',                                         default: 'false',                                       description: t('pages.feedback.drawer.props.innerBorder') },
    { name: 'ariaLabel',      type: 'string',                                                                                                  description: t('pages.feedback.drawer.props.ariaLabel') },
]);

const emitsList = computed<EmitDoc[]>(() => [
    { name: 'update:modelValue', payload: 'boolean', description: t('pages.feedback.drawer.emits.updateModelValue') },
]);

const slotsList = computed<SlotDoc[]>(() => [
    { name: 'default', description: t('pages.feedback.drawer.slots.default') },
    { name: 'header',  description: t('pages.feedback.drawer.slots.header') },
    { name: 'footer',  description: t('pages.feedback.drawer.slots.footer') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.feedback.drawer.title')"
        category="Feedback"
        import-path="import { Drawer } from 'mood-ui'"
        :description="t('pages.feedback.drawer.description')"
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" @reset="resetPlayground">
                <template #controls>
                    <TbPills :label="t('pages.feedback.drawer.controls.side')" :options="[{value:'left'},{value:'right'},{value:'top'},{value:'bottom'}]" v-model="pgSide" />
                    <TbSep />
                    <TbPills :label="t('pages.feedback.drawer.controls.size')" :options="[{value:'small'},{value:'medium'},{value:'large'},{value:'full'}]" v-model="pgSize" />
                    <TbSep />
                    <TbToggle :label="t('pages.feedback.drawer.controls.dismissable')" v-model="pgDismissable" />
                </template>

                <Button color="primary" @click="pgOpen = true">{{ t('pages.feedback.drawer.playground.open') }}</Button>
                <Drawer
                    v-model="pgOpen"
                    :side="pgSide"
                    :size="pgSize"
                    :close-on-overlay="pgDismissable"
                    :close-on-escape="pgDismissable"
                    :title="t('pages.feedback.drawer.playground.title')"
                    :description="t('pages.feedback.drawer.playground.description')"
                >
                    <Typography>{{ t('pages.feedback.drawer.playground.content') }}</Typography>
                </Drawer>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                :title="t('pages.feedback.drawer.examples.right.title')"
                :description="t('pages.feedback.drawer.examples.right.desc')"
                :code="`<Drawer v-model='open' side='right' title='Filtros' />`"
                min-height="180px"
            >
                <Button @click="open1 = true">{{ t('pages.feedback.drawer.examples.right.cta') }}</Button>
                <Drawer v-model="open1" side="right"
                    :title="t('pages.feedback.drawer.examples.right.drawerTitle')"
                    :description="t('pages.feedback.drawer.examples.right.drawerDesc')"
                >
                    <Typography>{{ t('pages.feedback.drawer.playground.content') }}</Typography>
                </Drawer>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.drawer.examples.left.title')"
                :description="t('pages.feedback.drawer.examples.left.desc')"
                :code="`<Drawer v-model='open' side='left' title='Menú' />`"
                min-height="180px"
            >
                <Button @click="open2 = true">{{ t('pages.feedback.drawer.examples.left.cta') }}</Button>
                <Drawer v-model="open2" side="left" :title="t('pages.feedback.drawer.examples.left.drawerTitle')">
                    <Typography>{{ t('pages.feedback.drawer.examples.left.content') }}</Typography>
                </Drawer>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.drawer.examples.sides.title')"
                :description="t('pages.feedback.drawer.examples.sides.desc')"
                :code="sidesCode"
                min-height="180px"
            >
                <Button @click="open3 = true">{{ t('pages.feedback.drawer.examples.sides.ctaTop') }}</Button>
                <Button @click="open4 = true">{{ t('pages.feedback.drawer.examples.sides.ctaBottom') }}</Button>
                <Drawer v-model="open3" side="top" :title="t('pages.feedback.drawer.examples.sides.topTitle')">
                    <Typography>{{ t('pages.feedback.drawer.playground.content') }}</Typography>
                </Drawer>
                <Drawer v-model="open4" side="bottom" :title="t('pages.feedback.drawer.examples.sides.bottomTitle')">
                    <Typography>{{ t('pages.feedback.drawer.examples.sides.bottomContent') }}</Typography>
                </Drawer>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.drawer.examples.form.title')"
                :description="t('pages.feedback.drawer.examples.form.desc')"
                :code="contentCode"
                min-height="180px"
            >
                <Button color="primary" @click="open5 = true">{{ t('pages.feedback.drawer.examples.form.cta') }}</Button>
                <Drawer v-model="open5" side="right" size="large"
                    :title="t('pages.feedback.drawer.examples.form.drawerTitle')"
                    :description="t('pages.feedback.drawer.examples.form.drawerDesc')"
                >
                    <div class="flex flex-col gap-3">
                        <input class="border border-border rounded-md px-3 py-2 bg-card" :placeholder="t('pages.feedback.drawer.examples.form.namePlaceholder')" />
                        <textarea class="border border-border rounded-md px-3 py-2 bg-card" :placeholder="t('pages.feedback.drawer.examples.form.notesPlaceholder')" />
                    </div>
                </Drawer>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
