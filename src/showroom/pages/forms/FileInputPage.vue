<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import FileInput from '../../../components/forms/FileInput.vue';

const files = ref<File[] | null>(null);
const images = ref<File[] | null>(null);
</script>

<template>
    <DocPage
        title="FileInput"
        category="Forms"
        import-path="import FileInput from '@/components/forms/FileInput.vue'"
        description="Drag & drop de archivos con preview, validación de tipo, tamaño y número máximo, y rechazo controlado."
    >
        <template #examples>
            <Example title="Single file">
                <FileInput v-model="files" label="Adjuntar documento" class="w-96" />
            </Example>

            <Example title="Multiple + accept" description="Solo imágenes.">
                <FileInput
                    v-model="images"
                    multiple
                    accept="image/*"
                    label="Imágenes"
                    helper-text="JPG, PNG hasta 5 MB."
                    :max-size="5 * 1024 * 1024"
                    :max-files="5"
                    class="w-96"
                />
            </Example>

            <Example title="Disabled">
                <FileInput disabled label="Subida deshabilitada" class="w-96" />
            </Example>
        </template>
    </DocPage>
</template>
