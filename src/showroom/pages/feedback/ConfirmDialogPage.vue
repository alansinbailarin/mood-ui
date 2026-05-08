<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import ConfirmDialog from '../../../components/feedback/ConfirmDialog.vue';
import Button from '../../../components/forms/Button.vue';
import { useConfirm } from '../../../composables/useConfirm';
import { useToast } from '../../../composables/useToast';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbSep from '../../components/toolbar/TbSep.vue';

const { t } = useI18n();

type Tone = 'default' | 'primary' | 'danger';
type Size = 'small' | 'medium' | 'large';

const { confirm } = useConfirm();
const toast = useToast();

const pgTone = ref<Tone>('primary');
const pgSize = ref<Size>('small');
const lastResult = ref<string>('—');

function resetPlayground() {
    pgTone.value = 'primary';
    pgSize.value = 'small';
    lastResult.value = '—';
}

async function runPlayground() {
    const ok = await confirm({
        title:        t('pages.feedback.confirmDialog.playground.title'),
        description:  t('pages.feedback.confirmDialog.playground.description'),
        confirmLabel: t('pages.feedback.confirmDialog.playground.confirmLabel'),
        cancelLabel:  t('pages.feedback.confirmDialog.playground.cancelLabel'),
        color: pgTone.value,
        size:  pgSize.value,
    });
    lastResult.value = ok
        ? t('pages.feedback.confirmDialog.playground.confirmed')
        : t('pages.feedback.confirmDialog.playground.cancelled');
}

const overviewCode = computed(() => {
    const parts: string[] = [
        `title: '¿Continuar con la acción?'`,
        `description: '...'`,
    ];
    if (pgTone.value !== 'primary') parts.push(`color: '${pgTone.value}'`);
    if (pgSize.value !== 'small')   parts.push(`size: '${pgSize.value}'`);
    return `// Mount once cerca del root:
<ConfirmDialog />

// Desde cualquier componente:
const { confirm } = useConfirm();
const ok = await confirm({
  ${parts.join(',\n  ')},
});`;
});

const basicCode = `const { confirm } = useConfirm();

async function ask() {
  const ok = await confirm('¿Confirmar acción?');
  if (ok) console.log('Confirmado');
}`;

const dangerCode = `const ok = await confirm({
  title: '¿Eliminar elemento?',
  description: 'Esta acción no se puede deshacer.',
  confirmLabel: 'Eliminar',
  cancelLabel: 'Cancelar',
  color: 'danger',
});`;

const asyncCode = `async function publish() {
  const ok = await confirm({
    title: '¿Publicar ahora?',
    description: 'El contenido será visible para todos los usuarios.',
    confirmLabel: 'Publicar',
    color: 'primary',
  });
  if (!ok) return;
  await api.publish();
  toast.success('Publicado');
}`;

const customCode = `await confirm({
  title: 'Cerrar sesión',
  description: 'Tendrás que volver a iniciar sesión para acceder.',
  confirmLabel: 'Cerrar sesión',
  cancelLabel: 'Quedarme',
  color: 'warning',
  hideCancel: false,
});`;

async function runBasic() {
    const ok = await confirm('¿Confirmar acción?');
    toast.info(ok ? 'Confirmado' : 'Cancelado');
}

async function runDanger() {
    const ok = await confirm({
        title:        '¿Eliminar elemento?',
        description:  'Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
        cancelLabel:  'Cancelar',
        color: 'danger',
    });
    if (ok) toast.success('Eliminado');
    else toast.info('Cancelado');
}

async function runAsync() {
    const ok = await confirm({
        title:        '¿Publicar ahora?',
        description:  'El contenido será visible para todos los usuarios.',
        confirmLabel: 'Publicar',
        color: 'primary',
    });
    if (!ok) return;
    toast.info('Publicando…');
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Publicado');
}

async function runCustom() {
    const ok = await confirm({
        title:        'Cerrar sesión',
        description:  'Tendrás que volver a iniciar sesión para acceder.',
        confirmLabel: 'Cerrar sesión',
        cancelLabel:  'Quedarme',
        color: 'warning',
    });
    toast.info(ok ? 'Sesión cerrada' : 'Te quedaste');
}

const propsList = computed<PropDoc[]>(() => [
    { name: 'radius', type: "'none' | 'small' | 'medium' | 'large' | 'full'", description: t('pages.feedback.confirmDialog.props.radius') },
]);

const emitsList: EmitDoc[] = [];
const slotsList: SlotDoc[] = [];
</script>

<template>
    <!-- Mount global del host -->
    <ConfirmDialog />

    <ComponentDoc
        :title="t('pages.feedback.confirmDialog.title')"
        category="Feedback"
        import-path="import { ConfirmDialog, useConfirm } from 'mood-ui'"
        :description="t('pages.feedback.confirmDialog.description')"
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" lang="vue" @reset="resetPlayground">
                <template #controls>
                    <TbPills :label="t('pages.feedback.confirmDialog.controls.tone')" :options="[{value:'default'},{value:'primary'},{value:'danger'}]" v-model="pgTone" />
                    <TbSep />
                    <TbPills :label="t('pages.feedback.confirmDialog.controls.size')" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                </template>

                <Button :color="pgTone === 'default' ? 'default' : pgTone" @click="runPlayground">
                    {{ t('pages.feedback.confirmDialog.playground.launch') }}
                </Button>
                <span class="text-sm text-muted-foreground">
                    {{ t('pages.feedback.confirmDialog.playground.lastResult') }} {{ lastResult }}
                </span>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                :title="t('pages.feedback.confirmDialog.examples.basic.title')"
                :description="t('pages.feedback.confirmDialog.examples.basic.desc')"
                :code="basicCode"
                min-height="180px"
            >
                <Button @click="runBasic">{{ t('pages.feedback.confirmDialog.examples.basic.cta') }}</Button>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.confirmDialog.examples.danger.title')"
                :description="t('pages.feedback.confirmDialog.examples.danger.desc')"
                :code="dangerCode"
                min-height="180px"
            >
                <Button color="danger" @click="runDanger">{{ t('pages.feedback.confirmDialog.examples.danger.cta') }}</Button>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.confirmDialog.examples.async.title')"
                :description="t('pages.feedback.confirmDialog.examples.async.desc')"
                :code="asyncCode"
                min-height="180px"
            >
                <Button color="primary" @click="runAsync">{{ t('pages.feedback.confirmDialog.examples.async.cta') }}</Button>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.confirmDialog.examples.custom.title')"
                :description="t('pages.feedback.confirmDialog.examples.custom.desc')"
                :code="customCode"
                min-height="180px"
            >
                <Button color="warning" @click="runCustom">{{ t('pages.feedback.confirmDialog.examples.custom.cta') }}</Button>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
