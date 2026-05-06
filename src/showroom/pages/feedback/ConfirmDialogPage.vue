<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import ConfirmDialog from '../../../components/feedback/ConfirmDialog.vue';
import Button from '../../../components/forms/Button.vue';
import { useConfirm } from '../../../composables/useConfirm';
import { useToast } from '../../../composables/useToast';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

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
        title: '¿Continuar con la acción?',
        description: 'Vista previa del componente con la configuración del playground.',
        confirmLabel: 'Continuar',
        cancelLabel: 'Cancelar',
        color: pgTone.value,
        size: pgSize.value,
    });
    lastResult.value = ok ? 'confirmado' : 'cancelado';
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
        title: '¿Eliminar elemento?',
        description: 'Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
        cancelLabel: 'Cancelar',
        color: 'danger',
    });
    if (ok) toast.success('Eliminado');
    else toast.info('Cancelado');
}

async function runAsync() {
    const ok = await confirm({
        title: '¿Publicar ahora?',
        description: 'El contenido será visible para todos los usuarios.',
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
        title: 'Cerrar sesión',
        description: 'Tendrás que volver a iniciar sesión para acceder.',
        confirmLabel: 'Cerrar sesión',
        cancelLabel: 'Quedarme',
        color: 'warning',
    });
    toast.info(ok ? 'Sesión cerrada' : 'Te quedaste');
}

const propsList: PropDoc[] = [
    { name: 'radius', type: "'none' | 'small' | 'medium' | 'large' | 'full'", description: 'Radio por defecto para confirmaciones que no especifican uno.' },
];

const emitsList: EmitDoc[] = [];

const slotsList: SlotDoc[] = [];
</script>

<template>
    <!-- Mount global del host -->
    <ConfirmDialog />

    <ComponentDoc
        title="ConfirmDialog"
        category="Feedback"
        import-path="import { ConfirmDialog, useConfirm } from 'mood-ui'"
        description="Diálogo de confirmación imperativo. Monta una vez el host <ConfirmDialog /> cerca del root y usa useConfirm().confirm({...}) desde cualquier componente para obtener un Promise<boolean>."
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" lang="vue" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Tono</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="t in (['default', 'primary', 'danger'] as Tone[])"
                                :key="t"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgTone === t
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgTone = t"
                            >{{ t }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Tamaño</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in (['small', 'medium', 'large'] as Size[])"
                                :key="s"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgSize === s
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgSize = s"
                            >{{ s }}</button>
                        </div>
                    </div>
                </template>

                <Button :color="pgTone === 'default' ? 'default' : pgTone" @click="runPlayground">
                    Lanzar confirm()
                </Button>
                <span class="text-sm text-muted-foreground">Última respuesta: {{ lastResult }}</span>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Confirmación básica"
                description="Pasando solo un string se obtiene un yes/no minimalista."
                :code="basicCode"
                min-height="180px"
            >
                <Button @click="runBasic">Lanzar confirm</Button>
            </ComponentPreview>

            <ComponentPreview
                title="Acción destructiva"
                description="Para borrados y operaciones irreversibles, usa color='danger' y un confirmLabel explícito."
                :code="dangerCode"
                min-height="180px"
            >
                <Button color="danger" @click="runDanger">Eliminar elemento</Button>
            </ComponentPreview>

            <ComponentPreview
                title="Async confirm"
                description="confirm() devuelve Promise<boolean>: ideal para encadenar await + llamada a API."
                :code="asyncCode"
                min-height="180px"
            >
                <Button color="primary" @click="runAsync">Publicar</Button>
            </ComponentPreview>

            <ComponentPreview
                title="Labels personalizados"
                description="Sobrescribe confirmLabel y cancelLabel para que el botón refleje exactamente la acción."
                :code="customCode"
                min-height="180px"
            >
                <Button color="warning" @click="runCustom">Cerrar sesión</Button>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
