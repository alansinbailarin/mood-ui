<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import DayView from '../../../components/data-display/calendar/DayView.vue';
import type { CalendarEvent } from '../../../interfaces/data-display/calendar/MonthView.interface';

const date = ref(new Date());
function at(h: number, m = 0) {
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
}
const events: CalendarEvent[] = [
    { id: 1, title: 'Reunión kickoff', start: at(9), end: at(10), color: 'primary' },
    { id: 2, title: 'Bloque deep work', start: at(10, 30), end: at(12, 30), color: 'success' },
    { id: 3, title: 'Comida', start: at(13), end: at(14), color: 'warning' },
    { id: 4, title: 'Demo', start: at(16), end: at(17), color: 'info' },
];
</script>

<template>
    <DocPage
        title="DayView"
        category="Data display"
        import-path="import DayView from '@/components/data-display/calendar/DayView.vue'"
        description="Vista diaria con grilla horaria. Ideal para agendas detalladas con bloques de tiempo."
    >
        <template #examples>
            <Example title="Default">
                <div class="w-full"><DayView v-model="date" :events="events" :business-hours="{ start: '08:00', end: '18:00' }" /></div>
            </Example>
        </template>
    </DocPage>
</template>
