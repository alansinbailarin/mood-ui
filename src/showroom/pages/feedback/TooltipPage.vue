<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Tooltip from '../../../components/feedback/Tooltip.vue';
import Button from '../../../components/forms/Button.vue';
import { HeartIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

type Placement = 'top' | 'right' | 'bottom' | 'left';
type Color = 'default' | 'primary' | 'danger' | 'success' | 'warning' | 'inverted';

const pgPlacement = ref<Placement>('top');
const pgColor     = ref<Color>('default');
const pgDelay     = ref<0 | 200 | 500>(200);

function resetPlayground() {
    pgPlacement.value = 'top';
    pgColor.value     = 'default';
    pgDelay.value     = 200;
}

const colorDots = [
    { value: 'default'  as const, bg: '#1f2937',        label: 'Default'  },
    { value: 'primary'  as const, bg: 'var(--primary)', label: 'Primary'  },
    { value: 'success'  as const, bg: '#22c55e',        label: 'Success'  },
    { value: 'warning'  as const, bg: '#f59e0b',        label: 'Warning'  },
    { value: 'danger'   as const, bg: '#ef4444',        label: 'Danger'   },
    { value: 'inverted' as const, bg: '#f8fafc',        label: 'Inverted' },
];

const overviewCode = computed(() => {
    const parts: string[] = [`content="Mensaje"`];
    if (pgPlacement.value !== 'top')     parts.push(`placement="${pgPlacement.value}"`);
    if (pgColor.value     !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgDelay.value     !== 200)       parts.push(`:open-delay="${pgDelay.value}"`);
    return `<Tooltip ${parts.join(' ')}>
  <Button>Hover me</Button>
</Tooltip>`;
});

const placementsCode = `<Tooltip content="Top" placement="top"><Button>Top</Button></Tooltip>
<Tooltip content="Right" placement="right"><Button>Right</Button></Tooltip>
<Tooltip content="Bottom" placement="bottom"><Button>Bottom</Button></Tooltip>
<Tooltip content="Left" placement="left"><Button>Left</Button></Tooltip>`;

const richCode = `<Tooltip placement="top" :max-width="280">
  <template #content>
    <div class="flex flex-col gap-1">
      <strong>Atajo de teclado</strong>
      <span class="opacity-80">Pulsa <kbd>Ctrl</kbd>+<kbd>K</kbd> para abrir el buscador.</span>
    </div>
  </template>
  <Button variant="outline">Ver atajo</Button>
</Tooltip>`;

const iconCode = `<Tooltip content="Me gusta">
  <Button :icon="HeartIcon" color="danger" variant="ghost" aria-label="Like" />
</Tooltip>`;

const delayCode = `<Tooltip content="Sin delay" :open-delay="0"><Button>Inmediato</Button></Tooltip>
<Tooltip content="Delay corto" :open-delay="200"><Button>200 ms</Button></Tooltip>
<Tooltip content="Delay largo" :open-delay="600"><Button>600 ms</Button></Tooltip>`;

const propsList: PropDoc[] = [
    { name: 'content',      type: 'string',                                                                                                  description: 'Texto del tooltip. Para markup, usa el slot content.' },
    { name: 'placement',    type: "'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'", default: "'top'", description: 'Posición respecto al trigger.' },
    { name: 'offset',       type: 'number',                                          default: '8',                                            description: 'Distancia en px entre el trigger y el panel.' },
    { name: 'trigger',      type: "'hover' | 'focus' | 'click' | 'manual' | array", default: "['hover','focus']",                             description: 'Eventos que abren el tooltip.' },
    { name: 'openDelay',    type: 'number',                                          default: '200',                                          description: 'Delay en ms antes de abrir.' },
    { name: 'closeDelay',   type: 'number',                                          default: '100',                                          description: 'Delay en ms antes de cerrar.' },
    { name: 'arrow',        type: 'boolean',                                         default: 'true',                                         description: 'Muestra una flecha apuntando al trigger.' },
    { name: 'color',        type: "'default' | 'primary' | 'danger' | 'success' | 'warning' | 'inverted'", default: "'default'",              description: 'Color del panel.' },
    { name: 'size',         type: "'small' | 'medium' | 'large'",                    default: "'medium'",                                     description: 'Tamaño del panel y la tipografía.' },
    { name: 'radius',       type: "'none' | 'small' | 'medium' | 'large' | 'full'",                                                           description: 'Radio de las esquinas. Cascada desde ModoProvider.' },
    { name: 'disabled',     type: 'boolean',                                         default: 'false',                                        description: 'No abre nunca el tooltip.' },
    { name: 'open',         type: 'boolean',                                                                                                  description: 'Control externo del estado abierto (v-model:open).' },
    { name: 'maxWidth',     type: 'number',                                          default: '260',                                          description: 'Ancho máximo del panel en px.' },
    { name: 'wrapperClass', type: 'string',                                                                                                   description: 'Clases extra para el wrapper del trigger.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:open', payload: 'boolean', description: 'Cambio del estado abierto/cerrado del tooltip.' },
    { name: 'show',        payload: '—',       description: 'Emitido cuando el panel se abre.' },
    { name: 'hide',        payload: '—',       description: 'Emitido cuando el panel se cierra.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Elemento trigger sobre el que se muestra el tooltip.' },
    { name: 'content', description: 'Contenido personalizado del panel. Reemplaza la prop content.' },
];
</script>

<template>
    <ComponentDoc
        title="Tooltip"
        category="Feedback"
        import-path="import { Tooltip } from 'mood-ui'"
        description="Pista contextual mostrada al hacer hover o focus sobre un elemento. Soporta múltiples placements, colores semánticos, delays configurables y contenido enriquecido."
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Posición</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="p in (['top', 'right', 'bottom', 'left'] as Placement[])"
                                :key="p"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgPlacement === p
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgPlacement = p"
                            >{{ p }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Color</span>
                        <div class="flex items-center gap-1">
                            <button
                                v-for="c in colorDots"
                                :key="c.value"
                                type="button"
                                class="size-4 rounded-full transition-all duration-150 border border-border"
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
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Delay</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="d in ([0, 200, 500] as const)"
                                :key="d"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgDelay === d
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgDelay = d"
                            >{{ d }}ms</button>
                        </div>
                    </div>
                </template>

                <Tooltip
                    content="Mensaje"
                    :placement="pgPlacement"
                    :color="pgColor"
                    :open-delay="pgDelay"
                >
                    <Button>Hover me</Button>
                </Tooltip>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Posiciones"
                description="Cuatro placements principales. Cada variante también admite -start y -end para alinear con un borde del trigger."
                :code="placementsCode"
                min-height="200px"
            >
                <Tooltip content="Top"    placement="top"><Button>Top</Button></Tooltip>
                <Tooltip content="Right"  placement="right"><Button>Right</Button></Tooltip>
                <Tooltip content="Bottom" placement="bottom"><Button>Bottom</Button></Tooltip>
                <Tooltip content="Left"   placement="left"><Button>Left</Button></Tooltip>
            </ComponentPreview>

            <ComponentPreview
                title="Contenido enriquecido"
                description="Usa el slot content para incluir markup, iconos o atajos de teclado dentro del panel."
                :code="richCode"
                min-height="200px"
            >
                <Tooltip placement="top" :max-width="280">
                    <template #content>
                        <div class="flex flex-col gap-1">
                            <strong>Atajo de teclado</strong>
                            <span class="opacity-80">Pulsa <kbd>Ctrl</kbd>+<kbd>K</kbd> para abrir el buscador.</span>
                        </div>
                    </template>
                    <Button variant="outline">Ver atajo</Button>
                </Tooltip>
            </ComponentPreview>

            <ComponentPreview
                title="Sobre botón con icono"
                description="Imprescindible en botones icon-only para describir la acción a usuarios de lectores de pantalla."
                :code="iconCode"
                min-height="180px"
            >
                <Tooltip content="Me gusta">
                    <Button :icon="HeartIcon" color="danger" variant="ghost" aria-label="Like" />
                </Tooltip>
            </ComponentPreview>

            <ComponentPreview
                title="Delays"
                description="Ajusta el openDelay para evitar tooltips intrusivos al pasar el cursor de un botón a otro."
                :code="delayCode"
                min-height="180px"
            >
                <Tooltip content="Sin delay" :open-delay="0"><Button>Inmediato</Button></Tooltip>
                <Tooltip content="Delay corto" :open-delay="200"><Button>200 ms</Button></Tooltip>
                <Tooltip content="Delay largo" :open-delay="600"><Button>600 ms</Button></Tooltip>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
