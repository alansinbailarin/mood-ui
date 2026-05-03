<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import AgendaView from '../../../components/data-display/calendar/AgendaView.vue';
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
    { id: 1, title: 'Standup', start: at(9, 0, 0), end: at(9, 30, 0), color: 'primary' },
    { id: 2, title: 'Revisión sprint', start: at(11, 0, 0), end: at(12, 0, 0), color: 'success' },
    { id: 3, title: 'Demo cliente', start: at(15, 0, 1), end: at(16, 0, 1), color: 'info' },
    { id: 4, title: 'Onboarding', start: at(10, 0, 3), end: at(11, 30, 3), color: 'warning' },
];
</script>

<template>
    <DocPage
        title="AgendaView"
        category="Data display"
        import-path="import AgendaView from '@/components/data-display/calendar/AgendaView.vue'"
        description="Lista cronológica de eventos por día. Ideal para upcoming events y secciones “próximos”."
    >
        <template #examples>
            <Example title="Default">
                <div class="w-full max-w-2xl"><AgendaView v-model="date" :events="events" :days-to-show="7" /></div>
            </Example>
        </template>
    </DocPage>
</template>
