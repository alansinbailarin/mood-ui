<template> 
    <div 
        ref="rootRef" 
        :class="['inline-flex flex-col select-none w-fit self-start', variant === 'outline' ? 'border border-border' : '', containerRadiusClass]" 
        tabindex="0" 
        role="application" 
        :aria-label="`Calendar, ${monthLabel} ${currentYear}`" 
        @focus="ensureFocusedDay" 
    > 
        <div v-if="showHeader" class="flex items-center justify-between px-2 py-3"> 
            <div class="flex items-center gap-0.5"> 
                <Button 
                    variant="text" 
                    size="small" 
                    radius="medium" 
                    :icon="ChevronDoubleLeftIcon" 
                    :ariaLabel="loc.calendar.prevYear" 
                    class="text-muted-foreground" 
                    @click="handlePrevYear" 
                /> 
                <Button 
                    variant="text" 
                    size="small" 
                    radius="medium" 
                    :icon="ChevronLeftIcon" 
                    :ariaLabel="loc.calendar.prevMonth" 
                    class="text-muted-foreground" 
                    @click="handlePrevMonth" 
                /> 
            </div> 
 
            <div class="flex items-center gap-2"> 
                <span class="text-sm font-semibold text-foreground select-none"> 
                    {{ monthLabel }} {{ currentYear }} 
                </span> 
                <button 
                    type="button" 
                    class="px-2 py-0.5 text-xs font-medium border border-border hover:bg-muted transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1" 
                    :class="[focusRingColorClass, todayButtonColorClass, pillRadiusClass]" 
                    :aria-label="loc.calendar.today" 
                    @click="handleToday" 
                > 
                    Today 
                </button> 
            </div> 
 
            <div class="flex items-center gap-0.5"> 
                <Button 
                    variant="text" 
                    size="small" 
                    radius="medium" 
                    :icon="ChevronRightIcon" 
                    :ariaLabel="loc.calendar.nextMonth" 
                    class="text-muted-foreground" 
                    @click="handleNextMonth" 
                /> 
                <Button 
                    variant="text" 
                    size="small" 
                    radius="medium" 
                    :icon="ChevronDoubleRightIcon" 
                    :ariaLabel="loc.calendar.nextYear" 
                    class="text-muted-foreground" 
                    @click="handleNextYear" 
                /> 
            </div> 
        </div> 
 
        <div class="grid grid-cols-7 px-2"> 
            <div 
                v-for="day in weekDayLabels" 
                :key="day" 
                class="text-center text-xs font-medium text-muted-foreground py-2" 
            > 
                {{ day }} 
            </div> 
        </div> 
 
        <div class="overflow-hidden px-2 pb-2"> 
            <div ref="gridRef" class="grid grid-cols-7"> 
                <template v-for="(day, i) in calendarDays" :key="day.date.getTime()"> 
                    <div 
                        v-if="day.isOutside && !showOutsideDays" 
                        class="w-9 h-9" 
                        aria-hidden="true" 
                    /> 
                    <button 
                        v-else 
                        type="button" 
                        :disabled="day.disabled" 
                        :tabindex="isFocusedDay(day) ? 0 : -1" 
                        :data-day-index="i" 
                        :aria-label="day.date.toLocaleDateString(locale === 'default' ? undefined : locale)" 
                        :aria-selected="day.isSelected" 
                        :aria-current="day.isToday ? 'date' : undefined" 
                        @click="!day.disabled && selectDate(day.date)" 
                        :class="[ 
                            'relative w-9 h-9 text-sm flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1', 
                            dayRadiusClass, 
                            focusRingColorClass, 
                            day.disabled 
                                ? 'text-muted-foreground/60 cursor-not-allowed' 
                                : day.isSelected 
                                    ? selectedClasses 
                                    : day.isToday 
                                        ? todayClasses 
                                        : day.isOutside 
                                            ? 'text-muted-foreground/40 hover:bg-muted' 
                                            : 'text-foreground/80 hover:bg-muted', 
                        ]" 
                    > 
                        {{ day.day }} 
                    </button> 
                </template> 
            </div> 
        </div> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { ref, computed, toRef, nextTick } from 'vue'; 
import { ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/vue/24/outline'; 
import Button from '../../forms/Button.vue'; 
import gsap from 'gsap'; 
import { useResolvedColor, useResolvedRadius, useModoLocale } from '../../../composables/useModoConfig'; 
import type { Calendar } from '../../../interfaces/data-display/calendar/Calendar.interface'; 
import { useCalendar, isSameDay, type CalendarDay } from '../../../composables/useCalendar'; 
import { useCalendarKeyboard } from '../../../composables/useCalendarKeyboard'; 
 
const loc = useModoLocale(); 
 
const props = withDefaults(defineProps<Calendar>(), { 
    modelValue: null, 
    locale: 'default', 
    firstDayOfWeek: 0, 
    color: 'default', 
    variant: 'outline', 
    showOutsideDays: true, 
    showHeader: true, 
    fixedWeeks: true, 
}); 
 
const emit = defineEmits<{ 
    'update:modelValue': [date: Date]; 
    'monthChange': [payload: { month: number; year: number }]; 
}>(); 
 
const rootRef = ref<HTMLElement | null>(null); 
const gridRef = ref<HTMLElement | null>(null); 
const focusedDate = ref<Date>(props.modelValue ?? new Date()); 
const isAnimating = ref(false); 
 
const { 
    currentMonth, 
    currentYear, 
    monthLabel, 
    weekDayLabels, 
    calendarDays, 
    prevMonth, 
    nextMonth, 
    prevYear, 
    nextYear, 
    goToToday, 
    goToDate, 
} = useCalendar({ 
    modelValue: toRef(props, 'modelValue'), 
    month: toRef(props, 'month'), 
    year: toRef(props, 'year'), 
    locale: toRef(props, 'locale'), 
    firstDayOfWeek: toRef(props, 'firstDayOfWeek'), 
    minDate: toRef(props, 'minDate'), 
    maxDate: toRef(props, 'maxDate'), 
    disabledDates: toRef(props, 'disabledDates'), 
    showOutsideDays: toRef(props, 'showOutsideDays'), 
    fixedWeeks: toRef(props, 'fixedWeeks'), 
}); 
 
const animateMonthChange = (direction: 'left' | 'right', action: () => void): Promise<void> => { 
    return new Promise((resolve) => { 
        if (!gridRef.value || isAnimating.value) { 
            action(); 
            emit('monthChange', { month: currentMonth.value, year: currentYear.value }); 
            resolve(); 
            return; 
        } 
        isAnimating.value = true; 
        const from = direction === 'left' ? -20 : 20; 
        const to = direction === 'left' ? 20 : -20; 
 
        gsap.to(gridRef.value, { 
            x: to, 
            opacity: 0, 
            duration: 0.15, 
            ease: 'power2.in', 
            onComplete: () => { 
                action(); 
                emit('monthChange', { month: currentMonth.value, year: currentYear.value }); 
                nextTick(() => { 
                    if (!gridRef.value) { 
                        isAnimating.value = false; 
                        resolve(); 
                        return; 
                    } 
                    gsap.fromTo( 
                        gridRef.value, 
                        { x: from, opacity: 0 }, 
                        { 
                            x: 0, 
                            opacity: 1, 
                            duration: 0.2, 
                            ease: 'power2.out', 
                            onComplete: () => { 
                                isAnimating.value = false; 
                                resolve(); 
                            }, 
                        } 
                    ); 
                }); 
            }, 
        }); 
    }); 
}; 
 
const handlePrevMonth = () => animateMonthChange('right', prevMonth); 
const handleNextMonth = () => animateMonthChange('left', nextMonth); 
const handlePrevYear = () => animateMonthChange('right', prevYear); 
const handleNextYear = () => animateMonthChange('left', nextYear); 
 
const handleToday = () => { 
    const now = goToToday(); 
    focusedDate.value = now; 
    emit('update:modelValue', now); 
    emit('monthChange', { month: currentMonth.value, year: currentYear.value }); 
 
    // Pulse the today cell so the visual feedback matches the intent of 
    // the "today" action. Happens after the DOM has re-rendered with the 
    // new month, and is a no-op under prefers-reduced-motion (handled by 
    // the global @media override in style.css). 
    nextTick(() => { 
        const todayEl = gridRef.value?.querySelector<HTMLElement>('[aria-current="date"]'); 
        if (!todayEl) return; 
        gsap.fromTo( 
            todayEl, 
            { scale: 1 }, 
            { 
                scale: 1.15, 
                duration: 0.18, 
                ease: 'power2.out', 
                yoyo: true, 
                repeat: 1, 
            } 
        ); 
    }); 
}; 
 
const selectDate = (date: Date) => { 
    focusedDate.value = date; 
    emit('update:modelValue', date); 
}; 
 
const isFocusedDay = (day: CalendarDay) => isSameDay(day.date, focusedDate.value); 
 
const ensureFocusedDay = () => { 
    const d = focusedDate.value; 
    if (d.getMonth() !== currentMonth.value || d.getFullYear() !== currentYear.value) { 
        focusedDate.value = new Date(currentYear.value, currentMonth.value, 1); 
    } 
    nextTick(() => focusDayElement()); 
}; 
 
const focusDayElement = () => { 
    const el = gridRef.value?.querySelector<HTMLButtonElement>('button[tabindex="0"]'); 
    el?.focus(); 
}; 
 
const moveFocus = (deltaDays: number) => { 
    const next = new Date(focusedDate.value); 
    next.setDate(next.getDate() + deltaDays); 
    focusedDate.value = next; 
    const outOfMonth = next.getMonth() !== currentMonth.value || next.getFullYear() !== currentYear.value; 
    if (outOfMonth) { 
        const direction = deltaDays > 0 ? 'left' : 'right'; 
        animateMonthChange(direction, () => goToDate(next)).then(() => focusDayElement()); 
    } else { 
        nextTick(() => focusDayElement()); 
    } 
}; 
 
useCalendarKeyboard(rootRef, { 
    onArrowLeft: () => moveFocus(-1), 
    onArrowRight: () => moveFocus(1), 
    onArrowUp: () => moveFocus(-7), 
    onArrowDown: () => moveFocus(7), 
    onEnter: () => selectDate(focusedDate.value), 
    onPageUp: handlePrevMonth, 
    onPageDown: handleNextMonth, 
    onShiftPageUp: handlePrevYear, 
    onShiftPageDown: handleNextYear, 
    onHome: () => { 
        const dow = focusedDate.value.getDay(); 
        const delta = -((dow - props.firstDayOfWeek + 7) % 7); 
        moveFocus(delta); 
    }, 
    onEnd: () => { 
        const dow = focusedDate.value.getDay(); 
        const delta = 6 - ((dow - props.firstDayOfWeek + 7) % 7); 
        moveFocus(delta); 
    }, 
    onToday: handleToday, 
}); 
 
const resolvedColor = useResolvedColor(() => props.color); 
const resolvedRadius = useResolvedRadius(() => props.radius); 
 
const selectedClasses = computed(() => { 
    const map: Record<string, string> = { 
        default: 'bg-foreground text-background hover:bg-foreground/90', 
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover', 
        danger: 'bg-destructive text-destructive-foreground hover:bg-destructive-hover', 
        success: 'bg-success text-success-foreground hover:bg-success-hover', 
        warning: 'bg-warning text-warning-foreground hover:bg-warning-hover', 
    }; 
    return map[resolvedColor.value] ?? map.default; 
}); 
 
const todayClasses = computed(() => { 
    const map: Record<string, string> = { 
        default: 'text-foreground font-semibold hover:bg-muted', 
        primary: 'text-primary font-semibold hover:bg-primary-subtle', 
        danger: 'text-destructive font-semibold hover:bg-destructive-subtle', 
        success: 'text-success font-semibold hover:bg-success-subtle', 
        warning: 'text-warning font-semibold hover:bg-warning-subtle', 
    }; 
    return map[resolvedColor.value] ?? map.default; 
}); 
 
const focusRingColorClass = computed(() => { 
    const map: Record<string, string> = { 
        default: 'focus-visible:ring-ring', 
        primary: 'focus-visible:ring-primary', 
        danger: 'focus-visible:ring-destructive', 
        success: 'focus-visible:ring-success', 
        warning: 'focus-visible:ring-warning', 
    }; 
    return map[resolvedColor.value] ?? map.default; 
}); 
 
const todayButtonColorClass = computed(() => { 
    const map: Record<string, string> = { 
        default: 'text-foreground', 
        primary: 'text-primary', 
        danger: 'text-destructive', 
        success: 'text-success', 
        warning: 'text-warning', 
    }; 
    return map[resolvedColor.value] ?? map.default; 
}); 
 
const containerRadiusClass = computed(() => { 
    const map: Record<string, string> = { 
        none: 'rounded-none', 
        small: 'rounded-sm', 
        medium: 'rounded-md', 
        large: 'rounded-lg', 
        full: 'rounded-xl', 
    }; 
    return map[resolvedRadius.value] ?? map.full; 
}); 
 
const dayRadiusClass = computed(() => { 
    const map: Record<string, string> = { 
        none: 'rounded-none', 
        small: 'rounded-sm', 
        medium: 'rounded-md', 
        large: 'rounded-lg', 
        full: 'rounded-full', 
    }; 
    return map[resolvedRadius.value] ?? map.full; 
}); 
 
const pillRadiusClass = computed(() => { 
    const map: Record<string, string> = { 
        none: 'rounded-none', 
        small: 'rounded-sm', 
        medium: 'rounded-md', 
        large: 'rounded-full', 
        full: 'rounded-full', 
    }; 
    return map[resolvedRadius.value] ?? map.full; 
}); 
</script>
