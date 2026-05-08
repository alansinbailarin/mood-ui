<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import FileInput from '../../../components/forms/FileInput.vue';
import type { PropDoc, EmitDoc } from '../../types';
import TbPills  from '../../components/toolbar/TbPills.vue';
import TbDots   from '../../components/toolbar/TbDots.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep    from '../../components/toolbar/TbSep.vue';

const { t } = useI18n();

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant  = ref<'inline' | 'area'>('inline');
const pgColor    = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('default');
const pgSize     = ref<'small' | 'medium' | 'large'>('medium');
const pgMultiple = ref(false);
const pgDashed   = ref(false);
const pgDisabled = ref(false);

function resetPlayground() {
    pgVariant.value  = 'inline';
    pgColor.value    = 'default';
    pgSize.value     = 'medium';
    pgMultiple.value = false;
    pgDashed.value   = false;
    pgDisabled.value = false;
}

const colorDots = [
    { value: 'default' as const, bg: 'var(--color-slate-400)',   label: 'Default' },
    { value: 'primary' as const, bg: 'var(--primary)',            label: 'Primary' },
    { value: 'success' as const, bg: 'var(--color-emerald-500)', label: 'Success' },
    { value: 'warning' as const, bg: 'var(--color-amber-500)',   label: 'Warning' },
    { value: 'danger'  as const, bg: 'var(--color-red-500)',     label: 'Danger'  },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgVariant.value  !== 'inline')  parts.push(`dropzone-variant="${pgVariant.value}"`);
    if (pgColor.value    !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value     !== 'medium')  parts.push(`size="${pgSize.value}"`);
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
const propsList = computed<PropDoc[]>(() => [
    { name: 'modelValue',      type: 'File[] | null',                                                       description: t('pages.forms.fileInput.props.modelValue') },
    { name: 'multiple',        type: 'boolean',                                            default: 'false', description: t('pages.forms.fileInput.props.multiple') },
    { name: 'accept',          type: 'string',                                                              description: t('pages.forms.fileInput.props.accept') },
    { name: 'maxSize',         type: 'number',                                                              description: t('pages.forms.fileInput.props.maxSize') },
    { name: 'maxFiles',        type: 'number',                                                              description: t('pages.forms.fileInput.props.maxFiles') },
    { name: 'previews',        type: 'boolean',                                            default: 'true',  description: t('pages.forms.fileInput.props.previews') },
    { name: 'dropzone',        type: 'boolean',                                            default: 'true',  description: t('pages.forms.fileInput.props.dropzone') },
    { name: 'dropzoneVariant', type: "'inline' | 'area'",                                  default: "'inline'", description: t('pages.forms.fileInput.props.dropzoneVariant') },
    { name: 'dropzoneHeight',  type: "'small' | 'medium' | 'large'",                       default: "'medium'", description: t('pages.forms.fileInput.props.dropzoneHeight') },
    { name: 'dashed',          type: 'boolean',                                            default: 'false', description: t('pages.forms.fileInput.props.dashed') },
    { name: 'dropzoneLabel',   type: 'string',                                                              description: t('pages.forms.fileInput.props.dropzoneLabel') },
    { name: 'dropzoneHint',    type: 'string',                                                              description: t('pages.forms.fileInput.props.dropzoneHint') },
    { name: 'clickToSelect',   type: 'boolean',                                            default: 'true',  description: t('pages.forms.fileInput.props.clickToSelect') },
    { name: 'label',           type: 'string',                                                              description: t('pages.forms.fileInput.props.label') },
    { name: 'placeholder',     type: 'string',                                                              description: t('pages.forms.fileInput.props.placeholder') },
    { name: 'helperText',      type: 'string',                                                              description: t('pages.forms.fileInput.props.helperText') },
    { name: 'errorText',       type: 'string',                                                              description: t('pages.forms.fileInput.props.errorText') },
    { name: 'variant',         type: "'outline' | 'filled' | 'ghost'",                     default: "'outline'", description: t('pages.forms.fileInput.props.variant') },
    { name: 'color',           type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: t('pages.forms.fileInput.props.color') },
    { name: 'size',            type: "'small' | 'medium' | 'large'",                       default: "'medium'", description: t('pages.forms.fileInput.props.size') },
    { name: 'disabled',        type: 'boolean',                                            default: 'false', description: t('pages.forms.fileInput.props.disabled') },
    { name: 'readonly',        type: 'boolean',                                            default: 'false', description: t('pages.forms.fileInput.props.readonly') },
    { name: 'required',        type: 'boolean',                                            default: 'false', description: t('pages.forms.fileInput.props.required') },
]);

const emitsList = computed<EmitDoc[]>(() => [
    { name: 'update:modelValue', payload: 'File[] | null',                                description: t('pages.forms.fileInput.emits.updateModelValue') },
    { name: 'change',            payload: 'File[]',                                       description: t('pages.forms.fileInput.emits.change') },
    { name: 'reject',            payload: 'FileInputRejection',                           description: t('pages.forms.fileInput.emits.reject') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.forms.fileInput.title')"
        :category="t('pages.forms.fileInput.category')"
        import-path="import { FileInput } from 'mood-ui'"
        :description="t('pages.forms.fileInput.description')"
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="240px" @reset="resetPlayground">
                <template #controls>
                    <TbPills :label="t('pages.forms.fileInput.controls.variant')" :options="[{value:'inline'},{value:'area'}]" v-model="pgVariant" />
                    <TbSep />
                    <TbDots :label="t('pages.forms.fileInput.controls.color')" :options="colorDots" v-model="pgColor" />
                    <TbSep />
                    <TbPills :label="t('pages.forms.fileInput.controls.size')" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbToggle :label="t('pages.forms.fileInput.controls.multiple')" v-model="pgMultiple" />
                    <TbToggle :label="t('pages.forms.fileInput.controls.dashed')"   v-model="pgDashed" />
                    <TbToggle :label="t('pages.forms.fileInput.controls.disabled')" v-model="pgDisabled" />
                </template>

                <FileInput
                    v-model="pgFiles"
                    :label="t('pages.forms.fileInput.playground.label')"
                    :dropzone-variant="pgVariant"
                    :color="pgColor"
                    :size="pgSize"
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
                :title="t('pages.forms.fileInput.examples.basic.title')"
                :description="t('pages.forms.fileInput.examples.basic.desc')"
                :code="basicCode"
            >
                <FileInput v-model="ex1" label="Adjunta un archivo" full-width class="w-full max-w-md" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.fileInput.examples.multiple.title')"
                :description="t('pages.forms.fileInput.examples.multiple.desc')"
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
                :title="t('pages.forms.fileInput.examples.accept.title')"
                :description="t('pages.forms.fileInput.examples.accept.desc')"
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
                :title="t('pages.forms.fileInput.examples.dropzone.title')"
                :description="t('pages.forms.fileInput.examples.dropzone.desc')"
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
                :title="t('pages.forms.fileInput.examples.previews.title')"
                :description="t('pages.forms.fileInput.examples.previews.desc')"
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
