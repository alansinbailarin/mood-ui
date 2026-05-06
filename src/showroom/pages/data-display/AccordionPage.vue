<script setup lang="ts">
import { ref, computed } from 'vue';
import { CreditCardIcon, ShieldCheckIcon, BoltIcon } from '@heroicons/vue/24/outline';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Accordion from '../../../components/data-display/Accordion.vue';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

// ── Items ───────────────────────────────────────────────────────────────────
const faqItems = [
    { value: 'what',    title: '¿Qué es mood-ui?',     content: 'Una librería de componentes Vue 3 totalmente tipada, con theming en runtime, dark mode e i18n.' },
    { value: 'license', title: '¿Cuál es la licencia?', content: 'MIT. Puedes usarla en proyectos personales y comerciales sin restricción.' },
    { value: 'install', title: '¿Cómo se instala?',     content: 'npm install mood-ui — luego importa los estilos y envuelve tu app con <ModoProvider>.' },
];

const iconItems = [
    { value: 'pay',   title: 'Pagos seguros', content: 'Procesamos pagos con Stripe usando tokenización end-to-end.', icon: CreditCardIcon },
    { value: 'sec',   title: 'Seguridad',     content: 'Cumplimos con SOC 2 Type II y GDPR.',                          icon: ShieldCheckIcon },
    { value: 'speed', title: 'Rendimiento',   content: 'Servidores edge en 200+ ubicaciones para latencia mínima.',  icon: BoltIcon },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant  = ref<'separated' | 'bordered' | 'flush'>('separated');
const pgSize     = ref<'small' | 'medium' | 'large'>('medium');
const pgMultiple = ref(false);
const pgSingle   = ref<string | number | null>('what');
const pgMulti    = ref<(string | number)[]>(['what']);

function resetPlayground() {
    pgVariant.value = 'separated';
    pgSize.value = 'medium';
    pgMultiple.value = false;
    pgSingle.value = 'what';
    pgMulti.value = ['what'];
}

const overviewCode = computed(() => {
    const parts: string[] = ['v-model="open"', ':items="items"'];
    if (pgVariant.value !== 'separated') parts.push(`variant="${pgVariant.value}"`);
    if (pgSize.value    !== 'medium')    parts.push(`size="${pgSize.value}"`);
    if (pgMultiple.value)                parts.push('multiple');
    return `<Accordion ${parts.join(' ')} />`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const basicCode = `<Accordion v-model="open" :items="items" />`;
const multipleCode = `<Accordion v-model="open" :items="items" multiple />`;
const variantsCode = `<Accordion :items="items" variant="separated" />
<Accordion :items="items" variant="bordered"  />
<Accordion :items="items" variant="flush"     />`;
const iconsCode = `// items con icono opcional:
const items = [
  { value: 'sec', title: 'Seguridad', content: '…', icon: ShieldCheckIcon },
];

<Accordion :items="items" />`;
const sizesCode = `<Accordion :items="items" size="small"  />
<Accordion :items="items" size="medium" />
<Accordion :items="items" size="large"  />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'items',        type: 'AccordionItem[]',                                           required: true,         description: 'Lista de ítems a renderizar (cada uno con value, title y content).' },
    { name: 'modelValue',   type: 'string | number | (string | number)[] | null',                                      description: 'Vínculo v-model. El tipo depende de multiple.' },
    { name: 'multiple',     type: 'boolean',                                                   default: 'false',       description: 'Permite tener varios paneles abiertos a la vez.' },
    { name: 'variant',      type: "'separated' | 'bordered' | 'flush'",                        default: "'separated'", description: 'Variante visual del contenedor.' },
    { name: 'size',         type: "'small' | 'medium' | 'large'",                                                      description: 'Escala de padding y tipografía. Hereda del ModoProvider.' },
    { name: 'radius',       type: "'none' | 'small' | 'medium' | 'large' | 'full'",                                    description: 'Radio de borde (para separated y bordered).' },
    { name: 'iconPosition', type: "'start' | 'end'",                                           default: "'end'",       description: 'Lado donde se muestra el chevron.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'string | number | (string|number)[] | null', description: 'Emitido cuando cambia el conjunto de paneles abiertos.' },
    { name: 'change',            payload: 'string | number | (string|number)[] | null', description: 'Alias de update:modelValue para uso sin v-model.' },
];

const slotsList: SlotDoc[] = [
    { name: 'item-<value>', description: 'Slot por item para renderizar contenido rico (HTML, formularios, listas).' },
];
</script>

<template>
    <ComponentDoc
        title="Accordion"
        category="Data Display"
        import-path="import { Accordion } from 'mood-ui'"
        description="Paneles expandibles para mostrar contenido jerárquico de forma compacta. Ideal para FAQs, configuraciones y filtros."
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="280px" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Variant</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in ['separated', 'bordered', 'flush']"
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

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgMultiple
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgMultiple = !pgMultiple"
                    >Multiple</button>
                </template>

                <div class="w-full max-w-md">
                    <Accordion
                        v-if="pgMultiple"
                        v-model="pgMulti"
                        :items="faqItems"
                        :variant="pgVariant"
                        :size="pgSize"
                        multiple
                    />
                    <Accordion
                        v-else
                        v-model="pgSingle"
                        :items="faqItems"
                        :variant="pgVariant"
                        :size="pgSize"
                    />
                </div>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Tres paneles single-open con v-model."
                :code="basicCode"
            >
                <div class="w-full max-w-md">
                    <Accordion :items="faqItems" :model-value="'what'" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Multiple abiertos"
                description="Permite mantener varios paneles expandidos simultáneamente."
                :code="multipleCode"
            >
                <div class="w-full max-w-md">
                    <Accordion :items="faqItems" :model-value="['what', 'install']" multiple />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Variantes"
                description="separated (cards independientes), bordered (caja única) y flush (sin contenedor)."
                :code="variantsCode"
            >
                <div class="w-full max-w-md flex flex-col gap-6">
                    <Accordion :items="faqItems.slice(0, 2)" variant="separated" :model-value="'what'" />
                    <Accordion :items="faqItems.slice(0, 2)" variant="bordered"  :model-value="'what'" />
                    <Accordion :items="faqItems.slice(0, 2)" variant="flush"     :model-value="'what'" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Con iconos"
                description="Cada item puede declarar un icono opcional junto al título."
                :code="iconsCode"
            >
                <div class="w-full max-w-md">
                    <Accordion :items="iconItems" :model-value="'sec'" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres escalas de padding y tipografía."
                :code="sizesCode"
            >
                <div class="w-full max-w-md flex flex-col gap-6">
                    <Accordion :items="faqItems.slice(0, 2)" size="small"  :model-value="'what'" />
                    <Accordion :items="faqItems.slice(0, 2)" size="medium" :model-value="'what'" />
                    <Accordion :items="faqItems.slice(0, 2)" size="large"  :model-value="'what'" />
                </div>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
