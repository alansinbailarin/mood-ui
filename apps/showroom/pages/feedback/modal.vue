<script setup lang="ts">
import { ref, computed } from "vue";
import { Button, FormField, Input, Modal, Select, Textarea, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import CodePreview from "~/components/CodePreview.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";







import type { PropDoc, EmitDoc, SlotDoc } from "~/types/component-doc";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();


useSeoMeta({
  title: () => t("pages.feedback.modal.title"),
  description: () => t("pages.feedback.modal.description"),
  ogTitle: () => `${t("pages.feedback.modal.title")} · mood-ui`,
  ogDescription: () => t("pages.feedback.modal.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.feedback.modal.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.feedback.modal.a11y.kbShiftTab") },
  { keys: ["Escape"], action: t("pages.feedback.modal.a11y.kbEsc") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: '"dialog"',
    desc: t("pages.feedback.modal.a11y.ariaDialog"),
  },
  {
    attribute: "aria-modal",
    value: "true",
    desc: t("pages.feedback.modal.a11y.ariaModal"),
  },
  {
    attribute: "aria-labelledby",
    value: "id",
    desc: t("pages.feedback.modal.a11y.ariaLabelledBy"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.feedback.modal.a11y.ariaDescribedBy"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.feedback.modal.a11y.focusTrap"),
  t("pages.feedback.modal.a11y.focusReturn"),
]);

type Size = "xsmall" | "small" | "medium" | "large" | "xlarge";

const pgSize = ref<Size>("medium");
const pgOverlay = ref<"blur" | "dim" | "solid" | "transparent">("blur");
const pgCentered = ref(true);
const pgClosable = ref(true);

const pgOpen = ref(false);
const open1 = ref(false);
const open2 = ref(false);
const open3 = ref(false);
const open4 = ref(false);
const open5 = ref(false);
const modalName = ref("");
const modalType = ref<string | number | null>(null);
const modalDesc = ref("");
const projectTypeOptions = [
  { value: "feature", label: "Feature" },
  { value: "bug", label: "Bug fix" },
  { value: "refactor", label: "Refactor" },
  { value: "research", label: "Research" },
];
function submitProject() {
  open2.value = false;
  modalName.value = "";
  modalType.value = null;
  modalDesc.value = "";
}

function resetPlayground() {
  pgSize.value = "medium";
  pgOverlay.value = "blur";
  pgCentered.value = true;
  pgClosable.value = true;
}

const overviewCode = computed(() => {
  const parts: string[] = ['v-model="open"', 'title="Confirm action"'];
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgOverlay.value !== "blur") parts.push(`overlay="${pgOverlay.value}"`);
  if (!pgCentered.value) parts.push('position="top"');
  if (!pgClosable.value)
    parts.push(
      ':show-close="false"',
      ':close-on-overlay="false"',
      ':close-on-escape="false"',
    );
  return `<Modal ${parts.join(" ")}>
  <p>Do you want to apply these changes?</p>
</Modal>`;
});

const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Modal, Button, Typography } from 'mood-ui';

const open = ref(false);
<\/script>

<template>
  <Button @click="open = true">Open modal</Button>
  <Modal v-model="open" title="Confirm" description="Do you want to apply these changes?">
    <Typography>The change is reversible from the history.</Typography>
    <template #footer>
      <Button variant="ghost" @click="open = false">Cancel</Button>
      <Button color="primary" @click="open = false">Apply</Button>
    </template>
  </Modal>
</template>`;

const formCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Modal, Button, FormField, Input, Textarea, Select } from 'mood-ui';
import type { SelectOption } from 'mood-ui';

const open = ref(false);
const name = ref('');
const type = ref<string | number | null>(null);
const description = ref('');

const typeOptions: SelectOption[] = [
  { value: 'feature',  label: 'Feature' },
  { value: 'bug',      label: 'Bug fix' },
  { value: 'refactor', label: 'Refactor' },
  { value: 'research', label: 'Research' },
];

function submit() {
  open.value = false;
}
<\/script>

<template>
  <Button color="primary" @click="open = true">New project<\/Button>

  <Modal v-model="open" size="medium" title="New project" description="Create a new project to track your work.">
    <div class="flex flex-col gap-4">
      <FormField label="Project name" required>
        <Input v-model="name" placeholder="My Awesome Project" />
      <\/FormField>

      <FormField label="Type" required>
        <Select v-model="type" :options="typeOptions" placeholder="Choose a type" full-width />
      <\/FormField>

      <FormField label="Description" hint="Optional">
        <Textarea v-model="description" placeholder="What is this project about?" :rows="3" />
      <\/FormField>
    <\/div>

    <template #footer>
      <Button variant="ghost" @click="open = false">Cancel<\/Button>
      <Button color="primary" @click="submit">Create project<\/Button>
    <\/template>
  <\/Modal>
<\/template>`;

const lockedCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Modal, Button, Typography } from 'mood-ui';

const open = ref(false);
<\/script>

<template>
  <Modal
    v-model="open"
    title="Critical action"
    color="danger"
    :close-on-overlay="false"
    :close-on-escape="false"
  >
    <Typography>Closes only with the explicit button.</Typography>
    <template #footer>
      <Button color="danger" @click="open = false">Understood</Button>
    </template>
  </Modal>
</template>`;

const fullCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Modal, Typography } from 'mood-ui';

const open = ref(false);
<\/script>

<template>
  <Modal v-model="open" size="full" title="Full view">
    <Typography>Occupies the entire available viewport.</Typography>
  </Modal>
</template>`;

const scrollCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Modal } from 'mood-ui';

const open = ref(false);
<\/script>

<template>
  <Modal v-model="open" title="Terms and conditions">
    <div class="max-h-[50vh] overflow-y-auto pr-2 flex flex-col gap-2">
      <p v-for="i in 12" :key="i">Paragraph {{ i }} with long text to force internal scroll.</p>
    </div>
  </Modal>
</template>`;

const typesCode = `export type ModalSize = 'small' | 'medium' | 'large' | 'xlarge' | 'full';
export type ModalPosition = 'center' | 'top';
export type ModalOverlay = 'blur' | 'solid' | 'transparent' | 'dark' | 'dim' | 'glass';

export interface Modal {
  modelValue?: boolean;
  size?: ModalSize;
  position?: ModalPosition;
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  title?: string;
  description?: string;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  showClose?: boolean;
  lockScroll?: boolean;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  overlay?: ModalOverlay;
  innerBorder?: boolean;
  origin?: HTMLElement | null;
  disableOriginAnimation?: boolean;
  id?: string;
  ariaLabel?: string;
}`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "boolean",
    description: t("pages.feedback.modal.props.modelValue"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large' | 'xlarge' | 'full'",
    default: "'medium'",
    description: t("pages.feedback.modal.props.size"),
  },
  {
    name: "position",
    type: "'center' | 'top'",
    default: "'center'",
    description: t("pages.feedback.modal.props.position"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.feedback.modal.props.radius"),
  },
  {
    name: "title",
    type: "string",
    description: t("pages.feedback.modal.props.title"),
  },
  {
    name: "description",
    type: "string",
    description: t("pages.feedback.modal.props.description"),
  },
  {
    name: "closeOnOverlay",
    type: "boolean",
    default: "true",
    description: t("pages.feedback.modal.props.closeOnOverlay"),
  },
  {
    name: "closeOnEscape",
    type: "boolean",
    default: "true",
    description: t("pages.feedback.modal.props.closeOnEscape"),
  },
  {
    name: "showClose",
    type: "boolean",
    default: "true",
    description: t("pages.feedback.modal.props.showClose"),
  },
  {
    name: "lockScroll",
    type: "boolean",
    default: "true",
    description: t("pages.feedback.modal.props.lockScroll"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",
    description: t("pages.feedback.modal.props.color"),
  },
  {
    name: "overlay",
    type: "'blur' | 'solid' | 'transparent' | 'dark' | 'dim' | 'glass'",
    default: "'blur'",
    description: t("pages.feedback.modal.props.overlay"),
  },
  {
    name: "innerBorder",
    type: "boolean",
    default: "true",
    description: t("pages.feedback.modal.props.innerBorder"),
  },
  {
    name: "origin",
    type: "HTMLElement | null",
    description: t("pages.feedback.modal.props.origin"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.feedback.modal.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "boolean",
    description: t("pages.feedback.modal.emits.updateModelValue"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: t("pages.feedback.modal.slots.default") },
  { name: "header", description: t("pages.feedback.modal.slots.header") },
  { name: "footer", description: t("pages.feedback.modal.slots.footer") },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.feedback.modal.title')"
    category="Feedback"
    import-path="import { Modal } from 'mood-ui'"
    :description="t('pages.feedback.modal.description')"
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
            :label="t('pages.feedback.modal.controls.size')"
            :options="[
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
              { value: 'xlarge' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbPills
            :label="t('pages.feedback.modal.controls.overlay')"
            :options="[
              { value: 'blur' },
              { value: 'dim' },
              { value: 'solid' },
              { value: 'transparent' },
            ]"
            v-model="pgOverlay"
          />
          <TbSep />
          <TbToggle
            :label="t('pages.feedback.modal.controls.centered')"
            v-model="pgCentered"
          />
          <TbToggle
            :label="t('pages.feedback.modal.controls.closable')"
            v-model="pgClosable"
          />
        </template>

        <Button color="primary" @click="pgOpen = true">{{
          t("pages.feedback.modal.playground.open")
        }}</Button>
        <Modal
          v-model="pgOpen"
          :size="pgSize"
          :position="pgCentered ? 'center' : 'top'"
          :overlay="pgOverlay"
          :show-close="pgClosable"
          :close-on-overlay="pgClosable"
          :close-on-escape="pgClosable"
          :title="t('pages.feedback.modal.playground.title')"
          :description="t('pages.feedback.modal.playground.description')"
        >
          <Typography>{{
            t("pages.feedback.modal.playground.body")
          }}</Typography>
          <template #footer>
            <Button variant="ghost" @click="pgOpen = false">{{
              t("pages.feedback.modal.playground.cancel")
            }}</Button>
            <Button color="primary" @click="pgOpen = false">{{
              t("pages.feedback.modal.playground.apply")
            }}</Button>
          </template>
        </Modal>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.feedback.modal.examples.basic.title')"
        :description="t('pages.feedback.modal.examples.basic.desc')"
        :code="basicCode"
        min-height="180px"
      >
        <Button @click="open1 = true">{{
          t("pages.feedback.modal.examples.basic.cta")
        }}</Button>
        <Modal
          v-model="open1"
          :title="t('pages.feedback.modal.examples.basic.modalTitle')"
          :description="t('pages.feedback.modal.examples.basic.modalDesc')"
        >
          <Typography>{{
            t("pages.feedback.modal.examples.basic.body")
          }}</Typography>
          <template #footer>
            <Button variant="ghost" @click="open1 = false">{{
              t("pages.feedback.modal.examples.basic.cancel")
            }}</Button>
            <Button color="primary" @click="open1 = false">{{
              t("pages.feedback.modal.examples.basic.apply")
            }}</Button>
          </template>
        </Modal>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.modal.examples.form.title')"
        :description="t('pages.feedback.modal.examples.form.desc')"
        :code="formCode"
        min-height="180px"
      >
        <Button color="primary" @click="open2 = true">{{
          t("pages.feedback.modal.examples.form.cta")
        }}</Button>
        <Modal
          v-model="open2"
          size="medium"
          :title="t('pages.feedback.modal.examples.form.modalTitle')"
          :description="t('pages.feedback.modal.examples.form.modalDesc')"
        >
          <div class="flex flex-col gap-4">
            <FormField label="Project name" required>
              <Input v-model="modalName" placeholder="My Awesome Project" />
            </FormField>

            <FormField label="Type" required>
              <Select
                v-model="modalType"
                :options="projectTypeOptions"
                placeholder="Choose a type"
                full-width
              />
            </FormField>

            <FormField label="Description" hint="Optional">
              <Textarea
                v-model="modalDesc"
                placeholder="What is this project about?"
                :rows="3"
              />
            </FormField>
          </div>

          <template #footer>
            <Button variant="ghost" @click="open2 = false">{{
              t("pages.feedback.modal.examples.form.cancel")
            }}</Button>
            <Button color="primary" @click="submitProject">{{
              t("pages.feedback.modal.examples.form.create")
            }}</Button>
          </template>
        </Modal>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.modal.examples.locked.title')"
        :description="t('pages.feedback.modal.examples.locked.desc')"
        :code="lockedCode"
        min-height="180px"
      >
        <Button color="danger" @click="open3 = true">{{
          t("pages.feedback.modal.examples.locked.cta")
        }}</Button>
        <Modal
          v-model="open3"
          :title="t('pages.feedback.modal.examples.locked.modalTitle')"
          color="danger"
          :close-on-overlay="false"
          :close-on-escape="false"
        >
          <Typography>{{
            t("pages.feedback.modal.examples.locked.body")
          }}</Typography>
          <template #footer>
            <Button color="danger" @click="open3 = false">{{
              t("pages.feedback.modal.examples.locked.confirm")
            }}</Button>
          </template>
        </Modal>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.modal.examples.full.title')"
        :description="t('pages.feedback.modal.examples.full.desc')"
        :code="fullCode"
        min-height="180px"
      >
        <Button @click="open4 = true">{{
          t("pages.feedback.modal.examples.full.cta")
        }}</Button>
        <Modal
          v-model="open4"
          size="full"
          :title="t('pages.feedback.modal.examples.full.modalTitle')"
        >
          <Typography>{{
            t("pages.feedback.modal.examples.full.body")
          }}</Typography>
        </Modal>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.modal.examples.scroll.title')"
        :description="t('pages.feedback.modal.examples.scroll.desc')"
        :code="scrollCode"
        min-height="180px"
      >
        <Button @click="open5 = true">{{
          t("pages.feedback.modal.examples.scroll.cta")
        }}</Button>
        <Modal
          v-model="open5"
          :title="t('pages.feedback.modal.examples.scroll.modalTitle')"
        >
          <div class="max-h-[50vh] overflow-y-auto pr-2 flex flex-col gap-2">
            <p v-for="i in 12" :key="i">
              {{ t("pages.feedback.modal.examples.scroll.paragraph", { i }) }}
            </p>
          </div>
        </Modal>
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
        {{ t("pages.feedback.modal.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.feedback.modal.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
