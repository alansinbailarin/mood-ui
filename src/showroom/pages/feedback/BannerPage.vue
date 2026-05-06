<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Banner from '../../../components/feedback/Banner.vue';
import Button from '../../../components/forms/Button.vue';
import { SparklesIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgColor       = ref<'info' | 'success' | 'warning' | 'danger'>('info');
const pgVariant     = ref<'subtle' | 'filled' | 'outline'>('subtle');
const pgDismissable = ref(false);
const pgVisible     = ref(true);

function resetPlayground() {
    pgColor.value       = 'info';
    pgVariant.value     = 'subtle';
    pgDismissable.value = false;
    pgVisible.value     = true;
}

const colorDots = [
    { value: 'info'    as const, bg: '#3b82f6', label: 'Info'    },
    { value: 'success' as const, bg: '#22c55e', label: 'Success' },
    { value: 'warning' as const, bg: '#f59e0b', label: 'Warning' },
    { value: 'danger'  as const, bg: '#ef4444', label: 'Danger'  },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgColor.value   !== 'info')   parts.push(`color="${pgColor.value}"`);
    if (pgVariant.value !== 'subtle') parts.push(`variant="${pgVariant.value}"`);
    if (pgDismissable.value)          parts.push('dismissable');
    parts.push('title="Información"');
    parts.push('description="Tu cuenta se sincronizará en unos minutos."');
    return `<Banner ${parts.join(' ')} />`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const colorsCode = `<Banner color="info"    title="Información" description="Tu cuenta se sincronizará en unos minutos." />
<Banner color="success" title="Listo"        description="Los cambios se guardaron correctamente." />
<Banner color="warning" title="Atención"     description="Tu plan caduca en 5 días." />
<Banner color="danger"  title="Error"        description="No pudimos procesar el pago." />`;

const variantsCode = `<Banner color="info" variant="filled"  title="Filled"  description="Estilo sólido." />
<Banner color="info" variant="subtle"  title="Subtle"  description="Estilo suave (default)." />
<Banner color="info" variant="outline" title="Outline" description="Estilo con borde." />`;

const actionCode = `<Banner color="warning" title="Plan próximo a vencer" description="Renueva para no perder acceso a las funciones premium.">
  <template #actions>
    <Button color="warning" size="small">Renovar</Button>
  </template>
</Banner>`;

const dismissCode = `<Banner color="info" title="Tip" description="Puedes cerrar este aviso." dismissable @dismiss="visible = false" />`;

const iconCode = `<Banner color="primary" :icon="SparklesIcon" title="Nueva versión" description="La v2 trae soporte para temas y nuevos componentes." />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'color',            type: "'info' | 'success' | 'warning' | 'danger'",       default: "'info'",     description: 'Color semántico del banner.' },
    { name: 'variant',          type: "'filled' | 'subtle' | 'outline'",                  default: "'subtle'",   description: 'Estilo visual aplicado al banner.' },
    { name: 'title',            type: 'string',                                                                   description: 'Título destacado del banner.' },
    { name: 'description',      type: 'string',                                                                   description: 'Texto descriptivo. Se reemplaza por el slot default si se provee.' },
    { name: 'dismissable',      type: 'boolean',                                          default: 'false',       description: 'Muestra un botón de cierre que emite el evento dismiss.' },
    { name: 'dismissAnimation', type: "'collapse' | 'shrink'",                            default: "'collapse'",  description: 'Animación usada al cerrar el banner.' },
    { name: 'icon',             type: 'Component',                                                                description: 'Icono personalizado. Si se omite usa el icono por color.' },
    { name: 'showIcon',         type: 'boolean',                                          default: 'true',        description: 'Muestra u oculta el icono del banner.' },
    { name: 'position',         type: "'inline' | 'sticky-top' | 'sticky-bottom'",        default: "'inline'",    description: 'Posicionamiento del banner.' },
    { name: 'fullWidth',        type: 'boolean',                                          default: 'false',       description: 'Elimina el radius para anclar el banner de borde a borde.' },
    { name: 'radius',           type: "'none' | 'small' | 'medium' | 'large' | 'full'",                          description: 'Radio de las esquinas. Cascada desde ModoProvider.' },
];

const emitsList: EmitDoc[] = [
    { name: 'dismiss', payload: '—', description: 'Emitido al cerrar el banner cuando dismissable está activo.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Contenido del cuerpo del banner. Reemplaza la prop description cuando se necesita HTML.' },
    { name: 'actions', description: 'Acciones a la derecha del banner (típicamente botones).' },
];
</script>

<template>
    <ComponentDoc
        title="Banner"
        category="Feedback"
        import-path="import { Banner } from 'mood-ui'"
        description="Aviso prominente para comunicar estado a nivel de página o sección. Soporta colores semánticos, variantes, dismiss y posición sticky."
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <!-- Color dots -->
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

                    <!-- Variant -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Variante</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in ['subtle', 'filled', 'outline']"
                                :key="v"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgVariant === v
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgVariant = (v as typeof pgVariant)"
                            >{{ v }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDismissable
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDismissable = !pgDismissable"
                    >Dismissable</button>
                </template>

                <Banner
                    v-if="pgVisible"
                    class="w-full max-w-md"
                    :color="pgColor"
                    :variant="pgVariant"
                    :dismissable="pgDismissable"
                    title="Información"
                    description="Tu cuenta se sincronizará en unos minutos."
                    @dismiss="pgVisible = false"
                />
                <button
                    v-else
                    type="button"
                    class="text-sm text-primary underline"
                    @click="pgVisible = true"
                >Mostrar de nuevo</button>
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Colores"
                description="Cuatro colores semánticos con sus iconos por defecto."
                :code="colorsCode"
            >
                <div class="flex flex-col gap-2 w-full max-w-md">
                    <Banner color="info"    title="Información" description="Tu cuenta se sincronizará en unos minutos." />
                    <Banner color="success" title="Listo"       description="Los cambios se guardaron correctamente." />
                    <Banner color="warning" title="Atención"    description="Tu plan caduca en 5 días." />
                    <Banner color="danger"  title="Error"       description="No pudimos procesar el pago." />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Variantes"
                description="Tres tratamientos visuales: filled, subtle (default) y outline."
                :code="variantsCode"
            >
                <div class="flex flex-col gap-2 w-full max-w-md">
                    <Banner color="info" variant="filled"  title="Filled"  description="Estilo sólido." />
                    <Banner color="info" variant="subtle"  title="Subtle"  description="Estilo suave (default)." />
                    <Banner color="info" variant="outline" title="Outline" description="Estilo con borde." />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Con acción"
                description="Slot actions a la derecha para anclar un CTA."
                :code="actionCode"
            >
                <Banner
                    class="w-full max-w-md"
                    color="warning"
                    title="Plan próximo a vencer"
                    description="Renueva para no perder acceso a las funciones premium."
                >
                    <template #actions>
                        <Button color="warning" size="small">Renovar</Button>
                    </template>
                </Banner>
            </ComponentPreview>

            <ComponentPreview
                title="Dismissable"
                description="Permite al usuario cerrar el banner. Emite el evento dismiss."
                :code="dismissCode"
            >
                <Banner
                    class="w-full max-w-md"
                    color="info"
                    title="Tip"
                    description="Puedes cerrar este aviso."
                    dismissable
                />
            </ComponentPreview>

            <ComponentPreview
                title="Con icono personalizado"
                description="Sustituye el icono por uno propio mediante la prop icon."
                :code="iconCode"
            >
                <Banner
                    class="w-full max-w-md"
                    color="info"
                    :icon="SparklesIcon"
                    title="Nueva versión"
                    description="La v2 trae soporte para temas y nuevos componentes."
                />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
