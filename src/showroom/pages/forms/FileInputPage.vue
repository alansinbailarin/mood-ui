<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import FileInput from '../../../components/forms/FileInput.vue';
import type { PropDoc, EmitDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant  = ref<'inline' | 'area'>('inline');
const pgMultiple = ref(false);
const pgDashed   = ref(false);
const pgDisabled = ref(false);

function resetPlayground() {
    pgVariant.value  = 'inline';
    pgMultiple.value = false;
    pgDashed.value   = false;
    pgDisabled.value = false;
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgVariant.value  !== 'inline') parts.push(`dropzone-variant="${pgVariant.value}"`);
    if (pgMultiple.value)               parts.push(':multiple="true"');
    if (pgDashed.value)                 parts.push(':dashed="true"');
    if (pgDisabled.value)               parts.push(':disabled="true"');
    const attrs = parts.length ? '\n    ' + parts.join('\n    ') : '';
    return `<FileInput
    v-model="files"
    label="Adjunta tus archivos"${attrs}
/>`;
});

// Playground state
const pgFiles = ref<File[] | null>(null);

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<FileInput v-model="file" label="Adjunta un archivo" />`;

const multipleCode = `<FileInput
    v-model="files"
    label="Sube tus documentos"
    multiple
    helper-text="Puedes seleccionar varios archivos."
/>`;

const acceptCode = `<FileInput
    v-model="image"
    label="Foto de perfil"
    accept="image/*"
    helper-text="Solo imágenes (JPG, PNG, WebP…)"
/>`;

const dropzoneCode = `<FileInput
    v-model="files"
    label="Arrastra y suelta"
    dropzone-variant="area"
    dashed
    multiple
    dropzone-label="Suelta tus archivos aquí"
    dropzone-hint="o usa el botón para buscar en tu equipo"
/>`;

const previewsCode = `<FileInput
    v-model="images"
    label="Galería"
    accept="image/*"
    multiple
    :previews="true"
    helper-text="Se muestran miniaturas para cada imagen."
/>`;

const ex1 = ref<File[] | null>(null);
const ex2 = ref<File[] | null>(null);
const ex3 = ref<File[] | null>(null);
const ex4 = ref<File[] | null>(null);
const ex5 = ref<File[] | null>(null);

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',      type: 'File[] | null',                                                       description: 'Lista de archivos seleccionados (v-model).' },
    { name: 'multiple',        type: 'boolean',                                            default: 'false', description: 'Permite seleccionar varios archivos.' },
    { name: 'accept',          type: 'string',                                                              description: 'Filtro de tipos aceptados (MIME types o extensiones).' },
    { name: 'maxSize',         type: 'number',                                                              description: 'Tamaño máximo por archivo en bytes.' },
    { name: 'maxFiles',        type: 'number',                                                              description: 'Cantidad máxima de archivos en modo multiple.' },
    { name: 'previews',        type: 'boolean',                                            default: 'true',  description: 'Muestra thumbnails para imágenes seleccionadas.' },
    { name: 'dropzone',        type: 'boolean',                                            default: 'true',  description: 'Habilita drag & drop sobre el área.' },
    { name: 'dropzoneVariant', type: "'inline' | 'area'",                                  default: "'inline'", description: 'Presentación: fila compacta o área prominente tipo dropzone.' },
    { name: 'dropzoneHeight',  type: "'small' | 'medium' | 'large'",                       default: "'medium'", description: 'Altura mínima del área cuando dropzoneVariant="area".' },
    { name: 'dashed',          type: 'boolean',                                            default: 'false', description: 'Aplica borde punteado al wrapper.' },
    { name: 'dropzoneLabel',   type: 'string',                                                              description: 'Texto principal del área (solo dropzoneVariant="area").' },
    { name: 'dropzoneHint',    type: 'string',                                                              description: 'Texto secundario del área (solo dropzoneVariant="area").' },
    { name: 'clickToSelect',   type: 'boolean',                                            default: 'true',  description: 'El click sobre el área completa abre el picker nativo.' },
    { name: 'label',           type: 'string',                                                              description: 'Etiqueta visible sobre el control.' },
    { name: 'placeholder',     type: 'string',                                                              description: 'Texto mostrado cuando no hay archivos seleccionados.' },
    { name: 'helperText',      type: 'string',                                                              description: 'Texto de ayuda bajo el control.' },
    { name: 'errorText',       type: 'string',                                                              description: 'Mensaje de error que reemplaza al helperText.' },
    { name: 'variant',         type: "'outline' | 'filled' | 'ghost'",                     default: "'outline'", description: 'Estilo visual del wrapper.' },
    { name: 'color',           type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Color semántico del foco y acento.' },
    { name: 'size',            type: "'small' | 'medium' | 'large'",                       default: "'medium'", description: 'Tamaño general del control.' },
    { name: 'disabled',        type: 'boolean',                                            default: 'false', description: 'Deshabilita el control.' },
    { name: 'readonly',        type: 'boolean',                                            default: 'false', description: 'Modo solo lectura.' },
    { name: 'required',        type: 'boolean',                                            default: 'false', description: 'Marca el campo como requerido.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'File[] | null',                                description: 'Emitido al cambiar la lista de archivos (sincroniza v-model).' },
    { name: 'change',            payload: 'File[]',                                       description: 'Emitido tras cada cambio confirmado.' },
    { name: 'reject',            payload: 'FileInputRejection',                           description: 'Emitido cuando un archivo es rechazado por tipo, tamaño o cantidad.' },
];
</script>

<template>
    <ComponentDoc
        title="FileInput"
        category="Forms"
        import-path="import { FileInput } from 'mood-ui'"
        description="Selector de archivos con soporte de drag & drop, validación, previews de imágenes y dos variantes visuales (inline y área prominente)."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="240px" @reset="resetPlayground">
                <template #controls>
                    <!-- Variant -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">VARIANT</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in ['inline', 'area']"
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

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgMultiple
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgMultiple = !pgMultiple"
                    >Multiple</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDashed
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDashed = !pgDashed"
                    >Dashed</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDisabled
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDisabled = !pgDisabled"
                    >Disabled</button>
                </template>

                <FileInput
                    v-model="pgFiles"
                    label="Adjunta tus archivos"
                    :dropzone-variant="pgVariant"
                    :multiple="pgMultiple"
                    :dashed="pgDashed"
                    :disabled="pgDisabled"
                    full-width
                    class="w-full max-w-md"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Uso básico"
                description="Selección de un único archivo con presentación inline."
                :code="basicCode"
            >
                <FileInput v-model="ex1" label="Adjunta un archivo" full-width class="w-full max-w-md" />
            </ComponentPreview>

            <ComponentPreview
                title="Múltiples archivos"
                description="Activa multiple para permitir seleccionar varios archivos a la vez."
                :code="multipleCode"
            >
                <FileInput
                    v-model="ex2"
                    label="Sube tus documentos"
                    multiple
                    helper-text="Puedes seleccionar varios archivos."
                    full-width
                    class="w-full max-w-md"
                />
            </ComponentPreview>

            <ComponentPreview
                title="Solo imágenes"
                description="Restringe los tipos aceptados con el atributo accept."
                :code="acceptCode"
            >
                <FileInput
                    v-model="ex3"
                    label="Foto de perfil"
                    accept="image/*"
                    helper-text="Solo imágenes (JPG, PNG, WebP…)"
                    full-width
                    class="w-full max-w-md"
                />
            </ComponentPreview>

            <ComponentPreview
                title="Drag & drop"
                description="La variante 'area' muestra un dropzone prominente con borde punteado opcional."
                :code="dropzoneCode"
            >
                <FileInput
                    v-model="ex4"
                    label="Arrastra y suelta"
                    dropzone-variant="area"
                    dashed
                    multiple
                    dropzone-label="Suelta tus archivos aquí"
                    dropzone-hint="o usa el botón para buscar en tu equipo"
                    full-width
                    class="w-full max-w-md"
                />
            </ComponentPreview>

            <ComponentPreview
                title="Con previews"
                description="Las imágenes seleccionadas muestran una miniatura automáticamente."
                :code="previewsCode"
            >
                <FileInput
                    v-model="ex5"
                    label="Galería"
                    accept="image/*"
                    multiple
                    :previews="true"
                    helper-text="Se muestran miniaturas para cada imagen."
                    full-width
                    class="w-full max-w-md"
                />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
