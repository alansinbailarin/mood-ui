<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Combobox from '../../../components/forms/Combobox.vue';

const v = ref('');
const v2 = ref('');

const fruits = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date' },
    { value: 'elderberry', label: 'Elderberry' },
    { value: 'fig', label: 'Fig' },
    { value: 'grape', label: 'Grape' },
];
</script>

<template>
    <DocPage
        title="Combobox"
        category="Forms"
        import-path="import Combobox from '@/components/forms/Combobox.vue'"
        description="Input con autocompletado: filtra opciones a medida que escribes, soporta freeSolo (valores arbitrarios) y carga remota con loadOptions."
    >
        <template #examples>
            <Example title="Default" description="Filtra por substring.">
                <Combobox v-model="v" :options="fruits" label="Fruta" placeholder="Empieza a escribir…" class="w-72" />
            </Example>

            <Example title="Free solo" description="Permite escribir valores fuera de la lista.">
                <Combobox v-model="v2" :options="fruits" free-solo label="Tag libre" placeholder="Cualquier valor" class="w-72" />
            </Example>

            <Example title="Clearable">
                <Combobox v-model="v" :options="fruits" clearable placeholder="Selecciona…" class="w-72" />
            </Example>
        </template>
    </DocPage>
</template>
