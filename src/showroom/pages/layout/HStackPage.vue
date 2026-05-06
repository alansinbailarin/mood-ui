<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import HStack from '../../../components/layout/HStack.vue';
import type { PropDoc, SlotDoc } from '../../types';

const pgSpacing = ref<'none' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'>('medium');
const pgAlign = ref<'start' | 'center' | 'end' | 'stretch' | 'baseline'>('center');
const pgJustify = ref<'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>('start');
const pgWrap = ref<'nowrap' | 'wrap' | 'wrap-reverse'>('nowrap');

function resetPlayground() {
    pgSpacing.value = 'medium';
    pgAlign.value = 'center';
    pgJustify.value = 'start';
    pgWrap.value = 'nowrap';
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgSpacing.value !== 'medium') parts.push(`spacing="${pgSpacing.value}"`);
    if (pgAlign.value !== 'stretch') parts.push(`align="${pgAlign.value}"`);
    if (pgJustify.value !== 'start') parts.push(`justify="${pgJustify.value}"`);
    if (pgWrap.value !== 'nowrap') parts.push(`wrap="${pgWrap.value}"`);
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<HStack${attrs}>
    <div>1</div>
    <div>2</div>
    <div>3</div>
</HStack>`;
});

const basicCode = `<HStack spacing="medium">
    <div>1</div>
    <div>2</div>
    <div>3</div>
</HStack>`;

const gapCode = `<HStack spacing="xsmall"><!-- ... --></HStack>
<HStack spacing="small"><!-- ... --></HStack>
<HStack spacing="medium"><!-- ... --></HStack>
<HStack spacing="large"><!-- ... --></HStack>`;

const alignmentsCode = `<HStack justify="start"   align="center">…</HStack>
<HStack justify="center"  align="center">…</HStack>
<HStack justify="end"     align="center">…</HStack>
<HStack justify="between" align="center">…</HStack>`;

const wrapCode = `<HStack spacing="small" wrap="wrap">
    <div v-for="n in 8" :key="n">{{ n }}</div>
</HStack>`;

const propsList: PropDoc[] = [
    { name: 'spacing',    type: "'none' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'", default: "'medium'", description: 'Gap horizontal entre los hijos.' },
    { name: 'align',      type: "'start' | 'center' | 'end' | 'stretch' | 'baseline'",          default: "'stretch'", description: 'Alineación vertical (cross-axis).' },
    { name: 'justify',    type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'", default: "'start'",   description: 'Distribución horizontal (main-axis).' },
    { name: 'wrap',       type: "'nowrap' | 'wrap' | 'wrap-reverse'",                          default: "'nowrap'",  description: 'Comportamiento de salto de línea cuando no hay espacio.' },
    { name: 'divider',    type: 'boolean',                                                      default: 'false',     description: 'Inserta un Divider vertical entre cada hijo.' },
    { name: 'fullWidth',  type: 'boolean',                                                      default: 'false',     description: 'Ocupa todo el ancho disponible.' },
    { name: 'fullHeight', type: 'boolean',                                                      default: 'false',     description: 'Ocupa todo el alto disponible.' },
    { name: 'as',         type: 'string',                                                       default: "'div'",     description: 'Etiqueta raíz a renderizar.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Hijos a apilar horizontalmente.' },
];
</script>

<template>
    <ComponentDoc
        title="HStack"
        category="Layout"
        import-path="import { HStack } from 'mood-ui'"
        description="Atajo de Stack con dirección horizontal. Útil para alinear ítems en fila con spacing y align consistentes."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
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

                    <span class="w-px h-4 bg-border shrink-0" />

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgWrap === 'wrap' ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgWrap = pgWrap === 'wrap' ? 'nowrap' : 'wrap'"
                    >Wrap</button>
                </template>

                <HStack
                    :spacing="pgSpacing"
                    :align="pgAlign"
                    :justify="pgJustify"
                    :wrap="pgWrap"
                    class="w-full p-4 border border-dashed border-border rounded-md min-h-[120px]"
                >
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">1</div>
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">2</div>
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">3</div>
                </HStack>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Distribuye hijos horizontalmente con spacing."
                :code="basicCode"
            >
                <HStack spacing="medium">
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">1</div>
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">2</div>
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">3</div>
                </HStack>
            </ComponentPreview>

            <ComponentPreview
                title="Spacings"
                description="Tokens del sistema: xsmall, small, medium, large."
                :code="gapCode"
            >
                <div class="flex flex-col gap-3 w-full">
                    <HStack spacing="xsmall"><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /></HStack>
                    <HStack spacing="small"><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /></HStack>
                    <HStack spacing="medium"><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /></HStack>
                    <HStack spacing="large"><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /></HStack>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Alineaciones"
                description="Combina justify y align para distintos layouts."
                :code="alignmentsCode"
            >
                <div class="flex flex-col gap-2 w-full">
                    <HStack justify="start"   align="center" class="border border-dashed border-border rounded-md p-2"><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /></HStack>
                    <HStack justify="center"  align="center" class="border border-dashed border-border rounded-md p-2"><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /></HStack>
                    <HStack justify="end"     align="center" class="border border-dashed border-border rounded-md p-2"><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /></HStack>
                    <HStack justify="between" align="center" class="border border-dashed border-border rounded-md p-2"><div class="size-10 bg-primary/10 rounded-md" /><div class="size-10 bg-primary/10 rounded-md" /></HStack>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Wrapping"
                description="Activa wrap para que los hijos salten cuando no hay espacio."
                :code="wrapCode"
            >
                <HStack spacing="small" wrap="wrap" class="max-w-[260px]">
                    <div v-for="n in 8" :key="n" class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">{{ n }}</div>
                </HStack>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
