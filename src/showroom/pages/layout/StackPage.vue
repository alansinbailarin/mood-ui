<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Stack from '../../../components/layout/Stack.vue';
import type { PropDoc, SlotDoc } from '../../types';

const pgDirection = ref<'row' | 'column'>('column');
const pgSpacing = ref<'none' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'>('medium');
const pgAlign = ref<'start' | 'center' | 'end' | 'stretch' | 'baseline'>('stretch');
const pgJustify = ref<'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>('start');

function resetPlayground() {
    pgDirection.value = 'column';
    pgSpacing.value = 'medium';
    pgAlign.value = 'stretch';
    pgJustify.value = 'start';
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgDirection.value !== 'column') parts.push(`direction="${pgDirection.value}"`);
    if (pgSpacing.value !== 'medium') parts.push(`spacing="${pgSpacing.value}"`);
    if (pgAlign.value !== 'stretch') parts.push(`align="${pgAlign.value}"`);
    if (pgJustify.value !== 'start') parts.push(`justify="${pgJustify.value}"`);
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Stack${attrs}>
    <div>1</div>
    <div>2</div>
    <div>3</div>
</Stack>`;
});

const verticalCode = `<Stack direction="column" spacing="medium">
    <div>1</div>
    <div>2</div>
    <div>3</div>
</Stack>`;

const horizontalCode = `<Stack direction="row" spacing="small">
    <div>1</div>
    <div>2</div>
    <div>3</div>
</Stack>`;

const dividerCode = `<Stack direction="row" spacing="medium" divider>
    <span>Inicio</span>
    <span>Centro</span>
    <span>Final</span>
</Stack>`;

const wrapCode = `<Stack direction="row" spacing="small" wrap="wrap">
    <div v-for="n in 8" :key="n">{{ n }}</div>
</Stack>`;

const propsList: PropDoc[] = [
    { name: 'direction',  type: "'row' | 'column'",                                                default: "'column'",  description: 'Orientación del stack.' },
    { name: 'spacing',    type: "'none' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'",     default: "'medium'",  description: 'Gap entre elementos hijos.' },
    { name: 'align',      type: "'start' | 'center' | 'end' | 'stretch' | 'baseline'",             default: "'stretch'", description: 'Alineación cross-axis (align-items).' },
    { name: 'justify',    type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",    default: "'start'",   description: 'Distribución main-axis (justify-content).' },
    { name: 'wrap',       type: "'nowrap' | 'wrap' | 'wrap-reverse'",                              default: "'nowrap'",  description: 'Comportamiento de salto de línea.' },
    { name: 'divider',    type: 'boolean',                                                          default: 'false',     description: 'Inserta un Divider entre cada hijo.' },
    { name: 'fullWidth',  type: 'boolean',                                                          default: 'false',     description: 'Hace que el stack ocupe todo el ancho disponible.' },
    { name: 'fullHeight', type: 'boolean',                                                          default: 'false',     description: 'Hace que el stack ocupe todo el alto disponible.' },
    { name: 'as',         type: 'string',                                                           default: "'div'",     description: 'Etiqueta raíz a renderizar.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Hijos a apilar.' },
];
</script>

<template>
    <ComponentDoc
        title="Stack"
        category="Layout"
        import-path="import { Stack } from 'mood-ui'"
        description="Primitiva flex genérica para apilar hijos en fila o columna con spacing, alineación y wrap consistentes. HStack y VStack son atajos."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Dir</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="d in ['row','column']"
                                :key="d"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgDirection === d ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgDirection = (d as typeof pgDirection)"
                            >{{ d }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Gap</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="g in ['none','small','medium','large']"
                                :key="g"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgSpacing === g ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgSpacing = (g as typeof pgSpacing)"
                            >{{ g }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Align</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="a in ['start','center','end','stretch']"
                                :key="a"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgAlign === a ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgAlign = (a as typeof pgAlign)"
                            >{{ a }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Justify</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="j in ['start','center','end','between']"
                                :key="j"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgJustify === j ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgJustify = (j as typeof pgJustify)"
                            >{{ j }}</button>
                        </div>
                    </div>
                </template>

                <Stack
                    :direction="pgDirection"
                    :spacing="pgSpacing"
                    :align="pgAlign"
                    :justify="pgJustify"
                    class="w-full p-4 border border-dashed border-border rounded-md min-h-[140px]"
                >
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">1</div>
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">2</div>
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">3</div>
                </Stack>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Vertical (default)"
                description="Apila hijos en columna con el spacing del sistema."
                :code="verticalCode"
            >
                <Stack direction="column" spacing="medium">
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">1</div>
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">2</div>
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">3</div>
                </Stack>
            </ComponentPreview>

            <ComponentPreview
                title="Horizontal"
                description="Cambia direction a row para una fila."
                :code="horizontalCode"
            >
                <Stack direction="row" spacing="small">
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">1</div>
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">2</div>
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">3</div>
                </Stack>
            </ComponentPreview>

            <ComponentPreview
                title="Con divider"
                description="Inserta separadores automáticos entre los hijos."
                :code="dividerCode"
            >
                <Stack direction="row" spacing="medium" divider>
                    <span class="text-sm">Inicio</span>
                    <span class="text-sm">Centro</span>
                    <span class="text-sm">Final</span>
                </Stack>
            </ComponentPreview>

            <ComponentPreview
                title="Wrapping"
                description="Permite que los hijos salten a la siguiente línea cuando no hay espacio."
                :code="wrapCode"
            >
                <Stack direction="row" spacing="small" wrap="wrap" class="max-w-[260px]">
                    <div
                        v-for="n in 8"
                        :key="n"
                        class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium"
                    >{{ n }}</div>
                </Stack>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
