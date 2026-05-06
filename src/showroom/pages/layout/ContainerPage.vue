<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Container from '../../../components/layout/Container.vue';
import type { PropDoc, SlotDoc } from '../../types';

const pgMaxWidth = ref<'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none'>('lg');
const pgPadding = ref<'none' | 'small' | 'medium' | 'large'>('medium');
const pgCentered = ref(true);

function resetPlayground() {
    pgMaxWidth.value = 'lg';
    pgPadding.value = 'medium';
    pgCentered.value = true;
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgMaxWidth.value !== 'lg') parts.push(`max-width="${pgMaxWidth.value}"`);
    if (pgPadding.value !== 'medium') parts.push(`padding="${pgPadding.value}"`);
    if (!pgCentered.value) parts.push(':centered="false"');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Container${attrs}>
    <p>Contenido limitado al ancho máximo</p>
</Container>`;
});

const sizesCode = `<Container max-width="sm" centered>sm — 640px</Container>
<Container max-width="md" centered>md — 768px</Container>
<Container max-width="lg" centered>lg — 1024px</Container>
<Container max-width="xl" centered>xl — 1280px</Container>`;

const fluidCode = `<Container max-width="full" padding="large">
    Ocupa todo el ancho disponible con padding generoso.
</Container>`;

const paddingCode = `<Container max-width="md" padding="none"  centered>sin padding</Container>
<Container max-width="md" padding="small" centered>small</Container>
<Container max-width="md" padding="large" centered>large</Container>`;

const propsList: PropDoc[] = [
    { name: 'maxWidth',      type: "'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none'", default: "'lg'",     description: 'Ancho máximo del contenedor.' },
    { name: 'padding',       type: "'none' | 'small' | 'medium' | 'large'",                default: "'medium'", description: 'Padding horizontal y vertical aplicado al contenedor.' },
    { name: 'centered',      type: 'boolean',                                              default: 'true',     description: 'Centra el contenedor horizontalmente con margen automático.' },
    { name: 'centerContent', type: 'boolean',                                              default: 'false',    description: 'Centra el contenido interior usando flexbox.' },
    { name: 'height',        type: "'auto' | 'screen' | 'fill' | 'full'",                  default: "'auto'",   description: 'Altura del contenedor.' },
    { name: 'as',            type: "'div' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer' | 'nav'", default: "'div'", description: 'Etiqueta semántica raíz a renderizar.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Contenido envuelto por el contenedor.' },
];
</script>

<template>
    <ComponentDoc
        title="Container"
        category="Layout"
        import-path="import { Container } from 'mood-ui'"
        description="Wrapper centrado con ancho máximo y padding semántico para limitar el ancho del contenido en cualquier breakpoint."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Max-width</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="w in ['sm','md','lg','xl','full']"
                                :key="w"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgMaxWidth === w
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgMaxWidth = (w as typeof pgMaxWidth)"
                            >{{ w }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Padding</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="p in ['none','small','medium','large']"
                                :key="p"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgPadding === p
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgPadding = (p as typeof pgPadding)"
                            >{{ p }}</button>
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
                    >Centered</button>
                </template>

                <div class="w-full">
                    <Container
                        :max-width="pgMaxWidth"
                        :padding="pgPadding"
                        :centered="pgCentered"
                        class="bg-primary/5 rounded-md border border-dashed border-primary/30"
                    >
                        <p class="text-sm text-foreground text-center">Contenido limitado al ancho máximo</p>
                    </Container>
                </div>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Tamaños"
                description="Cada preset corresponde a un breakpoint común para contenido legible."
                :code="sizesCode"
            >
                <div class="w-full flex flex-col gap-2">
                    <Container max-width="sm" centered class="bg-primary/5 rounded-md py-2 px-4 text-center text-sm">sm — 640px</Container>
                    <Container max-width="md" centered class="bg-primary/5 rounded-md py-2 px-4 text-center text-sm">md — 768px</Container>
                    <Container max-width="lg" centered class="bg-primary/5 rounded-md py-2 px-4 text-center text-sm">lg — 1024px</Container>
                    <Container max-width="xl" centered class="bg-primary/5 rounded-md py-2 px-4 text-center text-sm">xl — 1280px</Container>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Fluid"
                description="Sin ancho máximo, el contenedor ocupa todo el espacio disponible."
                :code="fluidCode"
            >
                <Container max-width="full" padding="large" class="w-full bg-primary/5 rounded-md text-center text-sm">
                    Ocupa todo el ancho disponible con padding generoso.
                </Container>
            </ComponentPreview>

            <ComponentPreview
                title="Padding"
                description="Controla el espaciado interno con los tokens del sistema."
                :code="paddingCode"
            >
                <div class="w-full flex flex-col gap-2">
                    <Container max-width="md" padding="none"  centered class="bg-primary/5 rounded-md text-sm text-center">sin padding</Container>
                    <Container max-width="md" padding="small" centered class="bg-primary/5 rounded-md text-sm text-center">small</Container>
                    <Container max-width="md" padding="large" centered class="bg-primary/5 rounded-md text-sm text-center">large</Container>
                </div>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
