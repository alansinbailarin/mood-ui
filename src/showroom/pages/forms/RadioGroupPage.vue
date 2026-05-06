<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import RadioGroup from '../../../components/forms/RadioGroup.vue';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

const plans = [
    { value: 'free',  label: 'Gratis' },
    { value: 'pro',   label: 'Pro' },
    { value: 'team',  label: 'Equipo' },
];

const plansDescribed = [
    { value: 'free',  label: 'Gratis',  description: 'Ideal para empezar y proyectos personales.' },
    { value: 'pro',   label: 'Pro',     description: 'Para profesionales que necesitan más capacidad.' },
    { value: 'team',  label: 'Equipo',  description: 'Colaboración avanzada para equipos en crecimiento.' },
];

const colors = [
    { value: 'red',   label: 'Rojo' },
    { value: 'green', label: 'Verde' },
    { value: 'blue',  label: 'Azul' },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue       = ref<string | number | null>('pro');
const pgColor       = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize        = ref<'small' | 'medium' | 'large'>('medium');
const pgOrientation = ref<'vertical' | 'horizontal'>('vertical');
const pgDisabled    = ref(false);

function resetPlayground() {
    pgValue.value       = 'pro';
    pgColor.value       = 'primary';
    pgSize.value        = 'medium';
    pgOrientation.value = 'vertical';
    pgDisabled.value    = false;
}

const colorDots = [
    { value: 'default' as const, bg: '#64748b',        label: 'Default' },
    { value: 'primary' as const, bg: 'var(--primary)', label: 'Primary' },
    { value: 'success' as const, bg: '#22c55e',        label: 'Success' },
    { value: 'warning' as const, bg: '#f59e0b',        label: 'Warning' },
    { value: 'danger'  as const, bg: '#ef4444',        label: 'Danger'  },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgColor.value       !== 'default')   parts.push(`color="${pgColor.value}"`);
    if (pgSize.value        !== 'medium')    parts.push(`size="${pgSize.value}"`);
    if (pgOrientation.value !== 'vertical')  parts.push(`orientation="${pgOrientation.value}"`);
    if (pgDisabled.value)                    parts.push(':disabled="true"');
    const attrs = parts.length ? '\n    ' + parts.join('\n    ') : '';
    return `<RadioGroup
    v-model="plan"
    :options="plans"
    label="Plan"${attrs}
/>`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<RadioGroup v-model="plan" :options="plans" label="Plan" />`;

const describedCode = `<RadioGroup v-model="plan" :options="plansDescribed" label="Elige tu plan" color="primary" />`;

const horizontalCode = `<RadioGroup
    v-model="color"
    :options="colors"
    label="Color favorito"
    orientation="horizontal"
    color="primary"
/>`;

const sizesCode = `<RadioGroup v-model="plan" :options="plans" size="small"  label="Small" />
<RadioGroup v-model="plan" :options="plans" size="medium" label="Medium" />
<RadioGroup v-model="plan" :options="plans" size="large"  label="Large" />`;

const disabledCode = `<RadioGroup v-model="plan" :options="plans" label="Disabled" disabled />`;

const ex1 = ref<string | number | null>('pro');
const ex2 = ref<string | number | null>('pro');
const ex3 = ref<string | number | null>('green');
const ex4 = ref<string | number | null>('free');

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',  type: 'string | number | null',                                               description: 'Valor seleccionado del grupo (v-model).' },
    { name: 'options',     type: 'RadioOption[]',                                                        description: 'Opciones { value, label, description?, disabled? } a renderizar.' },
    { name: 'name',        type: 'string',                                                               description: 'Atributo name compartido por todos los radios. Se autogenera si se omite.' },
    { name: 'label',       type: 'string',                                                               description: 'Etiqueta del grupo (renderizada como <legend>).' },
    { name: 'helperText',  type: 'string',                                                               description: 'Texto de ayuda bajo el grupo.' },
    { name: 'errorText',   type: 'string',                                                               description: 'Mensaje de error que reemplaza al helperText.' },
    { name: 'orientation', type: "'vertical' | 'horizontal'",            default: "'vertical'",          description: 'Disposición de los radios dentro del grupo.' },
    { name: 'color',       type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Color semántico aplicado a todos los radios.' },
    { name: 'size',        type: "'small' | 'medium' | 'large'",         default: "'medium'",            description: 'Tamaño aplicado a todos los radios.' },
    { name: 'disabled',    type: 'boolean',                              default: 'false',               description: 'Deshabilita todo el grupo.' },
    { name: 'required',    type: 'boolean',                              default: 'false',               description: 'Marca el grupo como requerido.' },
    { name: 'loading',     type: 'boolean',                              default: 'false',               description: 'Estado de carga.' },
    { name: 'ariaLabel',   type: 'string',                                                               description: 'Nombre accesible cuando no hay label visible.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'string | number', description: 'Emitido al cambiar la opción seleccionada (sincroniza v-model).' },
    { name: 'change',            payload: 'string | number', description: 'Emitido tras cada selección confirmada por el usuario.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Permite renderizar Radios manualmente cuando se necesita personalización por opción.' },
];
</script>

<template>
    <ComponentDoc
        title="RadioGroup"
        category="Forms"
        import-path="import { RadioGroup } from 'mood-ui'"
        description="Grupo de radios con selección única, fieldset/legend semántico y soporte completo de label, helper y error."
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <!-- Color dots -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">COLOR</span>
                        <div class="flex items-center gap-1">
                            <button
                                v-for="c in colorDots"
                                :key="c.value"
                                type="button"
                                class="size-4 rounded-full transition-all duration-150"
                                :class="pgColor === c.value
                                    ? 'ring-2 ring-offset-1 ring-foreground/30 scale-125'
                                    : 'hover:scale-110 opacity-70 hover:opacity-100'"
                                :style="`background: ${c.bg}`"
                                :title="c.label"
                                @click="pgColor = c.value"
                            />
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <!-- Size -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">SIZE</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in ['small', 'medium', 'large']"
                                :key="s"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgSize === s
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgSize = (s as typeof pgSize)"
                            >{{ s }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <!-- Orientation -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">LAYOUT</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="o in ['vertical', 'horizontal']"
                                :key="o"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgOrientation === o
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgOrientation = (o as typeof pgOrientation)"
                            >{{ o }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDisabled
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDisabled = !pgDisabled"
                    >Disabled</button>
                </template>

                <RadioGroup
                    v-model="pgValue"
                    :options="plans"
                    label="Plan"
                    :color="pgColor"
                    :size="pgSize"
                    :orientation="pgOrientation"
                    :disabled="pgDisabled"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Uso básico"
                description="Lista de opciones con selección única vinculada con v-model."
                :code="basicCode"
            >
                <RadioGroup v-model="ex1" :options="plans" label="Plan" />
            </ComponentPreview>

            <ComponentPreview
                title="Con descripción"
                description="Cada opción puede incluir un texto secundario para añadir contexto."
                :code="describedCode"
            >
                <RadioGroup v-model="ex2" :options="plansDescribed" label="Elige tu plan" color="primary" />
            </ComponentPreview>

            <ComponentPreview
                title="Horizontal"
                description="Ideal para opciones cortas alineadas en una sola fila."
                :code="horizontalCode"
            >
                <RadioGroup v-model="ex3" :options="colors" label="Color favorito" orientation="horizontal" color="primary" />
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres tamaños disponibles para distintas densidades de UI."
                :code="sizesCode"
            >
                <div class="flex flex-col gap-6">
                    <RadioGroup v-model="ex4" :options="plans" size="small"  label="Small" />
                    <RadioGroup v-model="ex4" :options="plans" size="medium" label="Medium" />
                    <RadioGroup v-model="ex4" :options="plans" size="large"  label="Large" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Disabled"
                description="Bloquea todo el grupo manteniendo la selección visible."
                :code="disabledCode"
            >
                <RadioGroup :model-value="'pro'" :options="plans" label="Disabled" disabled />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
