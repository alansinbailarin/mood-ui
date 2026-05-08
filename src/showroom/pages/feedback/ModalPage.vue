<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Modal from '../../../components/feedback/Modal.vue';
import Button from '../../../components/forms/Button.vue';
import Typography from '../../../components/data-display/Typography.vue';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep from '../../components/toolbar/TbSep.vue';

const { t } = useI18n();

type Size = 'small' | 'medium' | 'large' | 'xlarge';

const pgSize     = ref<Size>('medium');
const pgOverlay  = ref<'blur' | 'dim' | 'solid' | 'transparent'>('blur');
const pgCentered = ref(true);
const pgClosable = ref(true);

const pgOpen   = ref(false);
const open1    = ref(false);
const open2    = ref(false);
const open3    = ref(false);
const open4    = ref(false);
const open5    = ref(false);

function resetPlayground() {
    pgSize.value     = 'medium';
    pgOverlay.value  = 'blur';
    pgCentered.value = true;
    pgClosable.value = true;
}

const overviewCode = computed(() => {
    const parts: string[] = ['v-model="open"', 'title="Confirmar acción"'];
    if (pgSize.value    !== 'medium') parts.push(`size="${pgSize.value}"`);
    if (pgOverlay.value !== 'blur')   parts.push(`overlay="${pgOverlay.value}"`);
    if (!pgCentered.value)            parts.push('position="top"');
    if (!pgClosable.value)            parts.push(':show-close="false"', ':close-on-overlay="false"', ':close-on-escape="false"');
    return `<Modal ${parts.join(' ')}>
  <p>¿Quieres aplicar estos cambios?</p>
</Modal>`;
});

const basicCode = `<Button @click="open = true">Abrir modal</Button>
<Modal v-model="open" title="Confirmar" description="¿Quieres aplicar estos cambios?">
  <Typography>El cambio es reversible desde el historial.</Typography>
  <template #footer>
    <Button variant="ghost" @click="open = false">Cancelar</Button>
    <Button color="primary" @click="open = false">Aplicar</Button>
  </template>
</Modal>`;

const formCode = `<Modal v-model="open" size="medium" title="Nuevo proyecto">
  <form class="flex flex-col gap-3">
    <input class="border border-border rounded-md px-3 py-2" placeholder="Nombre" />
    <textarea class="border border-border rounded-md px-3 py-2" placeholder="Descripción" />
  </form>
  <template #footer>
    <Button variant="ghost" @click="open = false">Cancelar</Button>
    <Button color="primary" @click="open = false">Crear</Button>
  </template>
</Modal>`;

const lockedCode = `<Modal
  v-model="open"
  title="Acción crítica"
  color="danger"
  :close-on-overlay="false"
  :close-on-escape="false"
>
  <Typography>Solo se cierra con el botón explícito.</Typography>
  <template #footer>
    <Button color="danger" @click="open = false">Entendido</Button>
  </template>
</Modal>`;

const fullCode = `<Modal v-model="open" size="full" title="Vista completa">
  <Typography>Ocupa todo el viewport disponible.</Typography>
</Modal>`;

const scrollCode = `<Modal v-model="open" title="Términos y condiciones">
  <div class="max-h-[50vh] overflow-y-auto pr-2 flex flex-col gap-2">
    <p v-for="i in 12" :key="i">Párrafo {{ i }} con texto largo para forzar scroll interno.</p>
  </div>
</Modal>`;

const propsList = computed<PropDoc[]>(() => [
    { name: 'modelValue',     type: 'boolean',                                                                           description: t('pages.feedback.modal.props.modelValue') },
    { name: 'size',           type: "'small' | 'medium' | 'large' | 'xlarge' | 'full'", default: "'medium'",            description: t('pages.feedback.modal.props.size') },
    { name: 'position',       type: "'center' | 'top'",                                  default: "'center'",            description: t('pages.feedback.modal.props.position') },
    { name: 'radius',         type: "'none' | 'small' | 'medium' | 'large' | 'full'",                                    description: t('pages.feedback.modal.props.radius') },
    { name: 'title',          type: 'string',                                                                            description: t('pages.feedback.modal.props.title') },
    { name: 'description',    type: 'string',                                                                            description: t('pages.feedback.modal.props.description') },
    { name: 'closeOnOverlay', type: 'boolean',                                           default: 'true',                description: t('pages.feedback.modal.props.closeOnOverlay') },
    { name: 'closeOnEscape',  type: 'boolean',                                           default: 'true',                description: t('pages.feedback.modal.props.closeOnEscape') },
    { name: 'showClose',      type: 'boolean',                                           default: 'true',                description: t('pages.feedback.modal.props.showClose') },
    { name: 'lockScroll',     type: 'boolean',                                           default: 'true',                description: t('pages.feedback.modal.props.lockScroll') },
    { name: 'color',          type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",                          description: t('pages.feedback.modal.props.color') },
    { name: 'overlay',        type: "'blur' | 'solid' | 'transparent' | 'dark' | 'dim' | 'glass'", default: "'blur'",   description: t('pages.feedback.modal.props.overlay') },
    { name: 'innerBorder',    type: 'boolean',                                           default: 'true',                description: t('pages.feedback.modal.props.innerBorder') },
    { name: 'origin',         type: 'HTMLElement | null',                                                                description: t('pages.feedback.modal.props.origin') },
    { name: 'ariaLabel',      type: 'string',                                                                            description: t('pages.feedback.modal.props.ariaLabel') },
]);

const emitsList = computed<EmitDoc[]>(() => [
    { name: 'update:modelValue', payload: 'boolean', description: t('pages.feedback.modal.emits.updateModelValue') },
]);

const slotsList = computed<SlotDoc[]>(() => [
    { name: 'default', description: t('pages.feedback.modal.slots.default') },
    { name: 'header',  description: t('pages.feedback.modal.slots.header') },
    { name: 'footer',  description: t('pages.feedback.modal.slots.footer') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.feedback.modal.title')"
        category="Feedback"
        import-path="import { Modal } from 'mood-ui'"
        :description="t('pages.feedback.modal.description')"
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" @reset="resetPlayground">
                <template #controls>
                    <TbPills :label="t('pages.feedback.modal.controls.size')" :options="[{value:'small'},{value:'medium'},{value:'large'},{value:'xlarge'}]" v-model="pgSize" />
                    <TbSep />
                    <TbPills :label="t('pages.feedback.modal.controls.overlay')" :options="[{value:'blur'},{value:'dim'},{value:'solid'},{value:'transparent'}]" v-model="pgOverlay" />
                    <TbSep />
                    <TbToggle :label="t('pages.feedback.modal.controls.centered')" v-model="pgCentered" />
                    <TbToggle :label="t('pages.feedback.modal.controls.closable')" v-model="pgClosable" />
                </template>

                <Button color="primary" @click="pgOpen = true">{{ t('pages.feedback.modal.playground.open') }}</Button>
                <Modal
                    v-model="pgOpen"
                    :size="pgSize"
                    :position="pgCentered ? 'center' : 'top'"
                    :overlay="pgOverlay"
                    :show-close="pgClosable"
                    :close-on-overlay="pgClosable"
                    :close-on-escape="pgClosable"
                    :title="t('pages.feedback.modal.playground.title')"
                    :description="t('pages.feedback.modal.playground.description')"
                >
                    <Typography>{{ t('pages.feedback.modal.playground.body') }}</Typography>
                    <template #footer>
                        <Button variant="ghost" @click="pgOpen = false">{{ t('pages.feedback.modal.playground.cancel') }}</Button>
                        <Button color="primary" @click="pgOpen = false">{{ t('pages.feedback.modal.playground.apply') }}</Button>
                    </template>
                </Modal>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                :title="t('pages.feedback.modal.examples.basic.title')"
                :description="t('pages.feedback.modal.examples.basic.desc')"
                :code="basicCode"
                min-height="180px"
            >
                <Button @click="open1 = true">{{ t('pages.feedback.modal.examples.basic.cta') }}</Button>
                <Modal v-model="open1"
                    :title="t('pages.feedback.modal.examples.basic.modalTitle')"
                    :description="t('pages.feedback.modal.examples.basic.modalDesc')"
                >
                    <Typography>{{ t('pages.feedback.modal.examples.basic.body') }}</Typography>
                    <template #footer>
                        <Button variant="ghost" @click="open1 = false">{{ t('pages.feedback.modal.examples.basic.cancel') }}</Button>
                        <Button color="primary" @click="open1 = false">{{ t('pages.feedback.modal.examples.basic.apply') }}</Button>
                    </template>
                </Modal>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.modal.examples.form.title')"
                :description="t('pages.feedback.modal.examples.form.desc')"
                :code="formCode"
                min-height="180px"
            >
                <Button color="primary" @click="open2 = true">{{ t('pages.feedback.modal.examples.form.cta') }}</Button>
                <Modal v-model="open2" size="medium" :title="t('pages.feedback.modal.examples.form.modalTitle')">
                    <form class="flex flex-col gap-3">
                        <input class="border border-border rounded-md px-3 py-2 bg-card" :placeholder="t('pages.feedback.modal.examples.form.namePh')" />
                        <textarea class="border border-border rounded-md px-3 py-2 bg-card" :placeholder="t('pages.feedback.modal.examples.form.descPh')" />
                    </form>
                    <template #footer>
                        <Button variant="ghost" @click="open2 = false">{{ t('pages.feedback.modal.examples.form.cancel') }}</Button>
                        <Button color="primary" @click="open2 = false">{{ t('pages.feedback.modal.examples.form.create') }}</Button>
                    </template>
                </Modal>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.modal.examples.locked.title')"
                :description="t('pages.feedback.modal.examples.locked.desc')"
                :code="lockedCode"
                min-height="180px"
            >
                <Button color="danger" @click="open3 = true">{{ t('pages.feedback.modal.examples.locked.cta') }}</Button>
                <Modal
                    v-model="open3"
                    :title="t('pages.feedback.modal.examples.locked.modalTitle')"
                    color="danger"
                    :close-on-overlay="false"
                    :close-on-escape="false"
                >
                    <Typography>{{ t('pages.feedback.modal.examples.locked.body') }}</Typography>
                    <template #footer>
                        <Button color="danger" @click="open3 = false">{{ t('pages.feedback.modal.examples.locked.confirm') }}</Button>
                    </template>
                </Modal>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.modal.examples.full.title')"
                :description="t('pages.feedback.modal.examples.full.desc')"
                :code="fullCode"
                min-height="180px"
            >
                <Button @click="open4 = true">{{ t('pages.feedback.modal.examples.full.cta') }}</Button>
                <Modal v-model="open4" size="full" :title="t('pages.feedback.modal.examples.full.modalTitle')">
                    <Typography>{{ t('pages.feedback.modal.examples.full.body') }}</Typography>
                </Modal>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.modal.examples.scroll.title')"
                :description="t('pages.feedback.modal.examples.scroll.desc')"
                :code="scrollCode"
                min-height="180px"
            >
                <Button @click="open5 = true">{{ t('pages.feedback.modal.examples.scroll.cta') }}</Button>
                <Modal v-model="open5" :title="t('pages.feedback.modal.examples.scroll.modalTitle')">
                    <div class="max-h-[50vh] overflow-y-auto pr-2 flex flex-col gap-2">
                        <p v-for="i in 12" :key="i">{{ t('pages.feedback.modal.examples.scroll.paragraph', { i }) }}</p>
                    </div>
                </Modal>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
