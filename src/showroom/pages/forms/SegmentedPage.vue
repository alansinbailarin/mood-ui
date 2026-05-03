<script setup lang="ts">
import { ref } from 'vue';
import { Squares2X2Icon, ListBulletIcon, MapIcon, SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/vue/24/outline';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Segmented from '../../../components/forms/Segmented.vue';

const view = ref<'grid' | 'list' | 'map'>('grid');
const theme = ref<'light' | 'dark' | 'system'>('system');
const period = ref<string>('day');
const align = ref<string>('center');
</script>

<template>
    <DocPage
        title="Segmented"
        category="Forms"
        import-path="import { Segmented } from 'mood-ui'"
        description="Control segmentado para alternar entre opciones mutuamente excluyentes. Más compacto que un grupo de tabs y orientado a inputs."
    >
        <template #examples>
            <Example title="Básico" :code="`<script setup lang=\&quot;ts\&quot;>\nimport { ref } from 'vue';\nimport { Segmented } from 'mood-ui';\n\nconst view = ref('grid');\nconst items = [\n  { value: 'grid', label: 'Grid' },\n  { value: 'list', label: 'List' },\n  { value: 'map',  label: 'Map'  },\n];\n<\\/script>\n\n<template>\n  <Segmented v-model=\&quot;view\&quot; :items=\&quot;items\&quot; />\n</template>`">
                <div class="flex flex-col gap-3">
                    <Segmented
                        v-model="view"
                        :items="[
                            { value: 'grid', label: 'Grid' },
                            { value: 'list', label: 'List' },
                            { value: 'map',  label: 'Map'  },
                        ]"
                    />
                    <p class="text-xs text-muted-foreground font-mono">value: {{ view }}</p>
                </div>
            </Example>

            <Example title="Con iconos" :code="`<Segmented v-model=\&quot;view\&quot; :items=\&quot;items\&quot; />\n\n// items = [\n//   { value: 'grid', label: 'Grid', icon: Squares2X2Icon },\n//   { value: 'list', label: 'List', icon: ListBulletIcon },\n//   { value: 'map',  label: 'Map',  icon: MapIcon },\n// ]`">
                <Segmented
                    v-model="view"
                    :items="[
                        { value: 'grid', label: 'Grid', icon: Squares2X2Icon },
                        { value: 'list', label: 'List', icon: ListBulletIcon },
                        { value: 'map',  label: 'Map',  icon: MapIcon },
                    ]"
                />
            </Example>

            <Example title="Solo iconos" description="Cuando omitas label, asegúrate de pasar ariaLabel.">
                <Segmented
                    v-model="theme"
                    :items="[
                        { value: 'light',  icon: SunIcon,            ariaLabel: 'Claro' },
                        { value: 'dark',   icon: MoonIcon,           ariaLabel: 'Oscuro' },
                        { value: 'system', icon: ComputerDesktopIcon, ariaLabel: 'Sistema' },
                    ]"
                />
            </Example>

            <Example title="Tamaños">
                <div class="flex flex-col items-start gap-3">
                    <Segmented
                        v-model="period"
                        size="small"
                        :items="[
                            { value: 'day',   label: 'Día' },
                            { value: 'week',  label: 'Semana' },
                            { value: 'month', label: 'Mes' },
                        ]"
                    />
                    <Segmented
                        v-model="period"
                        size="medium"
                        :items="[
                            { value: 'day',   label: 'Día' },
                            { value: 'week',  label: 'Semana' },
                            { value: 'month', label: 'Mes' },
                        ]"
                    />
                    <Segmented
                        v-model="period"
                        size="large"
                        :items="[
                            { value: 'day',   label: 'Día' },
                            { value: 'week',  label: 'Semana' },
                            { value: 'month', label: 'Mes' },
                        ]"
                    />
                </div>
            </Example>

            <Example title="Full width">
                <Segmented
                    v-model="align"
                    full-width
                    :items="[
                        { value: 'left',   label: 'Izquierda' },
                        { value: 'center', label: 'Centro' },
                        { value: 'right',  label: 'Derecha' },
                    ]"
                />
            </Example>

            <Example title="Disabled (item / global)">
                <div class="flex flex-col items-start gap-3">
                    <Segmented
                        v-model="view"
                        :items="[
                            { value: 'grid', label: 'Grid' },
                            { value: 'list', label: 'List' },
                            { value: 'map',  label: 'Map', disabled: true },
                        ]"
                    />
                    <Segmented
                        v-model="view"
                        disabled
                        :items="[
                            { value: 'grid', label: 'Grid' },
                            { value: 'list', label: 'List' },
                            { value: 'map',  label: 'Map' },
                        ]"
                    />
                </div>
            </Example>

            <Example title="Colores">
                <div class="flex flex-col items-start gap-3">
                    <Segmented v-model="period" color="primary" :items="[{ value: 'day', label: 'Día' }, { value: 'week', label: 'Semana' }, { value: 'month', label: 'Mes' }]" />
                    <Segmented v-model="period" color="success" :items="[{ value: 'day', label: 'Día' }, { value: 'week', label: 'Semana' }, { value: 'month', label: 'Mes' }]" />
                    <Segmented v-model="period" color="warning" :items="[{ value: 'day', label: 'Día' }, { value: 'week', label: 'Semana' }, { value: 'month', label: 'Mes' }]" />
                    <Segmented v-model="period" color="danger"  :items="[{ value: 'day', label: 'Día' }, { value: 'week', label: 'Semana' }, { value: 'month', label: 'Mes' }]" />
                </div>
            </Example>
        </template>
    </DocPage>
</template>
