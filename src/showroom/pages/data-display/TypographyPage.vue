<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Typography from '../../../components/data-display/Typography.vue';
import type { PropDoc, SlotDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<'display' | 'heading' | 'title' | 'subtitle' | 'body' | 'caption' | 'overline'>('heading');
const pgSize    = ref<'small' | 'medium' | 'large'>('large');
const pgWeight  = ref<'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'>('semibold');
const pgColor   = ref<'default' | 'muted' | 'primary' | 'success' | 'warning' | 'danger'>('default');

function resetPlayground() {
    pgVariant.value = 'heading';
    pgSize.value = 'large';
    pgWeight.value = 'semibold';
    pgColor.value = 'default';
}

const colorDots = [
    { value: 'default'  as const, bg: '#0f172a',        label: 'Default'  },
    { value: 'muted'    as const, bg: '#94a3b8',        label: 'Muted'    },
    { value: 'primary'  as const, bg: 'var(--primary)', label: 'Primary'  },
    { value: 'success'  as const, bg: '#22c55e',        label: 'Success'  },
    { value: 'warning'  as const, bg: '#f59e0b',        label: 'Warning'  },
    { value: 'danger'   as const, bg: '#ef4444',        label: 'Danger'   },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgVariant.value !== 'body')     parts.push(`variant="${pgVariant.value}"`);
    if (pgSize.value    !== 'medium')   parts.push(`size="${pgSize.value}"`);
    if (pgWeight.value  !== 'normal')   parts.push(`weight="${pgWeight.value}"`);
    if (pgColor.value   !== 'default')  parts.push(`color="${pgColor.value}"`);
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Typography${attrs}>\n  Mood UI Typography\n</Typography>`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const variantsCode = `<Typography variant="display" size="large">Display</Typography>
<Typography variant="heading" size="large">Heading</Typography>
<Typography variant="title"   size="medium">Title</Typography>
<Typography variant="subtitle">Subtitle</Typography>
<Typography variant="body">Body — Lorem ipsum dolor sit amet.</Typography>
<Typography variant="caption" color="muted">Caption auxiliar</Typography>
<Typography variant="overline" color="muted">Overline</Typography>`;

const sizesCode = `<Typography variant="heading" size="small">Heading small</Typography>
<Typography variant="heading" size="medium">Heading medium</Typography>
<Typography variant="heading" size="large">Heading large</Typography>`;

const weightsCode = `<Typography weight="light">Light</Typography>
<Typography weight="normal">Normal</Typography>
<Typography weight="medium">Medium</Typography>
<Typography weight="semibold">Semibold</Typography>
<Typography weight="bold">Bold</Typography>
<Typography weight="extrabold">Extrabold</Typography>`;

const colorsCode = `<Typography color="default">default</Typography>
<Typography color="muted">muted</Typography>
<Typography color="primary">primary</Typography>
<Typography color="success">success</Typography>
<Typography color="warning">warning</Typography>
<Typography color="danger">danger</Typography>`;

const truncateCode = `<div class="w-48">
  <Typography truncate>
    Texto que se trunca con ellipsis cuando no cabe en una sola línea.
  </Typography>
</div>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'variant',       type: "'display' | 'heading' | 'title' | 'subtitle' | 'body' | 'caption' | 'overline'", default: "'body'",    description: 'Estilo tipográfico semántico. Define el tag por defecto.' },
    { name: 'size',          type: "'small' | 'medium' | 'large'",                                                                       description: 'Escala dentro del variant. Hereda del ModoProvider si se omite.' },
    { name: 'as',            type: "'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label' | 'small' | 'strong' | 'em'",       description: 'Sobrescribe el tag HTML inferido por el variant.' },
    { name: 'weight',        type: "'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'",                                  description: 'Peso de la fuente.' },
    { name: 'align',         type: "'left' | 'center' | 'right'",                                                                        description: 'Alineación horizontal del texto.' },
    { name: 'color',         type: "'default' | 'muted' | 'primary' | 'danger' | 'success' | 'warning'",                  default: "'default'", description: 'Color semántico aplicado al texto.' },
    { name: 'truncate',      type: 'boolean',                                                                              default: 'false',     description: 'Trunca con ellipsis a una sola línea.' },
    { name: 'italic',        type: 'boolean',                                                                              default: 'false',     description: 'Aplica estilo cursiva.' },
    { name: 'underline',     type: 'boolean',                                                                              default: 'false',     description: 'Subraya el texto.' },
    { name: 'strikethrough', type: 'boolean',                                                                              default: 'false',     description: 'Tachado del texto.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Contenido textual a renderizar.' },
];
</script>

<template>
    <ComponentDoc
        title="Typography"
        category="Data Display"
        import-path="import { Typography } from 'mood-ui'"
        description="Sistema tipográfico con variantes semánticas (display, heading, title, body, caption…), tamaños y pesos. La prop as permite mapear a la etiqueta HTML adecuada para mantener la jerarquía accesible."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <!-- Variant -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Variant</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in ['display', 'heading', 'title', 'subtitle', 'body', 'caption', 'overline']"
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
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Size</span>
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

                    <span class="w-px h-4 bg-border shrink-0" />

                    <!-- Weight -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Weight</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="w in ['light', 'normal', 'medium', 'semibold', 'bold', 'extrabold']"
                                :key="w"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgWeight === w
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgWeight = (w as typeof pgWeight)"
                            >{{ w }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

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
                </template>

                <Typography
                    :variant="pgVariant"
                    :size="pgSize"
                    :weight="pgWeight"
                    :color="pgColor"
                >
                    Mood UI Typography
                </Typography>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Variantes"
                description="Cada variant define una jerarquía visual y un tag HTML por defecto."
                :code="variantsCode"
            >
                <div class="flex flex-col gap-2 items-start">
                    <Typography variant="display" size="large">Display</Typography>
                    <Typography variant="heading" size="large">Heading</Typography>
                    <Typography variant="title" size="medium">Title</Typography>
                    <Typography variant="subtitle">Subtitle</Typography>
                    <Typography variant="body">Body — Lorem ipsum dolor sit amet.</Typography>
                    <Typography variant="caption" color="muted">Caption auxiliar</Typography>
                    <Typography variant="overline" color="muted">Overline</Typography>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Cada variant tiene tres escalas (small, medium, large)."
                :code="sizesCode"
            >
                <div class="flex flex-col gap-2 items-start">
                    <Typography variant="heading" size="small">Heading small</Typography>
                    <Typography variant="heading" size="medium">Heading medium</Typography>
                    <Typography variant="heading" size="large">Heading large</Typography>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Pesos"
                description="Seis pesos disponibles desde light hasta extrabold."
                :code="weightsCode"
            >
                <div class="flex flex-col gap-1 items-start">
                    <Typography weight="light">Light</Typography>
                    <Typography weight="normal">Normal</Typography>
                    <Typography weight="medium">Medium</Typography>
                    <Typography weight="semibold">Semibold</Typography>
                    <Typography weight="bold">Bold</Typography>
                    <Typography weight="extrabold">Extrabold</Typography>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Colores semánticos"
                description="Usa los colores del provider para mantener consistencia y accesibilidad."
                :code="colorsCode"
            >
                <div class="flex flex-col gap-1 items-start">
                    <Typography color="default">default</Typography>
                    <Typography color="muted">muted</Typography>
                    <Typography color="primary">primary</Typography>
                    <Typography color="success">success</Typography>
                    <Typography color="warning">warning</Typography>
                    <Typography color="danger">danger</Typography>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Truncate"
                description="Trunca el texto a una sola línea con ellipsis cuando excede el ancho."
                :code="truncateCode"
            >
                <div class="w-48">
                    <Typography truncate>
                        Texto que se trunca con ellipsis cuando no cabe en una sola línea.
                    </Typography>
                </div>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
