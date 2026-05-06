<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Button from '../../../components/forms/Button.vue';
import { useToast } from '../../../composables/useToast';
import { SparklesIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

type Color   = 'info' | 'success' | 'warning' | 'danger';
type Variant = 'filled' | 'subtle' | 'outline';

const toast = useToast();

const pgColor   = ref<Color>('info');
const pgVariant = ref<Variant>('subtle');

function resetPlayground() {
    pgColor.value   = 'info';
    pgVariant.value = 'subtle';
}

const colorDots = [
    { value: 'info'    as const, bg: '#3b82f6', label: 'Info'    },
    { value: 'success' as const, bg: '#22c55e', label: 'Success' },
    { value: 'warning' as const, bg: '#f59e0b', label: 'Warning' },
    { value: 'danger'  as const, bg: '#ef4444', label: 'Danger'  },
];

const overviewCode = computed(() => `toast.push({
  title: 'Notificación',
  description: 'Mensaje de ejemplo',
  color: '${pgColor.value}',
  variant: '${pgVariant.value}',
});`);

function pushOverview() {
    toast.push({
        title: 'Notificación',
        description: 'Vista previa con la configuración del playground.',
        color: pgColor.value,
        variant: pgVariant.value,
    });
}

function pushColor(color: Color, label: string) {
    toast[color]({ title: label, description: `Toast de tipo ${color}.` });
}

function pushAction() {
    toast.info({
        title: 'Archivo movido',
        description: 'Lo enviamos a la papelera.',
        action: {
            label: 'Deshacer',
            onClick: (close) => { toast.success({ title: 'Restaurado' }); close(); },
        },
    });
}

function pushIcon() {
    toast.success({
        title: 'Logro desbloqueado',
        description: 'Has completado el tour del producto.',
        icon: SparklesIcon,
    });
}

function pushPinned() {
    toast.warning({
        title: 'Conexión inestable',
        description: 'Reintentando…',
        duration: 0,
    });
}

const colorsCode = `toast.info({ title: 'Info' });
toast.success({ title: 'Success' });
toast.warning({ title: 'Warning' });
toast.danger({ title: 'Error' });`;

const actionCode = `toast.info({
  title: 'Archivo movido',
  description: 'Lo enviamos a la papelera.',
  action: {
    label: 'Deshacer',
    onClick: (close) => { restore(); close(); },
  },
});`;

const iconCode = `import { SparklesIcon } from '@heroicons/vue/24/outline';

toast.success({
  title: 'Logro desbloqueado',
  description: 'Has completado el tour del producto.',
  icon: SparklesIcon,
});`;

const pinnedCode = `// duration: 0 → toast persistente hasta dismiss explícito
toast.warning({
  title: 'Conexión inestable',
  description: 'Reintentando…',
  duration: 0,
});`;

const propsList: PropDoc[] = [
    { name: 'title',        type: 'string',                                                          description: 'Título principal del toast.' },
    { name: 'description',  type: 'string',                                                          description: 'Texto de soporte bajo el título.' },
    { name: 'color',        type: "'info' | 'success' | 'warning' | 'danger'",  default: "'info'",   description: 'Color semántico del toast.' },
    { name: 'variant',      type: "'filled' | 'subtle' | 'outline'",            default: "'subtle'", description: 'Variante visual.' },
    { name: 'icon',         type: 'Component',                                                       description: 'Icono leading personalizado. Por defecto se elige uno por color.' },
    { name: 'hideIcon',     type: 'boolean',                                                         description: 'Oculta el icono leading.' },
    { name: 'duration',     type: 'number',                                     default: '4500',     description: 'Auto-close en ms. Usa 0 para mantener el toast pinned.' },
    { name: 'action',       type: '{ label, onClick(close), keepOpen? }',                            description: 'Botón de acción inline (ej. "Deshacer").' },
    { name: 'dismissable',  type: 'boolean',                                    default: 'true',     description: 'Muestra el botón de cerrar.' },
    { name: 'pauseOnHover', type: 'boolean',                                    default: 'true',     description: 'Pausa el timer mientras el cursor está encima.' },
    { name: 'id',           type: 'string | number',                                                 description: 'ID estable. Si se reusa, el toast se actualiza in-place.' },
    { name: 'radius',       type: "'none' | 'small' | 'medium' | 'large' | 'full'",                  description: 'Radio override; por defecto cascadea del provider.' },
    { name: 'placement',    type: "'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'", description: 'Override de posición para este toast.' },
];

const emitsList: EmitDoc[] = [];

const slotsList: SlotDoc[] = [];
</script>

<template>
    <ComponentDoc
        title="Toast"
        category="Feedback"
        import-path="import { useToast } from 'mood-ui'"
        description="Notificación efímera renderizada por el ToastContainer. No se instancia directamente: se dispara con los helpers info / success / warning / danger del composable useToast()."
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" lang="ts" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Color</span>
                        <div class="flex items-center gap-1">
                            <button
                                v-for="c in colorDots"
                                :key="c.value"
                                type="button"
                                class="size-4 rounded-full transition-all duration-150"
                                :class="pgColor === c.value
                                    ? 'ring-2 ring-offset-1 ring-foreground/30 scale-125'
                                    : 'hover:scale-110 opacity-70 hover:opacity-100'"
                                :style="`background: ${c.bg}`"
                                :title="c.label"
                                @click="pgColor = c.value"
                            />
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Variante</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in (['filled', 'subtle', 'outline'] as Variant[])"
                                :key="v"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgVariant === v
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgVariant = v"
                            >{{ v }}</button>
                        </div>
                    </div>
                </template>

                <Button color="primary" @click="pushOverview">Lanzar toast</Button>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Colores semánticos"
                description="Cuatro helpers cubren los estados habituales: informativo, éxito, advertencia y error."
                :code="colorsCode"
                min-height="160px"
            >
                <Button @click="pushColor('info', 'Información')">info</Button>
                <Button color="success" @click="pushColor('success', 'Operación completada')">success</Button>
                <Button color="warning" @click="pushColor('warning', 'Atención')">warning</Button>
                <Button color="danger"  @click="pushColor('danger', 'Algo salió mal')">danger</Button>
            </ComponentPreview>

            <ComponentPreview
                title="Con acción"
                description="action añade un botón inline — patrón clásico para 'Deshacer' tras un borrado."
                :code="actionCode"
                min-height="160px"
            >
                <Button @click="pushAction">Mover a papelera</Button>
            </ComponentPreview>

            <ComponentPreview
                title="Icono personalizado"
                description="Pasa cualquier componente de icono (heroicons u otro) para sustituir el icono por defecto."
                :code="iconCode"
                min-height="160px"
            >
                <Button color="success" @click="pushIcon">Mostrar logro</Button>
            </ComponentPreview>

            <ComponentPreview
                title="Pinned (sin auto-close)"
                description="duration: 0 mantiene el toast hasta que el usuario lo cierre o llames dismiss()."
                :code="pinnedCode"
                min-height="160px"
            >
                <Button color="warning" @click="pushPinned">Toast pinned</Button>
                <Button variant="outline" @click="toast.dismissAll()">Limpiar todos</Button>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
