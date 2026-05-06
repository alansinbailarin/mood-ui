<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import SearchInput from '../../../components/forms/SearchInput.vue';
import type { PropDoc, EmitDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue    = ref('');
const pgVariant  = ref<'outline' | 'filled' | 'ghost'>('outline');
const pgColor    = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize     = ref<'small' | 'medium' | 'large'>('medium');
const pgShortcut = ref(false);
const pgLoading  = ref(false);
const pgDisabled = ref(false);

function resetPlayground() {
    pgValue.value    = '';
    pgVariant.value  = 'outline';
    pgColor.value    = 'primary';
    pgSize.value     = 'medium';
    pgShortcut.value = false;
    pgLoading.value  = false;
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
    if (pgVariant.value !== 'outline') parts.push(`variant="${pgVariant.value}"`);
    if (pgColor.value   !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value    !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgShortcut.value)              parts.push('shortcut="cmd+k"');
    if (pgLoading.value)               parts.push(':loading="true"');
    if (pgDisabled.value)              parts.push(':disabled="true"');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<SearchInput v-model="query" placeholder="Buscar componentes…"${attrs} />`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<SearchInput v-model="query" placeholder="Buscar componentes…" />`;

const debounceCode = `<SearchInput
    v-model="query"
    :debounce="400"
    placeholder="Búsqueda con debounce 400ms"
    @search="onSearch"
/>`;

const shortcutCode = `<SearchInput placeholder="Buscar" shortcut="cmd+k" />`;

const sizesCode = `<SearchInput size="small"  placeholder="small"  />
<SearchInput size="medium" placeholder="medium" />
<SearchInput size="large"  placeholder="large"  />`;

const loadingCode = `<SearchInput v-model="query" :loading="true" placeholder="Buscando…" />`;

// Example state
const exBasic    = ref('');
const exDebounce = ref('');

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',  type: 'string | null',                                            description: 'Valor del input (v-model).' },
    { name: 'label',       type: 'string',                                                   description: 'Etiqueta visible encima del input.' },
    { name: 'placeholder', type: 'string',                                                   default: "'Search…'", description: 'Placeholder cuando está vacío.' },
    { name: 'helperText',  type: 'string',                                                   description: 'Texto de ayuda. Oculto si hay errorText.' },
    { name: 'errorText',   type: 'string',                                                   description: 'Mensaje de error que marca el input como inválido.' },
    { name: 'variant',     type: "'outline' | 'filled' | 'ghost'",                           default: "'outline'", description: 'Estilo visual.' },
    { name: 'color',       type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Color semántico aplicado al estado de foco.' },
    { name: 'size',        type: "'small' | 'medium' | 'large'",                             default: "'medium'",  description: 'Tamaño visual.' },
    { name: 'radius',      type: "'none' | 'small' | 'medium' | 'large' | 'full'",                                  description: 'Radio de las esquinas. Hereda del ModoProvider si se omite.' },
    { name: 'halo',        type: "'tinted' | 'neutral' | 'off'",                                                    description: 'Estilo del halo persistente (ring).' },
    { name: 'fullWidth',   type: 'boolean',                                                  default: 'false',     description: 'Aplica w-full al root.' },
    { name: 'disabled',    type: 'boolean',                                                  default: 'false',     description: 'Deshabilita el input.' },
    { name: 'readonly',    type: 'boolean',                                                  default: 'false',     description: 'Solo lectura.' },
    { name: 'required',    type: 'boolean',                                                  default: 'false',     description: 'Marca el campo como requerido.' },
    { name: 'loading',     type: 'boolean',                                                  default: 'false',     description: 'Muestra spinner en lugar del botón clear.' },
    { name: 'maxLength',   type: 'number',                                                                         description: 'Longitud máxima. Activa el contador si showCounter.' },
    { name: 'showCounter', type: 'boolean',                                                  default: 'false',     description: 'Muestra contador de caracteres.' },
    { name: 'debounce',    type: 'number',                                                   default: '0',         description: "Tiempo (ms) antes de emitir 'search' al escribir. 0 = solo emite al pulsar Enter." },
    { name: 'shortcut',    type: 'string',                                                                         description: "Atajo de teclado global que enfoca el input. Se muestra como hint <kbd> (ej. 'cmd+k')." },
    { name: 'name',        type: 'string',                                                                         description: 'Atributo name HTML.' },
    { name: 'id',          type: 'string',                                                                         description: 'id del input. Se autogenera si se omite.' },
    { name: 'autofocus',   type: 'boolean',                                                  default: 'false',     description: 'Foco automático al montar.' },
    { name: 'ariaLabel',   type: 'string',                                                                         description: 'Nombre accesible cuando no hay label visible.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'string',     description: 'Emitido en cada cambio del valor (sincroniza v-model).' },
    { name: 'change',            payload: 'string',     description: 'Emitido tras un cambio confirmado por el usuario.' },
    { name: 'focus',             payload: 'FocusEvent', description: 'Emitido cuando el input recibe foco.' },
    { name: 'blur',              payload: 'FocusEvent', description: 'Emitido cuando el input pierde foco.' },
    { name: 'clear',             payload: 'void',       description: 'Emitido al pulsar el botón de limpiar.' },
    { name: 'search',            payload: 'string',     description: 'Emitido al pulsar Enter o tras el tiempo de debounce.' },
];
</script>

<template>
    <ComponentDoc
        title="SearchInput"
        category="Forms"
        import-path="import { SearchInput } from 'mood-ui'"
        description="Input optimizado para búsqueda: icono de lupa, botón clear automático, debounce opcional y soporte para atajo de teclado."
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
                        :class="pgShortcut
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgShortcut = !pgShortcut"
                    >Shortcut</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgLoading
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgLoading = !pgLoading"
                    >Loading</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDisabled
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDisabled = !pgDisabled"
                    >Disabled</button>
                </template>

                <SearchInput
                    v-model="pgValue"
                    placeholder="Buscar componentes…"
                    :variant="pgVariant"
                    :color="pgColor"
                    :size="pgSize"
                    :shortcut="pgShortcut ? 'cmd+k' : undefined"
                    :loading="pgLoading"
                    :disabled="pgDisabled"
                    style="width: 320px"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Uso básico"
                description="Icono de lupa y botón ✕ automático cuando hay valor."
                :code="basicCode"
            >
                <SearchInput v-model="exBasic" placeholder="Buscar componentes…" style="width: 320px" />
            </ComponentPreview>

            <ComponentPreview
                title="Con debounce"
                description="Emite el evento search tras el tiempo indicado. Útil para llamadas a API."
                :code="debounceCode"
            >
                <SearchInput v-model="exDebounce" :debounce="400" placeholder="Búsqueda con debounce 400ms" style="width: 320px" />
            </ComponentPreview>

            <ComponentPreview
                title="Con shortcut"
                description="Muestra un hint <kbd> a la derecha. La combinación enfoca el input globalmente."
                :code="shortcutCode"
            >
                <SearchInput placeholder="Buscar" shortcut="cmd+k" style="width: 320px" />
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres tamaños alineados con el resto de inputs."
                :code="sizesCode"
            >
                <SearchInput size="small"  placeholder="small"  style="width: 260px" />
                <SearchInput size="medium" placeholder="medium" style="width: 260px" />
                <SearchInput size="large"  placeholder="large"  style="width: 260px" />
            </ComponentPreview>

            <ComponentPreview
                title="Loading"
                description="Muestra spinner en lugar del botón clear durante la búsqueda."
                :code="loadingCode"
            >
                <SearchInput model-value="vue" :loading="true" placeholder="Buscando…" style="width: 320px" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
