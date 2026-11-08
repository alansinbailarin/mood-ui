<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { Button, Typography, LiquidToaster, createLiquidToast } from "mood-ui";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";
import A11yDoc from "~/components/A11yDoc.vue";
import type { A11yKeyboardRow, A11yAriaRow } from "~/components/A11yDoc.vue";
import type { PropDoc, EmitDoc, SlotDoc } from "~/types/component-doc";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbDots from "~/components/toolbar/TbDots.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();
const p = (key: string) => t(`pages.feedback.liquidToast.${key}`);

// Isolated controller so the demos never touch the app-wide `liquidToast`.
const toast = createLiquidToast();
onBeforeUnmount(() => toast.dismissAll());

// ── Playground ────────────────────────────────────────────────────────────────
type Color = "info" | "success" | "warning" | "danger";
type Variant = "filled" | "subtle" | "outline";
type Placement =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";
type Size = "xsmall" | "small" | "medium" | "large";
type Radius = "none" | "small" | "medium" | "large" | "full";

const pgColor = ref<Color>("success");
const pgVariant = ref<Variant>("subtle");
const pgPlacement = ref<Placement>("top-center");
const pgMax = ref<"1" | "2" | "3">("1");
const pgSize = ref<Size | undefined>(undefined);
const pgRadius = ref<Radius | undefined>(undefined);

function resetPlayground() {
  pgColor.value = "success";
  pgVariant.value = "subtle";
  pgPlacement.value = "top-center";
  pgMax.value = "1";
  pgSize.value = undefined;
  pgRadius.value = undefined;
}

const colorDots = [
  { value: "info", bg: "var(--color-sky-500)", label: "Info" },
  { value: "success", bg: "var(--color-emerald-500)", label: "Success" },
  { value: "warning", bg: "var(--color-amber-500)", label: "Warning" },
  { value: "danger", bg: "var(--color-red-500)", label: "Danger" },
];

function notify() {
  toast.push({
    title: p("demo.savedTitle"),
    description: p("demo.savedDesc"),
    color: pgColor.value,
    variant: pgVariant.value,
  });
}

function queueThree() {
  for (let i = 1; i <= 3; i++) {
    toast.push({
      title: `${p("demo.queued")} ${i}`,
      description: p("demo.queuedDesc"),
      color: pgColor.value,
      variant: pgVariant.value,
      duration: 2200,
    });
  }
}

const overviewCode = computed(() => {
  const attrs: string[] = [];
  if (pgPlacement.value !== "top-center") attrs.push(`placement="${pgPlacement.value}"`);
  if (pgMax.value !== "1") attrs.push(`:max="${pgMax.value}"`);
  if (pgVariant.value !== "subtle") attrs.push(`default-variant="${pgVariant.value}"`);
  if (pgSize.value) attrs.push(`size="${pgSize.value}"`);
  if (pgRadius.value) attrs.push(`radius="${pgRadius.value}"`);
  const attrStr = attrs.length ? " " + attrs.join(" ") : "";

  return `<script setup lang="ts">
import { LiquidToaster, liquidToast, Button } from 'mood-ui';

function save() {
  liquidToast.${pgColor.value}({
    title: 'Changes saved',
    description: 'Your workspace is up to date.',
  });
}
<\/script>

<template>
  <!-- Mount once near the root -->
  <LiquidToaster${attrStr} />
  <Button @click="save">Show notification</Button>
</template>`;
});

// ── Examples ──────────────────────────────────────────────────────────────────
function pushColor(color: Color) {
  toast[color]({
    title: p(`examples.colors.${color}Title`),
    description: p(`examples.colors.${color}Desc`),
  });
}

function pushAction() {
  toast.push({
    title: p("examples.action.toastTitle"),
    description: p("examples.action.toastDesc"),
    color: "info",
    duration: 0,
    action: {
      label: p("examples.action.undo"),
      onClick: (close) => {
        close();
        toast.success(p("examples.action.restored"));
      },
    },
  });
}

function pushPromise(fail: boolean) {
  const work = new Promise<string>((resolve, reject) =>
    setTimeout(
      () => (fail ? reject(new Error("timeout")) : resolve("report.pdf")),
      1600,
    ),
  );
  toast
    .promise(work, {
      loading: p("examples.promise.loading"),
      success: (name) => ({ title: p("examples.promise.success"), description: name }),
      error: () => ({
        title: p("examples.promise.error"),
        description: p("examples.promise.errorDesc"),
      }),
    })
    .catch(() => {});
}

let uploadTimer: ReturnType<typeof setInterval> | undefined;
function startUpload() {
  clearInterval(uploadTimer);
  let pct = 0;
  const id = toast.push({
    id: "upload",
    title: p("examples.update.uploading"),
    description: "0%",
    color: "info",
    loading: true,
    duration: 0,
    dismissable: false,
  });
  uploadTimer = setInterval(() => {
    pct += 25;
    if (pct < 100) {
      toast.update(id, { description: `${pct}%`, loading: true });
      return;
    }
    clearInterval(uploadTimer);
    toast.update(id, {
      title: p("examples.update.done"),
      description: "100%",
      color: "success",
      duration: 3000,
      dismissable: true,
    });
  }, 700);
}
onBeforeUnmount(() => clearInterval(uploadTimer));

function pushPinned() {
  toast.warning({
    title: p("examples.persistent.toastTitle"),
    description: p("examples.persistent.toastDesc"),
    variant: "filled",
    duration: 0,
    pauseOnHover: false,
  });
}

const colorsCode = `import { liquidToast } from 'mood-ui';

liquidToast.info({ title: 'Syncing', description: 'Fetching the latest data.' });
liquidToast.success({ title: 'Saved', description: 'Changes applied.' });
liquidToast.warning({ title: 'Storage almost full', description: '92% used.' });
liquidToast.danger({ title: 'Payment failed', description: 'The card was declined.' });`;

const actionCode = `import { liquidToast } from 'mood-ui';

liquidToast.push({
  title: 'Message archived',
  description: 'It was moved to the archive.',
  duration: 0, // stays until dismissed
  action: {
    label: 'Undo',
    // close() dismisses this toast; set keepOpen: true to keep it after the click
    onClick: (close) => {
      restoreMessage();
      close();
    },
  },
});`;

const promiseCode = `import { liquidToast } from 'mood-ui';

await liquidToast.promise(exportReport(), {
  loading: 'Exporting report…',
  success: (file) => ({ title: 'Report ready', description: file.name }),
  error: () => ({ title: 'Export failed', description: 'Try again in a moment.' }),
});`;

const updateCode = `import { liquidToast } from 'mood-ui';

// A stable id lets you update the same toast in place
const id = liquidToast.push({
  id: 'upload',
  title: 'Uploading',
  description: '0%',
  loading: true,
  duration: 0,
  dismissable: false,
});

liquidToast.update(id, { description: '50%', loading: true });
liquidToast.update(id, { title: 'Upload complete', color: 'success', duration: 3000 });`;

const persistentCode = `import { liquidToast } from 'mood-ui';

liquidToast.warning({
  title: 'Maintenance tonight',
  description: 'The service will be read-only from 23:00 to 23:30.',
  variant: 'filled',
  duration: 0,
});

// Later
liquidToast.dismissAll();`;

const controllerCode = `import { LiquidToaster, liquidToast, createLiquidToast } from 'mood-ui';

// Shared controller (call it from events or onMounted; server calls are ignored)
liquidToast('Saved');                       // push a plain title
const id = liquidToast.info({ title: 'Syncing' });
liquidToast.dismiss(id);                    // play the exit morph for one toast
liquidToast.dismissAll();                   // clear the stage and the queue

// Isolated state, e.g. one store per Vue app or per Nuxt request
const notifications = createLiquidToast();
// <LiquidToaster :controller="notifications" />
notifications.success({ title: 'Saved' });`;

const typesCode = `export type LiquidToastColor = 'info' | 'success' | 'warning' | 'danger';
export type LiquidToastVariant = 'filled' | 'subtle' | 'outline';
export type LiquidToastPlacement =
  | 'top-right' | 'top-left' | 'top-center'
  | 'bottom-right' | 'bottom-left' | 'bottom-center';

export interface LiquidToastAction {
  label: string;
  onClick?: (close: () => void) => void;
  keepOpen?: boolean;
}

export interface LiquidToastOptions {
  id?: string | number;
  title: VNodeChild;
  description?: VNodeChild;
  color?: LiquidToastColor;       // default 'info'
  variant?: LiquidToastVariant;   // default: the toaster's defaultVariant
  radius?: ModoRadius;
  size?: ModoSize;
  icon?: Component;
  hideIcon?: boolean;
  duration?: number;              // 0 keeps it until dismissed
  action?: LiquidToastAction;
  loading?: boolean;
  dismissable?: boolean;          // default true
  pauseOnHover?: boolean;         // default true
  placement?: LiquidToastPlacement;
}

export interface LiquidToastController {
  (options: LiquidToastOptions | string): string | number;
  push(options: LiquidToastOptions | string): string | number;
  info / success / warning / danger(options: Omit<LiquidToastOptions, 'color'> | string): string | number;
  update(id: string | number, patch: Partial<LiquidToastOptions>): void;
  dismiss(id: string | number): void;
  dismissAll(): void;
  promise<T>(promise: Promise<T>, messages: { loading; success; error }): Promise<T>;
}`;

// ── API tables ────────────────────────────────────────────────────────────────
const PLACEMENT_TYPE =
  "'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'";

const propsList = computed<PropDoc[]>(() => [
  { name: "placement", type: PLACEMENT_TYPE, default: "'top-center'", description: p("props.placement") },
  { name: "max", type: "number", default: "1", description: p("props.max") },
  { name: "defaultDuration", type: "number", default: "4500", description: p("props.defaultDuration") },
  { name: "defaultVariant", type: "'filled' | 'subtle' | 'outline'", default: "'subtle'", description: p("props.defaultVariant") },
  { name: "offset", type: "number", default: "16", description: p("props.offset") },
  { name: "size", type: "'xsmall' | 'small' | 'medium' | 'large'", description: p("props.size") },
  { name: "radius", type: "'none' | 'small' | 'medium' | 'large' | 'full'", description: p("props.radius") },
  { name: "controller", type: "LiquidToastController", default: "liquidToast", description: p("props.controller") },
  { name: "ariaLabel", type: "string", default: "locale liquidToast.region", description: p("props.ariaLabel") },
]);

const emitsList: EmitDoc[] = [];
const slotsList: SlotDoc[] = [];

// ── A11y ──────────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: p("a11y.kbTab") },
  { keys: ["Enter", "Space"], action: p("a11y.kbActivate") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  { attribute: "role", value: '"region"', desc: p("a11y.ariaRegion") },
  { attribute: "aria-live", value: "polite", desc: p("a11y.ariaPolite") },
  { attribute: "aria-live", value: "assertive", desc: p("a11y.ariaAssertive") },
  { attribute: "aria-hidden / inert", value: "true", desc: p("a11y.ariaPeek") },
]);

const a11yFocus = computed<string[]>(() => [
  p("a11y.focusNoSteal"),
  p("a11y.focusPause"),
  p("a11y.reducedMotion"),
]);
</script>

<template>
  <ComponentDoc
    :title="p('title')"
    :category="p('category')"
    :description="p('description')"
    import-path="import { LiquidToaster, liquidToast } from 'mood-ui'"
    :props-list="propsList"
    :emits-list="emitsList"
    :slots-list="slotsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="220px"
        lang="vue"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbDots
            v-model="pgColor"
            :label="p('controls.color')"
            :options="colorDots"
          />
          <TbSep />
          <TbPills
            v-model="pgVariant"
            :label="p('controls.variant')"
            :options="[
              { value: 'filled' },
              { value: 'subtle' },
              { value: 'outline' },
            ]"
          />
          <TbSep />
          <TbPills
            v-model="pgPlacement"
            :label="p('controls.placement')"
            :options="[
              { value: 'top-left' },
              { value: 'top-center' },
              { value: 'top-right' },
              { value: 'bottom-left' },
              { value: 'bottom-center' },
              { value: 'bottom-right' },
            ]"
          />
          <TbSep />
          <TbPills
            v-model="pgMax"
            :label="p('controls.max')"
            :options="[{ value: '1' }, { value: '2' }, { value: '3' }]"
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
        </template>

        <LiquidToaster
          :controller="toast"
          :placement="pgPlacement"
          :max="Number(pgMax)"
          :default-variant="pgVariant"
          :size="pgSize"
          :radius="pgRadius"
        />
        <Button :color="pgColor === 'info' ? 'primary' : pgColor" @click="notify">
          {{ p("playground.show") }}
        </Button>
        <Button variant="outline" @click="queueThree">
          {{ p("playground.queue") }}
        </Button>
        <Button variant="ghost" @click="toast.dismissAll()">
          {{ p("playground.dismissAll") }}
        </Button>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="p('examples.colors.title')"
        :description="p('examples.colors.desc')"
        :code="colorsCode"
        lang="ts"
        min-height="160px"
      >
        <Button variant="outline" @click="pushColor('info')">info()</Button>
        <Button color="success" @click="pushColor('success')">success()</Button>
        <Button color="warning" @click="pushColor('warning')">warning()</Button>
        <Button color="danger" @click="pushColor('danger')">danger()</Button>
      </ComponentPreview>

      <ComponentPreview
        :title="p('examples.action.title')"
        :description="p('examples.action.desc')"
        :code="actionCode"
        lang="ts"
        min-height="160px"
      >
        <Button variant="outline" @click="pushAction">
          {{ p("examples.action.cta") }}
        </Button>
      </ComponentPreview>

      <ComponentPreview
        :title="p('examples.promise.title')"
        :description="p('examples.promise.desc')"
        :code="promiseCode"
        lang="ts"
        min-height="160px"
      >
        <Button color="primary" @click="pushPromise(false)">
          {{ p("examples.promise.ctaOk") }}
        </Button>
        <Button variant="outline" @click="pushPromise(true)">
          {{ p("examples.promise.ctaFail") }}
        </Button>
      </ComponentPreview>

      <ComponentPreview
        :title="p('examples.update.title')"
        :description="p('examples.update.desc')"
        :code="updateCode"
        lang="ts"
        min-height="160px"
      >
        <Button variant="outline" @click="startUpload">
          {{ p("examples.update.cta") }}
        </Button>
      </ComponentPreview>

      <ComponentPreview
        :title="p('examples.persistent.title')"
        :description="p('examples.persistent.desc')"
        :code="persistentCode"
        lang="ts"
        min-height="160px"
      >
        <Button color="warning" @click="pushPinned">
          {{ p("examples.persistent.cta") }}
        </Button>
        <Button variant="outline" @click="toast.dismissAll()">
          {{ p("playground.dismissAll") }}
        </Button>
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
        {{ p("controller.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ p("controller.desc") }}
      </Typography>
      <CodePreview :code="controllerCode" lang="ts" code-only />

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
