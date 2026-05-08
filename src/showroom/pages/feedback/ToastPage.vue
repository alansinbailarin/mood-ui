<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Button from '../../../components/forms/Button.vue';
import { useToast } from '../../../composables/useToast';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';
import TbPills from '../../components/toolbar/TbPills.vue';

const { t } = useI18n();

type Placement = 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';

const toast = useToast();

const pgPlacement = ref<Placement>('top-right');

function resetPlayground() {
    pgPlacement.value = 'top-right';
}

const overviewCode = computed(() => `<!-- Mount once near the root -->
<ToastContainer placement="${pgPlacement.value}" />

// From any component:
const toast = useToast();
toast.success({ title: 'Guardado', description: 'Cambios aplicados' });`);

const successCode = `const toast = useToast();
toast.success({ title: 'Guardado', description: 'Cambios aplicados' });`;

const errorCode = `toast.danger({
  title: 'Error de red',
  description: 'No se pudo contactar el servidor.',
});`;

const infoCode = `toast.info({
  title: 'Sincronizando',
  description: 'Aplicando últimos cambios…',
  duration: 0, // pinned hasta dismiss
});`;

const warningCode = `toast.warning({
  title: 'Atención',
  description: 'Revisa los datos antes de continuar.',
  action: { label: 'Revisar', onClick: (close) => { /* … */ close(); } },
});`;

function pushSuccess() { toast.success({ title: 'Guardado', description: 'Cambios aplicados', placement: pgPlacement.value }); }
function pushError()   { toast.danger({ title: 'Error de red', description: 'No se pudo contactar el servidor.', placement: pgPlacement.value }); }
function pushInfo()    { toast.info({ title: 'Sincronizando', description: 'Aplicando últimos cambios…', placement: pgPlacement.value }); }
function pushWarn()    { toast.warning({ title: 'Atención', description: 'Revisa los datos antes de continuar.', placement: pgPlacement.value }); }

const propsList = computed<PropDoc[]>(() => [
    { name: 'placement',        type: "'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'", default: "'top-right'", description: t('pages.feedback.toast.props.placement') },
    { name: 'max',              type: 'number',                                  default: '5',         description: t('pages.feedback.toast.props.max') },
    { name: 'defaultDuration',  type: 'number',                                  default: '4500',      description: t('pages.feedback.toast.props.defaultDuration') },
    { name: 'defaultVariant',   type: "'filled' | 'subtle' | 'outline'",         default: "'subtle'",  description: t('pages.feedback.toast.props.defaultVariant') },
    { name: 'offset',           type: 'number',                                  default: '16',        description: t('pages.feedback.toast.props.offset') },
    { name: 'reducedMotion',    type: "'auto' | 'force'",                                              description: t('pages.feedback.toast.props.reducedMotion') },
]);

const emitsList: EmitDoc[] = [];
const slotsList: SlotDoc[] = [];
</script>

<template>
    <ComponentDoc
        :title="t('pages.feedback.toast.title')"
        category="Feedback"
        import-path="import { ToastContainer, useToast } from 'mood-ui'"
        :description="t('pages.feedback.toast.description')"
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" lang="vue" @reset="resetPlayground">
                <template #controls>
                    <TbPills :label="t('pages.feedback.toast.controls.placement')" :options="[{value:'top-left'},{value:'top-center'},{value:'top-right'},{value:'bottom-left'},{value:'bottom-center'},{value:'bottom-right'}]" v-model="pgPlacement" />
                </template>

                <Button color="primary" @click="pushSuccess">{{ t('pages.feedback.toast.playground.launch') }}</Button>
                <Button variant="outline" @click="toast.dismissAll()">{{ t('pages.feedback.toast.playground.dismissAll') }}</Button>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                :title="t('pages.feedback.toast.examples.success.title')"
                :description="t('pages.feedback.toast.examples.success.desc')"
                :code="successCode"
                min-height="160px"
            >
                <Button color="success" @click="pushSuccess">success()</Button>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.toast.examples.error.title')"
                :description="t('pages.feedback.toast.examples.error.desc')"
                :code="errorCode"
                min-height="160px"
            >
                <Button color="danger" @click="pushError">danger()</Button>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.toast.examples.info.title')"
                :description="t('pages.feedback.toast.examples.info.desc')"
                :code="infoCode"
                min-height="160px"
            >
                <Button @click="pushInfo">{{ t('pages.feedback.toast.examples.info.cta') }}</Button>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.toast.examples.warning.title')"
                :description="t('pages.feedback.toast.examples.warning.desc')"
                :code="warningCode"
                min-height="160px"
            >
                <Button color="warning" @click="pushWarn">warning()</Button>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
