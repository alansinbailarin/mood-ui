<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import EmptyState from '../../../components/feedback/EmptyState.vue';
import Button from '../../../components/forms/Button.vue';
import { InboxIcon, MagnifyingGlassIcon, ExclamationTriangleIcon, FolderOpenIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgSize    = ref<'small' | 'medium' | 'large'>('medium');
const pgVariant = ref<'subtle' | 'solid' | 'outline'>('subtle');

function resetPlayground() {
    pgSize.value    = 'medium';
    pgVariant.value = 'subtle';
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgVariant.value !== 'subtle') parts.push(`variant="${pgVariant.value}"`);
    if (pgSize.value    !== 'medium') parts.push(`size="${pgSize.value}"`);
    parts.push(':icon="InboxIcon"');
    parts.push('title="Sin notificaciones"');
    parts.push('description="Cuando recibas algo aparecerá aquí."');
    return `<EmptyState ${parts.join(' ')} />`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const actionCode = `<EmptyState
  :icon="MagnifyingGlassIcon"
  title="Sin resultados"
  description="Intenta con otra búsqueda o limpia los filtros."
>
  <template #actions>
    <Button color="primary">Limpiar filtros</Button>
  </template>
</EmptyState>`;

const variantsCode = `<EmptyState :icon="InboxIcon" title="Subtle"  description="Sin borde."        variant="subtle"  />
<EmptyState :icon="InboxIcon" title="Solid"   description="Con superficie."   variant="solid"   />
<EmptyState :icon="InboxIcon" title="Outline" description="Borde discontinuo." variant="outline" />`;

const noResultsCode = `<EmptyState
  :icon="MagnifyingGlassIcon"
  title="Sin resultados"
  description="No encontramos nada que coincida con \\"facturas 2025\\". Prueba otros términos."
/>`;

const errorCode = `<EmptyState
  :icon="ExclamationTriangleIcon"
  title="Algo salió mal"
  description="Reintenta en unos segundos."
  variant="outline"
>
  <template #actions>
    <Button color="primary" variant="outline">Reintentar</Button>
  </template>
</EmptyState>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'title',       type: 'string',                                                                       description: 'Encabezado principal del empty state.' },
    { name: 'description', type: 'string',                                                                       description: 'Texto secundario debajo del título.' },
    { name: 'icon',        type: 'Component',                                                                    description: 'Icono mostrado encima del título. Por defecto se usa InboxIcon.' },
    { name: 'size',        type: "'small' | 'medium' | 'large'",                       default: "'medium'",      description: 'Tamaño visual del empty state.' },
    { name: 'variant',     type: "'subtle' | 'solid' | 'outline'",                     default: "'subtle'",      description: 'Tratamiento visual del contenedor.' },
    { name: 'centered',    type: 'boolean',                                            default: 'true',          description: 'Centra horizontalmente el contenido.' },
    { name: 'radius',      type: "'none' | 'small' | 'medium' | 'large' | 'full'",                              description: 'Radio de las esquinas para variant solid u outline.' },
];

const emitsList: EmitDoc[] = [];

const slotsList: SlotDoc[] = [
    { name: 'actions', description: 'Acciones debajo de la descripción (típicamente botones).' },
    { name: 'default', description: 'Contenido extra renderizado al final del empty state.' },
];
</script>

<template>
    <ComponentDoc
        title="EmptyState"
        category="Feedback"
        import-path="import { EmptyState } from 'mood-ui'"
        description="Estado vacío para listas, búsquedas y secciones sin datos. Soporta icono, descripción, acciones y variantes visuales."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="280px" @reset="resetPlayground">
                <template #controls>
                    <!-- Variant -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Variante</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in ['subtle', 'solid', 'outline']"
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

                    <!-- Size -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Tamaño</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in ['small', 'medium', 'large']"
                                :key="s"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgSize === s
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgSize = (s as typeof pgSize)"
                            >{{ s }}</button>
                        </div>
                    </div>
                </template>

                <EmptyState
                    class="w-full max-w-md"
                    :icon="InboxIcon"
                    :size="pgSize"
                    :variant="pgVariant"
                    title="Sin notificaciones"
                    description="Cuando recibas algo aparecerá aquí."
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Con acción"
                description="Slot actions para añadir un CTA debajo de la descripción."
                :code="actionCode"
            >
                <EmptyState
                    class="w-full max-w-md"
                    :icon="MagnifyingGlassIcon"
                    title="Sin resultados"
                    description="Intenta con otra búsqueda o limpia los filtros."
                >
                    <template #actions>
                        <Button color="primary">Limpiar filtros</Button>
                    </template>
                </EmptyState>
            </ComponentPreview>

            <ComponentPreview
                title="Variantes"
                description="Tres superficies: subtle (default), solid (con borde) y outline (borde discontinuo)."
                :code="variantsCode"
            >
                <div class="flex flex-col gap-3 w-full max-w-md">
                    <EmptyState :icon="FolderOpenIcon" title="Subtle"  description="Sin borde."         variant="subtle"  />
                    <EmptyState :icon="FolderOpenIcon" title="Solid"   description="Con superficie."    variant="solid"   />
                    <EmptyState :icon="FolderOpenIcon" title="Outline" description="Borde discontinuo." variant="outline" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Sin resultados"
                description="Patrón típico para una búsqueda sin coincidencias."
                :code="noResultsCode"
            >
                <EmptyState
                    class="w-full max-w-md"
                    :icon="MagnifyingGlassIcon"
                    title="Sin resultados"
                    description='No encontramos nada que coincida con "facturas 2025". Prueba otros términos.'
                />
            </ComponentPreview>

            <ComponentPreview
                title="Estado de error"
                description="Combina variant outline con un CTA para reintentar la operación."
                :code="errorCode"
            >
                <EmptyState
                    class="w-full max-w-md"
                    :icon="ExclamationTriangleIcon"
                    title="Algo salió mal"
                    description="Reintenta en unos segundos."
                    variant="outline"
                >
                    <template #actions>
                        <Button color="primary" variant="outline">Reintentar</Button>
                    </template>
                </EmptyState>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
