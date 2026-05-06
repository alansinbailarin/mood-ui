<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import PasswordInput from '../../../components/forms/PasswordInput.vue';
import type { PropDoc, EmitDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue            = ref('SuperSecret123');
const pgVariant          = ref<'outline' | 'filled' | 'ghost'>('outline');
const pgColor            = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize             = ref<'small' | 'medium' | 'large'>('medium');
const pgToggleVisibility = ref(true);
const pgStrengthMeter    = ref(false);
const pgDisabled         = ref(false);

function resetPlayground() {
    pgValue.value            = 'SuperSecret123';
    pgVariant.value          = 'outline';
    pgColor.value            = 'primary';
    pgSize.value             = 'medium';
    pgToggleVisibility.value = true;
    pgStrengthMeter.value    = false;
    pgDisabled.value         = false;
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
    if (pgVariant.value !== 'outline') parts.push(`variant="${pgVariant.value}"`);
    if (pgColor.value   !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value    !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (!pgToggleVisibility.value)     parts.push(':toggle-visibility="false"');
    if (pgStrengthMeter.value)         parts.push('strength-meter');
    if (pgDisabled.value)              parts.push(':disabled="true"');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<PasswordInput v-model="password" label="Contraseña"${attrs} />`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<PasswordInput v-model="password" label="Contraseña" placeholder="Escribe tu contraseña" />`;

const strengthCode = `<PasswordInput v-model="password" label="Nueva contraseña" strength-meter />`;

const noToggleCode = `<PasswordInput :toggle-visibility="false" placeholder="Sin toggle" />`;

const sizesCode = `<PasswordInput size="small"  model-value="secret" />
<PasswordInput size="medium" model-value="secret" />
<PasswordInput size="large"  model-value="secret" />`;

const disabledCode = `<PasswordInput disabled model-value="hidden" label="Contraseña" />`;

// Example state
const exBasic    = ref('');
const exStrength = ref('Mood-UI-2025!');

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',       type: 'string | null',                                            description: 'Valor del input (v-model).' },
    { name: 'label',            type: 'string',                                                   description: 'Etiqueta visible encima del input.' },
    { name: 'placeholder',      type: 'string',                                                   description: 'Placeholder cuando está vacío.' },
    { name: 'helperText',       type: 'string',                                                   description: 'Texto de ayuda. Oculto si hay errorText.' },
    { name: 'errorText',        type: 'string',                                                   description: 'Mensaje de error que marca el input como inválido.' },
    { name: 'variant',          type: "'outline' | 'filled' | 'ghost'",                           default: "'outline'",          description: 'Estilo visual.' },
    { name: 'color',            type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'",          description: 'Color semántico aplicado al estado de foco.' },
    { name: 'size',             type: "'small' | 'medium' | 'large'",                             default: "'medium'",           description: 'Tamaño visual.' },
    { name: 'radius',           type: "'none' | 'small' | 'medium' | 'large' | 'full'",                                            description: 'Radio de las esquinas. Hereda del ModoProvider si se omite.' },
    { name: 'halo',             type: "'tinted' | 'neutral' | 'off'",                                                              description: 'Estilo del halo persistente (ring).' },
    { name: 'fullWidth',        type: 'boolean',                                                  default: 'false',              description: 'Aplica w-full al root.' },
    { name: 'disabled',         type: 'boolean',                                                  default: 'false',              description: 'Deshabilita el input.' },
    { name: 'readonly',         type: 'boolean',                                                  default: 'false',              description: 'Solo lectura.' },
    { name: 'required',         type: 'boolean',                                                  default: 'false',              description: 'Marca el campo como requerido.' },
    { name: 'loading',          type: 'boolean',                                                  default: 'false',              description: 'Estado de carga.' },
    { name: 'maxLength',        type: 'number',                                                                                  description: 'Longitud máxima. Activa el contador si showCounter.' },
    { name: 'showCounter',      type: 'boolean',                                                  default: 'false',              description: 'Muestra contador de caracteres.' },
    { name: 'toggleVisibility', type: 'boolean',                                                  default: 'true',               description: 'Muestra el botón para alternar visibilidad de la contraseña.' },
    { name: 'defaultVisible',   type: 'boolean',                                                  default: 'false',              description: 'Si el contenido arranca visible al montar.' },
    { name: 'strengthMeter',    type: 'boolean',                                                  default: 'false',              description: 'Muestra una barra de fortaleza heurística debajo del input.' },
    { name: 'strengthLabels',   type: 'PasswordStrengthLabels',                                                                  description: 'Labels custom para cada nivel del strength meter (i18n).' },
    { name: 'iconLeft',         type: 'Component',                                                                               description: 'Icono renderizado dentro del input a la izquierda.' },
    { name: 'prefix',           type: 'string',                                                                                  description: 'Texto fijo a la izquierda del input.' },
    { name: 'name',             type: 'string',                                                                                  description: 'Atributo name HTML.' },
    { name: 'id',               type: 'string',                                                                                  description: 'id del input. Se autogenera si se omite.' },
    { name: 'autocomplete',     type: 'string',                                                  default: "'current-password'", description: 'Atributo autocomplete HTML.' },
    { name: 'autofocus',        type: 'boolean',                                                  default: 'false',              description: 'Foco automático al montar.' },
    { name: 'ariaLabel',        type: 'string',                                                                                  description: 'Nombre accesible cuando no hay label visible.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'string',                description: 'Emitido en cada cambio del valor (sincroniza v-model).' },
    { name: 'change',            payload: 'string',                description: 'Emitido tras un cambio confirmado por el usuario.' },
    { name: 'focus',             payload: 'FocusEvent',            description: 'Emitido cuando el input recibe foco.' },
    { name: 'blur',              payload: 'FocusEvent',            description: 'Emitido cuando el input pierde foco.' },
    { name: 'update:visible',    payload: 'boolean',               description: 'Emitido al alternar la visibilidad de la contraseña.' },
    { name: 'strength-change',   payload: 'PasswordStrengthScore', description: 'Emitido cuando cambia el score de fortaleza (0–4).' },
];
</script>

<template>
    <ComponentDoc
        title="PasswordInput"
        category="Forms"
        import-path="import { PasswordInput } from 'mood-ui'"
        description="Input de contraseña con toggle de visibilidad y opcional medidor heurístico de fortaleza."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <!-- Variant -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">VARIANT</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in ['outline', 'filled', 'ghost']"
                                :key="v"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgVariant === v
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgVariant = (v as typeof pgVariant)"
                            >{{ v }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

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
                        :class="pgToggleVisibility
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgToggleVisibility = !pgToggleVisibility"
                    >Toggle</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgStrengthMeter
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgStrengthMeter = !pgStrengthMeter"
                    >Strength</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDisabled
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDisabled = !pgDisabled"
                    >Disabled</button>
                </template>

                <PasswordInput
                    v-model="pgValue"
                    label="Contraseña"
                    placeholder="Escribe tu contraseña"
                    :variant="pgVariant"
                    :color="pgColor"
                    :size="pgSize"
                    :toggle-visibility="pgToggleVisibility"
                    :strength-meter="pgStrengthMeter"
                    :disabled="pgDisabled"
                    style="width: 280px"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Uso básico"
                description="Toggle de visibilidad activado por defecto."
                :code="basicCode"
            >
                <PasswordInput v-model="exBasic" label="Contraseña" placeholder="Escribe tu contraseña" style="width: 280px" />
            </ComponentPreview>

            <ComponentPreview
                title="Con medidor de fortaleza"
                description="strengthMeter calcula score heurístico (longitud + clases de caracteres) y lo muestra debajo."
                :code="strengthCode"
            >
                <PasswordInput v-model="exStrength" label="Nueva contraseña" strength-meter style="width: 280px" />
            </ComponentPreview>

            <ComponentPreview
                title="Sin toggle de visibilidad"
                description="Útil cuando la visibilidad la controla la app o no aplica."
                :code="noToggleCode"
            >
                <PasswordInput :toggle-visibility="false" placeholder="Sin toggle" style="width: 280px" />
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres tamaños alineados con el resto de inputs."
                :code="sizesCode"
            >
                <PasswordInput size="small"  model-value="secret" style="width: 220px" />
                <PasswordInput size="medium" model-value="secret" style="width: 220px" />
                <PasswordInput size="large"  model-value="secret" style="width: 220px" />
            </ComponentPreview>

            <ComponentPreview
                title="Disabled"
                description="Estado deshabilitado preservando el valor."
                :code="disabledCode"
            >
                <PasswordInput disabled model-value="hidden" label="Contraseña" style="width: 280px" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
