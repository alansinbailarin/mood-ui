<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Switch from '../../../components/forms/Switch.vue';
import type { PropDoc, EmitDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgChecked  = ref(true);
const pgColor    = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize     = ref<'small' | 'medium' | 'large'>('medium');
const pgLabelPos = ref<'left' | 'right'>('right');
const pgDisabled = ref(false);

function resetPlayground() {
    pgChecked.value  = true;
    pgColor.value    = 'primary';
    pgSize.value     = 'medium';
    pgLabelPos.value = 'right';
    pgDisabled.value = false;
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
    if (pgColor.value    !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value     !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgLabelPos.value !== 'right')   parts.push(`label-position="${pgLabelPos.value}"`);
    if (pgDisabled.value)               parts.push(':disabled="true"');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Switch v-model="checked" label="Notificaciones"${attrs} />`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<Switch v-model="pushEnabled" label="Notificaciones push" />
<Switch v-model="darkMode"    label="Modo oscuro" />`;

const descriptionCode = `<Switch
    label="Marketing"
    description="Recibir novedades de producto."
    :model-value="true"
/>`;

const labelLeftCode = `<Switch label-position="left" label="Activo" :model-value="true" />`;

const colorsCode = `<Switch :model-value="true" color="primary" label="primary" />
<Switch :model-value="true" color="success" label="success" />
<Switch :model-value="true" color="warning" label="warning" />
<Switch :model-value="true" color="danger"  label="danger" />`;

const sizesCode = `<Switch :model-value="true" size="small"  label="small" />
<Switch :model-value="true" size="medium" label="medium" />
<Switch :model-value="true" size="large"  label="large" />`;

const disabledCode = `<Switch :model-value="true"  disabled label="Disabled on" />
<Switch :model-value="false" disabled label="Disabled off" />`;

// Example state
const ex1A = ref(true);
const ex1B = ref(false);

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',    type: 'boolean',                                                            default: 'false',    description: 'Valor del switch (v-model). true = encendido.' },
    { name: 'label',         type: 'string',                                                                                  description: 'Etiqueta visible junto al control.' },
    { name: 'description',   type: 'string',                                                                                  description: 'Texto descriptivo secundario bajo el label.' },
    { name: 'helperText',    type: 'string',                                                                                  description: 'Texto de ayuda bajo el control. Se oculta si hay errorText.' },
    { name: 'errorText',     type: 'string',                                                                                  description: 'Mensaje de error que reemplaza al helperText y aplica estado de error.' },
    { name: 'color',         type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",           default: "'default'", description: 'Color semántico aplicado en estado encendido.' },
    { name: 'size',          type: "'small' | 'medium' | 'large'",                                       default: "'medium'", description: 'Tamaño del track y del thumb.' },
    { name: 'radius',        type: "'none' | 'small' | 'medium' | 'large' | 'full'",                     default: "'full'",   description: 'Radio del track. El thumb permanece circular.' },
    { name: 'labelPosition', type: "'left' | 'right'",                                                   default: "'right'",  description: 'Posición de la etiqueta respecto al control.' },
    { name: 'disabled',      type: 'boolean',                                                            default: 'false',    description: 'Deshabilita el switch e impide la interacción.' },
    { name: 'readonly',      type: 'boolean',                                                            default: 'false',    description: 'Bloquea cambios pero mantiene foco y estilos activos.' },
    { name: 'required',      type: 'boolean',                                                            default: 'false',    description: 'Marca el campo como requerido y muestra asterisco.' },
    { name: 'loading',       type: 'boolean',                                                            default: 'false',    description: 'Estado de carga durante operaciones asíncronas.' },
    { name: 'name',          type: 'string',                                                                                  description: 'Atributo name HTML para envío en formularios.' },
    { name: 'id',            type: 'string',                                                                                  description: 'id del input. Se autogenera si se omite.' },
    { name: 'ariaLabel',     type: 'string',                                                                                  description: 'Nombre accesible cuando no hay label visible.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'boolean', description: 'Emitido al cambiar el valor (sincroniza v-model).' },
    { name: 'change',            payload: 'boolean', description: 'Emitido tras cada cambio confirmado por el usuario.' },
];
</script>

<template>
    <ComponentDoc
        title="Switch"
        category="Forms"
        import-path="import { Switch } from 'mood-ui'"
        description="Toggle on/off semánticamente accesible. Soporta etiqueta a izquierda o derecha, descripción y todas las variantes de color y tamaño."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="180px" @reset="resetPlayground">
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

                    <!-- Label position -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">LABEL</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="p in ['left', 'right']"
                                :key="p"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgLabelPos === p
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgLabelPos = (p as typeof pgLabelPos)"
                            >{{ p }}</button>
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

                <Switch
                    v-model="pgChecked"
                    label="Notificaciones"
                    :color="pgColor"
                    :size="pgSize"
                    :label-position="pgLabelPos"
                    :disabled="pgDisabled"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Uso básico"
                description="Toggle binario con v-model y etiqueta visible."
                :code="basicCode"
            >
                <div class="flex flex-col gap-3">
                    <Switch v-model="ex1A" label="Notificaciones push" />
                    <Switch v-model="ex1B" label="Modo oscuro" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Con descripción"
                description="Texto secundario bajo el label para añadir contexto."
                :code="descriptionCode"
            >
                <Switch label="Marketing" description="Recibir novedades de producto." :model-value="true" />
            </ComponentPreview>

            <ComponentPreview
                title="Label a la izquierda"
                description="Útil en filas de configuración con el control alineado a la derecha."
                :code="labelLeftCode"
            >
                <Switch label-position="left" label="Activo" :model-value="true" />
            </ComponentPreview>

            <ComponentPreview
                title="Colores"
                description="Variantes semánticas para el estado encendido."
                :code="colorsCode"
            >
                <Switch :model-value="true" color="primary" label="primary" />
                <Switch :model-value="true" color="success" label="success" />
                <Switch :model-value="true" color="warning" label="warning" />
                <Switch :model-value="true" color="danger"  label="danger" />
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres tamaños disponibles para distintas densidades de UI."
                :code="sizesCode"
            >
                <Switch :model-value="true" size="small"  label="small" />
                <Switch :model-value="true" size="medium" label="medium" />
                <Switch :model-value="true" size="large"  label="large" />
            </ComponentPreview>

            <ComponentPreview
                title="Disabled"
                description="Estado deshabilitado preservando el valor visual."
                :code="disabledCode"
            >
                <Switch :model-value="true"  disabled label="Disabled on" />
                <Switch :model-value="false" disabled label="Disabled off" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
