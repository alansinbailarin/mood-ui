<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Loader from '../../../components/feedback/Loader.vue';
import type { PropDoc, SlotDoc } from '../../types';

type Variant = 'normal' | 'outline';
type Size    = 'small' | 'medium' | 'large';

const pgVariant = ref<Variant>('normal');
const pgSize    = ref<Size>('medium');
const pgColor   = ref<string>('currentColor');

function resetPlayground() {
    pgVariant.value = 'normal';
    pgSize.value    = 'medium';
    pgColor.value   = 'currentColor';
}

const colorDots = [
    { value: 'currentColor', bg: '#1f2937', label: 'Default'  },
    { value: '#3b82f6',      bg: '#3b82f6', label: 'Primary'  },
    { value: '#22c55e',      bg: '#22c55e', label: 'Success'  },
    { value: '#f59e0b',      bg: '#f59e0b', label: 'Warning'  },
    { value: '#ef4444',      bg: '#ef4444', label: 'Danger'   },
    { value: '#ec4899',      bg: '#ec4899', label: 'Pink'     },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgVariant.value !== 'normal')        parts.push(`variant="${pgVariant.value}"`);
    if (pgSize.value    !== 'medium')        parts.push(`size="${pgSize.value}"`);
    if (pgColor.value   !== 'currentColor')  parts.push(`color="${pgColor.value}"`);
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Loader${attrs} />`;
});

const variantsCode = `<Loader variant="normal" />
<Loader variant="outline" />`;

const sizesCode = `<Loader size="small" />
<Loader size="medium" />
<Loader size="large" />`;

const colorsCode = `<Loader color="#3b82f6" />
<Loader color="#22c55e" />
<Loader color="#ef4444" />
<Loader color="#ec4899" />`;

const inlineCode = `<span class="inline-flex items-center gap-2">
  <Loader size="small" />
  <span>Cargando proyectos…</span>
</span>`;

const propsList: PropDoc[] = [
    { name: 'variant', type: "'normal' | 'outline' | 'ghost' | 'text'", default: "'normal'",       description: 'Variante visual. outline pinta el track de fondo del anillo.' },
    { name: 'size',    type: "'small' | 'medium' | 'large'",            default: "'medium'",       description: 'Tamaño del spinner. Cascada desde ModoProvider.' },
    { name: 'color',   type: 'string',                                  default: "'currentColor'", description: 'Color del trazo. Acepta cualquier valor CSS válido.' },
    { name: 'label',   type: 'string',                                  default: "'Loading'",      description: 'Texto accesible visualmente oculto para lectores de pantalla.' },
];

const slotsList: SlotDoc[] = [];
</script>

<template>
    <ComponentDoc
        title="Loader"
        category="Feedback"
        import-path="import { Loader } from 'mood-ui'"
        description="Spinner circular para indicar progreso indeterminado. Pequeño, accesible y con color heredado por defecto para integrarse en botones, banners o cualquier contenedor."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Variante</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in (['normal', 'outline'] as Variant[])"
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

                    <span class="w-px h-4 bg-border shrink-0" />

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
                </template>

                <Loader :variant="pgVariant" :size="pgSize" :color="pgColor" />
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Variantes"
                description="normal muestra solo el arco; outline añade un track sutil de fondo."
                :code="variantsCode"
                min-height="160px"
            >
                <Loader variant="normal" />
                <Loader variant="outline" />
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres tamaños alineados con el resto del sistema (14, 18 y 22 px)."
                :code="sizesCode"
                min-height="160px"
            >
                <Loader size="small" />
                <Loader size="medium" />
                <Loader size="large" />
            </ComponentPreview>

            <ComponentPreview
                title="Colores personalizados"
                description="La prop color acepta cualquier valor CSS — útil para aplicar tokens semánticos del proyecto."
                :code="colorsCode"
                min-height="160px"
            >
                <Loader color="#3b82f6" />
                <Loader color="#22c55e" />
                <Loader color="#ef4444" />
                <Loader color="#ec4899" />
            </ComponentPreview>

            <ComponentPreview
                title="Inline con texto"
                description="Combinado con texto, el spinner hereda el color del contenedor por defecto."
                :code="inlineCode"
                min-height="160px"
            >
                <span class="inline-flex items-center gap-2">
                    <Loader size="small" />
                    <span>Cargando proyectos…</span>
                </span>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
