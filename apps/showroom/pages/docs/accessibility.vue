<script setup lang="ts">
import { computed, inject, onMounted, watch } from "vue";
import { Banner, Card, Stack, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import {
  EyeIcon,
  CommandLineIcon,
  CursorArrowRaysIcon,
  CodeBracketIcon,
  BoltIcon,
  TagIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  CheckIcon,
} from "@heroicons/vue/24/outline";





import { vReveal, vRevealChildren } from "~/composables/useScrollReveal";
import { DOC_TOC_KEY } from "~/composables/useDocToc";

const go = useEntryNav();
const { t, locale } = useI18n();


useSeoMeta({
  title: () => t("pages.docs.accessibility.title"),
  description: () => t("pages.docs.accessibility.description"),
  ogTitle: () => `${t("pages.docs.accessibility.title")} · mood-ui`,
  ogDescription: () => t("pages.docs.accessibility.description"),
});

defineOgImage("Default", {
  title: t("pages.docs.accessibility.title"),
  description: t("pages.docs.accessibility.description"),
  category: "Docs",
});
const toc = inject(DOC_TOC_KEY, null);

function registerToc() {
  if (!toc) return;
  toc.register({
    id: "principles",
    label: t("pages.docs.accessibility.principlesTitle"),
    level: 1,
  });
  toc.register({
    id: "wcag",
    label: t("pages.docs.accessibility.wcagTitle"),
    level: 1,
  });
  toc.register({
    id: "keyboard",
    label: t("pages.docs.accessibility.kbTitle"),
    level: 1,
  });
  toc.register({
    id: "aria-patterns",
    label: t("pages.docs.accessibility.ariaTitle"),
    level: 1,
  });
  toc.register({
    id: "testing",
    label: t("pages.docs.accessibility.testTitle"),
    level: 1,
  });
}

onMounted(registerToc);
watch(locale, registerToc);

const principleCards = computed(() => [
  {
    icon: EyeIcon,
    key: "contrast",
    iconClasses:
      "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
    patternClasses:
      "text-primary [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:20px_20px]",
    hoverBorder: "hover:border-primary/50",
  },
  {
    icon: CommandLineIcon,
    key: "keyboard",
    iconClasses:
      "bg-success/10 text-success group-hover:bg-success group-hover:text-white",
    patternClasses:
      "text-success [background-image:radial-gradient(circle,currentColor_1.5px,transparent_1.5px)] [background-size:18px_18px]",
    hoverBorder: "hover:border-success/40",
  },
  {
    icon: CursorArrowRaysIcon,
    key: "focus",
    iconClasses:
      "bg-warning/10 text-warning group-hover:bg-warning group-hover:text-white",
    patternClasses:
      "text-warning [background-image:repeating-linear-gradient(-60deg,currentColor_0,currentColor_1px,transparent_0,transparent_12px)]",
    hoverBorder: "hover:border-warning/40",
  },
  {
    icon: CodeBracketIcon,
    key: "aria",
    iconClasses:
      "bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-white",
    patternClasses:
      "text-destructive [background-image:linear-gradient(45deg,currentColor_1px,transparent_1px),linear-gradient(-45deg,currentColor_1px,transparent_1px)] [background-size:14px_14px]",
    hoverBorder: "hover:border-destructive/40",
  },
  {
    icon: BoltIcon,
    key: "motion",
    iconClasses:
      "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
    patternClasses:
      "text-primary [background-image:radial-gradient(circle,currentColor_2px,transparent_2px)] [background-size:28px_28px]",
    hoverBorder: "hover:border-primary/50",
  },
  {
    icon: TagIcon,
    key: "labels",
    iconClasses:
      "bg-success/10 text-success group-hover:bg-success group-hover:text-white",
    patternClasses:
      "text-success [background-image:repeating-linear-gradient(0deg,currentColor_0,currentColor_1px,transparent_0,transparent_18px)]",
    hoverBorder: "hover:border-success/40",
  },
]);

const pourItems = computed(() => [
  {
    key: "perceivable",
    num: "1",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "hover:border-primary/40",
  },
  {
    key: "operable",
    num: "2",
    color: "text-success",
    bg: "bg-success/10",
    border: "hover:border-success/40",
  },
  {
    key: "understandable",
    num: "3",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "hover:border-warning/40",
  },
  {
    key: "robust",
    num: "4",
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "hover:border-destructive/40",
  },
]);

const kbGroups = computed(() => [
  {
    id: "controls",
    label: t("pages.docs.accessibility.kbGroups.controls"),
    rows: [
      {
        component: "Checkbox",
        keys: ["Space"],
        action: t("pages.docs.accessibility.kbActions.toggleChecked"),
      },
      {
        component: "Radio / RadioGroup",
        keys: ["↑", "↓", "←", "→"],
        action: t("pages.docs.accessibility.kbActions.navigateGroup"),
      },
      {
        component: "Switch",
        keys: ["Space", "Enter"],
        action: t("pages.docs.accessibility.kbActions.toggleSwitch"),
      },
      {
        component: "Segmented",
        keys: ["←", "→"],
        action: t("pages.docs.accessibility.kbActions.navigateSegmented"),
      },
      {
        component: "Rating",
        keys: ["←", "→"],
        action: t("pages.docs.accessibility.kbActions.adjustRating"),
      },
      {
        component: "TagInput",
        keys: ["Enter"],
        action: t("pages.docs.accessibility.kbActions.addTag"),
      },
      {
        component: "TagInput",
        keys: ["Backspace"],
        action: t("pages.docs.accessibility.kbActions.removeTag"),
      },
    ],
  },
  {
    id: "selection",
    label: t("pages.docs.accessibility.kbGroups.selection"),
    rows: [
      {
        component: "Select / MultiSelect / Combobox",
        keys: ["Space", "Enter"],
        action: t("pages.docs.accessibility.kbActions.openDropdown"),
      },
      {
        component: "Select / MultiSelect / Combobox",
        keys: ["↑", "↓"],
        action: t("pages.docs.accessibility.kbActions.navigateOptions"),
      },
      {
        component: "Select / MultiSelect / Combobox",
        keys: ["Enter"],
        action: t("pages.docs.accessibility.kbActions.selectOption"),
      },
      {
        component: "Select / MultiSelect / Combobox",
        keys: ["Escape"],
        action: t("pages.docs.accessibility.kbActions.closeDropdown"),
      },
      {
        component: "Combobox",
        keys: ["Type"],
        action: t("pages.docs.accessibility.kbActions.filterOptions"),
      },
    ],
  },
  {
    id: "datetime",
    label: t("pages.docs.accessibility.kbGroups.datetime"),
    rows: [
      {
        component: "DateField / DateTimeField / DateRangeField",
        keys: ["Tab"],
        action: t("pages.docs.accessibility.kbActions.nextSegment"),
      },
      {
        component: "DateField / DateTimeField",
        keys: ["↑", "↓"],
        action: t("pages.docs.accessibility.kbActions.incrDecr"),
      },
      {
        component: "Slider / RangeSlider",
        keys: ["←", "→", "↑", "↓"],
        action: t("pages.docs.accessibility.kbActions.adjustSlider"),
      },
      {
        component: "Slider / RangeSlider",
        keys: ["Home", "End"],
        action: t("pages.docs.accessibility.kbActions.minMax"),
      },
    ],
  },
  {
    id: "overlays",
    label: t("pages.docs.accessibility.kbGroups.overlays"),
    rows: [
      {
        component: "Modal / Drawer",
        keys: ["Escape"],
        action: t("pages.docs.accessibility.kbActions.closeOverlay"),
      },
      {
        component: "Modal / Drawer",
        keys: ["Tab"],
        action: t("pages.docs.accessibility.kbActions.moveFocusTrapped"),
      },
      {
        component: "ConfirmDialog",
        keys: ["Escape"],
        action: t("pages.docs.accessibility.kbActions.cancel"),
      },
      {
        component: "ConfirmDialog",
        keys: ["Enter"],
        action: t("pages.docs.accessibility.kbActions.confirm"),
      },
      {
        component: "ConfirmDialog / Modal",
        keys: ["Tab", "Shift+Tab"],
        action: t("pages.docs.accessibility.kbActions.cycleFocus"),
      },
    ],
  },
  {
    id: "navigation",
    label: t("pages.docs.accessibility.kbGroups.navigation"),
    rows: [
      {
        component: "Tabs",
        keys: ["←", "→"],
        action: t("pages.docs.accessibility.kbActions.navTabs"),
      },
      {
        component: "Tabs",
        keys: ["Home", "End"],
        action: t("pages.docs.accessibility.kbActions.firstLastTab"),
      },
      {
        component: "DropdownMenu",
        keys: ["↑", "↓"],
        action: t("pages.docs.accessibility.kbActions.navMenu"),
      },
      {
        component: "DropdownMenu",
        keys: ["Enter", "Space"],
        action: t("pages.docs.accessibility.kbActions.selectItem"),
      },
      {
        component: "DropdownMenu",
        keys: ["Escape"],
        action: t("pages.docs.accessibility.kbActions.closeMenu"),
      },
      {
        component: "Accordion",
        keys: ["Space", "Enter"],
        action: t("pages.docs.accessibility.kbActions.togglePanel"),
      },
    ],
  },
  {
    id: "calendar",
    label: t("pages.docs.accessibility.kbGroups.calendar"),
    rows: [
      {
        component: "Calendar views",
        keys: ["←", "→"],
        action: t("pages.docs.accessibility.kbActions.navDay"),
      },
      {
        component: "Calendar views",
        keys: ["↑", "↓"],
        action: t("pages.docs.accessibility.kbActions.navWeek"),
      },
      {
        component: "Calendar views",
        keys: ["Page Up", "Page Down"],
        action: t("pages.docs.accessibility.kbActions.navMonth"),
      },
      {
        component: "Calendar views",
        keys: ["Enter"],
        action: t("pages.docs.accessibility.kbActions.selectDate"),
      },
    ],
  },
]);

const ariaPatterns = computed(() => [
  {
    pattern: 'role="dialog" aria-modal="true"',
    components: ["Modal", "Drawer", "ConfirmDialog"],
    desc: t("pages.docs.accessibility.ariaPatterns.dialog"),
  },
  {
    pattern: 'role="combobox" aria-expanded aria-haspopup',
    components: ["Select", "MultiSelect", "Combobox"],
    desc: t("pages.docs.accessibility.ariaPatterns.combobox"),
  },
  {
    pattern: 'role="listbox" + role="option" aria-selected',
    components: ["Select", "MultiSelect", "Combobox"],
    desc: t("pages.docs.accessibility.ariaPatterns.listbox"),
  },
  {
    pattern: 'role="radiogroup" + role="radio" aria-checked',
    components: ["Radio", "RadioGroup"],
    desc: t("pages.docs.accessibility.ariaPatterns.radiogroup"),
  },
  {
    pattern: 'role="switch" aria-checked',
    components: ["Switch"],
    desc: t("pages.docs.accessibility.ariaPatterns.switch"),
  },
  {
    pattern: 'role="slider" aria-valuenow/min/max',
    components: ["Slider", "RangeSlider"],
    desc: t("pages.docs.accessibility.ariaPatterns.slider"),
  },
  {
    pattern: 'role="tablist" + role="tab" aria-selected',
    components: ["Tabs"],
    desc: t("pages.docs.accessibility.ariaPatterns.tablist"),
  },
  {
    pattern: 'aria-live="polite" role="status"',
    components: ["Toast"],
    desc: t("pages.docs.accessibility.ariaPatterns.live"),
  },
  {
    pattern: 'role="progressbar" aria-valuenow',
    components: ["ProgressBar"],
    desc: t("pages.docs.accessibility.ariaPatterns.progressbar"),
  },
  {
    pattern: 'role="tooltip" aria-describedby',
    components: ["Tooltip"],
    desc: t("pages.docs.accessibility.ariaPatterns.tooltip"),
  },
]);

const testingTools = computed(() => [
  {
    name: "axe-core",
    type: t("pages.docs.accessibility.toolType.library"),
    desc: t("pages.docs.accessibility.tools.axe"),
    href: "https://github.com/dequelabs/axe-core",
    typeBg: "bg-primary/10",
    typeColor: "text-primary",
  },
  {
    name: "Axe DevTools",
    type: t("pages.docs.accessibility.toolType.extension"),
    desc: t("pages.docs.accessibility.tools.axeExt"),
    href: "https://www.deque.com/axe/devtools/",
    typeBg: "bg-success/10",
    typeColor: "text-success",
  },
  {
    name: "WAVE",
    type: t("pages.docs.accessibility.toolType.extension"),
    desc: t("pages.docs.accessibility.tools.wave"),
    href: "https://wave.webaim.org/",
    typeBg: "bg-success/10",
    typeColor: "text-success",
  },
  {
    name: "Lighthouse",
    type: t("pages.docs.accessibility.toolType.builtin"),
    desc: t("pages.docs.accessibility.tools.lighthouse"),
    href: "https://developer.chrome.com/docs/lighthouse/accessibility/",
    typeBg: "bg-warning/10",
    typeColor: "text-warning",
  },
  {
    name: "VoiceOver",
    type: t("pages.docs.accessibility.toolType.screenreader"),
    desc: t("pages.docs.accessibility.tools.voiceover"),
    href: "https://support.apple.com/guide/voiceover/welcome/mac",
    typeBg: "bg-destructive/10",
    typeColor: "text-destructive",
  },
  {
    name: "NVDA",
    type: t("pages.docs.accessibility.toolType.screenreader"),
    desc: t("pages.docs.accessibility.tools.nvda"),
    href: "https://www.nvaccess.org/download/",
    typeBg: "bg-destructive/10",
    typeColor: "text-destructive",
  },
]);

const checklist = computed(() => [
  t("pages.docs.accessibility.checklist.item1"),
  t("pages.docs.accessibility.checklist.item2"),
  t("pages.docs.accessibility.checklist.item3"),
  t("pages.docs.accessibility.checklist.item4"),
  t("pages.docs.accessibility.checklist.item5"),
  t("pages.docs.accessibility.checklist.item6"),
  t("pages.docs.accessibility.checklist.item7"),
  t("pages.docs.accessibility.checklist.item8"),
]);
</script>

<template>
  <div class="flex flex-col gap-10 pb-12">
    <!-- Header -->
    <header v-reveal class="flex flex-col gap-3">
      <Typography variant="overline" size="medium" color="muted">
        {{ t("pages.docs.accessibility.overline") }}
      </Typography>
      <Typography
        variant="display"
        size="medium"
        as="h1"
        weight="medium"
        class="tracking-tight leading-[1.05]"
      >
        {{ t("pages.docs.accessibility.title") }}
      </Typography>
      <Typography variant="body" size="medium" color="muted" weight="light">
        {{ t("pages.docs.accessibility.subtitle") }}
      </Typography>
    </header>

    <!-- Disclaimer -->
    <Banner v-reveal color="warning" variant="subtle">
      <strong>{{ t("pages.docs.accessibility.disclaimerTitle") }}:</strong>
      {{ t("pages.docs.accessibility.disclaimerBody") }}
    </Banner>

    <!-- Target level -->
    <section v-reveal class="flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <div
          class="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0"
        >
          <ShieldCheckIcon class="size-5" />
        </div>
        <Typography variant="title" size="large" weight="medium" as="h2">
          {{ t("pages.docs.accessibility.targetTitle") }}
        </Typography>
      </div>
      <Typography
        variant="body"
        size="small"
        color="muted"
        weight="light"
        class="pl-[3.25rem]"
      >
        {{ t("pages.docs.accessibility.targetDesc") }}
      </Typography>
    </section>

    <!-- What we ship -->
    <section id="principles" v-reveal class="flex flex-col gap-4">
      <Typography variant="title" size="large" weight="medium" as="h2">
        {{ t("pages.docs.accessibility.principlesTitle") }}
      </Typography>
      <div v-reveal-children class="grid sm:grid-cols-2 gap-4">
        <Card
          v-for="card in principleCards"
          :key="card.key"
          variant="outlined"
          padding="large"
          class="relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300"
          :class="card.hoverBorder"
        >
          <div
            class="pointer-events-none absolute inset-0 opacity-[0.065]"
            :class="card.patternClasses"
          />
          <Stack direction="column" spacing="small" class="relative">
            <div
              class="size-10 rounded-xl grid place-items-center transition-colors"
              :class="card.iconClasses"
            >
              <component :is="card.icon" class="size-5" />
            </div>
            <Typography variant="title" size="small" as="h3">
              {{ t(`pages.docs.accessibility.principles.${card.key}.title`) }}
            </Typography>
            <Typography variant="body" size="small" color="muted">
              {{ t(`pages.docs.accessibility.principles.${card.key}.text`) }}
            </Typography>
          </Stack>
        </Card>
      </div>
    </section>

    <!-- WCAG 2.2 POUR -->
    <section id="wcag" v-reveal class="flex flex-col gap-4">
      <Typography variant="title" size="large" weight="medium" as="h2">
        {{ t("pages.docs.accessibility.wcagTitle") }}
      </Typography>
      <Typography variant="body" size="small" color="muted" weight="light">
        {{ t("pages.docs.accessibility.wcagDesc") }}
      </Typography>
      <div v-reveal-children class="grid sm:grid-cols-2 gap-4">
        <Card
          v-for="item in pourItems"
          :key="item.key"
          variant="outlined"
          padding="large"
          class="flex flex-col gap-3 transition-all duration-200"
          :class="item.border"
        >
          <div class="flex items-center gap-3">
            <div
              class="size-8 rounded-lg grid place-items-center font-bold text-sm shrink-0"
              :class="[item.bg, item.color]"
            >
              {{ item.num }}
            </div>
            <Typography variant="title" size="small" weight="medium" as="h3">
              {{ t(`pages.docs.accessibility.pour.${item.key}.label`) }}
            </Typography>
          </div>
          <Typography variant="body" size="small" color="muted">
            {{ t(`pages.docs.accessibility.pour.${item.key}.text`) }}
          </Typography>
        </Card>
      </div>
    </section>

    <!-- Keyboard reference -->
    <section id="keyboard" v-reveal class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <Typography variant="title" size="large" weight="medium" as="h2">
          {{ t("pages.docs.accessibility.kbTitle") }}
        </Typography>
        <Typography variant="body" size="small" color="muted" weight="light">
          {{ t("pages.docs.accessibility.kbDesc") }}
        </Typography>
      </div>
      <div
        v-for="group in kbGroups"
        :key="group.id"
        class="flex flex-col gap-2"
      >
        <Typography
          variant="title"
          size="small"
          weight="medium"
          as="h3"
          class="px-1"
        >
          {{ group.label }}
        </Typography>
        <div class="overflow-hidden rounded-xl border border-border">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-muted/40 text-left">
                <th
                  class="px-4 py-2.5 w-[30%] text-xs font-medium text-muted-foreground"
                >
                  {{ t("pages.docs.accessibility.kbColComponent") }}
                </th>
                <th
                  class="px-4 py-2.5 w-[28%] text-xs font-medium text-muted-foreground"
                >
                  {{ t("pages.docs.accessibility.kbColKey") }}
                </th>
                <th
                  class="px-4 py-2.5 text-xs font-medium text-muted-foreground"
                >
                  {{ t("pages.docs.accessibility.kbColAction") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, i) in group.rows"
                :key="i"
                class="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td class="px-4 py-2.5 font-mono text-xs text-foreground/80">
                  {{ row.component }}
                </td>
                <td class="px-4 py-2.5">
                  <div class="flex flex-wrap gap-1">
                    <kbd
                      v-for="k in row.keys"
                      :key="k"
                      class="inline-flex items-center px-1.5 py-0.5 text-xs font-mono rounded border border-border bg-muted text-foreground"
                      >{{ k }}</kbd
                    >
                  </div>
                </td>
                <td class="px-4 py-2.5 text-muted-foreground text-xs">
                  {{ row.action }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ARIA patterns -->
    <section id="aria-patterns" v-reveal class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <Typography variant="title" size="large" weight="medium" as="h2">
          {{ t("pages.docs.accessibility.ariaTitle") }}
        </Typography>
        <Typography variant="body" size="small" color="muted" weight="light">
          {{ t("pages.docs.accessibility.ariaDesc") }}
        </Typography>
      </div>
      <div class="overflow-hidden rounded-xl border border-border">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/40 text-left">
              <th
                class="px-4 py-2.5 w-[38%] text-xs font-medium text-muted-foreground"
              >
                {{ t("pages.docs.accessibility.ariaColPattern") }}
              </th>
              <th
                class="px-4 py-2.5 w-[22%] text-xs font-medium text-muted-foreground"
              >
                {{ t("pages.docs.accessibility.ariaColComponents") }}
              </th>
              <th class="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                {{ t("pages.docs.accessibility.ariaColDesc") }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(p, i) in ariaPatterns"
              :key="i"
              class="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
            >
              <td class="px-4 py-2.5 font-mono text-xs text-primary">
                {{ p.pattern }}
              </td>
              <td class="px-4 py-2.5">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="c in p.components"
                    :key="c"
                    class="inline-flex items-center px-1.5 py-0.5 text-xs rounded-md bg-muted text-foreground"
                    >{{ c }}</span
                  >
                </div>
              </td>
              <td class="px-4 py-2.5 text-muted-foreground text-xs">
                {{ p.desc }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Testing guide -->
    <section id="testing" v-reveal class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <Typography variant="title" size="large" weight="medium" as="h2">
          {{ t("pages.docs.accessibility.testTitle") }}
        </Typography>
        <Typography variant="body" size="small" color="muted" weight="light">
          {{ t("pages.docs.accessibility.testDesc") }}
        </Typography>
      </div>

      <!-- Tools -->
      <div class="flex flex-col gap-3">
        <Typography
          variant="title"
          size="small"
          weight="medium"
          as="h3"
          class="px-1"
        >
          {{ t("pages.docs.accessibility.testToolsTitle") }}
        </Typography>
        <div v-reveal-children class="grid sm:grid-cols-2 gap-3">
          <a
            v-for="tool in testingTools"
            :key="tool.name"
            :href="tool.href"
            target="_blank"
            rel="noopener noreferrer"
            class="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 no-underline group"
          >
            <div class="flex items-center justify-between gap-2">
              <span
                class="font-mono text-sm font-semibold text-foreground group-hover:text-primary transition-colors"
              >
                {{ tool.name }}
              </span>
              <span
                class="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium"
                :class="[tool.typeBg, tool.typeColor]"
              >
                {{ tool.type }}
              </span>
            </div>
            <Typography variant="body" size="small" color="muted">
              {{ tool.desc }}
            </Typography>
          </a>
        </div>
      </div>

      <!-- Checklist -->
      <div class="flex flex-col gap-3">
        <Typography
          variant="title"
          size="small"
          weight="medium"
          as="h3"
          class="px-1"
        >
          {{ t("pages.docs.accessibility.testChecklistTitle") }}
        </Typography>
        <Card variant="outlined" padding="large">
          <ul class="flex flex-col gap-3 list-none p-0 m-0">
            <li
              v-for="(item, i) in checklist"
              :key="i"
              class="flex items-start gap-3 text-sm text-muted-foreground"
            >
              <div
                class="size-5 rounded-full bg-success/10 text-success grid place-items-center shrink-0 mt-0.5"
              >
                <CheckIcon class="size-3" />
              </div>
              {{ item }}
            </li>
          </ul>
        </Card>
      </div>
    </section>

    <!-- Next steps -->
    <section v-reveal class="flex flex-col gap-4">
      <Typography variant="heading" size="large" weight="medium">
        {{ t("pages.docs.accessibility.nextTitle") }}
      </Typography>
      <Typography variant="body" size="small" color="muted" weight="light">
        {{ t("pages.docs.accessibility.nextDesc") }}
      </Typography>
      <div class="grid sm:grid-cols-2 gap-4">
        <Card
          variant="outlined"
          padding="large"
          class="relative overflow-hidden cursor-pointer hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-300 group"
          @click="go('button')"
        >
          <div
            class="pointer-events-none absolute inset-0 opacity-[0.065] text-primary [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:20px_20px]"
          />
          <Stack direction="column" spacing="small" class="relative">
            <div
              class="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            >
              <ShieldCheckIcon class="size-5" />
            </div>
            <Typography variant="title" size="medium" weight="medium" as="h3">
              {{ t("pages.docs.accessibility.nextComponents") }}
            </Typography>
            <Typography
              variant="body"
              size="small"
              color="muted"
              weight="light"
            >
              {{ t("pages.docs.accessibility.nextComponentsDesc") }}
            </Typography>
            <span
              class="inline-flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all"
            >
              {{ t("pages.docs.accessibility.nextComponentsCta") }}
              <ArrowRightIcon class="size-4" />
            </span>
          </Stack>
        </Card>

        <a
          href="https://www.w3.org/TR/WCAG22/"
          target="_blank"
          rel="noopener noreferrer"
          class="block rounded-xl border border-border bg-card hover:border-success/40 hover:-translate-y-0.5 transition-all duration-300 p-6 group no-underline"
        >
          <Stack direction="column" spacing="small">
            <div
              class="size-10 rounded-xl bg-success/10 text-success grid place-items-center group-hover:bg-success group-hover:text-white transition-colors"
            >
              <ArrowTopRightOnSquareIcon class="size-5" />
            </div>
            <Typography variant="title" size="medium" weight="medium" as="h3">
              {{ t("pages.docs.accessibility.nextWcag") }}
            </Typography>
            <Typography
              variant="body"
              size="small"
              color="muted"
              weight="light"
            >
              {{ t("pages.docs.accessibility.nextWcagDesc") }}
            </Typography>
            <span
              class="inline-flex items-center gap-1 text-success text-sm font-medium group-hover:gap-2 transition-all"
            >
              {{ t("pages.docs.accessibility.nextWcagCta") }}
              <ArrowTopRightOnSquareIcon class="size-4" />
            </span>
          </Stack>
        </a>
      </div>
    </section>
  </div>
</template>
