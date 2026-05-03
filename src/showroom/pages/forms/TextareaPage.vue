<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Textarea from '../../../components/forms/Textarea.vue';

const v = ref('');
const v2 = ref('Hola mood-ui');
</script>

<template>
    <DocPage
        title="Textarea"
        category="Forms"
        import-path="import Textarea from '@/components/forms/Textarea.vue'"
        description="Área de texto multilínea con autosize, contador de caracteres, helper/error text y todas las variantes visuales del Input."
    >
        <template #examples>
            <Example title="Default" description="Textarea simple con label.">
                <Textarea v-model="v" label="Comentario" placeholder="Escribe algo…" :rows="4" class="w-96" />
            </Example>

            <Example title="Variantes">
                <Textarea variant="outline" placeholder="outline" :rows="2" class="w-64" />
                <Textarea variant="filled" placeholder="filled" :rows="2" class="w-64" />
                <Textarea variant="ghost" placeholder="ghost" :rows="2" class="w-64" />
            </Example>

            <Example title="Autoresize + contador" description="Crece con el contenido y muestra contador.">
                <Textarea
                    v-model="v2"
                    label="Bio"
                    autoresize
                    :max-length="200"
                    show-counter
                    placeholder="Cuéntanos sobre ti"
                    class="w-96"
                />
            </Example>

            <Example title="Error">
                <Textarea
                    label="Descripción"
                    error-text="La descripción es requerida"
                    :rows="3"
                    class="w-96"
                />
            </Example>

            <Example title="Disabled">
                <Textarea disabled model-value="No editable" :rows="2" class="w-64" />
            </Example>
        </template>
    </DocPage>
</template>
