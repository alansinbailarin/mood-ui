<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import CodePreview from "../../components/CodePreview.vue";
import Typography from "../../../components/data-display/Typography.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import Drawer from "../../../components/feedback/Drawer.vue";
import Button from "../../../components/forms/Button.vue";
import FormField from "../../../components/forms/FormField.vue";
import Input from "../../../components/forms/Input.vue";
import Textarea from "../../../components/forms/Textarea.vue";
import Select from "../../../components/forms/Select.vue";
import type { PropDoc, EmitDoc, SlotDoc } from "../../types";
import A11yDoc from "../../components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "../../components/A11yDoc.vue";
import TbPills from "../../components/toolbar/TbPills.vue";
import TbToggle from "../../components/toolbar/TbToggle.vue";
import TbSep from "../../components/toolbar/TbSep.vue";

const { t } = useI18n();

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.feedback.drawer.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.feedback.drawer.a11y.kbShiftTab") },
  { keys: ["Escape"], action: t("pages.feedback.drawer.a11y.kbEsc") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: '"dialog"',
    desc: t("pages.feedback.drawer.a11y.ariaDialog"),
  },
  {
    attribute: "aria-modal",
    value: "true",
    desc: t("pages.feedback.drawer.a11y.ariaModal"),
  },
  {
    attribute: "aria-labelledby",
    value: "id",
    desc: t("pages.feedback.drawer.a11y.ariaLabelledBy"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.feedback.drawer.a11y.ariaDescribedBy"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.feedback.drawer.a11y.focusTrap"),
  t("pages.feedback.drawer.a11y.focusReturn"),
]);

type Side = "left" | "right" | "top" | "bottom";
type Size = "small" | "medium" | "large" | "full";

const pgSide = ref<Side>("right");
const pgSize = ref<Size>("medium");
const pgDismissable = ref(true);

const pgOpen = ref(false);
const open1 = ref(false);
const open2 = ref(false);
const open3 = ref(false);
const open4 = ref(false);
const open5 = ref(false);
const formName = ref("");
const formCategory = ref<string | number | null>(null);
const formPriority = ref<string | number | null>(null);
const formDesc = ref("");
const categoryOptions = [
  { value: "web", label: "Web App" },
  { value: "mobile", label: "Mobile App" },
  { value: "backend", label: "Backend Service" },
  { value: "design", label: "Design System" },
];
const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];
function saveProject() {
  open5.value = false;
  formName.value = "";
  formCategory.value = null;
  formPriority.value = null;
  formDesc.value = "";
}

function resetPlayground() {
  pgSide.value = "right";
  pgSize.value = "medium";
  pgDismissable.value = true;
}

const overviewCode = computed(() => {
  const parts: string[] = ['v-model="open"', 'title="Filters"'];
  if (pgSide.value !== "right") parts.push(`side="${pgSide.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (!pgDismissable.value)
    parts.push(':close-on-overlay="false"', ':close-on-escape="false"');
  return `<Drawer ${parts.join(" ")}>
  <p>Drawer content goes here.</p>
</Drawer>`;
});

const sidesCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Drawer } from 'mood-ui';

const open = ref(false);
<\/script>

<template>
  <Drawer v-model="open" side="right" title="Right" />
  <Drawer v-model="open" side="left"   title="Left" />
  <Drawer v-model="open" side="top"    title="Top" />
  <Drawer v-model="open" side="bottom" title="Bottom sheet" />
</template>`;

const contentCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Drawer, Button, FormField, Input, Textarea, Select } from 'mood-ui';
import type { SelectOption } from 'mood-ui';

const open = ref(false);
const name = ref('');
const category = ref<string | number | null>(null);
const priority = ref<string | number | null>(null);
const description = ref('');

const categories: SelectOption[] = [
  { value: 'web',     label: 'Web App' },
  { value: 'mobile',  label: 'Mobile App' },
  { value: 'backend', label: 'Backend Service' },
  { value: 'design',  label: 'Design System' },
];

const priorities: SelectOption[] = [
  { value: 'low',      label: 'Low' },
  { value: 'medium',   label: 'Medium' },
  { value: 'high',     label: 'High' },
  { value: 'critical', label: 'Critical' },
];

function save() {
  open.value = false;
}
<\/script>

<template>
  <Button color="primary" @click="open = true">New Project<\/Button>

  <Drawer
    v-model="open"
    side="right"
    size="large"
    title="New Project"
    description="Fill in the details to create a new project."
  >
    <div class="flex flex-col gap-4">
      <FormField label="Project name" required>
        <Input v-model="name" placeholder="My Awesome Project" />
      <\/FormField>

      <FormField label="Category" required>
        <Select v-model="category" :options="categories" placeholder="Choose a category" full-width />
      <\/FormField>

      <FormField label="Priority">
        <Select v-model="priority" :options="priorities" placeholder="Choose priority" full-width />
      <\/FormField>

      <FormField label="Description" hint="Optional">
        <Textarea v-model="description" placeholder="Brief description of the project…" :rows="4" />
      <\/FormField>
    <\/div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="ghost" @click="open = false">Cancel<\/Button>
        <Button color="primary" @click="save">Create Project<\/Button>
      <\/div>
    <\/template>
  <\/Drawer>
<\/template>`;

const persistentCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Drawer, Typography } from 'mood-ui';

const open = ref(false);
<\/script>

<template>
  <Drawer
    v-model="open"
    side="right"
    title="Wizard"
    :close-on-overlay="false"
    :close-on-escape="false"
  >
    <Typography>Closes only with the explicit button.</Typography>
  </Drawer>
</template>`;

const typesCode = `export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'small' | 'medium' | 'large' | 'full';
export type DrawerOverlay = 'blur' | 'solid' | 'transparent' | 'dark' | 'dim' | 'glass';

export interface Drawer {
  modelValue?: boolean;
  side?: DrawerSide;
  size?: DrawerSize;
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  title?: string;
  description?: string;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  showClose?: boolean;
  lockScroll?: boolean;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  overlay?: DrawerOverlay;
  innerBorder?: boolean;
  id?: string;
  ariaLabel?: string;
}`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "boolean",
    description: t("pages.feedback.drawer.props.modelValue"),
  },
  {
    name: "side",
    type: "'left' | 'right' | 'top' | 'bottom'",
    default: "'right'",
    description: t("pages.feedback.drawer.props.side"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large' | 'full'",
    default: "'medium'",
    description: t("pages.feedback.drawer.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.feedback.drawer.props.radius"),
  },
  {
    name: "title",
    type: "string",
    description: t("pages.feedback.drawer.props.title"),
  },
  {
    name: "description",
    type: "string",
    description: t("pages.feedback.drawer.props.description"),
  },
  {
    name: "closeOnOverlay",
    type: "boolean",
    default: "true",
    description: t("pages.feedback.drawer.props.closeOnOverlay"),
  },
  {
    name: "closeOnEscape",
    type: "boolean",
    default: "true",
    description: t("pages.feedback.drawer.props.closeOnEscape"),
  },
  {
    name: "showClose",
    type: "boolean",
    default: "true",
    description: t("pages.feedback.drawer.props.showClose"),
  },
  {
    name: "lockScroll",
    type: "boolean",
    default: "true",
    description: t("pages.feedback.drawer.props.lockScroll"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",
    description: t("pages.feedback.drawer.props.color"),
  },
  {
    name: "overlay",
    type: "'blur' | 'solid' | 'transparent' | 'dark' | 'dim' | 'glass'",
    default: "'blur'",
    description: t("pages.feedback.drawer.props.overlay"),
  },
  {
    name: "innerBorder",
    type: "boolean",
    default: "false",
    description: t("pages.feedback.drawer.props.innerBorder"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.feedback.drawer.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "boolean",
    description: t("pages.feedback.drawer.emits.updateModelValue"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: t("pages.feedback.drawer.slots.default") },
  { name: "header", description: t("pages.feedback.drawer.slots.header") },
  { name: "footer", description: t("pages.feedback.drawer.slots.footer") },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.feedback.drawer.title')"
    category="Feedback"
    import-path="import { Drawer } from 'mood-ui'"
    :description="t('pages.feedback.drawer.description')"
    :props-list="propsList"
    :emits-list="emitsList"
    :slots-list="slotsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="220px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('pages.feedback.drawer.controls.side')"
            :options="[
              { value: 'left' },
              { value: 'right' },
              { value: 'top' },
              { value: 'bottom' },
            ]"
            v-model="pgSide"
          />
          <TbSep />
          <TbPills
            :label="t('pages.feedback.drawer.controls.size')"
            :options="[
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
              { value: 'full' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbToggle
            :label="t('pages.feedback.drawer.controls.dismissable')"
            v-model="pgDismissable"
          />
        </template>

        <Button color="primary" @click="pgOpen = true">{{
          t("pages.feedback.drawer.playground.open")
        }}</Button>
        <Drawer
          v-model="pgOpen"
          :side="pgSide"
          :size="pgSize"
          :close-on-overlay="pgDismissable"
          :close-on-escape="pgDismissable"
          :title="t('pages.feedback.drawer.playground.title')"
          :description="t('pages.feedback.drawer.playground.description')"
        >
          <Typography>{{
            t("pages.feedback.drawer.playground.content")
          }}</Typography>
        </Drawer>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.feedback.drawer.examples.right.title')"
        :description="t('pages.feedback.drawer.examples.right.desc')"
        :code="`<Drawer v-model='open' side='right' title='Filters' />`"
        min-height="180px"
      >
        <Button @click="open1 = true">{{
          t("pages.feedback.drawer.examples.right.cta")
        }}</Button>
        <Drawer
          v-model="open1"
          side="right"
          :title="t('pages.feedback.drawer.examples.right.drawerTitle')"
          :description="t('pages.feedback.drawer.examples.right.drawerDesc')"
        >
          <Typography>{{
            t("pages.feedback.drawer.playground.content")
          }}</Typography>
        </Drawer>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.drawer.examples.left.title')"
        :description="t('pages.feedback.drawer.examples.left.desc')"
        :code="`<Drawer v-model='open' side='left' title='Menu' />`"
        min-height="180px"
      >
        <Button @click="open2 = true">{{
          t("pages.feedback.drawer.examples.left.cta")
        }}</Button>
        <Drawer
          v-model="open2"
          side="left"
          :title="t('pages.feedback.drawer.examples.left.drawerTitle')"
        >
          <Typography>{{
            t("pages.feedback.drawer.examples.left.content")
          }}</Typography>
        </Drawer>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.drawer.examples.sides.title')"
        :description="t('pages.feedback.drawer.examples.sides.desc')"
        :code="sidesCode"
        min-height="180px"
      >
        <Button @click="open3 = true">{{
          t("pages.feedback.drawer.examples.sides.ctaTop")
        }}</Button>
        <Button @click="open4 = true">{{
          t("pages.feedback.drawer.examples.sides.ctaBottom")
        }}</Button>
        <Drawer
          v-model="open3"
          side="top"
          :title="t('pages.feedback.drawer.examples.sides.topTitle')"
        >
          <Typography>{{
            t("pages.feedback.drawer.playground.content")
          }}</Typography>
        </Drawer>
        <Drawer
          v-model="open4"
          side="bottom"
          :title="t('pages.feedback.drawer.examples.sides.bottomTitle')"
        >
          <Typography>{{
            t("pages.feedback.drawer.examples.sides.bottomContent")
          }}</Typography>
        </Drawer>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.drawer.examples.form.title')"
        :description="t('pages.feedback.drawer.examples.form.desc')"
        :code="contentCode"
        min-height="180px"
      >
        <Button color="primary" @click="open5 = true">{{
          t("pages.feedback.drawer.examples.form.cta")
        }}</Button>
        <Drawer
          v-model="open5"
          side="right"
          size="large"
          :title="t('pages.feedback.drawer.examples.form.drawerTitle')"
          :description="t('pages.feedback.drawer.examples.form.drawerDesc')"
        >
          <div class="flex flex-col gap-4">
            <FormField label="Project name" required>
              <Input v-model="formName" placeholder="My Awesome Project" />
            </FormField>

            <FormField label="Category" required>
              <Select
                v-model="formCategory"
                :options="categoryOptions"
                placeholder="Choose a category"
                full-width
              />
            </FormField>

            <FormField label="Priority">
              <Select
                v-model="formPriority"
                :options="priorityOptions"
                placeholder="Choose priority"
                full-width
              />
            </FormField>

            <FormField label="Description" hint="Optional">
              <Textarea
                v-model="formDesc"
                placeholder="Brief description of the project…"
                :rows="4"
              />
            </FormField>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <Button variant="ghost" @click="open5 = false">Cancel</Button>
              <Button color="primary" @click="saveProject"
                >Create Project</Button
              >
            </div>
          </template>
        </Drawer>
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
        {{ t("pages.feedback.drawer.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.feedback.drawer.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
