<script setup lang="ts">
import { ref, computed } from "vue";
import { TagInput, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import type { PropDoc, EmitDoc } from "~/types/component-doc";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";

const { t } = useI18n();


useSeoMeta({
  title: () => t("pages.forms.tagInput.title"),
  description: () => t("pages.forms.tagInput.description"),
  ogTitle: () => `${t("pages.forms.tagInput.title")} · mood-ui`,
  ogDescription: () => t("pages.forms.tagInput.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.forms.tagInput.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.tagInput.a11y.kbShiftTab") },
  { keys: ["Type"], action: t("pages.forms.tagInput.a11y.kbType") },
  { keys: ["Backspace"], action: t("pages.forms.tagInput.a11y.kbBackspace") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-invalid",
    value: "true",
    desc: t("pages.forms.tagInput.a11y.ariaInvalid"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.forms.tagInput.a11y.ariaDescribedBy"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.tagInput.a11y.ariaDisabled"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.tagInput.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.tagInput.a11y.focusNative"),
  t("pages.forms.tagInput.a11y.focusChips"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue = ref<string[]>(["vue", "tailwind"]);
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgVariant = ref<"subtle" | "outline" | "solid">("subtle");
const pgDisabled = ref(false);

function resetPlayground() {
  pgValue.value = ["vue", "tailwind"];
  pgColor.value = "primary";
  pgSize.value = "medium";
  pgVariant.value = "subtle";
  pgDisabled.value = false;
}

const colorDots = [
  { value: "default" as const, bg: "#64748b", label: "Default" },
  { value: "primary" as const, bg: "var(--primary)", label: "Primary" },
  { value: "success" as const, bg: "#22c55e", label: "Success" },
  { value: "warning" as const, bg: "#f59e0b", label: "Warning" },
  { value: "danger" as const, bg: "#ef4444", label: "Danger" },
];

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgVariant.value !== "subtle") parts.push(`variant="${pgVariant.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgDisabled.value) parts.push(':disabled="true"');
  const attrs = parts.length ? "\n    " + parts.join("\n    ") : "";
  return `<TagInput\n    v-model="tags"\n    placeholder="${t("pages.forms.tagInput.playground.placeholder")}"${attrs}\n/>`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { TagInput } from 'mood-ui';

const tags = ref<string[]>(['design', 'typography']);
<\/script>

<template>
  <TagInput v-model="tags" placeholder="Add a tag and press Enter…" />
</template>`;

const maxCode = `<script setup lang="ts">
import { ref } from 'vue';
import { TagInput } from 'mood-ui';

const tags = ref<string[]>(['react', 'vue']);
<\/script>

<template>
  <TagInput v-model="tags" :max="3" placeholder="Up to 3 tags" />
</template>`;

const validatorCode = `<script setup lang="ts">
import { ref } from 'vue';
import { TagInput } from 'mood-ui';

const emails = ref<string[]>(['hello@modo.dev']);

function isEmail(t: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}
<\/script>

<template>
  <TagInput
    v-model="emails"
    placeholder="Valid emails only"
    :validator="isEmail"
  />
</template>`;

const colorsCode = `<script setup lang="ts">
import { ref } from 'vue';
import { TagInput } from 'mood-ui';

const t1 = ref<string[]>(['vue', 'pinia']);
const t2 = ref<string[]>(['ok', 'shipped']);
const t3 = ref<string[]>(['error', 'warning']);
<\/script>

<template>
  <TagInput v-model="t1" color="primary" />
  <TagInput v-model="t2" color="success" />
  <TagInput v-model="t3" color="danger" />
</template>`;

const sizesCode = `<script setup lang="ts">
import { ref } from 'vue';
import { TagInput } from 'mood-ui';

const tags = ref<string[]>(['hello', 'world']);
<\/script>

<template>
  <TagInput v-model="tags" size="small"  />
  <TagInput v-model="tags" size="medium" />
  <TagInput v-model="tags" size="large"  />
</template>`;

const ex1 = ref<string[]>(["design", "typography"]);
const ex2 = ref<string[]>(["react", "vue"]);
const ex3 = ref<string[]>(["hello@modo.dev"]);
function isEmail(t: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}
const t1 = ref<string[]>(["vue", "pinia"]);
const t2 = ref<string[]>(["ok", "shipped"]);
const t3 = ref<string[]>(["error", "warning"]);
const tt = ref<string[]>(["hola", "mundo"]);

const typesCode = `export interface TagInput {
  modelValue?: string[];
  placeholder?: string;
  max?: number;
  unique?: boolean;
  validator?: (tag: string) => boolean;
  delimiters?: string[];
  disabled?: boolean;
  readonly?: boolean;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  variant?: 'subtle' | 'outline' | 'solid';
  fieldVariant?: 'outline' | 'filled' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  halo?: 'tinted' | 'neutral' | 'off';
  ariaLabel?: string;
  label?: string;
  id?: string;
  errorText?: string;
  helperText?: string;
  invalid?: boolean;
  fullWidth?: boolean;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "string[]",
    default: "[]",
    description: t("pages.forms.tagInput.props.modelValue"),
  },
  {
    name: "placeholder",
    type: "string",
    default: "'Add a tag and press Enter…'",
    description: t("pages.forms.tagInput.props.placeholder"),
  },
  {
    name: "max",
    type: "number",
    description: t("pages.forms.tagInput.props.max"),
  },
  {
    name: "unique",
    type: "boolean",
    default: "true",
    description: t("pages.forms.tagInput.props.unique"),
  },
  {
    name: "validator",
    type: "(tag: string) => boolean",
    description: t("pages.forms.tagInput.props.validator"),
  },
  {
    name: "delimiters",
    type: "string[]",
    default: "[',']",
    description: t("pages.forms.tagInput.props.delimiters"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.forms.tagInput.props.color"),
  },
  {
    name: "variant",
    type: "'subtle' | 'outline' | 'solid'",
    default: "'subtle'",
    description: t("pages.forms.tagInput.props.variant"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.tagInput.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    default: "'medium'",
    description: t("pages.forms.tagInput.props.radius"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.tagInput.props.disabled"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: t("pages.forms.tagInput.props.readonly"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.forms.tagInput.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "string[]",
    description: t("pages.forms.tagInput.emits.updateModelValue"),
  },
  {
    name: "add",
    payload: "string",
    description: t("pages.forms.tagInput.emits.add"),
  },
  {
    name: "remove",
    payload: "(tag, index)",
    description: t("pages.forms.tagInput.emits.remove"),
  },
  {
    name: "change",
    payload: "string[]",
    description: t("pages.forms.tagInput.emits.change"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.tagInput.title')"
    category="Forms"
    import-path="import { TagInput } from 'mood-ui'"
    :description="t('pages.forms.tagInput.description')"
    :props-list="propsList"
    :emits-list="emitsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="200px"
        @reset="resetPlayground"
      >
        <template #controls>
          <!-- Variant -->
          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline"
              >VARIANT</span
            >
            <div class="flex rounded-md border border-border overflow-hidden">
              <button
                v-for="v in ['subtle', 'outline', 'solid']"
                :key="v"
                type="button"
                class="px-2 py-1 text-xs transition-colors capitalize"
                :class="
                  pgVariant === v
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/60'
                "
                @click="pgVariant = v as typeof pgVariant"
              >
                {{ v }}
              </button>
            </div>
          </div>

          <span class="w-px h-4 bg-border shrink-0" />

          <!-- Color dots -->
          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline"
              >COLOR</span
            >
            <div class="flex items-center gap-1">
              <button
                v-for="c in colorDots"
                :key="c.value"
                type="button"
                class="size-4 rounded-full transition-all duration-150"
                :class="
                  pgColor === c.value
                    ? 'ring-2 ring-offset-1 ring-foreground/30 scale-125'
                    : 'hover:scale-110 opacity-70 hover:opacity-100'
                "
                :style="`background: ${c.bg}`"
                :title="c.label"
                @click="pgColor = c.value"
              />
            </div>
          </div>

          <span class="w-px h-4 bg-border shrink-0" />

          <!-- Size -->
          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline"
              >SIZE</span
            >
            <div class="flex rounded-md border border-border overflow-hidden">
              <button
                v-for="s in ['xsmall', 'small', 'medium', 'large']"
                :key="s"
                type="button"
                class="px-2 py-1 text-xs transition-colors capitalize"
                :class="
                  pgSize === s
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/60'
                "
                @click="pgSize = s as typeof pgSize"
              >
                {{ s }}
              </button>
            </div>
          </div>

          <span class="w-px h-4 bg-border shrink-0" />

          <button
            type="button"
            class="px-2 py-1 rounded-md text-xs border transition-colors"
            :class="
              pgDisabled
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            "
            @click="pgDisabled = !pgDisabled"
          >
            Disabled
          </button>
        </template>

        <div class="w-80">
          <TagInput
            v-model="pgValue"
            :variant="pgVariant"
            :color="pgColor"
            :size="pgSize"
            :disabled="pgDisabled"
            :placeholder="t('pages.forms.tagInput.playground.placeholder')"
            ariaLabel="Tags"
          />
        </div>
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.tagInput.examples.basic.title')"
        :description="t('pages.forms.tagInput.examples.basic.desc')"
        :code="basicCode"
      >
        <div class="w-80">
          <TagInput
            v-model="ex1"
            :placeholder="t('pages.forms.tagInput.examples.basic.ph')"
            ariaLabel="Tags"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.tagInput.examples.max.title')"
        :description="t('pages.forms.tagInput.examples.max.desc')"
        :code="maxCode"
      >
        <div class="w-80">
          <TagInput
            v-model="ex2"
            :max="3"
            :placeholder="t('pages.forms.tagInput.examples.max.ph')"
            ariaLabel="Tags"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.tagInput.examples.validator.title')"
        :description="t('pages.forms.tagInput.examples.validator.desc')"
        :code="validatorCode"
      >
        <div class="w-80">
          <TagInput
            v-model="ex3"
            :placeholder="t('pages.forms.tagInput.examples.validator.ph')"
            :validator="isEmail"
            ariaLabel="Email tags"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.tagInput.examples.colors.title')"
        :description="t('pages.forms.tagInput.examples.colors.desc')"
        :code="colorsCode"
      >
        <div class="flex flex-col gap-3 w-80">
          <TagInput v-model="t1" color="primary" ariaLabel="Primary tags" />
          <TagInput v-model="t2" color="success" ariaLabel="Success tags" />
          <TagInput v-model="t3" color="danger" ariaLabel="Danger tags" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.tagInput.examples.sizes.title')"
        :description="t('pages.forms.tagInput.examples.sizes.desc')"
        :code="sizesCode"
      >
        <div class="flex flex-col gap-3 w-80">
          <TagInput v-model="tt" size="small" ariaLabel="Tags small" />
          <TagInput v-model="tt" size="medium" ariaLabel="Tags medium" />
          <TagInput v-model="tt" size="large" ariaLabel="Tags large" />
        </div>
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
        {{ t("pages.forms.tagInput.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.tagInput.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
