<template> 
    <div v-if="showHeader" class="flex items-center justify-between gap-2 px-3 py-3 border-b border-border min-w-0"> 
        <div class="flex items-center gap-0.5 shrink-0"> 
            <Button 
                v-if="showYearJump" 
                variant="text" 
                size="small" 
                radius="medium" 
                :icon="ChevronDoubleLeftIcon" 
                :ariaLabel="loc.calendar.prevYear" 
                :disabled="isPrevYearDisabled" 
                class="text-muted-foreground" 
                @click="$emit('prevYear')" 
            /> 
            <Button 
                variant="text" 
                size="small" 
                radius="medium" 
                :icon="ChevronLeftIcon" 
                :ariaLabel="prevLabel" 
                :disabled="isPrevDisabled" 
                class="text-muted-foreground" 
                @click="$emit('prev')" 
            /> 
        </div> 
 
        <template v-if="showSelects"> 
            <div class="hidden sm:flex items-center gap-1 min-w-0 flex-1 justify-center flex-wrap"> 
                <Select 
                    v-if="dayOptions" 
                    :modelValue="selectedDay" 
                    :options="dayOptionItems" 
                    :color="color" 
                    variant="ghost" 
                    size="small" 
                    panelWidth="auto" 
                    ariaLabel="Day" 
                    class="modo-calendar-header-select" 
                    @update:modelValue="$emit('update:selectedDay', Number($event))" 
                /> 
                <Select 
                    v-if="showMonthSelect" 
                    :modelValue="selectedMonth" 
                    :options="monthOptionItems" 
                    :color="color" 
                    variant="ghost" 
                    size="small" 
                    panelWidth="auto" 
                    :panelMinWidth="160" 
                    ariaLabel="Month" 
                    class="modo-calendar-header-select" 
                    @update:modelValue="$emit('update:selectedMonth', Number($event))" 
                /> 
                <Select 
                    v-if="showYearSelect" 
                    :modelValue="selectedYear" 
                    :options="yearOptionItems" 
                    :color="color" 
                    variant="ghost" 
                    size="small" 
                    panelWidth="auto" 
                    ariaLabel="Year" 
                    class="modo-calendar-header-select" 
                    @update:modelValue="$emit('update:selectedYear', Number($event))" 
                /> 
                <Select 
                    v-if="weekOptions" 
                    :modelValue="selectedWeek" 
                    :options="weekOptionItems" 
                    :color="color" 
                    variant="ghost" 
                    size="small" 
                    panelWidth="auto" 
                    ariaLabel="Week" 
                    class="modo-calendar-header-select" 
                    @update:modelValue="$emit('update:selectedWeek', Number($event))" 
                /> 
            </div> 
            <Typography 
                class="sm:hidden capitalize tracking-tight min-w-0 flex-1" 
                variant="title" 
                size="small" 
                as="h2" 
                weight="semibold" 
                align="center" 
                :truncate="true" 
            > 
                {{ label }} 
            </Typography> 
        </template> 
        <div v-else-if="weekdayLabel" class="flex flex-col items-center min-w-0 flex-1"> 
            <span :class="['text-[11px] font-medium tracking-wider text-muted-foreground', dayNameCaseClass]">{{ weekdayLabel }}</span> 
            <Typography variant="title" size="small" as="h2" weight="semibold" :truncate="true" class="capitalize tracking-tight max-w-full">{{ label }}</Typography> 
        </div> 
        <Typography v-else variant="title" size="small" as="h2" weight="semibold" align="center" :truncate="true" class="capitalize tracking-tight min-w-0 flex-1">{{ label }}</Typography> 
 
        <div class="flex items-center gap-1 shrink-0"> 
            <button 
                v-if="showTodayButton" 
                type="button" 
                @click="$emit('today')" 
                :class="['text-xs font-medium px-2.5 py-1 hover:bg-muted transition-colors cursor-pointer focus:outline-none focus-visible:ring-2', todayRadiusClass, todayRingClass, todayTextClass]" 
            > 
                Today 
            </button> 
            <Button 
                variant="text" 
                size="small" 
                radius="medium" 
                :icon="ChevronRightIcon" 
                :ariaLabel="nextLabel" 
                :disabled="isNextDisabled" 
                class="text-muted-foreground" 
                @click="$emit('next')" 
            /> 
            <Button 
                v-if="showYearJump" 
                variant="text" 
                size="small" 
                radius="medium" 
                :icon="ChevronDoubleRightIcon" 
                :ariaLabel="loc.calendar.nextYear" 
                :disabled="isNextYearDisabled" 
                class="text-muted-foreground" 
                @click="$emit('nextYear')" 
            /> 
        </div> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { computed } from 'vue'; 
import { ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/vue/24/outline'; 
import Typography from '../Typography.vue'; 
import Select from '../../forms/Select.vue'; 
import Button from '../../forms/Button.vue'; 
import type { SelectOption } from '../../../interfaces/forms/Select.interface'; 
import type { CalendarColor } from '../../../composables/useCalendarTheme'; 
import { useModoLocale } from '../../../composables/useModoConfig'; 
 
const loc = useModoLocale(); 
 
interface Props { 
    label: string; 
    weekdayLabel?: string; 
    showHeader?: boolean; 
    showYearJump?: boolean; 
    showTodayButton?: boolean; 
    showMonthYearSelects?: boolean; 
    showWeekSelect?: boolean; 
    prevLabel?: string; 
    nextLabel?: string; 
    focusRingColorClass: string; 
    todayTextClass: string; 
    todayRadiusClass?: string; 
    dayNameCaseClass?: string; 
    useFocusRingForToday?: boolean; 
    color?: CalendarColor; 
    monthOptions: string[]; 
    yearOptions: number[]; 
    dayOptions?: number[]; 
    weekOptions?: { index: number }[]; 
    selectedMonth?: number; 
    selectedYear?: number; 
    selectedDay?: number; 
    selectedWeek?: number; 
    isMonthDisabled?: (i: number) => boolean; 
    isPrevDisabled?: boolean; 
    isNextDisabled?: boolean; 
    isPrevYearDisabled?: boolean; 
    isNextYearDisabled?: boolean; 
} 
 
const props = withDefaults(defineProps<Props>(), { 
    showHeader: true, 
    showYearJump: false, 
    showTodayButton: true, 
    showMonthYearSelects: false, 
    showWeekSelect: false, 
    prevLabel: 'Previous', 
    nextLabel: 'Next', 
    useFocusRingForToday: false, 
    color: 'default', 
    todayRadiusClass: 'rounded-md', 
}); 
 
defineEmits<{ 
    prev: []; 
    next: []; 
    prevYear: []; 
    nextYear: []; 
    today: []; 
    'update:selectedMonth': [v: number]; 
    'update:selectedYear': [v: number]; 
    'update:selectedDay': [v: number]; 
    'update:selectedWeek': [v: number]; 
}>(); 
 
const showMonthSelect = computed(() => props.showMonthYearSelects); 
const showYearSelect = computed(() => props.showMonthYearSelects); 
const showSelects = computed(() => props.showMonthYearSelects || props.showWeekSelect || !!props.dayOptions); 
const todayRingClass = computed(() => (props.useFocusRingForToday ? props.focusRingColorClass : 'focus-visible:ring-ring')); 
 
const dayOptionItems = computed<SelectOption[]>(() => 
    (props.dayOptions ?? []).map((d) => ({ value: d, label: String(d) })), 
); 
const monthOptionItems = computed<SelectOption[]>(() => 
    props.monthOptions.map((m, i) => ({ 
        value: i, 
        label: m, 
        disabled: props.isMonthDisabled ? props.isMonthDisabled(i) : false, 
    })), 
); 
const yearOptionItems = computed<SelectOption[]>(() => 
    props.yearOptions.map((y) => ({ value: y, label: String(y) })), 
); 
const weekOptionItems = computed<SelectOption[]>(() => 
    (props.weekOptions ?? []).map((w) => ({ value: w.index, label: `W${w.index}` })), 
); 
</script> 
 
<style scoped> 
/* Tighten the Select trigger to fit the calendar header chrome. 
 * The panel sizes itself to its content via `panelWidth="auto"`, so the 
 * trigger can stay compact and only show the active value. */ 
.modo-calendar-header-select :deep(.modo-field-wrapper) { 
    height: 1.75rem; 
    padding-inline: 0.5rem; 
    background-color: transparent; 
    border-color: transparent; 
    font-weight: 600; 
    gap: 0.25rem; 
} 
.modo-calendar-header-select :deep(.modo-field-wrapper):hover { 
    background-color: var(--color-muted); 
} 
</style>
