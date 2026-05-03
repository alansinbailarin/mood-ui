<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import DateField from '../../../components/forms/DateField.vue';

const d = ref<Date | null>(new Date());
const d2 = ref<Date | null>(null);
</script>

<template>
    <DocPage
        title="DateField"
        category="Forms"
        import-path="import DateField from '@/components/forms/DateField.vue'"
        description="Input de fecha con popover de calendario. Localizable, con minDate / maxDate y formato configurable."
    >
        <template #examples>
            <Example title="Default">
                <DateField v-model="d" label="Fecha" class="w-64" />
            </Example>

            <Example title="Con min y max">
                <DateField
                    v-model="d2"
                    label="Reservar entre hoy y +30 días"
                    :min-date="new Date()"
                    :max-date="new Date(Date.now() + 30 * 86400000)"
                    class="w-64"
                />
            </Example>

            <Example title="Tamaños">
                <DateField :model-value="d" size="small" class="w-48" />
                <DateField :model-value="d" size="medium" class="w-48" />
                <DateField :model-value="d" size="large" class="w-48" />
            </Example>

            <Example title="Disabled">
                <DateField :model-value="d" disabled class="w-64" />
            </Example>
        </template>
    </DocPage>
</template>
