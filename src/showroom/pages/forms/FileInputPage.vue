<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import CodePreview from "../../components/CodePreview.vue";
import FileInput from "../../../components/forms/FileInput.vue";
import type { PropDoc, EmitDoc } from "../../types";
import A11yDoc from "../../components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "../../components/A11yDoc.vue";
import TbPills from "../../components/toolbar/TbPills.vue";
import TbDots from "../../components/toolbar/TbDots.vue";
import TbToggle from "../../components/toolbar/TbToggle.vue";
import TbSep from "../../components/toolbar/TbSep.vue";
import Typography from "../../../components/data-display/Typography.vue";

const { t } = useI18n();

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.forms.fileInput.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.fileInput.a11y.kbShiftTab") },
  { keys: ["Enter"], action: t("pages.forms.fileInput.a11y.kbEnter") },
  { keys: ["Space"], action: t("pages.forms.fileInput.a11y.kbSpace") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-invalid",
    value: "true",
    desc: t("pages.forms.fileInput.a11y.ariaInvalid"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.forms.fileInput.a11y.ariaDescribedBy"),
  },
  {
    attribute: "aria-required",
    value: "true",
    desc: t("pages.forms.fileInput.a11y.ariaRequired"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.fileInput.a11y.ariaDisabled"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.fileInput.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.fileInput.a11y.focusNative"),
  t("pages.forms.fileInput.a11y.focusDropzone"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<"inline" | "area">("inline");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "default",
);
const pgSize = ref<"small" | "medium" | "large">("medium");
const pgMultiple = ref(false);
const pgDashed = ref(false);
const pgDisabled = ref(false);

function resetPlayground() {
  pgVariant.value = "inline";
  pgColor.value = "default";
  pgSize.value = "medium";
  pgMultiple.value = false;
  pgDashed.value = false;
  pgDisabled.value = false;
}

const colorDots = [
  { value: "default" as const, bg: "var(--color-slate-400)", label: "Default" },
  { value: "primary" as const, bg: "var(--primary)", label: "Primary" },
  {
    value: "success" as const,
    bg: "var(--color-emerald-500)",
    label: "Success",
  },
  { value: "warning" as const, bg: "var(--color-amber-500)", label: "Warning" },
  { value: "danger" as const, bg: "var(--color-red-500)", label: "Danger" },
];

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgVariant.value !== "inline")
    parts.push(`dropzone-variant="${pgVariant.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgMultiple.value) parts.push(':multiple="true"');
  if (pgDashed.value) parts.push(':dashed="true"');
  if (pgDisabled.value) parts.push(':disabled="true"');
  const attrs = parts.length ? "\n    " + parts.join("\n    ") : "";
  return `<FileInput
    v-model="files"
    label="Adjunta tus archivos"${attrs}
/>`;
});

// Playground state
const pgFiles = ref<File[] | null>(null);

// ── Example code strings (self-contained) ─────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { FileInput } from 'mood-ui';

const file = ref<File[] | null>(null);
<\/script>

<template>
  <FileInput v-model="file" label="Attach a file" />
</template>`;

const multipleCode = `<script setup lang="ts">
import { ref } from 'vue';
import { FileInput } from 'mood-ui';

const files = ref<File[] | null>(null);
<\/script>

<template>
  <FileInput
    v-model="files"
    label="Upload your documents"
    multiple
    helper-text="You can select several files."
  />
</template>`;

const acceptCode = `<script setup lang="ts">
import { ref } from 'vue';
import { FileInput } from 'mood-ui';

const image = ref<File[] | null>(null);
<\/script>

<template>
  <FileInput
    v-model="image"
    label="Profile photo"
    accept="image/*"
    helper-text="Images only (JPG, PNG, WebP…)"
  />
</template>`;

const dropzoneCode = `<script setup lang="ts">
import { ref } from 'vue';
import { FileInput } from 'mood-ui';

const files = ref<File[] | null>(null);
<\/script>

<template>
  <FileInput
    v-model="files"
    label="Drag & drop"
    dropzone-variant="area"
    dashed
    multiple
    dropzone-label="Drop your files here"
    dropzone-hint="or use the button to browse your device"
  />
</template>`;

const previewsCode = `<script setup lang="ts">
import { ref } from 'vue';
import { FileInput } from 'mood-ui';

const images = ref<File[] | null>(null);
<\/script>

<template>
  <FileInput
    v-model="images"
    label="Gallery"
    accept="image/*"
    multiple
    :previews="true"
    helper-text="Thumbnails are shown for each image."
  />
</template>`;

const typesCode = `export interface FileInput {
  modelValue?: File[] | null;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  rejectMessages?: FileInputRejectMessages;
  previews?: boolean;
  dropzone?: boolean;
  dropzoneVariant?: 'inline' | 'area';
  dropzoneHeight?: 'small' | 'medium' | 'large';
  dashed?: boolean;
  dropzoneLabel?: string;
  dropzoneHint?: string;
  clickToSelect?: boolean;
  progress?: Record<string, number>;
  errors?: Record<string, string>;
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  variant?: 'outline' | 'filled' | 'ghost';
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  halo?: 'tinted' | 'neutral' | 'off';
  fullWidth?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  loading?: boolean;
  iconLeft?: Component;
  id?: string;
  name?: string;
  autofocus?: boolean;
  ariaLabel?: string;
}`;

const ex1 = ref<File[] | null>(null);
const ex2 = ref<File[] | null>(null);
const ex3 = ref<File[] | null>(null);
const ex4 = ref<File[] | null>(null);
const ex5 = ref<File[] | null>(null);

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "File[] | null",
    description: t("pages.forms.fileInput.props.modelValue"),
  },
  {
    name: "multiple",
    type: "boolean",
    default: "false",
    description: t("pages.forms.fileInput.props.multiple"),
  },
  {
    name: "accept",
    type: "string",
    description: t("pages.forms.fileInput.props.accept"),
  },
  {
    name: "maxSize",
    type: "number",
    description: t("pages.forms.fileInput.props.maxSize"),
  },
  {
    name: "maxFiles",
    type: "number",
    description: t("pages.forms.fileInput.props.maxFiles"),
  },
  {
    name: "previews",
    type: "boolean",
    default: "true",
    description: t("pages.forms.fileInput.props.previews"),
  },
  {
    name: "dropzone",
    type: "boolean",
    default: "true",
    description: t("pages.forms.fileInput.props.dropzone"),
  },
  {
    name: "dropzoneVariant",
    type: "'inline' | 'area'",
    default: "'inline'",
    description: t("pages.forms.fileInput.props.dropzoneVariant"),
  },
  {
    name: "dropzoneHeight",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.fileInput.props.dropzoneHeight"),
  },
  {
    name: "dashed",
    type: "boolean",
    default: "false",
    description: t("pages.forms.fileInput.props.dashed"),
  },
  {
    name: "dropzoneLabel",
    type: "string",
    description: t("pages.forms.fileInput.props.dropzoneLabel"),
  },
  {
    name: "dropzoneHint",
    type: "string",
    description: t("pages.forms.fileInput.props.dropzoneHint"),
  },
  {
    name: "clickToSelect",
    type: "boolean",
    default: "true",
    description: t("pages.forms.fileInput.props.clickToSelect"),
  },
  {
    name: "label",
    type: "string",
    description: t("pages.forms.fileInput.props.label"),
  },
  {
    name: "placeholder",
    type: "string",
    description: t("pages.forms.fileInput.props.placeholder"),
  },
  {
    name: "helperText",
    type: "string",
    description: t("pages.forms.fileInput.props.helperText"),
  },
  {
    name: "errorText",
    type: "string",
    description: t("pages.forms.fileInput.props.errorText"),
  },
  {
    name: "variant",
    type: "'outline' | 'filled' | 'ghost'",
    default: "'outline'",
    description: t("pages.forms.fileInput.props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.forms.fileInput.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.fileInput.props.size"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.fileInput.props.disabled"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: t("pages.forms.fileInput.props.readonly"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: t("pages.forms.fileInput.props.required"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "File[] | null",
    description: t("pages.forms.fileInput.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "File[]",
    description: t("pages.forms.fileInput.emits.change"),
  },
  {
    name: "reject",
    payload: "FileInputRejection",
    description: t("pages.forms.fileInput.emits.reject"),
  },
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
      <ComponentPreview
        :code="overviewCode"
        min-height="240px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('pages.forms.fileInput.controls.variant')"
            :options="[{ value: 'inline' }, { value: 'area' }]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbDots
            :label="t('pages.forms.fileInput.controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('pages.forms.fileInput.controls.size')"
            :options="[
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbToggle
            :label="t('pages.forms.fileInput.controls.multiple')"
            v-model="pgMultiple"
          />
          <TbToggle
            :label="t('pages.forms.fileInput.controls.dashed')"
            v-model="pgDashed"
          />
          <TbToggle
            :label="t('pages.forms.fileInput.controls.disabled')"
            v-model="pgDisabled"
          />
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
        <FileInput
          v-model="ex1"
          label="Adjunta un archivo"
          full-width
          class="w-full max-w-md"
        />
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

    <template #a11y>
      <A11yDoc
        :keyboard-rows="a11yKeyboard"
        :aria-rows="a11yAria"
        :focus-notes="a11yFocus"
      />
    </template>

    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.forms.fileInput.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.fileInput.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
