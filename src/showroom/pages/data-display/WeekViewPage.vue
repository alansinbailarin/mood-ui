<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import WeekView from '../../../components/data-display/calendar/WeekView.vue';
import type { CalendarEvent } from '../../../interfaces/data-display/calendar/MonthView.interface';

const date = ref(new Date());
const t = new Date();
function at(h: number, m = 0, dayOffset = 0) {
    const d = new Date(t);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(h, m, 0, 0);
    return d;
}
const events: CalendarEvent[] = [
    { id: 1, title: 'Standup', start: at(9), end: at(9, 30), color: 'primary' },
    { id: 2, title: 'Diseño UI', start: at(10), end: at(12), color: 'success' },
    { id: 3, title: 'Lunch', start: at(13), end: at(14), color: 'warning' },
    { id: 4, title: 'Code review', start: at(15, 0, 1), end: at(16, 30, 1), color: 'info' },
];
</script>

<template>
    <DocPage
        title="WeekView"
        category="Data display"
        import-path="import WeekView from '@/components/data-display/calendar/WeekView.vue'"
        description="Vista semanal con grilla horaria. Soporta business hours, rangos deshabilitados y resaltado de columnas."
    >
        <template #examples>
            <Example title="Default">
                <div class="w-full"><WeekView v-model="date" :events="events" :business-hours="{ start: '09:00', end: '18:00' }" /></div>
            </Example>
        </template>
    </DocPage>
</template>
