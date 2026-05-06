<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Checkbox from '../../../components/forms/Checkbox.vue';
import type { PropDoc, EmitDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgChecked       = ref(true);
const pgColor         = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize          = ref<'small' | 'medium' | 'large'>('medium');
const pgIndeterminate = ref(false);
const pgDisabled      = ref(false);

function resetPlayground() {
    pgChecked.value       = true;
    pgColor.value         = 'primary';
    pgSize.value          = 'medium';
    pgIndeterminate.value = false;
    pgDisabled.value      = false;
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
    if (pgColor.value !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value  !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgIndeterminate.value)       parts.push(':indeterminate="true"');
    if (pgDisabled.value)            parts.push(':disabled="true"');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Checkbox v-model="checked" label="Acepto los términos"${attrs} />`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<Checkbox v-model="terms"      label="Acepto los términos" />
<Checkbox v-model="newsletter" label="Suscribirme al newsletter" />`;

const descriptionCode = `<Checkbox
    label="Notificaciones"
    description="Recibe alertas por email cuando hay actividad."
/>`;

const indeterminateCode = `<Checkbox :indeterminate="true" :model-value="false" label="Selección parcial" />`;

const colorsCode = `<Checkbox :model-value="true" color="primary" label="primary" />
<Checkbox :model-value="true" color="success" label="success" />
<Checkbox :model-value="true" color="warning" label="warning" />
<Checkbox :model-value="true" color="danger"  label="danger" />`;

const sizesCode = `<Checkbox :model-value="true" size="small"  label="small" />
<Checkbox :model-value="true" size="medium" label="medium" />
<Checkbox :model-value="true" size="large"  label="large" />`;

const disabledCode = `<Checkbox :model-value="true"  disabled label="Disabled marcado" />
<Checkbox :model-value="false" disabled label="Disabled vacío" />`;

// Example state
const ex1A = ref(true);
const ex1B = ref(false);

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',    type: 'boolean',                                                            default: 'false',    description: 'Valor del checkbox (v-model).' },
    { name: 'label',         type: 'string',                                                                                  description: 'Etiqueta visible a la derecha del control.' },
    { name: 'description',   type: 'string',                                                                                  description: 'Texto descriptivo secundario bajo el label.' },
    { name: 'helperText',    type: 'string',                                                                                  description: 'Texto de ayuda bajo el control. Se oculta si hay errorText.' },
    { name: 'errorText',     type: 'string',                                                                                  description: 'Mensaje de error que reemplaza al helperText y aplica estado de error.' },
    { name: 'color',         type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",           default: "'default'", description: 'Color semántico aplicado en estado checked.' },
    { name: 'size',          type: "'small' | 'medium' | 'large'",                                       default: "'medium'", description: 'Tamaño del cuadro y del label.' },
    { name: 'radius',        type: "'none' | 'small' | 'medium' | 'large' | 'full'",                     default: "'small'",  description: 'Radio del cuadro del checkbox.' },
    { name: 'indeterminate', type: 'boolean',                                                            default: 'false',    description: 'Estado tri-estado: muestra un guión en lugar del check.' },
    { name: 'disabled',      type: 'boolean',                                                            default: 'false',    description: 'Deshabilita el checkbox e impide la interacción.' },
    { name: 'readonly',      type: 'boolean',                                                            default: 'false',    description: 'Bloquea cambios pero mantiene foco y estilos activos.' },
    { name: 'required',      type: 'boolean',                                                            default: 'false',    description: 'Marca el campo como requerido y muestra asterisco.' },
    { name: 'loading',       type: 'boolean',                                                            default: 'false',    description: 'Estado de carga durante operaciones asíncronas.' },
    { name: 'name',          type: 'string',                                                                                  description: 'Atributo name HTML para envío en formularios.' },
    { name: 'value',         type: 'string | number',                                                                         description: 'Atributo value HTML, útil dentro de un grupo de checkboxes.' },
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
        title="Checkbox"
        category="Forms"
        import-path="import { Checkbox } from 'mood-ui'"
        description="Checkbox accesible con soporte para estado indeterminado, descripción y todas las variantes de color y tamaño."
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

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgIndeterminate
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgIndeterminate = !pgIndeterminate"
                    >Indeterminate</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDisabled
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDisabled = !pgDisabled"
                    >Disabled</button>
                </template>

                <Checkbox
                    v-model="pgChecked"
                    label="Acepto los términos"
                    :color="pgColor"
                    :size="pgSize"
                    :indeterminate="pgIndeterminate"
                    :disabled="pgDisabled"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Uso básico"
                description="Checkbox controlado con v-model."
                :code="basicCode"
            >
                <div class="flex flex-col gap-3">
                    <Checkbox v-model="ex1A" label="Acepto los términos" />
                    <Checkbox v-model="ex1B" label="Suscribirme al newsletter" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Con descripción"
                description="Texto secundario bajo el label para clarificar el propósito."
                :code="descriptionCode"
            >
                <Checkbox label="Notificaciones" description="Recibe alertas por email cuando hay actividad." />
            </ComponentPreview>

            <ComponentPreview
                title="Indeterminado"
                description="Útil para representar selección parcial en listas con “seleccionar todos”."
                :code="indeterminateCode"
            >
                <Checkbox :indeterminate="true" :model-value="false" label="Selección parcial" />
            </ComponentPreview>

            <ComponentPreview
                title="Colores"
                description="Variantes semánticas para el estado checked."
                :code="colorsCode"
            >
                <Checkbox :model-value="true" color="primary" label="primary" />
                <Checkbox :model-value="true" color="success" label="success" />
                <Checkbox :model-value="true" color="warning" label="warning" />
                <Checkbox :model-value="true" color="danger"  label="danger" />
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres tamaños para adaptarse a la densidad del formulario."
                :code="sizesCode"
            >
                <Checkbox :model-value="true" size="small"  label="small" />
                <Checkbox :model-value="true" size="medium" label="medium" />
                <Checkbox :model-value="true" size="large"  label="large" />
            </ComponentPreview>

            <ComponentPreview
                title="Disabled"
                description="Estado deshabilitado preservando el valor visual."
                :code="disabledCode"
            >
                <Checkbox :model-value="true"  disabled label="Disabled marcado" />
                <Checkbox :model-value="false" disabled label="Disabled vacío" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
