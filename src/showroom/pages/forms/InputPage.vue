<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Input from '../../../components/forms/Input.vue';
import { EnvelopeIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, EmitDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue     = ref('mood@example.com');
const pgVariant   = ref<'outline' | 'filled' | 'ghost'>('outline');
const pgColor     = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize      = ref<'small' | 'medium' | 'large'>('medium');
const pgClearable = ref(true);
const pgDisabled  = ref(false);
const pgReadonly  = ref(false);

function resetPlayground() {
    pgValue.value     = 'mood@example.com';
    pgVariant.value   = 'outline';
    pgColor.value     = 'primary';
    pgSize.value      = 'medium';
    pgClearable.value = true;
    pgDisabled.value  = false;
    pgReadonly.value  = false;
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
    if (pgClearable.value)             parts.push('clearable');
    if (pgDisabled.value)              parts.push(':disabled="true"');
    if (pgReadonly.value)              parts.push(':readonly="true"');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Input v-model="value" label="Email" placeholder="tu@email.com"${attrs} />`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<Input v-model="email" label="Email" placeholder="tu@email.com" />`;

const variantsCode = `<Input variant="outline" placeholder="outline" />
<Input variant="filled"  placeholder="filled"  />
<Input variant="ghost"   placeholder="ghost"   />`;

const sizesCode = `<Input size="small"  placeholder="small"  />
<Input size="medium" placeholder="medium" />
<Input size="large"  placeholder="large"  />`;

const iconsCode = `<Input :icon-left="EnvelopeIcon"        placeholder="Email" />
<Input :icon-right="MagnifyingGlassIcon" placeholder="Buscar" />
<Input prefix="$" suffix="USD"           placeholder="0.00" />`;

const statesCode = `<Input disabled placeholder="Disabled" />
<Input readonly model-value="Solo lectura" />
<Input v-model="email" error-text="Email inválido" label="Email" />`;

// Example state
const exBasic = ref('');
const exErr   = ref('not-an-email');

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',  type: 'string | number | null',                                   description: 'Valor del input (v-model).' },
    { name: 'label',       type: 'string',                                                   description: 'Etiqueta visible encima del input.' },
    { name: 'placeholder', type: 'string',                                                   description: 'Placeholder cuando está vacío.' },
    { name: 'helperText',  type: 'string',                                                   description: 'Texto de ayuda bajo el input. Se oculta si hay errorText.' },
    { name: 'errorText',   type: 'string',                                                   description: 'Mensaje de error que marca el input como inválido.' },
    { name: 'type',        type: "'text' | 'email' | 'url' | 'tel' | 'search'",              default: "'text'",    description: 'Tipo HTML del input.' },
    { name: 'variant',     type: "'outline' | 'filled' | 'ghost'",                           default: "'outline'", description: 'Estilo visual del campo.' },
    { name: 'color',       type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Color semántico aplicado al estado de foco.' },
    { name: 'size',        type: "'small' | 'medium' | 'large'",                             default: "'medium'",  description: 'Controla padding y tipografía.' },
    { name: 'radius',      type: "'none' | 'small' | 'medium' | 'large' | 'full'",                                  description: 'Radio de las esquinas. Hereda del ModoProvider si se omite.' },
    { name: 'halo',        type: "'tinted' | 'neutral' | 'off'",                                                    description: 'Estilo del halo persistente (ring). Hereda del ModoProvider.' },
    { name: 'fullWidth',   type: 'boolean',                                                  default: 'false',     description: 'Aplica w-full al root del campo.' },
    { name: 'disabled',    type: 'boolean',                                                  default: 'false',     description: 'Deshabilita el input.' },
    { name: 'readonly',    type: 'boolean',                                                  default: 'false',     description: 'Solo lectura: mantiene estilo normal pero impide edición.' },
    { name: 'required',    type: 'boolean',                                                  default: 'false',     description: 'Marca el campo como requerido y muestra el indicador.' },
    { name: 'loading',     type: 'boolean',                                                  default: 'false',     description: 'Muestra un loader y bloquea el input durante operaciones asíncronas.' },
    { name: 'clearable',   type: 'boolean',                                                  default: 'false',     description: 'Muestra botón ✕ para limpiar el valor cuando hay contenido.' },
    { name: 'maxLength',   type: 'number',                                                                         description: 'Longitud máxima del valor. Activa el contador si showCounter.' },
    { name: 'showCounter', type: 'boolean',                                                  default: 'false',     description: 'Muestra el contador de caracteres (requiere maxLength).' },
    { name: 'iconLeft',    type: 'Component',                                                                      description: 'Icono renderizado dentro del input a la izquierda.' },
    { name: 'iconRight',   type: 'Component',                                                                      description: 'Icono renderizado dentro del input a la derecha.' },
    { name: 'prefix',      type: 'string',                                                                         description: 'Texto fijo a la izquierda (ej. "$", "https://").' },
    { name: 'suffix',      type: 'string',                                                                         description: 'Texto fijo a la derecha (ej. ".com", "kg").' },
    { name: 'name',        type: 'string',                                                                         description: 'Atributo name HTML para envío en formularios.' },
    { name: 'id',          type: 'string',                                                                         description: 'id del input. Se autogenera si se omite.' },
    { name: 'autocomplete',type: 'string',                                                                         description: 'Atributo autocomplete HTML.' },
    { name: 'autofocus',   type: 'boolean',                                                  default: 'false',     description: 'Foco automático al montar.' },
    { name: 'ariaLabel',   type: 'string',                                                                         description: 'Nombre accesible cuando no hay label visible.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'string',     description: 'Emitido en cada cambio del valor (sincroniza v-model).' },
    { name: 'change',            payload: 'string',     description: 'Emitido tras un cambio confirmado por el usuario.' },
    { name: 'focus',             payload: 'FocusEvent', description: 'Emitido cuando el input recibe foco.' },
    { name: 'blur',              payload: 'FocusEvent', description: 'Emitido cuando el input pierde foco.' },
    { name: 'clear',             payload: 'void',       description: 'Emitido al pulsar el botón de limpiar (clearable).' },
];
</script>

<template>
    <ComponentDoc
        title="Input"
        category="Forms"
        import-path="import { Input } from 'mood-ui'"
        description="Input de texto con label, helper, mensajes de error, iconos, prefijos/sufijos y tres variantes visuales."
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
                        :class="pgClearable
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgClearable = !pgClearable"
                    >Clearable</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDisabled
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDisabled = !pgDisabled"
                    >Disabled</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgReadonly
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgReadonly = !pgReadonly"
                    >Readonly</button>
                </template>

                <Input
                    v-model="pgValue"
                    label="Email"
                    placeholder="tu@email.com"
                    :variant="pgVariant"
                    :color="pgColor"
                    :size="pgSize"
                    :clearable="pgClearable"
                    :disabled="pgDisabled"
                    :readonly="pgReadonly"
                    style="width: 280px"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Uso básico"
                description="Input con label, placeholder y v-model."
                :code="basicCode"
            >
                <Input v-model="exBasic" label="Email" placeholder="tu@email.com" style="width: 280px" />
            </ComponentPreview>

            <ComponentPreview
                title="Variantes"
                description="outline (default), filled y ghost."
                :code="variantsCode"
            >
                <Input variant="outline" placeholder="outline" style="width: 200px" />
                <Input variant="filled"  placeholder="filled"  style="width: 200px" />
                <Input variant="ghost"   placeholder="ghost"   style="width: 200px" />
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres tamaños para distintas densidades de UI."
                :code="sizesCode"
            >
                <Input size="small"  placeholder="small"  style="width: 200px" />
                <Input size="medium" placeholder="medium" style="width: 200px" />
                <Input size="large"  placeholder="large"  style="width: 200px" />
            </ComponentPreview>

            <ComponentPreview
                title="Iconos y affixes"
                description="iconLeft, iconRight y prefix/suffix de texto."
                :code="iconsCode"
            >
                <Input :icon-left="EnvelopeIcon"         placeholder="Email"  style="width: 240px" />
                <Input :icon-right="MagnifyingGlassIcon" placeholder="Buscar" style="width: 240px" />
                <Input prefix="$" suffix="USD"           placeholder="0.00"   style="width: 200px" />
            </ComponentPreview>

            <ComponentPreview
                title="Estados"
                description="Disabled, readonly y error."
                :code="statesCode"
            >
                <Input disabled placeholder="Disabled" style="width: 200px" />
                <Input readonly model-value="Solo lectura" style="width: 200px" />
                <Input v-model="exErr" error-text="Email inválido" label="Email" style="width: 240px" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
