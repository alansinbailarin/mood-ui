import { computed } from 'vue'; 
 
export interface TimeGridInput { 
    hourStart: () => number; 
    hourEnd: () => number; 
    slotMinutes: () => number; 
    slotHeight: () => number; 
    format: () => '12h' | '24h'; 
} 
 
export const MS_MIN = 60000; 
 
export function useTimeGrid(input: TimeGridInput) { 
    const slotsPerHour = computed(() => 60 / input.slotMinutes()); 
 
    const windowHours = computed(() => { 
        const s = input.hourStart(); 
        const e = input.hourEnd(); 
        if (e > s) return e - s; 
        return 24 - s + e; 
    }); 
 
    const totalSlots = computed(() => windowHours.value * slotsPerHour.value); 
    const windowMinutes = computed(() => windowHours.value * 60); 
    const totalPixels = computed(() => windowMinutes.value * (input.slotHeight() / input.slotMinutes())); 
 
    const hourLabels = computed(() => { 
        const labels: { offset: number; hour: number; label: string }[] = []; 
        for (let i = 0; i <= windowHours.value; i++) { 
            const h = (input.hourStart() + i) % 24; 
            let label: string; 
            if (input.format() === '12h') { 
                const period = h >= 12 && h < 24 ? 'PM' : 'AM'; 
                const h12 = h % 12 === 0 ? 12 : h % 12; 
                label = `${h12} ${period}`; 
            } else { 
                label = `${h.toString().padStart(2, '0')}:00`; 
            } 
            labels.push({ offset: i, hour: h, label }); 
        } 
        return labels; 
    }); 
 
    const dayStartMs = (d: Date) => 
        new Date(d.getFullYear(), d.getMonth(), d.getDate(), input.hourStart(), 0).getTime(); 
 
    const dayEndMs = (d: Date) => dayStartMs(d) + windowMinutes.value * MS_MIN; 
 
    return { 
        slotsPerHour, 
        windowHours, 
        totalSlots, 
        windowMinutes, 
        totalPixels, 
        hourLabels, 
        dayStartMs, 
        dayEndMs, 
    }; 
}
