<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Drawer from '../../../components/feedback/Drawer.vue';
import Button from '../../../components/forms/Button.vue';
import Typography from '../../../components/data-display/Typography.vue';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

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

const propsList: PropDoc[] = [
    { name: 'modelValue',     type: 'boolean',                                                                                                description: 'Visibilidad. Usa v-model.' },
    { name: 'side',           type: "'left' | 'right' | 'top' | 'bottom'",            default: "'right'",                                     description: 'Lado desde el que entra el panel.' },
    { name: 'size',           type: "'small' | 'medium' | 'large' | 'full'",          default: "'medium'",                                    description: 'Tamaño en el eje principal del panel.' },
    { name: 'radius',         type: "'none' | 'small' | 'medium' | 'large' | 'full'",                                                          description: 'Radio de las esquinas (el lado pegado al borde no se redondea).' },
    { name: 'title',          type: 'string',                                                                                                  description: 'Título accesible — renderizado en header si no hay slot.' },
    { name: 'description',    type: 'string',                                                                                                  description: 'Descripción opcional bajo el título.' },
    { name: 'closeOnOverlay', type: 'boolean',                                         default: 'true',                                        description: 'Cierra al hacer click en el backdrop.' },
    { name: 'closeOnEscape',  type: 'boolean',                                         default: 'true',                                        description: 'Cierra al pulsar Escape.' },
    { name: 'showClose',      type: 'boolean',                                         default: 'true',                                        description: 'Muestra el botón de cerrar (X) en el header.' },
    { name: 'lockScroll',     type: 'boolean',                                         default: 'true',                                        description: 'Bloquea el scroll del body mientras está abierto.' },
    { name: 'color',          type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",                                                description: 'Color de acento aplicado a borde y ring.' },
    { name: 'overlay',        type: "'blur' | 'solid' | 'transparent' | 'dark' | 'dim' | 'glass'", default: "'blur'",                          description: 'Estilo del backdrop.' },
    { name: 'innerBorder',    type: 'boolean',                                         default: 'false',                                       description: 'Borde interior sutil dentro del panel.' },
    { name: 'ariaLabel',      type: 'string',                                                                                                  description: 'Etiqueta accesible cuando no hay title.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'boolean', description: 'Cambio del estado abierto/cerrado.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Cuerpo principal del drawer.' },
    { name: 'header',  description: 'Reemplaza el header generado por title/description.' },
    { name: 'footer',  description: 'Acciones al pie del drawer.' },
];
</script>

<template>
    <ComponentDoc
        title="Drawer"
        category="Feedback"
        import-path="import { Drawer } from 'mood-ui'"
        description="Panel deslizable desde cualquier lado del viewport. Útil para filtros, settings, detalles y bottom-sheets en mobile. Soporta foco atrapado y bloqueo de scroll."
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Lado</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in (['left', 'right', 'top', 'bottom'] as Side[])"
                                :key="s"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgSide === s
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgSide = s"
                            >{{ s }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Tamaño</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in (['small', 'medium', 'large', 'full'] as Size[])"
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

                <Button color="primary" @click="pgOpen = true">Abrir drawer</Button>
                <Drawer
                    v-model="pgOpen"
                    :side="pgSide"
                    :size="pgSize"
                    :close-on-overlay="pgDismissable"
                    :close-on-escape="pgDismissable"
                    title="Filtros"
                    description="Vista previa interactiva."
                >
                    <Typography>Contenido del drawer.</Typography>
                </Drawer>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Lado derecho (default)"
                description="El placement por defecto. Ideal para detalles secundarios sin abandonar la vista actual."
                :code="`<Drawer v-model='open' side='right' title='Filtros' />`"
                min-height="180px"
            >
                <Button @click="open1 = true">Abrir drawer derecho</Button>
                <Drawer v-model="open1" side="right" title="Filtros" description="Refina los resultados">
                    <Typography>Contenido del drawer.</Typography>
                </Drawer>
            </ComponentPreview>

            <ComponentPreview
                title="Izquierdo"
                description="Patrón clásico de menú de navegación lateral."
                :code="`<Drawer v-model='open' side='left' title='Menú' />`"
                min-height="180px"
            >
                <Button @click="open2 = true">Abrir menú</Button>
                <Drawer v-model="open2" side="left" title="Menú">
                    <Typography>Enlaces de navegación.</Typography>
                </Drawer>
            </ComponentPreview>

            <ComponentPreview
                title="Superior y bottom-sheet"
                description="top funciona bien para notificaciones; bottom imita el comportamiento de bottom-sheet en móvil."
                :code="sidesCode"
                min-height="180px"
            >
                <Button @click="open3 = true">Top</Button>
                <Button @click="open4 = true">Bottom</Button>
                <Drawer v-model="open3" side="top" title="Notificaciones">
                    <Typography>Contenido del drawer.</Typography>
                </Drawer>
                <Drawer v-model="open4" side="bottom" title="Compartir">
                    <Typography>Opciones para compartir.</Typography>
                </Drawer>
            </ComponentPreview>

            <ComponentPreview
                title="Con contenido (form)"
                description="El drawer se adapta al contenido — útil para formularios secundarios y edición rápida."
                :code="contentCode"
                min-height="180px"
            >
                <Button color="primary" @click="open5 = true">Editar detalles</Button>
                <Drawer v-model="open5" side="right" size="large" title="Detalles" description="Edición rápida del proyecto seleccionado.">
                    <div class="flex flex-col gap-3">
                        <input class="border border-border rounded-md px-3 py-2 bg-card" placeholder="Nombre" />
                        <textarea class="border border-border rounded-md px-3 py-2 bg-card" placeholder="Notas" />
                    </div>
                </Drawer>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
