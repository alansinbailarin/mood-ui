<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { Typography, Dialog, PressButton, Input } from "mood-ui";
import {
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  BellAlertIcon,
} from "@heroicons/vue/20/solid";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";
import A11yDoc from "~/components/A11yDoc.vue";
import type { A11yKeyboardRow, A11yAriaRow } from "~/components/A11yDoc.vue";
import type { PropDoc, EmitDoc, SlotDoc } from "~/types/component-doc";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbDots from "~/components/toolbar/TbDots.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();
const p = (key: string) => t(`pages.feedback.dialog.${key}`);

// ── Playground ────────────────────────────────────────────────────────────────
type Placement = "trigger" | "center";
type Width = "xsmall" | "small" | "medium" | "large" | "xlarge" | "full";
type Color = "default" | "primary" | "success" | "warning" | "danger";
type Size = "xsmall" | "small" | "medium" | "large";
type Radius = "none" | "small" | "medium" | "large" | "full";

const pgPlacement = ref<Placement>("trigger");
const pgWidth = ref<Width>("medium");
const pgColor = ref<Color>("primary");
const pgSize = ref<Size | undefined>(undefined);
const pgRadius = ref<Radius | undefined>(undefined);
const pgSurface = ref<"auto" | "trigger">("auto");
const pgAlert = ref(false);

const projectName = ref("Mood Design System");
const controlledOpen = ref(false);

function resetPlayground() {
  pgPlacement.value = "trigger";
  pgWidth.value = "medium";
  pgColor.value = "primary";
  pgSize.value = undefined;
  pgRadius.value = undefined;
  pgSurface.value = "auto";
  pgAlert.value = false;
}

const colorDots = [
  { value: "default", bg: "var(--color-slate-400)", label: "Default" },
  { value: "primary", bg: "var(--primary)", label: "Primary" },
  { value: "success", bg: "var(--color-emerald-500)", label: "Success" },
  { value: "warning", bg: "var(--color-amber-500)", label: "Warning" },
  { value: "danger", bg: "var(--color-red-500)", label: "Danger" },
];

const overviewCode = computed(() => {
  const rootAttrs = ` color="${pgColor.value}"`;
  const attrs: string[] = [];
  if (pgPlacement.value !== "trigger") attrs.push(`placement="${pgPlacement.value}"`);
  if (pgWidth.value !== "medium") attrs.push(`width="${pgWidth.value}"`);
  if (pgSize.value) attrs.push(`size="${pgSize.value}"`);
  if (pgRadius.value) attrs.push(`radius="${pgRadius.value}"`);
  if (pgSurface.value !== "auto") attrs.push(`surface="${pgSurface.value}"`);
  if (pgAlert.value) attrs.push("alert");
  const attrStr = attrs.length ? " " + attrs.join(" ") : "";

  return `<script setup lang="ts">
import { ref } from 'vue';
import { Dialog, Input } from 'mood-ui';
import { SparklesIcon } from '@heroicons/vue/20/solid';

const projectName = ref('Mood Design System');
<\/script>

<template>
  <Dialog${rootAttrs}>
    <Dialog.Trigger label="Rename project" variant="normal" />
    <Dialog.Content${attrStr}>
      <Dialog.Header>
        <Dialog.Icon><SparklesIcon /></Dialog.Icon>
        <Dialog.Title>Rename project</Dialog.Title>
        <Dialog.Description>
          The new name applies to every connected workspace.
        </Dialog.Description>
      </Dialog.Header>
      <Input v-model="projectName" label="Project name" full-width />
      <Dialog.Footer>
        <Dialog.Close label="Cancel" />
        <Dialog.Close label="Save changes" variant="normal" />
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog>
</template>`;
});

const widthsCode = `<script setup lang="ts">
import { Dialog } from 'mood-ui';
import { CheckCircleIcon } from '@heroicons/vue/20/solid';
<\/script>

<template>
  <Dialog v-for="w in ['xsmall', 'medium', 'xlarge']" :key="w">
    <Dialog.Trigger :label="w" variant="outline" />
    <Dialog.Content placement="center" :width="w">
      <Dialog.Header>
        <Dialog.Icon color="success"><CheckCircleIcon /></Dialog.Icon>
        <Dialog.Title>Centered dialog</Dialog.Title>
        <Dialog.Description>
          Morphs from the trigger to the center of the viewport over a dimmed backdrop.
        </Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <Dialog.Close label="Done" variant="normal" />
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog>
</template>`;

const buttonsCode = `<script setup lang="ts">
import { Dialog } from 'mood-ui';
import { PencilSquareIcon } from '@heroicons/vue/20/solid';
<\/script>

<template>
  <!-- Without as-child, Trigger and Close render a native Button -->
  <Dialog color="primary">
    <Dialog.Trigger label="Edit profile" variant="outline" :icon="PencilSquareIcon" />
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Edit profile</Dialog.Title>
        <Dialog.Description>Trigger and Close inherit the dialog color.</Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <!-- No label: falls back to the locale's "Close" -->
        <Dialog.Close />
        <Dialog.Close label="Save" variant="normal" />
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog>

  <!-- With as-child, any element (here a PressButton) becomes the trigger -->
  <Dialog>
    <Dialog.Trigger as-child>
      <PressButton color="primary">Custom trigger</PressButton>
    </Dialog.Trigger>
    <Dialog.Content>…</Dialog.Content>
  </Dialog>
</template>`;

const surfaceCode = `<script setup lang="ts">
import { Dialog } from 'mood-ui';
import { SparklesIcon, BellAlertIcon } from '@heroicons/vue/20/solid';
<\/script>

<template>
  <Dialog color="success">
    <Dialog.Trigger label="Success surface" />
    <Dialog.Content surface="trigger">
      <Dialog.Header>
        <Dialog.Icon><SparklesIcon /></Dialog.Icon>
        <Dialog.Title>Surface continuity</Dialog.Title>
        <Dialog.Description>
          The panel keeps the trigger's background, lightly tinted with the dialog color.
        </Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <Dialog.Close />
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog>

  <Dialog color="warning">
    <Dialog.Trigger label="Warning icon" variant="outline" />
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Icon size="large" radius="full"><BellAlertIcon /></Dialog.Icon>
        <Dialog.Title>Icon tile</Dialog.Title>
      </Dialog.Header>
    </Dialog.Content>
  </Dialog>
</template>`;

const alertCode = `<script setup lang="ts">
import { Dialog } from 'mood-ui';
import { ExclamationTriangleIcon } from '@heroicons/vue/20/solid';
<\/script>

<template>
  <Dialog color="danger">
    <Dialog.Trigger label="Delete workspace" variant="outline" />
    <Dialog.Content placement="center" width="small" alert>
      <Dialog.Header>
        <Dialog.Icon><ExclamationTriangleIcon /></Dialog.Icon>
        <Dialog.Title>Delete the workspace?</Dialog.Title>
        <Dialog.Description>
          This cannot be undone. Outside clicks and the corner button are disabled.
        </Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <Dialog.Close label="Cancel" />
        <Dialog.Close label="Delete" variant="normal" />
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog>
</template>`;

const controlledCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Dialog, Button } from 'mood-ui';

const open = ref(false);
<\/script>

<template>
  <Button variant="outline" @click="open = true">Open from outside</Button>

  <Dialog v-model:open="open">
    <Dialog.Content placement="center" aria-label="Controlled dialog">
      <Dialog.Header>
        <Dialog.Title>Controlled dialog</Dialog.Title>
        <Dialog.Description>Open state: {{ open }}</Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <Dialog.Close />
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog>
</template>`;

const typesCode = `export type DialogPlacement = 'trigger' | 'center';
export type DialogSide = 'auto' | 'top' | 'bottom';
export type DialogAlign = 'auto' | 'start' | 'center' | 'end';
export type DialogSurface = 'auto' | 'trigger';
export type DialogWidth = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'full';
export type DialogButtonVariant = 'normal' | 'outline' | 'ghost' | 'text';

export interface DialogProps {
  open?: boolean;
  modelValue?: boolean;
  defaultOpen?: boolean;
  color?: ModoColor;
}

export interface DialogContentProps {
  placement?: DialogPlacement;
  side?: DialogSide;
  align?: DialogAlign;
  surface?: DialogSurface;
  width?: DialogWidth;
  size?: ModoSize;
  color?: ModoColor;
  radius?: ModoRadius;
  dismissable?: boolean;
  alert?: boolean;
  closeLabel?: string;
  ariaLabel?: string;
}

// Shared by Dialog.Trigger and Dialog.Close (and Sheet.Trigger / Sheet.Close)
export interface DialogButtonProps {
  asChild?: boolean;
  label?: string;
  variant?: DialogButtonVariant;
  color?: ModoColor;
  size?: ModoSize;
  radius?: ModoRadius;
  icon?: Component;
  disabled?: boolean;
}

export interface DialogIconProps {
  color?: ModoColor;
  size?: ModoSize;
  radius?: ModoRadius;
}`;

// ── API tables ────────────────────────────────────────────────────────────────
const COLOR_TYPE = "'default' | 'primary' | 'success' | 'warning' | 'danger'";
const SIZE_TYPE = "'xsmall' | 'small' | 'medium' | 'large'";
const RADIUS_TYPE = "'none' | 'small' | 'medium' | 'large' | 'full'";

const propsList = computed<PropDoc[]>(() => [
  { name: "open / v-model", type: "boolean", default: "undefined", description: p("props.open") },
  { name: "defaultOpen", type: "boolean", default: "false", description: p("props.defaultOpen") },
  { name: "color", type: COLOR_TYPE, description: p("props.color") },
  { name: "placement (Dialog.Content)", type: "'trigger' | 'center'", default: "'trigger'", description: p("props.placement") },
  { name: "side (Dialog.Content)", type: "'auto' | 'top' | 'bottom'", default: "'auto'", description: p("props.side") },
  { name: "align (Dialog.Content)", type: "'auto' | 'start' | 'center' | 'end'", default: "'auto'", description: p("props.align") },
  { name: "surface (Dialog.Content)", type: "'auto' | 'trigger'", default: "'auto'", description: p("props.surface") },
  { name: "width (Dialog.Content)", type: "'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'full'", default: "'medium'", description: p("props.width") },
  { name: "size (Dialog.Content)", type: SIZE_TYPE, description: p("props.size") },
  { name: "color (Dialog.Content)", type: COLOR_TYPE, description: p("props.contentColor") },
  { name: "radius (Dialog.Content)", type: RADIUS_TYPE, description: p("props.radius") },
  { name: "alert (Dialog.Content)", type: "boolean", default: "false", description: p("props.alert") },
  { name: "dismissable (Dialog.Content)", type: "boolean", default: "!alert", description: p("props.dismissable") },
  { name: "closeLabel (Dialog.Content)", type: "string", default: "locale common.close", description: p("props.closeLabel") },
  { name: "ariaLabel (Dialog.Content)", type: "string", default: "locale dialog.label", description: p("props.ariaLabel") },
  { name: "asChild (Trigger / Close)", type: "boolean", default: "false", description: p("props.asChild") },
  { name: "label (Trigger / Close)", type: "string", description: p("props.label") },
  { name: "variant (Trigger / Close)", type: "'normal' | 'outline' | 'ghost' | 'text'", default: "Close: 'outline'", description: p("props.variant") },
  { name: "color / size / radius (Trigger / Close)", type: "ModoColor / ModoSize / ModoRadius", description: p("props.buttonTheme") },
  { name: "icon (Trigger / Close)", type: "Component", description: p("props.icon") },
  { name: "disabled (Trigger / Close)", type: "boolean", default: "false", description: p("props.disabled") },
  { name: "color / size / radius (Dialog.Icon)", type: "ModoColor / ModoSize / ModoRadius", description: p("props.iconTheme") },
]);

const emitsList = computed<EmitDoc[]>(() => [
  { name: "update:open", payload: "boolean", description: p("emits.updateOpen") },
  { name: "update:modelValue", payload: "boolean", description: p("emits.updateModelValue") },
  { name: "openChange", payload: "boolean", description: p("emits.openChange") },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: p("slots.default") },
  { name: "default (Trigger)", description: p("slots.trigger") },
  { name: "default (Close)", description: p("slots.close") },
]);

// ── A11y ──────────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Enter", "Space"], action: p("a11y.kbOpen") },
  { keys: ["Tab", "Shift+Tab"], action: p("a11y.kbTab") },
  { keys: ["Escape"], action: p("a11y.kbEsc") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  { attribute: "role", value: '"dialog" | "alertdialog"', desc: p("a11y.ariaDialog") },
  { attribute: "aria-labelledby / aria-describedby", value: "id", desc: p("a11y.ariaLabelledby") },
  { attribute: "aria-label", value: "ariaLabel", desc: p("a11y.ariaLabel") },
  { attribute: "aria-haspopup / aria-expanded", value: '"dialog" / boolean', desc: p("a11y.ariaTrigger") },
]);

const a11yFocus = computed<string[]>(() => [
  p("a11y.focusTrap"),
  p("a11y.focusRestore"),
  p("a11y.reducedMotion"),
]);
</script>

<template>
  <ComponentDoc
    :title="p('title')"
    :category="p('category')"
    :description="p('description')"
    import-path="import { Dialog } from 'mood-ui'"
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
            v-model="pgPlacement"
            :label="p('controls.placement')"
            :options="[
              { value: 'trigger', label: p('options.trigger') },
              { value: 'center', label: p('options.center') },
            ]"
          />
          <TbSep />
          <TbPills
            v-model="pgWidth"
            :label="p('controls.width')"
            :options="[
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
              { value: 'xlarge' },
              { value: 'full' },
            ]"
          />
          <TbSep />
          <TbDots
            v-model="pgColor"
            :label="p('controls.color')"
            :options="colorDots"
          />
          <TbSep />
          <TbPills
            v-model="pgSize"
            :label="p('controls.size')"
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
            :label="p('controls.radius')"
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
            v-model="pgSurface"
            :label="p('controls.surface')"
            :options="[
              { value: 'auto', label: p('options.auto') },
              { value: 'trigger', label: p('options.trigger') },
            ]"
          />
          <TbSep />
          <TbToggle v-model="pgAlert" :label="p('controls.alert')" />
        </template>

        <Dialog :color="pgColor">
          <Dialog.Trigger
            :label="p('playground.open')"
            variant="normal"
            :size="pgSize"
            :radius="pgRadius"
          />
          <Dialog.Content
            :placement="pgPlacement"
            :width="pgWidth"
            :size="pgSize"
            :radius="pgRadius"
            :surface="pgSurface"
            :alert="pgAlert"
          >
            <Dialog.Header>
              <Dialog.Icon>
                <SparklesIcon />
              </Dialog.Icon>
              <Dialog.Title>{{ p("playground.title") }}</Dialog.Title>
              <Dialog.Description>
                {{ p("playground.desc") }}
              </Dialog.Description>
            </Dialog.Header>
            <div class="py-1">
              <Input
                v-model="projectName"
                :label="p('playground.field')"
                :color="pgColor"
                :size="pgSize"
                :radius="pgRadius"
                full-width
              />
            </div>
            <Dialog.Footer>
              <Dialog.Close :label="p('playground.cancel')" :size="pgSize" />
              <Dialog.Close
                :label="p('playground.save')"
                variant="normal"
                :size="pgSize"
              />
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="p('examples.widths.title')"
        :description="p('examples.widths.desc')"
        :code="widthsCode"
      >
        <div class="flex flex-wrap items-center justify-center gap-3">
          <Dialog
            v-for="w in (['xsmall', 'medium', 'xlarge'] as const)"
            :key="w"
          >
            <Dialog.Trigger :label="w" variant="outline" />
            <Dialog.Content placement="center" :width="w">
              <Dialog.Header>
                <Dialog.Icon color="success">
                  <CheckCircleIcon />
                </Dialog.Icon>
                <Dialog.Title>{{ p("examples.widths.dialogTitle") }}</Dialog.Title>
                <Dialog.Description>
                  {{ p("examples.widths.dialogDesc") }}
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer>
                <Dialog.Close :label="p('examples.widths.done')" variant="normal" />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="p('examples.buttons.title')"
        :description="p('examples.buttons.desc')"
        :code="buttonsCode"
      >
        <div class="flex flex-wrap items-center justify-center gap-3">
          <Dialog color="primary">
            <Dialog.Trigger
              :label="p('examples.buttons.edit')"
              variant="outline"
              :icon="PencilSquareIcon"
            />
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{{ p("examples.buttons.edit") }}</Dialog.Title>
                <Dialog.Description>
                  {{ p("examples.buttons.dialogDesc") }}
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer>
                <Dialog.Close />
                <Dialog.Close :label="p('examples.buttons.save')" variant="normal" />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog>

          <Dialog>
            <Dialog.Trigger as-child>
              <PressButton color="primary">
                {{ p("examples.buttons.custom") }}
              </PressButton>
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{{ p("examples.buttons.custom") }}</Dialog.Title>
                <Dialog.Description>
                  {{ p("examples.buttons.customDesc") }}
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer>
                <Dialog.Close />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="p('examples.surface.title')"
        :description="p('examples.surface.desc')"
        :code="surfaceCode"
      >
        <div class="flex flex-wrap items-center justify-center gap-3">
          <Dialog color="success">
            <Dialog.Trigger :label="p('examples.surface.cta')" />
            <Dialog.Content surface="trigger">
              <Dialog.Header>
                <Dialog.Icon>
                  <SparklesIcon />
                </Dialog.Icon>
                <Dialog.Title>{{ p("examples.surface.dialogTitle") }}</Dialog.Title>
                <Dialog.Description>
                  {{ p("examples.surface.dialogDesc") }}
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer>
                <Dialog.Close />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog>

          <Dialog color="warning">
            <Dialog.Trigger :label="p('examples.surface.iconCta')" variant="outline" />
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Icon size="large" radius="full">
                  <BellAlertIcon />
                </Dialog.Icon>
                <Dialog.Title>{{ p("examples.surface.iconTitle") }}</Dialog.Title>
                <Dialog.Description>
                  {{ p("examples.surface.iconDesc") }}
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer>
                <Dialog.Close />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="p('examples.alert.title')"
        :description="p('examples.alert.desc')"
        :code="alertCode"
      >
        <Dialog color="danger">
          <Dialog.Trigger :label="p('examples.alert.cta')" variant="outline" />
          <Dialog.Content placement="center" width="small" alert>
            <Dialog.Header>
              <Dialog.Icon>
                <ExclamationTriangleIcon />
              </Dialog.Icon>
              <Dialog.Title>{{ p("examples.alert.dialogTitle") }}</Dialog.Title>
              <Dialog.Description>
                {{ p("examples.alert.dialogDesc") }}
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Dialog.Close :label="p('examples.alert.cancel')" />
              <Dialog.Close :label="p('examples.alert.confirm')" variant="normal" />
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      </ComponentPreview>

      <ComponentPreview
        :title="p('examples.controlled.title')"
        :description="p('examples.controlled.desc')"
        :code="controlledCode"
      >
        <PressButton variant="outline" @click="controlledOpen = true">
          {{ p("examples.controlled.cta") }}
        </PressButton>
        <Dialog v-model:open="controlledOpen">
          <Dialog.Content
            placement="center"
            :aria-label="p('examples.controlled.dialogTitle')"
          >
            <Dialog.Header>
              <Dialog.Title>{{ p("examples.controlled.dialogTitle") }}</Dialog.Title>
              <Dialog.Description>
                {{ p("examples.controlled.state") }}: {{ controlledOpen }}
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Dialog.Close />
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
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
        {{ p("types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ p("types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
