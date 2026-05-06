<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import VStack from '../../../components/layout/VStack.vue';
import type { PropDoc, SlotDoc } from '../../types';

const pgSpacing = ref<'none' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'>('medium');
const pgAlign = ref<'start' | 'center' | 'end' | 'stretch' | 'baseline'>('stretch');
const pgJustify = ref<'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>('start');

function resetPlayground() {
    pgSpacing.value = 'medium';
    pgAlign.value = 'stretch';
    pgJustify.value = 'start';
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgSpacing.value !== 'medium') parts.push(`spacing="${pgSpacing.value}"`);
    if (pgAlign.value !== 'stretch') parts.push(`align="${pgAlign.value}"`);
    if (pgJustify.value !== 'start') parts.push(`justify="${pgJustify.value}"`);
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<VStack${attrs}>
    <div>1</div>
    <div>2</div>
    <div>3</div>
</VStack>`;
});

const basicCode = `<VStack spacing="medium">
    <div>1</div>
    <div>2</div>
    <div>3</div>
</VStack>`;

const gapCode = `<VStack spacing="small">…</VStack>
<VStack spacing="medium">…</VStack>
<VStack spacing="large">…</VStack>`;

const alignmentsCode = `<VStack align="start">…</VStack>
<VStack align="center">…</VStack>
<VStack align="end">…</VStack>
<VStack align="stretch">…</VStack>`;

const dividerCode = `<VStack spacing="medium" divider>
    <span>Sección 1</span>
    <span>Sección 2</span>
    <span>Sección 3</span>
</VStack>`;

const propsList: PropDoc[] = [
    { name: 'spacing',    type: "'none' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'", default: "'medium'",  description: 'Gap vertical entre los hijos.' },
    { name: 'align',      type: "'start' | 'center' | 'end' | 'stretch' | 'baseline'",          default: "'stretch'", description: 'Alineación horizontal (cross-axis).' },
    { name: 'justify',    type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'", default: "'start'",   description: 'Distribución vertical (main-axis).' },
    { name: 'wrap',       type: "'nowrap' | 'wrap' | 'wrap-reverse'",                          default: "'nowrap'",  description: 'Comportamiento de salto de línea.' },
    { name: 'divider',    type: 'boolean',                                                      default: 'false',     description: 'Inserta un Divider horizontal entre cada hijo.' },
    { name: 'fullWidth',  type: 'boolean',                                                      default: 'false',     description: 'Ocupa todo el ancho disponible.' },
    { name: 'fullHeight', type: 'boolean',                                                      default: 'false',     description: 'Ocupa todo el alto disponible.' },
    { name: 'as',         type: 'string',                                                       default: "'div'",     description: 'Etiqueta raíz a renderizar.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Hijos a apilar verticalmente.' },
];
</script>

<template>
    <ComponentDoc
        title="VStack"
        category="Layout"
        import-path="import { VStack } from 'mood-ui'"
        description="Atajo de Stack con dirección vertical. Apila hijos en columna con spacing y align consistentes."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="240px" @reset="resetPlayground">
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
                </template>

                <VStack
                    :spacing="pgSpacing"
                    :align="pgAlign"
                    :justify="pgJustify"
                    class="w-full max-w-xs p-4 border border-dashed border-border rounded-md min-h-[200px]"
                >
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">1</div>
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">2</div>
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">3</div>
                </VStack>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Apila hijos verticalmente con spacing del sistema."
                :code="basicCode"
            >
                <VStack spacing="medium" class="w-full max-w-xs">
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">1</div>
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">2</div>
                    <div class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium">3</div>
                </VStack>
            </ComponentPreview>

            <ComponentPreview
                title="Spacings"
                description="Selecciona el gap vertical según la densidad deseada."
                :code="gapCode"
            >
                <div class="flex gap-6 items-start">
                    <VStack spacing="small">
                        <div class="size-10 bg-primary/10 rounded-md" />
                        <div class="size-10 bg-primary/10 rounded-md" />
                        <div class="size-10 bg-primary/10 rounded-md" />
                    </VStack>
                    <VStack spacing="medium">
                        <div class="size-10 bg-primary/10 rounded-md" />
                        <div class="size-10 bg-primary/10 rounded-md" />
                        <div class="size-10 bg-primary/10 rounded-md" />
                    </VStack>
                    <VStack spacing="large">
                        <div class="size-10 bg-primary/10 rounded-md" />
                        <div class="size-10 bg-primary/10 rounded-md" />
                        <div class="size-10 bg-primary/10 rounded-md" />
                    </VStack>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Alineaciones"
                description="Controla la alineación horizontal del contenido."
                :code="alignmentsCode"
            >
                <div class="flex gap-3 w-full">
                    <VStack align="start"   class="border border-dashed border-border rounded-md p-2 flex-1"><div class="size-10 bg-primary/10 rounded-md" /><div class="size-8 bg-primary/10 rounded-md" /></VStack>
                    <VStack align="center"  class="border border-dashed border-border rounded-md p-2 flex-1"><div class="size-10 bg-primary/10 rounded-md" /><div class="size-8 bg-primary/10 rounded-md" /></VStack>
                    <VStack align="end"     class="border border-dashed border-border rounded-md p-2 flex-1"><div class="size-10 bg-primary/10 rounded-md" /><div class="size-8 bg-primary/10 rounded-md" /></VStack>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Con divider"
                description="Inserta separadores horizontales entre cada elemento."
                :code="dividerCode"
            >
                <VStack spacing="medium" divider class="w-full max-w-xs">
                    <span class="text-sm">Sección 1</span>
                    <span class="text-sm">Sección 2</span>
                    <span class="text-sm">Sección 3</span>
                </VStack>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
