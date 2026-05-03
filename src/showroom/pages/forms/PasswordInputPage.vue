<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import PasswordInput from '../../../components/forms/PasswordInput.vue';

const v = ref('');
const v2 = ref('SuperSecret123');
</script>

<template>
    <DocPage
        title="PasswordInput"
        category="Forms"
        import-path="import PasswordInput from '@/components/forms/PasswordInput.vue'"
        description="Input de contraseña con toggle de visibilidad y opcional medidor de fortaleza."
    >
        <template #examples>
            <Example title="Default" description="Toggle de visibilidad activado por defecto.">
                <PasswordInput v-model="v" label="Contraseña" placeholder="Escribe tu contraseña" class="w-72" />
            </Example>

            <Example title="Con medidor de fortaleza">
                <PasswordInput v-model="v2" label="Nueva contraseña" strength-meter class="w-72" />
            </Example>

            <Example title="Sin toggle de visibilidad">
                <PasswordInput :toggle-visibility="false" placeholder="Solo lectura" class="w-72" />
            </Example>

            <Example title="Disabled">
                <PasswordInput disabled model-value="hidden" class="w-72" />
            </Example>
        </template>
    </DocPage>
</template>
