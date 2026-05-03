<script setup lang="ts">
import { ref } from 'vue';
import { CreditCardIcon, ShieldCheckIcon, BoltIcon } from '@heroicons/vue/24/outline';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Accordion from '../../../components/data-display/Accordion.vue';

const single = ref<string | number | null>('what');
const multi = ref<(string | number)[]>(['returns']);

const faqItems = [
    { value: 'what', title: '¿Qué es mood-ui?', content: 'Una librería de componentes Vue 3 totalmente tipada, con theming en runtime, dark mode y i18n.' },
    { value: 'license', title: '¿Cuál es la licencia?', content: 'MIT. Puedes usarla en proyectos personales y comerciales sin restricción.' },
    { value: 'install', title: '¿Cómo se instala?', content: 'npm install mood-ui — luego importa los estilos y envuelve tu app con <ModoProvider>.' },
];

const policyItems = [
    { value: 'returns',  title: 'Devoluciones', content: 'Aceptamos devoluciones dentro de los primeros 30 días desde la compra.' },
    { value: 'shipping', title: 'Envío',        content: 'Envío gratuito en pedidos superiores a 50€.' },
    { value: 'warranty', title: 'Garantía',     content: 'Todos los productos incluyen 2 años de garantía oficial.' },
];

const iconItems = [
    { value: 'pay',      title: 'Pagos seguros',     content: 'Procesamos pagos con Stripe usando tokenización end-to-end.', icon: CreditCardIcon },
    { value: 'sec',      title: 'Seguridad',         content: 'Cumplimos con SOC 2 Type II y GDPR.',                            icon: ShieldCheckIcon },
    { value: 'speed',    title: 'Rendimiento',       content: 'Servidores edge en 200+ ubicaciones para latencia mínima.',     icon: BoltIcon },
];
</script>

<template>
    <DocPage
        title="Accordion"
        category="Data display"
        import-path="import { Accordion } from 'mood-ui'"
        description="Paneles expandibles para mostrar contenido jerárquico de forma compacta. Ideal para FAQs, configuraciones y filtros."
    >
        <template #examples>
            <Example title="Básico (single)" :code="`<script setup>\nimport { ref } from 'vue';\nimport { Accordion } from 'mood-ui';\n\nconst open = ref('what');\nconst items = [\n  { value: 'what',    title: '\u00bfQu\u00e9 es mood-ui?',    content: '\u2026' },\n  { value: 'license', title: '\u00bfCu\u00e1l es la licencia?', content: '\u2026' },\n  { value: 'install', title: '\u00bfC\u00f3mo se instala?',     content: '\u2026' },\n];\n<\\/script>\n\n<template>\n  <Accordion v-model=\&quot;open\&quot; :items=\&quot;items\&quot; />\n</template>`">
                <Accordion v-model="single" :items="faqItems" />
            </Example>

            <Example title="Multiple" description="Permite varios paneles abiertos a la vez.">
                <Accordion v-model="multi" :items="policyItems" multiple />
            </Example>

            <Example title="Variantes">
                <div class="flex flex-col gap-6 w-full">
                    <div>
                        <p class="text-xs uppercase tracking-wider text-muted-foreground mb-2">separated</p>
                        <Accordion :items="faqItems.slice(0, 2)" variant="separated" :model-value="'what'" />
                    </div>
                    <div>
                        <p class="text-xs uppercase tracking-wider text-muted-foreground mb-2">bordered</p>
                        <Accordion :items="faqItems.slice(0, 2)" variant="bordered" :model-value="'what'" />
                    </div>
                    <div>
                        <p class="text-xs uppercase tracking-wider text-muted-foreground mb-2">flush</p>
                        <Accordion :items="faqItems.slice(0, 2)" variant="flush" :model-value="'what'" />
                    </div>
                </div>
            </Example>

            <Example title="Con iconos">
                <Accordion :items="iconItems" :model-value="'sec'" />
            </Example>

            <Example title="Posición del chevron">
                <div class="flex flex-col gap-6 w-full">
                    <Accordion :items="faqItems.slice(0, 2)" icon-position="end"   :model-value="'what'" />
                    <Accordion :items="faqItems.slice(0, 2)" icon-position="start" :model-value="'what'" />
                </div>
            </Example>

            <Example title="Tamaños">
                <div class="flex flex-col gap-6 w-full">
                    <Accordion :items="faqItems.slice(0, 2)" size="small"  :model-value="'what'" />
                    <Accordion :items="faqItems.slice(0, 2)" size="medium" :model-value="'what'" />
                    <Accordion :items="faqItems.slice(0, 2)" size="large"  :model-value="'what'" />
                </div>
            </Example>

            <Example title="Contenido rico (slot)" description="Usa el slot #item-<value> para JSX, listas, formularios, etc.">
                <Accordion
                    :items="[
                        { value: 'plan', title: 'Plan Pro' },
                        { value: 'team', title: 'Equipo' },
                    ]"
                    :model-value="'plan'"
                >
                    <template #item-plan>
                        <ul class="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>Hasta 50 proyectos</li>
                            <li>Soporte prioritario 24/7</li>
                            <li>Analytics avanzados</li>
                        </ul>
                    </template>
                    <template #item-team>
                        <p class="text-sm">Invita a tu equipo desde Configuración → Miembros.</p>
                    </template>
                </Accordion>
            </Example>
        </template>
    </DocPage>
</template>
