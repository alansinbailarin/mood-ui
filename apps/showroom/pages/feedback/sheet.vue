<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { Typography, Sheet, PressButton, Switch } from "mood-ui";
import { AdjustmentsHorizontalIcon } from "@heroicons/vue/20/solid";
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
const p = (key: string) => t(`pages.feedback.sheet.${key}`);

// ── Playground ────────────────────────────────────────────────────────────────
type Height = "auto" | "half" | "full";
type Color = "default" | "primary" | "success" | "warning" | "danger";
type Size = "xsmall" | "small" | "medium" | "large";
type Radius = "none" | "small" | "medium" | "large" | "full";

const pgHeight = ref<Height>("auto");
const pgColor = ref<Color>("primary");
const pgSize = ref<Size | undefined>(undefined);
const pgRadius = ref<Radius | undefined>(undefined);
const pgExpandable = ref(true);
const pgDismissable = ref(true);

const pushEnabled = ref(true);
const digestEnabled = ref(false);
const securityEnabled = ref(true);
const controlledOpen = ref(false);

function resetPlayground() {
  pgHeight.value = "auto";
  pgColor.value = "primary";
  pgSize.value = undefined;
  pgRadius.value = undefined;
  pgExpandable.value = true;
  pgDismissable.value = true;
}

const colorDots = [
  { value: "default", bg: "var(--color-slate-400)", label: "Default" },
  { value: "primary", bg: "var(--primary)", label: "Primary" },
  { value: "success", bg: "var(--color-emerald-500)", label: "Success" },
  { value: "warning", bg: "var(--color-amber-500)", label: "Warning" },
  { value: "danger", bg: "var(--color-red-500)", label: "Danger" },
];

const settings = computed(() => [
  { key: "push", model: pushEnabled, label: p("playground.push"), hint: p("playground.pushHint") },
  { key: "digest", model: digestEnabled, label: p("playground.digest"), hint: p("playground.digestHint") },
  { key: "security", model: securityEnabled, label: p("playground.security"), hint: p("playground.securityHint") },
]);

const overviewCode = computed(() => {
  const attrs: string[] = [];
  if (pgHeight.value !== "auto") attrs.push(`height="${pgHeight.value}"`);
  if (pgExpandable.value) attrs.push("expandable");
  if (!pgDismissable.value) attrs.push(':dismissable="false"');
  if (pgSize.value) attrs.push(`size="${pgSize.value}"`);
  if (pgRadius.value) attrs.push(`radius="${pgRadius.value}"`);
  const attrStr = attrs.length ? " " + attrs.join(" ") : "";

  return `<script setup lang="ts">
import { ref } from 'vue';
import { Sheet, Switch } from 'mood-ui';

const push = ref(true);
const digest = ref(false);
<\/script>

<template>
  <Sheet color="${pgColor.value}">
    <Sheet.Trigger label="Notification settings" variant="normal" />
    <Sheet.Content${attrStr}>
      <Sheet.Header>
        <Sheet.Title>Workspace notifications</Sheet.Title>
        <Sheet.Description>Pull down to dismiss, pull up to expand.</Sheet.Description>
      </Sheet.Header>
      <Sheet.Body class="space-y-4 py-2">
        <Switch v-model="push" label="Push notifications" />
        <Switch v-model="digest" label="Weekly digest" />
      </Sheet.Body>
      <Sheet.Footer>
        <Sheet.Close label="Cancel" />
        <Sheet.Close label="Save preferences" variant="normal" />
      </Sheet.Footer>
    </Sheet.Content>
  </Sheet>
</template>`;
});

const heightsCode = `<script setup lang="ts">
import { Sheet } from 'mood-ui';
<\/script>

<template>
  <Sheet>
    <Sheet.Trigger label="Auto" variant="outline" />
    <Sheet.Content height="auto">
      <Sheet.Header>
        <Sheet.Title>Auto height</Sheet.Title>
        <Sheet.Description>Fits its content, up to 85dvh.</Sheet.Description>
      </Sheet.Header>
      <Sheet.Footer><Sheet.Close /></Sheet.Footer>
    </Sheet.Content>
  </Sheet>

  <Sheet>
    <Sheet.Trigger label="Half + expandable" variant="outline" />
    <Sheet.Content height="half" expandable>…</Sheet.Content>
  </Sheet>

  <Sheet>
    <Sheet.Trigger label="Full" variant="outline" />
    <Sheet.Content height="full">…</Sheet.Content>
  </Sheet>
</template>`;

const scrollableCode = `<script setup lang="ts">
import { Sheet } from 'mood-ui';
<\/script>

<template>
  <Sheet>
    <Sheet.Trigger label="Release notes" variant="outline" />
    <Sheet.Content height="half" expandable>
      <Sheet.Header>
        <Sheet.Title>Release notes</Sheet.Title>
        <Sheet.Description>Header and footer stay pinned while the body scrolls.</Sheet.Description>
      </Sheet.Header>
      <Sheet.Body class="space-y-3">
        <div v-for="i in 10" :key="i" class="rounded-xl border border-border bg-muted/30 p-3 text-sm">
          Update v2.{{ i }}.0
        </div>
      </Sheet.Body>
      <Sheet.Footer>
        <Sheet.Close label="Got it" variant="normal" />
      </Sheet.Footer>
    </Sheet.Content>
  </Sheet>
</template>`;

const buttonsCode = `<script setup lang="ts">
import { Sheet, PressButton } from 'mood-ui';
import { AdjustmentsHorizontalIcon } from '@heroicons/vue/20/solid';
<\/script>

<template>
  <!-- Without as-child, Trigger and Close render a native Button -->
  <Sheet color="success">
    <Sheet.Trigger label="Filters" variant="outline" :icon="AdjustmentsHorizontalIcon" />
    <Sheet.Content>
      <Sheet.Header>
        <Sheet.Title>Filters</Sheet.Title>
      </Sheet.Header>
      <Sheet.Footer>
        <!-- No label: falls back to the locale's "Close" -->
        <Sheet.Close />
        <Sheet.Close label="Apply" variant="normal" />
      </Sheet.Footer>
    </Sheet.Content>
  </Sheet>

  <!-- With as-child, any element becomes the trigger -->
  <Sheet>
    <Sheet.Trigger as-child>
      <PressButton color="primary">Custom trigger</PressButton>
    </Sheet.Trigger>
    <Sheet.Content>…</Sheet.Content>
  </Sheet>
</template>`;

const controlledCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Sheet, Button } from 'mood-ui';

const open = ref(false);
<\/script>

<template>
  <Button variant="outline" @click="open = true">Open from outside</Button>

  <Sheet v-model:open="open">
    <Sheet.Content :dismissable="false" aria-label="Controlled sheet">
      <Sheet.Header>
        <Sheet.Title>Controlled sheet</Sheet.Title>
        <Sheet.Description>Only the footer button closes it.</Sheet.Description>
      </Sheet.Header>
      <Sheet.Footer>
        <Sheet.Close label="Done" variant="normal" />
      </Sheet.Footer>
    </Sheet.Content>
  </Sheet>
</template>`;

const typesCode = `export type SheetHeight = 'auto' | 'half' | 'full';

export interface SheetProps {
  open?: boolean;
  modelValue?: boolean;
  defaultOpen?: boolean;
  color?: ModoColor;
}

export interface SheetContentProps {
  height?: SheetHeight;
  expandable?: boolean;
  dismissable?: boolean;
  size?: ModoSize;
  color?: ModoColor;
  radius?: ModoRadius;
  closeLabel?: string;
  ariaLabel?: string;
}

// Same props as Dialog.Trigger / Dialog.Close
export type SheetTriggerProps = DialogButtonProps;
export type SheetCloseProps = DialogButtonProps;`;

// ── API tables ────────────────────────────────────────────────────────────────
const COLOR_TYPE = "'default' | 'primary' | 'success' | 'warning' | 'danger'";
const SIZE_TYPE = "'xsmall' | 'small' | 'medium' | 'large'";
const RADIUS_TYPE = "'none' | 'small' | 'medium' | 'large' | 'full'";

const propsList = computed<PropDoc[]>(() => [
  { name: "open / v-model", type: "boolean", default: "undefined", description: p("props.open") },
  { name: "defaultOpen", type: "boolean", default: "false", description: p("props.defaultOpen") },
  { name: "color", type: COLOR_TYPE, description: p("props.color") },
  { name: "height (Sheet.Content)", type: "'auto' | 'half' | 'full'", default: "'auto'", description: p("props.height") },
  { name: "expandable (Sheet.Content)", type: "boolean", default: "false", description: p("props.expandable") },
  { name: "dismissable (Sheet.Content)", type: "boolean", default: "true", description: p("props.dismissable") },
  { name: "size (Sheet.Content)", type: SIZE_TYPE, description: p("props.size") },
  { name: "color (Sheet.Content)", type: COLOR_TYPE, description: p("props.contentColor") },
  { name: "radius (Sheet.Content)", type: RADIUS_TYPE, description: p("props.radius") },
  { name: "closeLabel (Sheet.Content)", type: "string", default: "locale common.close", description: p("props.closeLabel") },
  { name: "ariaLabel (Sheet.Content)", type: "string", default: "locale sheet.label", description: p("props.ariaLabel") },
  { name: "asChild (Trigger / Close)", type: "boolean", default: "false", description: p("props.asChild") },
  { name: "label (Trigger / Close)", type: "string", description: p("props.label") },
  { name: "variant (Trigger / Close)", type: "'normal' | 'outline' | 'ghost' | 'text'", default: "Close: 'outline'", description: p("props.variant") },
  { name: "color / size / radius (Trigger / Close)", type: "ModoColor / ModoSize / ModoRadius", description: p("props.buttonTheme") },
  { name: "icon (Trigger / Close)", type: "Component", description: p("props.icon") },
  { name: "disabled (Trigger / Close)", type: "boolean", default: "false", description: p("props.disabled") },
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
  { attribute: "role", value: '"dialog" (aria-modal="true")', desc: p("a11y.ariaDialog") },
  { attribute: "aria-labelledby / aria-describedby", value: "id", desc: p("a11y.ariaLabelledby") },
  { attribute: "aria-label", value: "ariaLabel", desc: p("a11y.ariaLabel") },
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
    import-path="import { Sheet } from 'mood-ui'"
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
            v-model="pgHeight"
            :label="p('controls.height')"
            :options="[
              { value: 'auto' },
              { value: 'half' },
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
          <TbToggle v-model="pgExpandable" :label="p('controls.expandable')" />
          <TbToggle v-model="pgDismissable" :label="p('controls.dismissable')" />
        </template>

        <Sheet :color="pgColor">
          <Sheet.Trigger
            :label="p('playground.open')"
            variant="normal"
            :size="pgSize"
            :radius="pgRadius"
          />
          <Sheet.Content
            :height="pgHeight"
            :expandable="pgExpandable"
            :dismissable="pgDismissable"
            :size="pgSize"
            :radius="pgRadius"
          >
            <Sheet.Header>
              <Sheet.Title>{{ p("playground.title") }}</Sheet.Title>
              <Sheet.Description>{{ p("playground.desc") }}</Sheet.Description>
            </Sheet.Header>
            <Sheet.Body class="space-y-4 py-2">
              <div
                v-for="item in settings"
                :key="item.key"
                class="flex items-center justify-between gap-4"
              >
                <div>
                  <div class="text-sm font-medium text-foreground">{{ item.label }}</div>
                  <div class="text-xs text-muted-foreground">{{ item.hint }}</div>
                </div>
                <Switch
                  v-model="item.model.value"
                  :color="pgColor"
                  :size="pgSize"
                  :aria-label="item.label"
                />
              </div>
            </Sheet.Body>
            <Sheet.Footer>
              <Sheet.Close :label="p('playground.cancel')" :size="pgSize" />
              <Sheet.Close
                :label="p('playground.save')"
                variant="normal"
                :size="pgSize"
              />
            </Sheet.Footer>
          </Sheet.Content>
        </Sheet>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="p('examples.heights.title')"
        :description="p('examples.heights.desc')"
        :code="heightsCode"
      >
        <div class="flex flex-wrap items-center justify-center gap-3">
          <Sheet>
            <Sheet.Trigger :label="p('examples.heights.auto')" variant="outline" />
            <Sheet.Content height="auto">
              <Sheet.Header>
                <Sheet.Title>{{ p("examples.heights.autoTitle") }}</Sheet.Title>
                <Sheet.Description>{{ p("examples.heights.autoDesc") }}</Sheet.Description>
              </Sheet.Header>
              <Sheet.Footer>
                <Sheet.Close />
              </Sheet.Footer>
            </Sheet.Content>
          </Sheet>

          <Sheet>
            <Sheet.Trigger :label="p('examples.heights.half')" variant="outline" />
            <Sheet.Content height="half" expandable>
              <Sheet.Header>
                <Sheet.Title>{{ p("examples.heights.halfTitle") }}</Sheet.Title>
                <Sheet.Description>{{ p("examples.heights.halfDesc") }}</Sheet.Description>
              </Sheet.Header>
              <Sheet.Footer>
                <Sheet.Close />
              </Sheet.Footer>
            </Sheet.Content>
          </Sheet>

          <Sheet>
            <Sheet.Trigger :label="p('examples.heights.full')" variant="outline" />
            <Sheet.Content height="full">
              <Sheet.Header>
                <Sheet.Title>{{ p("examples.heights.fullTitle") }}</Sheet.Title>
                <Sheet.Description>{{ p("examples.heights.fullDesc") }}</Sheet.Description>
              </Sheet.Header>
              <Sheet.Footer>
                <Sheet.Close />
              </Sheet.Footer>
            </Sheet.Content>
          </Sheet>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="p('examples.scrollable.title')"
        :description="p('examples.scrollable.desc')"
        :code="scrollableCode"
      >
        <Sheet>
          <Sheet.Trigger :label="p('examples.scrollable.cta')" variant="outline" />
          <Sheet.Content height="half" expandable>
            <Sheet.Header>
              <Sheet.Title>{{ p("examples.scrollable.sheetTitle") }}</Sheet.Title>
              <Sheet.Description>{{ p("examples.scrollable.sheetDesc") }}</Sheet.Description>
            </Sheet.Header>
            <Sheet.Body class="space-y-3">
              <div
                v-for="i in 10"
                :key="i"
                class="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground"
              >
                <strong class="text-foreground">v2.{{ i }}.0</strong>
                {{ p("examples.scrollable.item") }}
              </div>
            </Sheet.Body>
            <Sheet.Footer>
              <Sheet.Close :label="p('examples.scrollable.done')" variant="normal" />
            </Sheet.Footer>
          </Sheet.Content>
        </Sheet>
      </ComponentPreview>

      <ComponentPreview
        :title="p('examples.buttons.title')"
        :description="p('examples.buttons.desc')"
        :code="buttonsCode"
      >
        <div class="flex flex-wrap items-center justify-center gap-3">
          <Sheet color="success">
            <Sheet.Trigger
              :label="p('examples.buttons.filters')"
              variant="outline"
              :icon="AdjustmentsHorizontalIcon"
            />
            <Sheet.Content>
              <Sheet.Header>
                <Sheet.Title>{{ p("examples.buttons.filters") }}</Sheet.Title>
                <Sheet.Description>{{ p("examples.buttons.sheetDesc") }}</Sheet.Description>
              </Sheet.Header>
              <Sheet.Footer>
                <Sheet.Close />
                <Sheet.Close :label="p('examples.buttons.apply')" variant="normal" />
              </Sheet.Footer>
            </Sheet.Content>
          </Sheet>

          <Sheet>
            <Sheet.Trigger as-child>
              <PressButton color="primary">{{ p("examples.buttons.custom") }}</PressButton>
            </Sheet.Trigger>
            <Sheet.Content>
              <Sheet.Header>
                <Sheet.Title>{{ p("examples.buttons.custom") }}</Sheet.Title>
                <Sheet.Description>{{ p("examples.buttons.customDesc") }}</Sheet.Description>
              </Sheet.Header>
              <Sheet.Footer>
                <Sheet.Close />
              </Sheet.Footer>
            </Sheet.Content>
          </Sheet>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="p('examples.controlled.title')"
        :description="p('examples.controlled.desc')"
        :code="controlledCode"
      >
        <PressButton variant="outline" @click="controlledOpen = true">
          {{ p("examples.controlled.cta") }}
        </PressButton>
        <Sheet v-model:open="controlledOpen">
          <Sheet.Content
            :dismissable="false"
            :aria-label="p('examples.controlled.sheetTitle')"
          >
            <Sheet.Header>
              <Sheet.Title>{{ p("examples.controlled.sheetTitle") }}</Sheet.Title>
              <Sheet.Description>{{ p("examples.controlled.sheetDesc") }}</Sheet.Description>
            </Sheet.Header>
            <Sheet.Footer>
              <Sheet.Close :label="p('examples.controlled.done')" variant="normal" />
            </Sheet.Footer>
          </Sheet.Content>
        </Sheet>
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
