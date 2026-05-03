<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import DateRangeField from '../../../components/forms/DateRangeField.vue';

const r = ref<[Date | null, Date | null]>([new Date(), null]);
</script>

<template>
    <DocPage
        title="DateRangeField"
        category="Forms"
        import-path="import DateRangeField from '@/components/forms/DateRangeField.vue'"
        description="Selector de rango de fechas con popover de doble calendario y presets."
    >
        <template #examples>
            <Example title="Default">
                <DateRangeField v-model="r" label="Periodo" class="w-96" />
            </Example>

            <Example title="Disabled">
                <DateRangeField :model-value="r" disabled class="w-96" />
            </Example>
        </template>
    </DocPage>
</template>
