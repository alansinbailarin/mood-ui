<script setup lang="ts">
import { ref, computed } from "vue";
import { PhoneInput, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import type { PropDoc, EmitDoc } from "~/types/component-doc";
import A11yDoc from "~/components/A11yDoc.vue";
import type { A11yKeyboardRow, A11yAriaRow } from "~/components/A11yDoc.vue";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbDots from "~/components/toolbar/TbDots.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();

// ── A11y data ──────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.forms.phoneInput.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.phoneInput.a11y.kbShiftTab") },
  { keys: ["Enter", "Space"], action: t("pages.forms.phoneInput.a11y.kbEnterSpace") },
  { keys: ["↓"], action: t("pages.forms.phoneInput.a11y.kbArrowDown") },
  { keys: ["↑"], action: t("pages.forms.phoneInput.a11y.kbArrowUp") },
  { keys: ["Enter"], action: t("pages.forms.phoneInput.a11y.kbEnterSelect") },
  { keys: ["Escape"], action: t("pages.forms.phoneInput.a11y.kbEscape") },
  { keys: ["Type"], action: t("pages.forms.phoneInput.a11y.kbType") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-invalid",
    value: "true",
    desc: t("pages.forms.phoneInput.a11y.ariaInvalid"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.forms.phoneInput.a11y.ariaDescribedBy"),
  },
  {
    attribute: "aria-required",
    value: "true",
    desc: t("pages.forms.phoneInput.a11y.ariaRequired"),
  },
  {
    attribute: "aria-expanded",
    value: "true | false",
    desc: t("pages.forms.phoneInput.a11y.ariaExpanded"),
  },
  {
    attribute: "aria-haspopup",
    value: "listbox",
    desc: t("pages.forms.phoneInput.a11y.ariaHasPopup"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.phoneInput.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.phoneInput.a11y.focusComposite"),
  t("pages.forms.phoneInput.a11y.focusDropdown"),
]);

// ── Overview playground state ──────────────────────────────────────────────────
const pgValue = ref("");
const pgCountry = ref("US");
const pgVariant = ref<"outline" | "filled" | "ghost">("outline");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">("default");
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgDisabled = ref(false);
const pgReadonly = ref(false);
const pgLoading = ref(false);

function resetPlayground() {
  pgValue.value = "";
  pgCountry.value = "US";
  pgVariant.value = "outline";
  pgColor.value = "default";
  pgSize.value = "medium";
  pgDisabled.value = false;
  pgReadonly.value = false;
  pgLoading.value = false;
}

const colorDots = [
  { value: "default" as const, bg: "var(--color-slate-400)", label: "Default" },
  { value: "primary" as const, bg: "var(--primary)", label: "Primary" },
  { value: "success" as const, bg: "var(--color-emerald-500)", label: "Success" },
  { value: "warning" as const, bg: "var(--color-amber-500)", label: "Warning" },
  { value: "danger" as const, bg: "var(--color-red-500)", label: "Danger" },
];

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgVariant.value !== "outline") parts.push(`variant="${pgVariant.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgDisabled.value) parts.push(':disabled="true"');
  if (pgReadonly.value) parts.push(':readonly="true"');
  if (pgLoading.value) parts.push(':loading="true"');
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<PhoneInput v-model="phone" v-model:country="country" label="Phone"${attrs} />`;
});

// ── Example code strings (self-contained) ──────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { PhoneInput } from 'mood-ui';

const phone = ref('');
<\/script>

<template>
  <PhoneInput v-model="phone" label="Phone" placeholder="555 123 4567" />
</template>`;

const countryCode = `<script setup lang="ts">
import { ref } from 'vue';
import { PhoneInput } from 'mood-ui';

const phone = ref('');
const country = ref('ES');
<\/script>

<template>
  <div class="flex flex-col gap-1">
    <PhoneInput
      v-model="phone"
      v-model:country="country"
      label="Phone"
    />
    <span class="text-caption text-muted-foreground">
      Country: {{ country }} · Value: {{ phone }}
    </span>
  </div>
</template>`;

const formatsCode = `<script setup lang="ts">
import { ref } from 'vue';
import { PhoneInput } from 'mood-ui';

const national = ref('');
const international = ref('');
const e164 = ref('');
<\/script>

<template>
  <PhoneInput v-model="national"      format="national"     label="National" />
  <PhoneInput v-model="international" format="international" label="International" />
  <PhoneInput v-model="e164"          format="e164"         label="E.164" />
</template>`;

const statesCode = `<script setup lang="ts">
import { PhoneInput } from 'mood-ui';
<\/script>

<template>
  <PhoneInput disabled label="Disabled" />
  <PhoneInput readonly model-value="555 123 4567" label="Readonly" />
  <PhoneInput
    model-value="abc"
    error-text="Invalid phone number"
    label="Error"
  />
</template>`;

const variantsCode = `<script setup lang="ts">
import { PhoneInput } from 'mood-ui';
<\/script>

<template>
  <PhoneInput variant="outline" label="Outline" />
  <PhoneInput variant="filled"  label="Filled"  />
  <PhoneInput variant="ghost"   label="Ghost"   />
</template>`;

const sizesCode = `<script setup lang="ts">
import { PhoneInput } from 'mood-ui';
<\/script>

<template>
  <PhoneInput size="small"  label="Small"  />
  <PhoneInput size="medium" label="Medium" />
  <PhoneInput size="large"  label="Large"  />
</template>`;

// ── Example state ──────────────────────────────────────────────────────────────
const exBasic = ref("");
const exCountryPhone = ref("");
const exCountry = ref("ES");
const exNational = ref("");
const exIntl = ref("");
const exE164 = ref("");

// ── Types string ───────────────────────────────────────────────────────────────
const typesCode = `export interface PhoneInput {
  modelValue?: string;
  country?: string;
  defaultCountry?: string;
  format?: 'national' | 'international' | 'e164';
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
  name?: string;
  id?: string;
  autocomplete?: string;
  autofocus?: boolean;
  ariaLabel?: string;
  invalid?: boolean;
  ariaDescribedBy?: string;
}

export interface PhoneCountry {
  iso: string;   // ISO 3166-1 alpha-2 (e.g. 'US', 'ES')
  dial: string;  // Dial code without '+' (e.g. '1', '34')
  name: string;  // English country name
}`;

// ── API docs ───────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "string",
    description: t("pages.forms.phoneInput.props.modelValue"),
  },
  {
    name: "country",
    type: "string",
    description: t("pages.forms.phoneInput.props.country"),
  },
  {
    name: "defaultCountry",
    type: "string",
    default: "'US'",
    description: t("pages.forms.phoneInput.props.defaultCountry"),
  },
  {
    name: "format",
    type: "'national' | 'international' | 'e164'",
    default: "'national'",
    description: t("pages.forms.phoneInput.props.format"),
  },
  {
    name: "label",
    type: "string",
    description: t("pages.forms.phoneInput.props.label"),
  },
  {
    name: "placeholder",
    type: "string",
    description: t("pages.forms.phoneInput.props.placeholder"),
  },
  {
    name: "helperText",
    type: "string",
    description: t("pages.forms.phoneInput.props.helperText"),
  },
  {
    name: "errorText",
    type: "string",
    description: t("pages.forms.phoneInput.props.errorText"),
  },
  {
    name: "variant",
    type: "'outline' | 'filled' | 'ghost'",
    default: "'outline'",
    description: t("pages.forms.phoneInput.props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.forms.phoneInput.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.phoneInput.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.forms.phoneInput.props.radius"),
  },
  {
    name: "halo",
    type: "'tinted' | 'neutral' | 'off'",
    description: t("pages.forms.phoneInput.props.halo"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.forms.phoneInput.props.fullWidth"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.phoneInput.props.disabled"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: t("pages.forms.phoneInput.props.readonly"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: t("pages.forms.phoneInput.props.required"),
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: t("pages.forms.phoneInput.props.loading"),
  },
  {
    name: "name",
    type: "string",
    description: t("pages.forms.phoneInput.props.name"),
  },
  {
    name: "id",
    type: "string",
    description: t("pages.forms.phoneInput.props.id"),
  },
  {
    name: "autocomplete",
    type: "string",
    default: "'tel-national'",
    description: t("pages.forms.phoneInput.props.autocomplete"),
  },
  {
    name: "autofocus",
    type: "boolean",
    default: "false",
    description: t("pages.forms.phoneInput.props.autofocus"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.forms.phoneInput.props.ariaLabel"),
  },
  {
    name: "invalid",
    type: "boolean",
    description: t("pages.forms.phoneInput.props.invalid"),
  },
  {
    name: "ariaDescribedBy",
    type: "string",
    description: t("pages.forms.phoneInput.props.ariaDescribedBy"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "string",
    description: t("pages.forms.phoneInput.emits.updateModelValue"),
  },
  {
    name: "update:country",
    payload: "string",
    description: t("pages.forms.phoneInput.emits.updateCountry"),
  },
  {
    name: "change",
    payload: "string",
    description: t("pages.forms.phoneInput.emits.change"),
  },
  {
    name: "focus",
    payload: "FocusEvent",
    description: t("pages.forms.phoneInput.emits.focus"),
  },
  {
    name: "blur",
    payload: "FocusEvent",
    description: t("pages.forms.phoneInput.emits.blur"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.phoneInput.title')"
    category="Forms"
    import-path="import { PhoneInput } from 'mood-ui'"
    :description="t('pages.forms.phoneInput.description')"
    :props-list="propsList"
    :emits-list="emitsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="180px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('pages.forms.phoneInput.controls.variant')"
            :options="[{ value: 'outline' }, { value: 'filled' }, { value: 'ghost' }]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbDots
            :label="t('pages.forms.phoneInput.controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('pages.forms.phoneInput.controls.size')"
            :options="[{ value: 'xsmall' }, { value: 'small' }, { value: 'medium' }, { value: 'large' }]"
            v-model="pgSize"
          />
          <TbSep />
          <TbToggle :label="t('pages.forms.phoneInput.controls.loading')" v-model="pgLoading" />
          <TbToggle :label="t('pages.forms.phoneInput.controls.disabled')" v-model="pgDisabled" />
          <TbToggle :label="t('pages.forms.phoneInput.controls.readonly')" v-model="pgReadonly" />
        </template>

        <PhoneInput
          v-model="pgValue"
          v-model:country="pgCountry"
          :label="t('pages.forms.phoneInput.playground.label')"
          :placeholder="t('pages.forms.phoneInput.playground.placeholder')"
          :variant="pgVariant"
          :color="pgColor"
          :size="pgSize"
          :disabled="pgDisabled"
          :readonly="pgReadonly"
          :loading="pgLoading"
          style="width: 300px"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <!-- Basic -->
      <ComponentPreview
        :title="t('pages.forms.phoneInput.examples.basic.title')"
        :description="t('pages.forms.phoneInput.examples.basic.desc')"
        :code="basicCode"
      >
        <PhoneInput
          v-model="exBasic"
          :label="t('pages.forms.phoneInput.examples.basic.label')"
          placeholder="555 123 4567"
          style="width: 300px"
        />
      </ComponentPreview>

      <!-- Controlled country -->
      <ComponentPreview
        :title="t('pages.forms.phoneInput.examples.country.title')"
        :description="t('pages.forms.phoneInput.examples.country.desc')"
        :code="countryCode"
      >
        <div class="flex flex-col gap-1.5">
          <PhoneInput
            v-model="exCountryPhone"
            v-model:country="exCountry"
            :label="t('pages.forms.phoneInput.examples.country.label')"
            style="width: 300px"
          />
          <span class="text-caption text-muted-foreground">
            {{ t('pages.forms.phoneInput.examples.country.countryLabel') }}: {{ exCountry }}
            &nbsp;·&nbsp; Value: {{ exCountryPhone || '—' }}
          </span>
        </div>
      </ComponentPreview>

      <!-- Output formats -->
      <ComponentPreview
        :title="t('pages.forms.phoneInput.examples.formats.title')"
        :description="t('pages.forms.phoneInput.examples.formats.desc')"
        :code="formatsCode"
      >
        <div class="flex flex-col gap-4 w-full max-w-sm">
          <div class="flex flex-col gap-1">
            <PhoneInput
              v-model="exNational"
              format="national"
              :label="t('pages.forms.phoneInput.examples.formats.nationalLabel')"
            />
            <span class="text-caption text-muted-foreground font-mono">{{ exNational || '—' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <PhoneInput
              v-model="exIntl"
              format="international"
              :label="t('pages.forms.phoneInput.examples.formats.intlLabel')"
            />
            <span class="text-caption text-muted-foreground font-mono">{{ exIntl || '—' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <PhoneInput
              v-model="exE164"
              format="e164"
              :label="t('pages.forms.phoneInput.examples.formats.e164Label')"
            />
            <span class="text-caption text-muted-foreground font-mono">{{ exE164 || '—' }}</span>
          </div>
        </div>
      </ComponentPreview>

      <!-- States -->
      <ComponentPreview
        :title="t('pages.forms.phoneInput.examples.states.title')"
        :description="t('pages.forms.phoneInput.examples.states.desc')"
        :code="statesCode"
      >
        <PhoneInput
          disabled
          :label="t('pages.forms.phoneInput.examples.states.disabledLabel')"
          style="width: 280px"
        />
        <PhoneInput
          readonly
          model-value="555 123 4567"
          :label="t('pages.forms.phoneInput.examples.states.readonlyLabel')"
          style="width: 280px"
        />
        <PhoneInput
          model-value="abc"
          :error-text="t('pages.forms.phoneInput.examples.states.errorText')"
          :label="t('pages.forms.phoneInput.examples.states.errorLabel')"
          style="width: 280px"
        />
      </ComponentPreview>

      <!-- Variants -->
      <ComponentPreview
        :title="t('pages.forms.phoneInput.examples.variants.title')"
        :description="t('pages.forms.phoneInput.examples.variants.desc')"
        :code="variantsCode"
      >
        <PhoneInput variant="outline" :label="t('pages.forms.phoneInput.examples.variants.label') + ' (outline)'" style="width: 260px" />
        <PhoneInput variant="filled"  :label="t('pages.forms.phoneInput.examples.variants.label') + ' (filled)'"  style="width: 260px" />
        <PhoneInput variant="ghost"   :label="t('pages.forms.phoneInput.examples.variants.label') + ' (ghost)'"   style="width: 260px" />
      </ComponentPreview>

      <!-- Sizes -->
      <ComponentPreview
        :title="t('pages.forms.phoneInput.examples.sizes.title')"
        :description="t('pages.forms.phoneInput.examples.sizes.desc')"
        :code="sizesCode"
      >
        <PhoneInput size="small"  :label="t('pages.forms.phoneInput.examples.sizes.label') + ' (small)'"  style="width: 280px" />
        <PhoneInput size="medium" :label="t('pages.forms.phoneInput.examples.sizes.label') + ' (medium)'" style="width: 280px" />
        <PhoneInput size="large"  :label="t('pages.forms.phoneInput.examples.sizes.label') + ' (large)'"  style="width: 280px" />
      </ComponentPreview>
    </template>

    <!-- ── A11y ─────────────────────────────────────────────────────────── -->
    <template #a11y>
      <A11yDoc
        :keyboard-rows="a11yKeyboard"
        :aria-rows="a11yAria"
        :focus-notes="a11yFocus"
      />
    </template>

    <!-- ── Extra (Types) ─────────────────────────────────────────────────── -->
    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.forms.phoneInput.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.phoneInput.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
