<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Card from '../../../components/data-display/Card.vue';
import Typography from '../../../components/data-display/Typography.vue';
import Stack from '../../../components/layout/Stack.vue';
import Select from '../../../components/forms/Select.vue';
import Switch from '../../../components/forms/Switch.vue';
import Scheduler from '../../../components/data-display/calendar/Scheduler.vue';
import type { SchedulerEvent, SchedulerResource } from '../../../interfaces/data-display/calendar/Scheduler.interface';
import type { PropDoc } from '../../types';

const date = ref(new Date());

const resources: SchedulerResource[] = [
    { id: 'r1', title: 'Sala Atlas', subtitle: 'Capacidad 12', color: 'primary' },
    { id: 'r2', title: 'Sala Boreal', subtitle: 'Capacidad 6', color: 'success' },
    { id: 'r3', title: 'Sala Cosmos', subtitle: 'Capacidad 20', color: 'warning' },
    { id: 'r4', title: 'Sala Drift', subtitle: 'Capacidad 4', color: 'info' },
];

function at(h: number, m = 0, dayOffset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(h, m, 0, 0);
    return d;
}

const events: SchedulerEvent[] = [
    { id: 'e1', resourceId: 'r1', title: 'Standup', start: at(9), end: at(9, 30), color: 'primary' },
    { id: 'e2', resourceId: 'r1', title: 'Diseño UI', start: at(10), end: at(12), color: 'primary' },
    { id: 'e3', resourceId: 'r2', title: 'Entrevista', start: at(11), end: at(12), color: 'success' },
    { id: 'e4', resourceId: 'r3', title: 'Workshop', start: at(13), end: at(15), color: 'warning' },
    { id: 'e5', resourceId: 'r4', title: 'Demo cliente', start: at(15, 0, 1), end: at(16, 30, 1), color: 'info' },
];

const color = ref<'default' | 'primary' | 'danger' | 'success' | 'warning'>('primary');
const bordered = ref(true);
const dayNameCase = ref<'upper' | 'lower' | 'capitalize' | 'normal'>('capitalize');

const colorOpts = [
    { value: 'default', label: 'default' },
    { value: 'primary', label: 'primary' },
    { value: 'success', label: 'success' },
    { value: 'warning', label: 'warning' },
    { value: 'danger', label: 'danger' },
];
const caseOpts = [
    { value: 'upper', label: 'upper' },
    { value: 'lower', label: 'lower' },
    { value: 'capitalize', label: 'capitalize' },
    { value: 'normal', label: 'normal' },
];

const propsList: PropDoc[] = [
    { name: 'modelValue', type: 'Date', description: 'Fecha visible.' },
    { name: 'resources', type: 'SchedulerResource[]', description: 'Filas (recursos) del scheduler.', required: true },
    { name: 'events', type: 'SchedulerEvent[]', description: 'Eventos asignados a recursos por `resourceId`.' },
    { name: 'color', type: "'default' | 'primary' | 'danger' | 'success' | 'warning'" },
    { name: 'bordered', type: 'boolean', default: 'true' },
    { name: 'dayNameFormat', type: "'narrow' | 'short' | 'long'" },
    { name: 'dayNameCase', type: "'upper' | 'lower' | 'capitalize' | 'normal'" },
    { name: 'highlightedDates', type: 'Date[]' },
    { name: 'minDate / maxDate', type: 'Date' },
];
</script>

<template>
    <DocPage
        title="Scheduler"
        category="Data display"
        import-path="import Scheduler from '@/components/data-display/calendar/Scheduler.vue'"
        description="Vista tipo agenda agrupada por recursos (salas, personas, equipos). Cada recurso es una fila y los eventos se muestran en columnas de tiempo."
        :props-list="propsList"
    >
        <template #examples>
            <Example title="Default">
                <div class="w-full"><Scheduler v-model="date" :resources="resources" :events="events" /></div>
            </Example>
        </template>

        <template #playground>
            <div class="grid grid-cols-1 xl:grid-cols-4 gap-4">
                <Card variant="outlined" padding="medium" class="xl:col-span-3">
                    <Scheduler
                        v-model="date"
                        :resources="resources"
                        :events="events"
                        :color="color"
                        :bordered="bordered"
                        :day-name-case="dayNameCase"
                    />
                </Card>
                <Card variant="outlined" padding="large">
                    <Stack direction="column" spacing="medium">
                        <Typography variant="title" size="small">Controles</Typography>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Color</Typography>
                            <Select v-model="color" :options="colorOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Day name case</Typography>
                            <Select v-model="dayNameCase" :options="caseOpts" size="small" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Bordered</Typography>
                            <Switch v-model="bordered" />
                        </label>
                    </Stack>
                </Card>
            </div>
        </template>
    </DocPage>
</template>
