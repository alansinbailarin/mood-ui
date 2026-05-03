<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import TagInput from '../../../components/forms/TagInput.vue';

const tags = ref<string[]>(['vue', 'typescript']);
const skills = ref<string[]>([]);
const limited = ref<string[]>(['admin']);
const emails = ref<string[]>([]);

function isValidEmail(t: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}
</script>

<template>
    <DocPage
        title="TagInput"
        category="Forms"
        import-path="import { TagInput } from 'mood-ui'"
        description="Input que crea chips al pulsar Enter o un delimitador. Soporta validación, máximo, único, paste con varios valores y eliminación con Backspace."
    >
        <template #examples>
            <Example title="Básico" :code="`<TagInput v-model=\&quot;tags\&quot; />`">
                <div class="flex flex-col gap-2">
                    <TagInput v-model="tags" />
                    <p class="text-xs text-muted-foreground font-mono">value: {{ JSON.stringify(tags) }}</p>
                </div>
            </Example>

            <Example title="Con placeholder + colores">
                <div class="flex flex-col gap-3">
                    <TagInput v-model="skills" placeholder="Añade una skill (Enter)" color="primary" />
                    <TagInput v-model="skills" placeholder="Variant: outline" color="primary" variant="outline" />
                    <TagInput v-model="skills" placeholder="Variant: solid"   color="primary" variant="solid" />
                </div>
            </Example>

            <Example title="Validación (solo emails)" description="Pasa `validator` para rechazar tags no válidos.">
                <div class="flex flex-col gap-2">
                    <TagInput v-model="emails" placeholder="me@example.com, …" :validator="isValidEmail" color="success" />
                    <p class="text-xs text-muted-foreground">Acepta solo correos. Pega varios separados por coma.</p>
                </div>
            </Example>

            <Example title="Máximo 3" :code="`<TagInput v-model=\&quot;tags\&quot; :max=\&quot;3\&quot; />`">
                <TagInput v-model="limited" :max="3" placeholder="Hasta 3 tags" color="warning" />
            </Example>

            <Example title="Tamaños">
                <div class="flex flex-col gap-3">
                    <TagInput v-model="tags" size="small" />
                    <TagInput v-model="tags" size="medium" />
                    <TagInput v-model="tags" size="large" />
                </div>
            </Example>

            <Example title="Readonly / disabled">
                <div class="flex flex-col gap-3">
                    <TagInput v-model="tags" readonly />
                    <TagInput v-model="tags" disabled />
                </div>
            </Example>
        </template>
    </DocPage>
</template>
