<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import MonthView from '../../../components/data-display/calendar/MonthView.vue';
import type { CalendarEvent } from '../../../interfaces/data-display/calendar/MonthView.interface';

const date = ref(new Date());
const today = new Date();
const events: CalendarEvent[] = [
    { id: 1, title: 'Reunión equipo', start: today, color: 'primary' },
    { id: 2, title: 'Lanzamiento', start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2), color: 'success' },
    { id: 3, title: 'Demo cliente', start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), color: 'warning' },
    { id: 4, title: 'Workshop', start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3), color: 'info', allDay: true },
];
</script>

<template>
    <DocPage
        title="MonthView"
        category="Data display"
        import-path="import MonthView from '@/components/data-display/calendar/MonthView.vue'"
        description="Vista mensual tipo calendario para mostrar eventos por día. Limita events visibles por celda con maxEventsPerDay."
    >
        <template #examples>
            <Example title="Con eventos">
                <div class="w-full"><MonthView v-model="date" :events="events" /></div>
            </Example>

            <Example title="Con weekNumbers + fixedWeeks">
                <div class="w-full"><MonthView v-model="date" :events="events" show-week-numbers fixed-weeks color="primary" /></div>
            </Example>
        </template>
    </DocPage>
</template>
