<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Textarea from '../../../components/forms/Textarea.vue';
import type { PropDoc, EmitDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue      = ref('Hola mood-ui 👋');
const pgVariant    = ref<'outline' | 'filled' | 'ghost'>('outline');
const pgColor      = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize       = ref<'small' | 'medium' | 'large'>('medium');
const pgAutoresize = ref(false);
const pgDisabled   = ref(false);

function resetPlayground() {
    pgValue.value      = 'Hola mood-ui 👋';
    pgVariant.value    = 'outline';
    pgColor.value      = 'primary';
    pgSize.value       = 'medium';
    pgAutoresize.value = false;
    pgDisabled.value   = false;
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
    if (pgAutoresize.value)            parts.push('autoresize');
    if (pgDisabled.value)              parts.push(':disabled="true"');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Textarea v-model="value" label="Comentario" placeholder="Escribe algo…"${attrs} />`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<Textarea v-model="comment" label="Comentario" placeholder="Escribe algo…" :rows="4" />`;

const variantsCode = `<Textarea variant="outline" placeholder="outline" :rows="2" />
<Textarea variant="filled"  placeholder="filled"  :rows="2" />
<Textarea variant="ghost"   placeholder="ghost"   :rows="2" />`;

const autoresizeCode = `<Textarea
    v-model="bio"
    label="Bio"
    autoresize
    :max-rows="6"
    :max-length="200"
    show-counter
    placeholder="Cuéntanos sobre ti"
/>`;

const errorCode = `<Textarea
    label="Descripción"
    error-text="La descripción es requerida"
    :rows="3"
/>`;

const disabledCode = `<Textarea disabled model-value="No editable" :rows="2" />`;

// Example state
const exBasic = ref('');
const exBio   = ref('Hola mood-ui');

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',  type: 'string | null',                                            description: 'Valor del textarea (v-model).' },
    { name: 'label',       type: 'string',                                                   description: 'Etiqueta visible encima del textarea.' },
    { name: 'placeholder', type: 'string',                                                   description: 'Placeholder cuando está vacío.' },
    { name: 'helperText',  type: 'string',                                                   description: 'Texto de ayuda bajo el textarea. Se oculta si hay errorText.' },
    { name: 'errorText',   type: 'string',                                                   description: 'Mensaje de error que marca el textarea como inválido.' },
    { name: 'variant',     type: "'outline' | 'filled' | 'ghost'",                           default: "'outline'", description: 'Estilo visual.' },
    { name: 'color',       type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Color semántico aplicado al estado de foco.' },
    { name: 'size',        type: "'small' | 'medium' | 'large'",                             default: "'medium'",  description: 'Controla padding y tipografía.' },
    { name: 'radius',      type: "'none' | 'small' | 'medium' | 'large' | 'full'",                                  description: 'Radio de las esquinas. Hereda del ModoProvider si se omite.' },
    { name: 'halo',        type: "'tinted' | 'neutral' | 'off'",                                                    description: 'Estilo del halo persistente (ring).' },
    { name: 'fullWidth',   type: 'boolean',                                                  default: 'false',     description: 'Aplica w-full al root.' },
    { name: 'disabled',    type: 'boolean',                                                  default: 'false',     description: 'Deshabilita el textarea.' },
    { name: 'readonly',    type: 'boolean',                                                  default: 'false',     description: 'Solo lectura.' },
    { name: 'required',    type: 'boolean',                                                  default: 'false',     description: 'Marca el campo como requerido.' },
    { name: 'loading',     type: 'boolean',                                                  default: 'false',     description: 'Estado de carga (deshabilita y muestra loader).' },
    { name: 'clearable',   type: 'boolean',                                                  default: 'false',     description: 'Muestra botón ✕ para limpiar el valor.' },
    { name: 'maxLength',   type: 'number',                                                                         description: 'Longitud máxima. Activa el contador si showCounter.' },
    { name: 'showCounter', type: 'boolean',                                                  default: 'false',     description: 'Muestra contador de caracteres (requiere maxLength).' },
    { name: 'rows',        type: 'number',                                                   default: '3',         description: 'Número mínimo de filas visibles.' },
    { name: 'autoresize',  type: 'boolean',                                                  default: 'false',     description: 'Crece automáticamente con el contenido hasta maxRows.' },
    { name: 'maxRows',     type: 'number',                                                   default: '8',         description: 'Máximo de filas cuando autoresize=true.' },
    { name: 'resize',      type: "'none' | 'vertical' | 'horizontal' | 'both'",              default: "'vertical'", description: 'Dirección de redimensionamiento manual del navegador.' },
    { name: 'name',        type: 'string',                                                                         description: 'Atributo name HTML.' },
    { name: 'id',          type: 'string',                                                                         description: 'id del textarea. Se autogenera si se omite.' },
    { name: 'autofocus',   type: 'boolean',                                                  default: 'false',     description: 'Foco automático al montar.' },
    { name: 'ariaLabel',   type: 'string',                                                                         description: 'Nombre accesible cuando no hay label visible.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'string',     description: 'Emitido en cada cambio del valor (sincroniza v-model).' },
    { name: 'change',            payload: 'string',     description: 'Emitido tras un cambio confirmado por el usuario.' },
    { name: 'focus',             payload: 'FocusEvent', description: 'Emitido cuando el textarea recibe foco.' },
    { name: 'blur',              payload: 'FocusEvent', description: 'Emitido cuando el textarea pierde foco.' },
    { name: 'clear',             payload: 'void',       description: 'Emitido al pulsar el botón de limpiar (clearable).' },
];
</script>

<template>
    <ComponentDoc
        title="Textarea"
        category="Forms"
        import-path="import { Textarea } from 'mood-ui'"
        description="Área de texto multilínea con autoresize, contador de caracteres, helper/error text y todas las variantes visuales del Input."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" @reset="resetPlayground">
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
                        :class="pgAutoresize
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgAutoresize = !pgAutoresize"
                    >Autoresize</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDisabled
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDisabled = !pgDisabled"
                    >Disabled</button>
                </template>

                <Textarea
                    v-model="pgValue"
                    label="Comentario"
                    placeholder="Escribe algo…"
                    :variant="pgVariant"
                    :color="pgColor"
                    :size="pgSize"
                    :autoresize="pgAutoresize"
                    :disabled="pgDisabled"
                    :rows="3"
                    style="width: 360px"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Uso básico"
                description="Textarea simple con label, placeholder y filas iniciales."
                :code="basicCode"
            >
                <Textarea v-model="exBasic" label="Comentario" placeholder="Escribe algo…" :rows="4" style="width: 360px" />
            </ComponentPreview>

            <ComponentPreview
                title="Variantes"
                description="outline (default), filled y ghost."
                :code="variantsCode"
            >
                <Textarea variant="outline" placeholder="outline" :rows="2" style="width: 240px" />
                <Textarea variant="filled"  placeholder="filled"  :rows="2" style="width: 240px" />
                <Textarea variant="ghost"   placeholder="ghost"   :rows="2" style="width: 240px" />
            </ComponentPreview>

            <ComponentPreview
                title="Autoresize + contador"
                description="Crece con el contenido hasta maxRows y muestra contador de caracteres."
                :code="autoresizeCode"
            >
                <Textarea
                    v-model="exBio"
                    label="Bio"
                    autoresize
                    :max-rows="6"
                    :max-length="200"
                    show-counter
                    placeholder="Cuéntanos sobre ti"
                    style="width: 360px"
                />
            </ComponentPreview>

            <ComponentPreview
                title="Error"
                description="errorText marca el campo como inválido y reemplaza al helperText."
                :code="errorCode"
            >
                <Textarea
                    label="Descripción"
                    error-text="La descripción es requerida"
                    :rows="3"
                    style="width: 360px"
                />
            </ComponentPreview>

            <ComponentPreview
                title="Disabled"
                description="Estado deshabilitado preservando el valor visual."
                :code="disabledCode"
            >
                <Textarea disabled model-value="No editable" :rows="2" style="width: 280px" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
