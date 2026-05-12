<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import CodePreview from "../../components/CodePreview.vue";
import Typography from "../../../components/data-display/Typography.vue";
import FormField from "../../../components/forms/FormField.vue";
import Input from "../../../components/forms/Input.vue";
import Select from "../../../components/forms/Select.vue";
import Textarea from "../../../components/forms/Textarea.vue";
import type { PropDoc, SlotDoc } from "../../types";
import A11yDoc from "../../components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "../../components/A11yDoc.vue";

const { t } = useI18n();

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.forms.formField.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.formField.a11y.kbShiftTab") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: '"group"',
    desc: t("pages.forms.formField.a11y.ariaGroup"),
  },
  {
    attribute: "aria-labelledby",
    value: "id",
    desc: t("pages.forms.formField.a11y.ariaLabelledBy"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.forms.formField.a11y.ariaDescribedBy"),
  },
  {
    attribute: "aria-invalid",
    value: "true",
    desc: t("pages.forms.formField.a11y.ariaInvalid"),
  },
  {
    attribute: "aria-required",
    value: "true",
    desc: t("pages.forms.formField.a11y.ariaRequired"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.formField.a11y.focusLabel"),
  t("pages.forms.formField.a11y.focusError"),
]);

const countries = [
  { value: "us", label: "United States" },
  { value: "gb", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgRequired = ref(false);
const pgDisabled = ref(false);
const pgError = ref(false);
const pgOrientation = ref<"vertical" | "horizontal">("vertical");

function resetPlayground() {
  pgRequired.value = false;
  pgDisabled.value = false;
  pgError.value = false;
  pgOrientation.value = "vertical";
}

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgOrientation.value !== "vertical")
    parts.push(`orientation="${pgOrientation.value}"`);
  if (pgRequired.value) parts.push(':required="true"');
  if (pgDisabled.value) parts.push(':disabled="true"');
  if (pgError.value) parts.push('error-text="This field is required"');
  const attrs = parts.length ? "\n    " + parts.join("\n    ") : "";
  return `<FormField
    label="Email"
    helper-text="Used to confirm your account."${attrs}
>
    <Input v-model="email" placeholder="your@email.com" />
</FormField>`;
});

// Playground state
const pgValue = ref("");

// ── Example code strings (self-contained) ─────────────────────────────────────
const inputCode = `<script setup lang="ts">
import { ref } from 'vue';
import { FormField, Input } from 'mood-ui';

const name = ref('');
<\/script>

<template>
  <FormField label="Full name" helper-text="As it appears on your ID.">
    <Input v-model="name" placeholder="Ada Lovelace" />
  </FormField>
</template>`;

const selectCode = `<script setup lang="ts">
import { ref } from 'vue';
import { FormField, Select } from 'mood-ui';

const country = ref<string | null>(null);

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
];
<\/script>

<template>
  <FormField label="Country" required>
    <Select v-model="country" :options="countries" placeholder="Choose a country" />
  </FormField>
</template>`;

const textareaCode = `<script setup lang="ts">
import { ref } from 'vue';
import { FormField, Textarea } from 'mood-ui';

const message = ref('');
<\/script>

<template>
  <FormField label="Comments" hint="Optional">
    <Textarea v-model="message" rows="4" placeholder="Tell us more…" />
  </FormField>
</template>`;

const errorCode = `<script setup lang="ts">
import { ref } from 'vue';
import { FormField, Input } from 'mood-ui';

const email = ref('not-an-email');
<\/script>

<template>
  <FormField
    label="Email"
    error-text="Invalid email"
    required
  >
    <Input v-model="email" placeholder="tu@email.com" />
  </FormField>
</template>`;

const horizontalCode = `<script setup lang="ts">
import { ref } from 'vue';
import { FormField, Input } from 'mood-ui';

const url = ref('');
<\/script>

<template>
  <FormField
    label="Public URL"
    helper-text="Visible on your profile."
    orientation="horizontal"
    label-width="9rem"
    full-width
  >
    <Input v-model="url" placeholder="https://…" full-width />
  </FormField>
</template>`;

// Example state
const exName = ref("");
const exCountry = ref<string | number | null>(null);
const exMessage = ref("");
const exEmail = ref("invalido");
const exUrl = ref("");

const typesCode = `export interface FormField {
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  orientation?: 'vertical' | 'horizontal';
  labelWidth?: string;
  fullWidth?: boolean;
  hint?: string;
  as?: string;
}

export interface FormFieldSlotProps {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
  disabled: boolean;
  required: boolean;
  color: 'danger' | undefined;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "label",
    type: "string",
    description: t("pages.forms.formField.props.label"),
  },
  {
    name: "helperText",
    type: "string",
    description: t("pages.forms.formField.props.helperText"),
  },
  {
    name: "errorText",
    type: "string",
    description: t("pages.forms.formField.props.errorText"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: t("pages.forms.formField.props.required"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.formField.props.disabled"),
  },
  {
    name: "id",
    type: "string",
    description: t("pages.forms.formField.props.id"),
  },
  {
    name: "orientation",
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: t("pages.forms.formField.props.orientation"),
  },
  {
    name: "labelWidth",
    type: "string",
    default: "'10rem'",
    description: t("pages.forms.formField.props.labelWidth"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.forms.formField.props.fullWidth"),
  },
  {
    name: "hint",
    type: "string",
    description: t("pages.forms.formField.props.hint"),
  },
  {
    name: "as",
    type: "string",
    default: "'div'",
    description: t("pages.forms.formField.props.as"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: t("pages.forms.formField.slots.default") },
  { name: "label", description: t("pages.forms.formField.slots.label") },
  { name: "helper", description: t("pages.forms.formField.slots.helper") },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.formField.title')"
    :category="t('pages.forms.formField.category')"
    import-path="import { FormField } from 'mood-ui'"
    :description="t('pages.forms.formField.description')"
    :props-list="propsList"
    :slots-list="slotsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="220px"
        @reset="resetPlayground"
      >
        <template #controls>
          <!-- Orientation -->
          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline"
              >{{
                t("pages.forms.formField.controls.layout").toUpperCase()
              }}</span
            >
            <div class="flex rounded-md border border-border overflow-hidden">
              <button
                v-for="o in ['vertical', 'horizontal']"
                :key="o"
                type="button"
                class="px-2 py-1 text-xs transition-colors capitalize"
                :class="
                  pgOrientation === o
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/60'
                "
                @click="pgOrientation = o as typeof pgOrientation"
              >
                {{ o }}
              </button>
            </div>
          </div>

          <span class="w-px h-4 bg-border shrink-0" />

          <button
            type="button"
            class="px-2 py-1 rounded-md text-xs border transition-colors"
            :class="
              pgRequired
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            "
            @click="pgRequired = !pgRequired"
          >
            {{ t("pages.forms.formField.controls.required") }}
          </button>

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
            {{ t("pages.forms.formField.controls.disabled") }}
          </button>

          <button
            type="button"
            class="px-2 py-1 rounded-md text-xs border transition-colors"
            :class="
              pgError
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            "
            @click="pgError = !pgError"
          >
            {{ t("pages.forms.formField.controls.error") }}
          </button>
        </template>

        <FormField
          v-slot="{ id, disabled, describedBy, invalid, color }"
          :label="t('pages.forms.formField.playground.label')"
          :helper-text="t('pages.forms.formField.playground.helperText')"
          :orientation="pgOrientation"
          :required="pgRequired"
          :disabled="pgDisabled"
          :error-text="
            pgError
              ? t('pages.forms.formField.playground.errorText')
              : undefined
          "
          full-width
          class="w-80"
        >
          <Input
            :id="id"
            v-model="pgValue"
            :disabled="disabled"
            :aria-describedby="describedBy"
            :invalid="invalid"
            :color="color as 'danger' | undefined"
            :placeholder="t('pages.forms.formField.playground.placeholder')"
            full-width
          />
        </FormField>
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.formField.examples.input.title')"
        :description="t('pages.forms.formField.examples.input.desc')"
        :code="inputCode"
      >
        <FormField
          v-slot="{ id }"
          label="Full name"
          helper-text="As it appears on your ID."
          class="w-72"
        >
          <Input
            :id="id"
            v-model="exName"
            placeholder="Ada Lovelace"
            full-width
          />
        </FormField>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.formField.examples.select.title')"
        :description="t('pages.forms.formField.examples.select.desc')"
        :code="selectCode"
      >
        <FormField v-slot="{ id }" label="Country" required class="w-72">
          <Select
            :id="id"
            v-model="exCountry"
            :options="countries"
            placeholder="Choose a country"
            full-width
          />
        </FormField>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.formField.examples.textarea.title')"
        :description="t('pages.forms.formField.examples.textarea.desc')"
        :code="textareaCode"
      >
        <FormField
          v-slot="{ id }"
          label="Comments"
          hint="Optional"
          class="w-80"
        >
          <Textarea
            :id="id"
            v-model="exMessage"
            :rows="4"
            placeholder="Tell us more…"
            full-width
          />
        </FormField>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.formField.examples.error.title')"
        :description="t('pages.forms.formField.examples.error.desc')"
        :code="errorCode"
      >
        <FormField
          v-slot="{ id, invalid, color }"
          label="Email"
          error-text="Invalid email"
          required
          class="w-72"
        >
          <Input
            :id="id"
            v-model="exEmail"
            :invalid="invalid"
            :color="color as 'danger' | undefined"
            placeholder="tu@email.com"
            full-width
          />
        </FormField>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.formField.examples.horizontal.title')"
        :description="t('pages.forms.formField.examples.horizontal.desc')"
        :code="horizontalCode"
      >
        <FormField
          v-slot="{ id }"
          label="Public URL"
          helper-text="Visible on your profile."
          orientation="horizontal"
          label-width="9rem"
          full-width
          class="max-w-xl"
        >
          <Input :id="id" v-model="exUrl" placeholder="https://…" full-width />
        </FormField>
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
        {{ t("pages.forms.formField.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.formField.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
