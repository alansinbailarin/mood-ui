<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import DateTimePicker from '../../../components/data-display/date-picker/DateTimePicker.vue';

const d = ref<Date | null>(new Date());
</script>

<template>
    <DocPage
        title="DateTimePicker"
        category="Data display"
        import-path="import DateTimePicker from '@/components/data-display/date-picker/DateTimePicker.vue'"
        description="Selector inline de fecha y hora. Soporta minDate/maxDate, formato 12/24 h y minutos por step."
    >
        <template #examples>
            <Example title="Default 24h">
                <DateTimePicker v-model="d" />
            </Example>

            <Example title="12h con segundos">
                <DateTimePicker v-model="d" format="12h" show-seconds />
            </Example>

            <Example title="Step 15 min">
                <DateTimePicker v-model="d" :step="15" color="primary" />
            </Example>
        </template>
    </DocPage>
</template>
