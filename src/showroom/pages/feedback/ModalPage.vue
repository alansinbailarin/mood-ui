<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Modal from '../../../components/feedback/Modal.vue';
import Button from '../../../components/forms/Button.vue';
import Typography from '../../../components/data-display/Typography.vue';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

type Size = 'small' | 'medium' | 'large' | 'xlarge';

const pgSize     = ref<Size>('medium');
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
    pgCentered.value = true;
    pgClosable.value = true;
}

const overviewCode = computed(() => {
    const parts: string[] = ['v-model="open"', 'title="Confirmar acción"'];
    if (pgSize.value !== 'medium') parts.push(`size="${pgSize.value}"`);
    if (!pgCentered.value)         parts.push('position="top"');
    if (!pgClosable.value)         parts.push(':show-close="false"', ':close-on-overlay="false"', ':close-on-escape="false"');
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

const propsList: PropDoc[] = [
    { name: 'modelValue',     type: 'boolean',                                                                           description: 'Visibilidad. Usa v-model.' },
    { name: 'size',           type: "'small' | 'medium' | 'large' | 'xlarge' | 'full'", default: "'medium'",            description: 'Tamaño del panel.' },
    { name: 'position',       type: "'center' | 'top'",                                  default: "'center'",            description: 'Posición vertical del panel.' },
    { name: 'radius',         type: "'none' | 'small' | 'medium' | 'large' | 'full'",                                    description: 'Radio de las esquinas. Cascada del provider.' },
    { name: 'title',          type: 'string',                                                                            description: 'Título accesible — se renderiza en header si no hay slot.' },
    { name: 'description',    type: 'string',                                                                            description: 'Descripción opcional bajo el título.' },
    { name: 'closeOnOverlay', type: 'boolean',                                           default: 'true',                description: 'Cierra al hacer click en el backdrop.' },
    { name: 'closeOnEscape',  type: 'boolean',                                           default: 'true',                description: 'Cierra al pulsar Escape.' },
    { name: 'showClose',      type: 'boolean',                                           default: 'true',                description: 'Muestra el botón de cerrar (X) en la esquina.' },
    { name: 'lockScroll',     type: 'boolean',                                           default: 'true',                description: 'Bloquea el scroll del body mientras está abierto.' },
    { name: 'color',          type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",                          description: 'Color de acento aplicado a borde y ring.' },
    { name: 'overlay',        type: "'blur' | 'solid' | 'transparent' | 'dark' | 'dim' | 'glass'", default: "'blur'",   description: 'Estilo del backdrop.' },
    { name: 'innerBorder',    type: 'boolean',                                           default: 'true',                description: 'Renderiza un borde interior sutil dentro del borde principal.' },
    { name: 'origin',         type: 'HTMLElement | null',                                                                description: 'Elemento de origen para la animación FLIP-style.' },
    { name: 'ariaLabel',      type: 'string',                                                                            description: 'Etiqueta accesible cuando no hay title.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'boolean', description: 'Cambio del estado abierto/cerrado.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Cuerpo principal del modal.' },
    { name: 'header',  description: 'Reemplaza el header generado a partir de title/description.' },
    { name: 'footer',  description: 'Acciones al pie del modal (botones de cancelar/confirmar).' },
];
</script>

<template>
    <ComponentDoc
        title="Modal"
        category="Feedback"
        import-path="import { Modal } from 'mood-ui'"
        description="Diálogo modal centrado con foco atrapado, bloqueo de scroll y animación FLIP-style desde el botón que lo abrió. Soporta tamaños, header con título/descripción y slot footer."
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Tamaño</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in (['small', 'medium', 'large', 'xlarge'] as Size[])"
                                :key="s"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
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
                        :class="pgCentered
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgCentered = !pgCentered"
                    >Centrado</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgClosable
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgClosable = !pgClosable"
                    >Cerrable</button>
                </template>

                <Button color="primary" @click="pgOpen = true">Abrir modal</Button>
                <Modal
                    v-model="pgOpen"
                    :size="pgSize"
                    :position="pgCentered ? 'center' : 'top'"
                    :show-close="pgClosable"
                    :close-on-overlay="pgClosable"
                    :close-on-escape="pgClosable"
                    title="Confirmar acción"
                    description="Vista previa interactiva del modal."
                >
                    <Typography>¿Quieres aplicar estos cambios?</Typography>
                    <template #footer>
                        <Button variant="ghost" @click="pgOpen = false">Cancelar</Button>
                        <Button color="primary" @click="pgOpen = false">Aplicar</Button>
                    </template>
                </Modal>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Disparado por un botón con v-model. Footer con acciones cancelar/confirmar."
                :code="basicCode"
                min-height="180px"
            >
                <Button @click="open1 = true">Abrir modal</Button>
                <Modal v-model="open1" title="Confirmar" description="¿Quieres aplicar estos cambios?">
                    <Typography>El cambio es reversible desde el historial.</Typography>
                    <template #footer>
                        <Button variant="ghost" @click="open1 = false">Cancelar</Button>
                        <Button color="primary" @click="open1 = false">Aplicar</Button>
                    </template>
                </Modal>
            </ComponentPreview>

            <ComponentPreview
                title="Con formulario"
                description="Útil para crear o editar entidades sin sacar al usuario del contexto actual."
                :code="formCode"
                min-height="180px"
            >
                <Button color="primary" @click="open2 = true">Nuevo proyecto</Button>
                <Modal v-model="open2" size="medium" title="Nuevo proyecto">
                    <form class="flex flex-col gap-3">
                        <input class="border border-border rounded-md px-3 py-2 bg-card" placeholder="Nombre" />
                        <textarea class="border border-border rounded-md px-3 py-2 bg-card" placeholder="Descripción" />
                    </form>
                    <template #footer>
                        <Button variant="ghost" @click="open2 = false">Cancelar</Button>
                        <Button color="primary" @click="open2 = false">Crear</Button>
                    </template>
                </Modal>
            </ComponentPreview>

            <ComponentPreview
                title="Sin overlay-close"
                description="Para acciones críticas, fuerza la decisión explícita deshabilitando el cierre por overlay y Escape."
                :code="lockedCode"
                min-height="180px"
            >
                <Button color="danger" @click="open3 = true">Acción crítica</Button>
                <Modal
                    v-model="open3"
                    title="Acción crítica"
                    color="danger"
                    :close-on-overlay="false"
                    :close-on-escape="false"
                >
                    <Typography>Solo se cierra con el botón explícito.</Typography>
                    <template #footer>
                        <Button color="danger" @click="open3 = false">Entendido</Button>
                    </template>
                </Modal>
            </ComponentPreview>

            <ComponentPreview
                title="Fullscreen"
                description="size='full' ocupa todo el viewport — ideal para vistas de detalle inmersivas."
                :code="fullCode"
                min-height="180px"
            >
                <Button @click="open4 = true">Abrir fullscreen</Button>
                <Modal v-model="open4" size="full" title="Vista completa">
                    <Typography>Ocupa todo el viewport disponible.</Typography>
                </Modal>
            </ComponentPreview>

            <ComponentPreview
                title="Contenido scrollable"
                description="El cuerpo del modal puede scrollear internamente sin bloquear el resto del layout."
                :code="scrollCode"
                min-height="180px"
            >
                <Button @click="open5 = true">Términos y condiciones</Button>
                <Modal v-model="open5" title="Términos y condiciones">
                    <div class="max-h-[50vh] overflow-y-auto pr-2 flex flex-col gap-2">
                        <p v-for="i in 12" :key="i">Párrafo {{ i }} con texto largo para forzar scroll interno.</p>
                    </div>
                </Modal>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
