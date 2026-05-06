<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Pagination from '../../../components/navigation/Pagination.vue';
import type { PropDoc, EmitDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgSize     = ref<'small' | 'medium' | 'large'>('medium');
const pgTotal    = ref<number>(50);
const pgSiblings = ref<number>(1);
const pgPage     = ref(1);

function resetPlayground() {
    pgSize.value     = 'medium';
    pgTotal.value    = 50;
    pgSiblings.value = 1;
    pgPage.value     = 1;
}

const overviewCode = computed(() => {
    const parts: string[] = [`v-model="page"`, `:page-count="${pgTotal.value}"`];
    if (pgSiblings.value !== 1)        parts.push(`:sibling-count="${pgSiblings.value}"`);
    if (pgSize.value     !== 'medium') parts.push(`size="${pgSize.value}"`);
    return `<Pagination ${parts.join(' ')} class="w-full" />`;
});

// ── Example state ─────────────────────────────────────────────────────────────
const basicPage    = ref(3);
const siblingsPage = ref(7);
const jumpPage     = ref(1);
const sizesPage    = ref(2);
const compactPage  = ref(4);

const jumpInput = ref<number | null>(null);
function jumpTo() {
    if (jumpInput.value && jumpInput.value >= 1 && jumpInput.value <= 20) {
        jumpPage.value = jumpInput.value;
    }
}

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `const page = ref(3);

<Pagination v-model="page" :page-count="10" class="w-full" />`;

const siblingsCode = `<Pagination v-model="page" :page-count="20" :sibling-count="2" class="w-full" />`;

const jumpCode = `const page = ref(1);
const jumpInput = ref<number | null>(null);

function jumpTo() {
    if (jumpInput.value) page.value = jumpInput.value;
}

<div class="flex items-center gap-3">
    <Pagination v-model="page" :page-count="20" />
    <input v-model.number="jumpInput" type="number" min="1" max="20" />
    <button @click="jumpTo">Ir</button>
</div>`;

const sizesCode = `<Pagination v-model="page" :page-count="10" size="small" />
<Pagination v-model="page" :page-count="10" size="medium" />
<Pagination v-model="page" :page-count="10" size="large" />`;

const compactCode = `<!-- Sin botones de primera/última página -->
<Pagination v-model="page" :page-count="10" :show-first-last="false" />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',    type: 'number',                                                    required: true,          description: 'Página actual (1-indexed). Usa v-model.' },
    { name: 'pageCount',     type: 'number',                                                    required: true,          description: 'Número total de páginas (≥ 1).' },
    { name: 'siblingCount',  type: 'number',                                                    default: '1',            description: 'Páginas hermanas mostradas a cada lado de la actual.' },
    { name: 'boundaryCount', type: 'number',                                                    default: '1',            description: 'Páginas pinned al inicio y final del rango.' },
    { name: 'showFirstLast', type: 'boolean',                                                   default: 'true',         description: 'Muestra los botones de primera y última página.' },
    { name: 'showPrevNext',  type: 'boolean',                                                   default: 'true',         description: 'Muestra los botones de página anterior y siguiente.' },
    { name: 'color',         type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",  default: "'primary'",    description: 'Color de la página activa.' },
    { name: 'size',          type: "'small' | 'medium' | 'large'",                              default: "'medium'",     description: 'Tamaño de los botones del paginador.' },
    { name: 'radius',        type: "'none' | 'small' | 'medium' | 'large' | 'full'",                                     description: 'Radio aplicado a los botones.' },
    { name: 'disabled',      type: 'boolean',                                                   default: 'false',        description: 'Deshabilita todos los botones.' },
    { name: 'ariaLabel',     type: 'string',                                                    default: "'Pagination'", description: 'Etiqueta accesible del nav.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'number', description: 'Emitido al cambiar de página. Usado por v-model.' },
    { name: 'change',            payload: 'number', description: 'Mismo payload que update:modelValue, útil para listeners externos.' },
];
</script>

<template>
    <ComponentDoc
        title="Pagination"
        category="Navigation"
        import-path="import { Pagination } from 'mood-ui'"
        description="Paginador accesible con saltos a primera/última página, hermanos configurables y todos los tokens visuales del sistema."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="180px" @reset="resetPlayground">
                <template #controls>
                    <!-- Size -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Size</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in ['small', 'medium', 'large']"
                                :key="s"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgSize === s
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgSize = (s as typeof pgSize)"
                            >{{ s }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <!-- Total -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Total</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="t in [50, 100, 500]"
                                :key="t"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgTotal === t
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgTotal = t"
                            >{{ t }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <!-- Siblings -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Siblings</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="n in [0, 1, 2]"
                                :key="n"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgSiblings === n
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgSiblings = n"
                            >{{ n }}</button>
                        </div>
                    </div>
                </template>

                <Pagination
                    v-model="pgPage"
                    :page-count="pgTotal"
                    :sibling-count="pgSiblings"
                    :size="pgSize"
                    class="w-full"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Paginador con primera/última, prev/next y un hermano por defecto a cada lado."
                :code="basicCode"
            >
                <Pagination v-model="basicPage" :page-count="10" class="w-full" />
            </ComponentPreview>

            <ComponentPreview
                title="Con más hermanos"
                description="Aumenta `sibling-count` para mostrar más páginas alrededor de la actual."
                :code="siblingsCode"
            >
                <Pagination v-model="siblingsPage" :page-count="20" :sibling-count="2" class="w-full" />
            </ComponentPreview>

            <ComponentPreview
                title="Salto rápido"
                description="Combina el paginador con un input para saltar directamente a una página concreta."
                :code="jumpCode"
            >
                <div class="flex flex-col items-center gap-3 w-full">
                    <Pagination v-model="jumpPage" :page-count="20" class="w-full" />
                    <div class="flex items-center gap-2">
                        <input
                            v-model.number="jumpInput"
                            type="number"
                            min="1"
                            max="20"
                            placeholder="Página"
                            class="w-24 rounded-md border border-border bg-background px-2 py-1 text-sm"
                        />
                        <button
                            type="button"
                            class="px-3 py-1 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                            @click="jumpTo"
                        >Ir</button>
                    </div>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres tamaños responden a la jerarquía visual del entorno donde se inserte el paginador."
                :code="sizesCode"
            >
                <div class="flex flex-col gap-3 w-full">
                    <Pagination v-model="sizesPage" :page-count="10" size="small"  class="w-full" />
                    <Pagination v-model="sizesPage" :page-count="10" size="medium" class="w-full" />
                    <Pagination v-model="sizesPage" :page-count="10" size="large"  class="w-full" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Compacto"
                description="Oculta los botones de primera/última cuando el espacio escasea o el contexto no los necesita."
                :code="compactCode"
            >
                <Pagination v-model="compactPage" :page-count="10" :show-first-last="false" class="w-full" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
