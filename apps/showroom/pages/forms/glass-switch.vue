<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { GlassSwitch, Typography } from "mood-ui";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";
import A11yDoc from "~/components/A11yDoc.vue";
import type { A11yKeyboardRow, A11yAriaRow } from "~/components/A11yDoc.vue";
import type { PropDoc, EmitDoc } from "~/types/component-doc";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbDots from "~/components/toolbar/TbDots.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();
const k = (key: string) => t(`pages.forms.glassSwitch.${key}`);

type Color = "default" | "primary" | "success" | "warning" | "danger";
type Size = "xsmall" | "small" | "medium" | "large";
type Radius = "none" | "small" | "medium" | "large" | "full";

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: k("a11y.kbTab") },
  { keys: ["Shift+Tab"], action: k("a11y.kbShiftTab") },
  { keys: ["Space"], action: k("a11y.kbSpace") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  { attribute: "role", value: '"switch"', desc: k("a11y.roleSwitch") },
  { attribute: "aria-invalid", value: "true", desc: k("a11y.ariaInvalid") },
  { attribute: "aria-describedby", value: "id", desc: k("a11y.ariaDescribedBy") },
  { attribute: "aria-readonly", value: "true", desc: k("a11y.ariaReadonly") },
  { attribute: "aria-label", value: "string", desc: k("a11y.ariaLabel") },
]);

const a11yFocus = computed<string[]>(() => [
  k("a11y.focusNative"),
  k("a11y.focusDrag"),
  k("a11y.focusReducedMotion"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
// Size and radius start undefined so the switch follows the showroom's
// ModoProvider (the track radius falls back to a pill).
const pgChecked = ref(true);
const pgColor = ref<Color>("primary");
const pgSize = ref<Size | undefined>(undefined);
const pgRadius = ref<Radius | undefined>(undefined);
const pgLabelPos = ref<"left" | "right">("right");
const pgLoading = ref(false);
const pgReadonly = ref(false);
const pgDisabled = ref(false);

function resetPlayground() {
  pgChecked.value = true;
  pgColor.value = "primary";
  pgSize.value = undefined;
  pgRadius.value = undefined;
  pgLabelPos.value = "right";
  pgLoading.value = false;
  pgReadonly.value = false;
  pgDisabled.value = false;
}

const colorDots = computed(() => [
  { value: "default", bg: "var(--color-slate-400)", label: k("controls.colors.default") },
  { value: "primary", bg: "var(--primary)", label: k("controls.colors.primary") },
  { value: "success", bg: "var(--color-emerald-500)", label: k("controls.colors.success") },
  { value: "warning", bg: "var(--color-amber-500)", label: k("controls.colors.warning") },
  { value: "danger", bg: "var(--color-red-500)", label: k("controls.colors.danger") },
]);

const exampleColors: Color[] = ["primary", "success", "warning", "danger"];
const exampleSizes: Size[] = ["xsmall", "small", "medium", "large"];

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value) parts.push(`size="${pgSize.value}"`);
  if (pgRadius.value) parts.push(`radius="${pgRadius.value}"`);
  if (pgLabelPos.value !== "right")
    parts.push(`label-position="${pgLabelPos.value}"`);
  if (pgLoading.value) parts.push("loading");
  if (pgReadonly.value) parts.push("readonly");
  if (pgDisabled.value) parts.push("disabled");
  const attrs = parts.length ? "\n  " + parts.join("\n  ") : "";
  return `<GlassSwitch
  v-model="checked"
  label="Notifications"
  description="Push and email updates."${attrs}
/>`;
});

// ── Example state ─────────────────────────────────────────────────────────────
const ex1A = ref(true);
const ex1B = ref(false);
const exLeft = ref(true);
const exHelper = ref(true);
const exError = ref(false);

// ── Example code strings (self-contained) ─────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { GlassSwitch } from 'mood-ui';

const pushEnabled = ref(true);
const darkMode    = ref(false);
<\/script>

<template>
  <GlassSwitch v-model="pushEnabled" label="Push notifications" />
  <GlassSwitch v-model="darkMode"    label="Dark mode" />
</template>`;

const descriptionCode = `<script setup lang="ts">
import { GlassSwitch } from 'mood-ui';
<\/script>

<template>
  <GlassSwitch
    label="Marketing"
    description="Receive product news and updates."
    default-checked
  />
</template>`;

const labelLeftCode = `<script setup lang="ts">
import { ref } from 'vue';
import { GlassSwitch } from 'mood-ui';

const active = ref(true);
<\/script>

<template>
  <GlassSwitch v-model="active" label="Active" label-position="left" full-width />
</template>`;

const validationCode = `<script setup lang="ts">
import { ref } from 'vue';
import { GlassSwitch } from 'mood-ui';

const digest = ref(true);
const terms  = ref(false);
<\/script>

<template>
  <GlassSwitch
    v-model="digest"
    label="Weekly digest"
    helper-text="Sent every Monday morning."
  />
  <GlassSwitch
    v-model="terms"
    label="Accept the terms"
    required
    :error-text="terms ? undefined : 'You need to accept the terms to continue.'"
  />
</template>`;

const colorsCode = `<script setup lang="ts">
import { GlassSwitch } from 'mood-ui';
<\/script>

<template>
  <GlassSwitch default-checked color="primary" label="Primary" />
  <GlassSwitch default-checked color="success" label="Success" />
  <GlassSwitch default-checked color="warning" label="Warning" />
  <GlassSwitch default-checked color="danger"  label="Danger" />
</template>`;

const sizesCode = `<script setup lang="ts">
import { GlassSwitch } from 'mood-ui';
<\/script>

<template>
  <GlassSwitch default-checked size="xsmall" label="xsmall" />
  <GlassSwitch default-checked size="small"  label="small" />
  <GlassSwitch default-checked size="medium" label="medium" />
  <GlassSwitch default-checked size="large"  label="large" />
</template>`;

const statesCode = `<script setup lang="ts">
import { GlassSwitch } from 'mood-ui';
<\/script>

<template>
  <GlassSwitch :model-value="true"  disabled label="Disabled on" />
  <GlassSwitch :model-value="false" disabled label="Disabled off" />
  <GlassSwitch :model-value="true"  readonly label="Read only" />
</template>`;

const uncontrolledCode = `<script setup lang="ts">
import { GlassSwitch } from 'mood-ui';
<\/script>

<template>
  <form>
    <!-- Submits newsletter=yes only while checked; reset restores defaultChecked -->
    <GlassSwitch
      name="newsletter"
      value="yes"
      default-checked
      label="Subscribe to the newsletter"
    />
  </form>
</template>`;

const typesCode = `export interface GlassSwitchProps {
  modelValue?: boolean;
  defaultChecked?: boolean;
  label?: string;
  description?: string;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  loading?: boolean;
  labelPosition?: 'left' | 'right';
  fullWidth?: boolean;
  id?: string;
  name?: string;
  value?: string;
  ariaLabel?: string;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  { name: "modelValue", type: "boolean", description: k("props.modelValue") },
  {
    name: "defaultChecked",
    type: "boolean",
    default: "false",
    description: k("props.defaultChecked"),
  },
  { name: "label", type: "string", description: k("props.label") },
  { name: "description", type: "string", description: k("props.description") },
  { name: "helperText", type: "string", description: k("props.helperText") },
  { name: "errorText", type: "string", description: k("props.errorText") },
  {
    name: "invalid",
    type: "boolean",
    default: "false",
    description: k("props.invalid"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: k("props.color"),
  },
  {
    name: "size",
    type: "'xsmall' | 'small' | 'medium' | 'large'",
    default: "ModoProvider",
    description: k("props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    default: "'full'",
    description: k("props.radius"),
  },
  {
    name: "labelPosition",
    type: "'left' | 'right'",
    default: "'right'",
    description: k("props.labelPosition"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: k("props.fullWidth"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: k("props.disabled"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: k("props.readonly"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: k("props.required"),
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: k("props.loading"),
  },
  { name: "name", type: "string", description: k("props.name") },
  {
    name: "value",
    type: "string",
    default: "'on'",
    description: k("props.value"),
  },
  { name: "id", type: "string", description: k("props.id") },
  { name: "ariaLabel", type: "string", description: k("props.ariaLabel") },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "boolean",
    description: k("emits.updateModelValue"),
  },
  { name: "change", payload: "boolean", description: k("emits.change") },
]);
</script>

<template>
  <ComponentDoc
    :title="k('title')"
    :category="k('category')"
    import-path="import { GlassSwitch } from 'mood-ui'"
    :description="k('description')"
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
          <TbDots
            v-model="pgColor"
            :label="k('controls.color')"
            :options="colorDots"
          />
          <TbSep />
          <TbPills
            v-model="pgSize"
            :label="k('controls.size')"
            :options="[
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
          />
          <TbSep />
          <TbPills
            v-model="pgRadius"
            :label="k('controls.radius')"
            :options="[
              { value: 'none' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
              { value: 'full' },
            ]"
          />
          <TbSep />
          <TbPills
            v-model="pgLabelPos"
            :label="k('controls.label')"
            :options="[{ value: 'left' }, { value: 'right' }]"
          />
          <TbSep />
          <TbToggle v-model="pgLoading" :label="k('controls.loading')" />
          <TbToggle v-model="pgReadonly" :label="k('controls.readonly')" />
          <TbToggle v-model="pgDisabled" :label="k('controls.disabled')" />
        </template>

        <GlassSwitch
          v-model="pgChecked"
          :label="k('playground.label')"
          :description="k('playground.description')"
          :color="pgColor"
          :size="pgSize"
          :radius="pgRadius"
          :label-position="pgLabelPos"
          :loading="pgLoading"
          :readonly="pgReadonly"
          :disabled="pgDisabled"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="k('examples.basic.title')"
        :description="k('examples.basic.desc')"
        :code="basicCode"
      >
        <div class="flex flex-col gap-3">
          <GlassSwitch v-model="ex1A" :label="k('examples.basic.pushLabel')" />
          <GlassSwitch v-model="ex1B" :label="k('examples.basic.darkLabel')" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.description.title')"
        :description="k('examples.description.desc')"
        :code="descriptionCode"
      >
        <GlassSwitch
          :label="k('examples.description.label')"
          :description="k('examples.description.description')"
          default-checked
        />
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.labelLeft.title')"
        :description="k('examples.labelLeft.desc')"
        :code="labelLeftCode"
      >
        <div class="w-full max-w-sm">
          <GlassSwitch
            v-model="exLeft"
            :label="k('examples.labelLeft.label')"
            label-position="left"
            full-width
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.validation.title')"
        :description="k('examples.validation.desc')"
        :code="validationCode"
      >
        <div class="flex flex-col gap-4">
          <GlassSwitch
            v-model="exHelper"
            :label="k('examples.validation.helperLabel')"
            :helper-text="k('examples.validation.helperText')"
          />
          <GlassSwitch
            v-model="exError"
            :label="k('examples.validation.errorLabel')"
            required
            :error-text="exError ? undefined : k('examples.validation.errorText')"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.colors.title')"
        :description="k('examples.colors.desc')"
        :code="colorsCode"
      >
        <GlassSwitch
          v-for="c in exampleColors"
          :key="c"
          default-checked
          :color="c"
          :label="k(`controls.colors.${c}`)"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.sizes.title')"
        :description="k('examples.sizes.desc')"
        :code="sizesCode"
      >
        <GlassSwitch
          v-for="s in exampleSizes"
          :key="s"
          default-checked
          :size="s"
          :label="s"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.states.title')"
        :description="k('examples.states.desc')"
        :code="statesCode"
      >
        <GlassSwitch
          :model-value="true"
          disabled
          :label="k('examples.states.disabledOn')"
        />
        <GlassSwitch
          :model-value="false"
          disabled
          :label="k('examples.states.disabledOff')"
        />
        <GlassSwitch
          :model-value="true"
          readonly
          :label="k('examples.states.readonly')"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.uncontrolled.title')"
        :description="k('examples.uncontrolled.desc')"
        :code="uncontrolledCode"
      >
        <form @submit.prevent>
          <GlassSwitch
            name="newsletter"
            value="yes"
            default-checked
            :label="k('examples.uncontrolled.label')"
          />
        </form>
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
        {{ k("types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ k("types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
