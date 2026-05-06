<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import TagInput from '../../../components/forms/TagInput.vue';
import type { PropDoc, EmitDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue    = ref<string[]>(['vue', 'tailwind']);
const pgColor    = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize     = ref<'small' | 'medium' | 'large'>('medium');
const pgVariant  = ref<'subtle' | 'outline' | 'solid'>('subtle');
const pgDisabled = ref(false);

function resetPlayground() {
    pgValue.value    = ['vue', 'tailwind'];
    pgColor.value    = 'primary';
    pgSize.value     = 'medium';
    pgVariant.value  = 'subtle';
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
    if (pgVariant.value !== 'subtle')  parts.push(`variant="${pgVariant.value}"`);
    if (pgColor.value   !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value    !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgDisabled.value)              parts.push(':disabled="true"');
    const attrs = parts.length ? '\n    ' + parts.join('\n    ') : '';
    return `<TagInput\n    v-model="tags"\n    placeholder="Añade un tag y pulsa Enter…"${attrs}\n/>`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<TagInput v-model="tags" placeholder="Añade un tag y pulsa Enter…" />`;

const maxCode = `<TagInput v-model="tags" :max="3" placeholder="Hasta 3 tags" />`;

const validatorCode = `function isEmail(t: string) {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(t);
}

<TagInput
    v-model="emails"
    placeholder="Sólo emails válidos"
    :validator="isEmail"
/>`;

const colorsCode = `<TagInput v-model="t1" color="primary" />
<TagInput v-model="t2" color="success" />
<TagInput v-model="t3" color="danger" />`;

const sizesCode = `<TagInput v-model="t" size="small"  />
<TagInput v-model="t" size="medium" />
<TagInput v-model="t" size="large"  />`;

const ex1 = ref<string[]>(['design', 'typography']);
const ex2 = ref<string[]>(['react', 'vue']);
const ex3 = ref<string[]>(['hello@modo.dev']);
function isEmail(t: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}
const t1 = ref<string[]>(['vue', 'pinia']);
const t2 = ref<string[]>(['ok', 'shipped']);
const t3 = ref<string[]>(['error', 'warning']);
const tt = ref<string[]>(['hola', 'mundo']);

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue', type: 'string[]',                                                            default: '[]',                              description: 'Array actual de tags (v-model).' },
    { name: 'placeholder', type: 'string',                                                              default: "'Añade un tag y pulsa Enter…'",  description: 'Placeholder cuando no hay tags y el input está vacío.' },
    { name: 'max',         type: 'number',                                                                                                          description: 'Máximo de tags. Más allá del límite el input se deshabilita.' },
    { name: 'unique',      type: 'boolean',                                                            default: 'true',                            description: 'Rechaza duplicados (comparación case-insensitive).' },
    { name: 'validator',   type: '(tag: string) => boolean',                                                                                       description: 'Validador opcional. Devolver false rechaza el tag.' },
    { name: 'delimiters',  type: 'string[]',                                                            default: "[',']",                          description: 'Caracteres que también confirman el tag actual al teclearlos.' },
    { name: 'color',       type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",          default: "'default'",                      description: 'Color semántico de los chips.' },
    { name: 'variant',     type: "'subtle' | 'outline' | 'solid'",                                    default: "'subtle'",                       description: 'Variante visual de los chips.' },
    { name: 'size',        type: "'small' | 'medium' | 'large'",                                       default: "'medium'",                       description: 'Tamaño del input y los chips.' },
    { name: 'radius',      type: "'none' | 'small' | 'medium' | 'large' | 'full'",                     default: "'medium'",                       description: 'Radio del wrapper y los chips.' },
    { name: 'disabled',    type: 'boolean',                                                            default: 'false',                          description: 'Deshabilita la interacción.' },
    { name: 'readonly',    type: 'boolean',                                                            default: 'false',                          description: 'Modo sólo lectura — los tags no se pueden eliminar.' },
    { name: 'ariaLabel',   type: 'string',                                                                                                         description: 'Nombre accesible para el input.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'string[]',           description: 'Emitido al cambiar la lista de tags (v-model).' },
    { name: 'add',               payload: 'string',             description: 'Emitido al añadir un tag nuevo.' },
    { name: 'remove',            payload: '(tag, index)',       description: 'Emitido al eliminar un tag, con su valor e índice original.' },
    { name: 'change',            payload: 'string[]',           description: 'Emitido tras cualquier cambio (add o remove).' },
];
</script>

<template>
    <ComponentDoc
        title="TagInput"
        category="Forms"
        import-path="import { TagInput } from 'mood-ui'"
        description="Editor de etiquetas: el usuario escribe texto, pulsa Enter (o un delimitador) y se añade un chip. Soporta validación, máximos y variantes visuales."
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
                                v-for="v in ['subtle', 'outline', 'solid']"
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
                        :class="pgDisabled
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDisabled = !pgDisabled"
                    >Disabled</button>
                </template>

                <div class="w-80">
                    <TagInput
                        v-model="pgValue"
                        :variant="pgVariant"
                        :color="pgColor"
                        :size="pgSize"
                        :disabled="pgDisabled"
                        placeholder="Añade un tag y pulsa Enter…"
                    />
                </div>
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Uso básico"
                description="Pulsa Enter o coma para confirmar. Los duplicados se descartan por defecto."
                :code="basicCode"
            >
                <div class="w-80">
                    <TagInput v-model="ex1" placeholder="Añade un tag y pulsa Enter…" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Máximo de tags"
                description="Limita la cantidad de tags con la prop max."
                :code="maxCode"
            >
                <div class="w-80">
                    <TagInput v-model="ex2" :max="3" placeholder="Hasta 3 tags" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Validador personalizado"
                description="Sólo se confirman tags que pasan el validador (aquí, emails válidos)."
                :code="validatorCode"
            >
                <div class="w-80">
                    <TagInput v-model="ex3" placeholder="Sólo emails válidos" :validator="isEmail" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Colores"
                description="Variantes semánticas para los chips."
                :code="colorsCode"
            >
                <div class="flex flex-col gap-3 w-80">
                    <TagInput v-model="t1" color="primary" />
                    <TagInput v-model="t2" color="success" />
                    <TagInput v-model="t3" color="danger" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres alturas para encajar con la densidad del formulario."
                :code="sizesCode"
            >
                <div class="flex flex-col gap-3 w-80">
                    <TagInput v-model="tt" size="small"  />
                    <TagInput v-model="tt" size="medium" />
                    <TagInput v-model="tt" size="large"  />
                </div>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
