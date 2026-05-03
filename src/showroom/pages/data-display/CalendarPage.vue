<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Calendar from '../../../components/data-display/calendar/Calendar.vue';

const d = ref<Date | null>(new Date());
</script>

<template>
    <DocPage
        title="Calendar"
        category="Data display"
        import-path="import Calendar from '@/components/data-display/calendar/Calendar.vue'"
        description="Calendario mensual para selección de fecha. Soporta minDate, maxDate, fechas deshabilitadas y locale."
    >
        <template #examples>
            <Example title="Default">
                <Calendar v-model="d" />
            </Example>

            <Example title="Con min/max">
                <Calendar
                    v-model="d"
                    :min-date="new Date()"
                    :max-date="new Date(Date.now() + 30 * 86400000)"
                    color="primary"
                />
            </Example>

            <Example title="Variant outline + locale en">
                <Calendar v-model="d" variant="outline" locale="en-US" :first-day-of-week="0" />
            </Example>
        </template>
    </DocPage>
</template>
