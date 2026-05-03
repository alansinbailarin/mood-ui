<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import SearchInput from '../../../components/forms/SearchInput.vue';

const q = ref('');
const q2 = ref('');
</script>

<template>
    <DocPage
        title="SearchInput"
        category="Forms"
        import-path="import SearchInput from '@/components/forms/SearchInput.vue'"
        description="Input optimizado para búsqueda: icono de lupa, botón clear automático, debounce opcional y soporte para shortcut de teclado."
    >
        <template #examples>
            <Example title="Default">
                <SearchInput v-model="q" placeholder="Buscar componentes…" class="w-80" />
            </Example>

            <Example title="Con debounce" description="Útil para llamadas a API.">
                <SearchInput v-model="q2" :debounce="400" placeholder="Búsqueda con debounce 400ms" class="w-80" />
            </Example>

            <Example title="Con shortcut" description="Muestra un hint con la tecla rápida.">
                <SearchInput placeholder="Buscar" shortcut="⌘K" class="w-80" />
            </Example>

            <Example title="Tamaños">
                <SearchInput size="small" placeholder="small" class="w-64" />
                <SearchInput size="medium" placeholder="medium" class="w-64" />
                <SearchInput size="large" placeholder="large" class="w-64" />
            </Example>
        </template>
    </DocPage>
</template>
