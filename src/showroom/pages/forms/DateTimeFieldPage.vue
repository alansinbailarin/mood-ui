<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import DateTimeField from '../../../components/forms/DateTimeField.vue';

const d = ref<Date | null>(new Date());
</script>

<template>
    <DocPage
        title="DateTimeField"
        category="Forms"
        import-path="import DateTimeField from '@/components/forms/DateTimeField.vue'"
        description="Input combinado de fecha + hora con popover y selector de hora interno."
    >
        <template #examples>
            <Example title="Default">
                <DateTimeField v-model="d" label="Inicio" class="w-72" />
            </Example>

            <Example title="Disabled">
                <DateTimeField :model-value="d" disabled class="w-72" />
            </Example>
        </template>
    </DocPage>
</template>
