<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Button from '../../../components/forms/Button.vue';
import { useToast } from '../../../composables/useToast';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

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

const propsList: PropDoc[] = [
    { name: 'placement',        type: "'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'", default: "'top-right'", description: 'Posición del stack en el viewport.' },
    { name: 'max',              type: 'number',                                  default: '5',         description: 'Número máximo de toasts visibles; los más antiguos se evictan.' },
    { name: 'defaultDuration',  type: 'number',                                  default: '4500',      description: 'Duración por defecto en ms para toasts sin duration.' },
    { name: 'defaultVariant',   type: "'filled' | 'subtle' | 'outline'",         default: "'subtle'",  description: 'Variante por defecto aplicada a las llamadas push().' },
    { name: 'offset',           type: 'number',                                  default: '16',        description: 'Distancia en px desde el borde del viewport.' },
    { name: 'reducedMotion',    type: "'auto' | 'force'",                                              description: 'Comportamiento de animación bajo prefers-reduced-motion.' },
];

const emitsList: EmitDoc[] = [];

const slotsList: SlotDoc[] = [];
</script>

<template>
    <ComponentDoc
        title="ToastContainer"
        category="Feedback"
        import-path="import { ToastContainer, useToast } from 'mood-ui'"
        description="Contenedor singleton donde aparecen los toasts disparados por el composable useToast(). Móntalo una vez cerca del root y dispara notificaciones desde cualquier componente."
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" lang="vue" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Posición</span>
                        <div class="flex rounded-md border border-border overflow-hidden flex-wrap">
                            <button
                                v-for="p in (['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as Placement[])"
                                :key="p"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgPlacement === p
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgPlacement = p"
                            >{{ p }}</button>
                        </div>
                    </div>
                </template>

                <Button color="primary" @click="pushSuccess">Lanzar toast</Button>
                <Button variant="outline" @click="toast.dismissAll()">Limpiar todos</Button>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Success"
                description="Para confirmar acciones completadas correctamente."
                :code="successCode"
                min-height="160px"
            >
                <Button color="success" @click="pushSuccess">success()</Button>
            </ComponentPreview>

            <ComponentPreview
                title="Error / danger"
                description="Para errores de red, validación fallida o cualquier estado bloqueante."
                :code="errorCode"
                min-height="160px"
            >
                <Button color="danger" @click="pushError">danger()</Button>
            </ComponentPreview>

            <ComponentPreview
                title="Info pinned"
                description="Pasando duration: 0 el toast queda anclado hasta que el usuario lo cierre o llames dismiss()."
                :code="infoCode"
                min-height="160px"
            >
                <Button @click="pushInfo">info() (pinned)</Button>
            </ComponentPreview>

            <ComponentPreview
                title="Warning con acción"
                description="Añade un botón de acción inline — útil para 'Deshacer', 'Revisar' o 'Reintentar'."
                :code="warningCode"
                min-height="160px"
            >
                <Button color="warning" @click="pushWarn">warning()</Button>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
