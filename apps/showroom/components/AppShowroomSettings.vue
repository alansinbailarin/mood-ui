<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from "vue";
import {
  SwatchIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/vue/24/outline";
import { buildModoProviderSnippet } from "~/utils/configSnippet";
import { useI18n } from "vue-i18n";
import { Tooltip, PopoverPanel, usePopover } from "mood-ui";
import type { ModoRadius, ModoSize } from "mood-ui";
import { useDocsTheme, type DarkSurfacePreset } from "~/composables/useDocsTheme";

// Self-contained — pulls and writes through the shared docs theme
// singleton, which the ModoProvider in the layouts also reads from.
const { state, reset: resetTheme } = useDocsTheme();

const radius = computed({
  get: () => state.value.radius,
  set: (v: ModoRadius) => (state.value.radius = v),
});
const size = computed({
  get: () => state.value.size,
  set: (v: ModoSize) => (state.value.size = v),
});
const primaryHex = computed({
  get: () => state.value.primaryHex,
  set: (v: string) => (state.value.primaryHex = v),
});
const baseIntensity = computed({
  get: () => state.value.baseIntensity,
  set: (v: number) => (state.value.baseIntensity = v),
});
const darkSurface = computed({
  get: () => state.value.darkSurface,
  set: (v: DarkSurfacePreset) => (state.value.darkSurface = v),
});

const { t } = useI18n();

const { triggerRef, panelRef, isOpen, panelStyle, toggle } = usePopover({
  placement: "bottom-end",
  offset: 10,
});

const copied = ref(false);
let copyTimer: ReturnType<typeof setTimeout> | undefined;

async function copyConfig() {
  try {
    await navigator.clipboard.writeText(buildModoProviderSnippet(state.value));
    copied.value = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    /* clipboard unavailable / permission denied — no-op */
  }
}

onBeforeUnmount(() => clearTimeout(copyTimer));

interface Swatch {
  name: string;
  hex: string;
}

const swatches: Swatch[] = [
  { name: t("colors.indigo"), hex: "#6366f1" },
  { name: t("colors.violet"), hex: "#8b5cf6" },
  { name: t("colors.purple"), hex: "#a855f7" },
  { name: t("colors.fuchsia"), hex: "#d946ef" },
  { name: t("colors.pink"), hex: "#ec4899" },
  { name: t("colors.rose"), hex: "#f43f5e" },
  { name: t("colors.red"), hex: "#ef4444" },
  { name: t("colors.orange"), hex: "#f97316" },
  { name: t("colors.amber"), hex: "#f59e0b" },
  { name: t("colors.yellow"), hex: "#eab308" },
  { name: t("colors.lime"), hex: "#84cc16" },
  { name: t("colors.green"), hex: "#22c55e" },
  { name: t("colors.emerald"), hex: "#10b981" },
  { name: t("colors.teal"), hex: "#14b8a6" },
  { name: t("colors.cyan"), hex: "#06b6d4" },
  { name: t("colors.sky"), hex: "#0ea5e9" },
  { name: t("colors.blue"), hex: "#3b82f6" },
  { name: t("colors.slate"), hex: "#64748b" },
];

const radiusOptions: { value: ModoRadius; label: string }[] = [
  { value: "none", label: "0" },
  { value: "small", label: "sm" },
  { value: "medium", label: "md" },
  { value: "large", label: "lg" },
  { value: "full", label: "full" },
];

const sizeOptions: { value: ModoSize; label: string }[] = [
  { value: "small", label: "sm" },
  { value: "medium", label: "md" },
  { value: "large", label: "lg" },
];

const surfaceOptions: {
  value: DarkSurfacePreset;
  label: string;
  sample: string;
}[] = [
  { value: "default", label: t("surfaces.default"), sample: "#0b1220" },
  { value: "navy", label: t("surfaces.navy"), sample: "#0a1530" },
  { value: "zinc", label: t("surfaces.zinc"), sample: "#18181b" },
  { value: "charcoal", label: t("surfaces.charcoal"), sample: "#1c1917" },
  { value: "midnight", label: t("surfaces.midnight"), sample: "#0a0a1a" },
  { value: "forest", label: t("surfaces.forest"), sample: "#0f1c14" },
];

const activePrimary = computed(() =>
  swatches.find((s) => s.hex.toLowerCase() === primaryHex.value.toLowerCase()),
);
</script>

<template>
  <!-- Trigger -->
  <Tooltip :content="t('settings.customizeTheme')">
    <button
      ref="triggerRef"
      type="button"
      :aria-label="t('settings.customizeTheme')"
      :aria-expanded="isOpen"
      class="relative inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-muted/60"
      @click="toggle"
    >
      <SwatchIcon
        class="w-5 h-5 transition-colors"
        :style="{ color: primaryHex }"
      />
    </button>
  </Tooltip>

  <PopoverPanel
    :open="isOpen"
    :style="panelStyle"
    radius="large"
    role="dialog"
    :aria-label="t('settings.customizeTheme')"
    @update:panelRef="panelRef = $event"
  >
    <div class="w-62 flex flex-col rounded-2xl overflow-hidden">
      <!-- ── Header ── -->
      <div class="relative shrink-0 overflow-hidden">
        <!-- Accent line -->
        <div
          class="h-0.5 w-full"
          :style="{
            background: `linear-gradient(90deg, transparent 0%, ${primaryHex} 40%, ${primaryHex}60 70%, transparent 100%)`,
          }"
        />
        <div
          class="px-3 py-2.5 border-b border-border/50"
          :style="{
            background: `linear-gradient(135deg, ${primaryHex}14 0%, transparent 50%)`,
          }"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 min-w-0">
              <div
                class="size-[14px] rounded-full shrink-0"
                :style="{
                  background: primaryHex,
                  boxShadow: `0 0 0 2.5px ${primaryHex}30, 0 0 10px ${primaryHex}55`,
                }"
              />
              <span
                class="text-[11.5px] font-semibold text-foreground tracking-tight truncate"
              >
                {{ t("settings.customizeTheme") }}
              </span>
            </div>
            <Tooltip :content="t('settings.reset')">
              <button
                type="button"
                class="size-6 shrink-0 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                @click="resetTheme()"
              >
                <ArrowPathIcon class="w-[13px] h-[13px]" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <!-- ── Body ── -->
      <div class="max-h-[min(80vh,520px)] overflow-y-auto overscroll-contain">
        <div class="px-3 py-2.5 flex flex-col gap-3">
          <!-- ── Primary Color ── -->
          <section>
            <div class="flex items-center justify-between mb-1.5">
              <span
                class="text-[9px] font-bold text-muted-foreground uppercase tracking-widest"
              >
                {{ t("settings.primary") }}
              </span>
              <span
                v-if="activePrimary"
                class="text-[8px] font-bold px-[6px] py-[2px] rounded-full"
                :style="{ background: primaryHex + '18', color: primaryHex }"
                >{{ activePrimary.name }}</span
              >
            </div>

            <!-- Swatch dots — no container, raw grid -->
            <div class="grid grid-cols-9 gap-y-1.5 gap-x-[5px] mb-2">
              <Tooltip
                v-for="s in swatches"
                :key="`prim-${s.hex}`"
                :content="s.name"
              >
                <button
                  type="button"
                  :aria-label="`Primary ${s.name}`"
                  class="size-[14px] rounded-full mx-auto block transition-all duration-150 hover:scale-110"
                  :style="{
                    backgroundColor: s.hex,
                    transform:
                      primaryHex.toLowerCase() === s.hex.toLowerCase()
                        ? 'scale(0.78)'
                        : undefined,
                    outline:
                      primaryHex.toLowerCase() === s.hex.toLowerCase()
                        ? `2px solid ${s.hex}`
                        : 'none',
                    outlineOffset: '3px',
                  }"
                  @click="primaryHex = s.hex"
                />
              </Tooltip>
            </div>
          </section>

          <!-- divider -->
          <div class="h-px bg-border/40" />

          <!-- ── Base Intensity ── -->
          <section>
            <div class="flex items-center justify-between mb-2">
              <span
                class="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em]"
                >{{ t("settings.base") }}</span
              >
              <span
                class="text-[8px] font-bold tabular-nums px-[6px] py-[2px] rounded-full transition-all"
                :style="
                  baseIntensity > 0
                    ? { background: primaryHex + '18', color: primaryHex }
                    : { color: 'var(--muted-foreground)', opacity: '0.5' }
                "
                >{{ baseIntensity }}%</span
              >
            </div>
            <div class="relative h-4 flex items-center">
              <div
                class="absolute inset-x-0 h-[3px] rounded-full pointer-events-none"
                :style="{
                  background: `linear-gradient(90deg, ${primaryHex}30 0%, ${primaryHex} 100%)`,
                }"
              />
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                :value="baseIntensity"
                :aria-label="t('settings.base')"
                class="w-full h-[3px] cursor-pointer bg-transparent appearance-none [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[13px] [&::-webkit-slider-thumb]:h-[13px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.07)] [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:w-[13px] [&::-moz-range-thumb]:h-[13px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.2)]"
                @input="
                  (e: Event) =>
                    baseIntensity = Number((e.target as HTMLInputElement).value)
                "
              />
            </div>
          </section>

          <!-- divider -->
          <div class="h-px bg-border/40" />

          <!-- ── Radius ── -->
          <section>
            <span
              class="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em] block mb-1.5"
              >{{ t("settings.radius") }}</span
            >
            <div class="grid grid-cols-5 gap-1">
              <button
                v-for="opt in radiusOptions"
                :key="opt.value"
                type="button"
                class="flex flex-col items-center gap-[5px] py-[7px] rounded-lg border transition-all duration-100"
                :class="
                  radius === opt.value
                    ? 'border-transparent'
                    : 'border-border text-muted-foreground hover:border-foreground/20 hover:bg-muted/20'
                "
                :style="
                  radius === opt.value
                    ? {
                        background: primaryHex + '12',
                        boxShadow: `0 0 0 1.5px ${primaryHex}`,
                        color: primaryHex,
                      }
                    : {}
                "
                @click="radius = opt.value"
              >
                <div
                  class="size-[12px] border-[1.5px]"
                  :style="{
                    borderColor:
                      radius === opt.value ? primaryHex : 'currentColor',
                    opacity: radius === opt.value ? 1 : 0.4,
                    borderRadius:
                      opt.value === 'none'
                        ? '0'
                        : opt.value === 'small'
                          ? '2px'
                          : opt.value === 'medium'
                            ? '4px'
                            : opt.value === 'large'
                              ? '7px'
                              : '50%',
                  }"
                />
              </button>
            </div>
          </section>

          <!-- ── Density ── -->
          <section>
            <span
              class="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em] block mb-1.5"
              >{{ t("settings.density") }}</span
            >
            <div class="grid grid-cols-3 gap-1">
              <button
                v-for="opt in sizeOptions"
                :key="opt.value"
                type="button"
                class="flex items-center justify-center py-2.25 rounded-lg border transition-all duration-100"
                :class="
                  size === opt.value
                    ? 'border-transparent'
                    : 'border-border text-muted-foreground hover:border-foreground/20 hover:bg-muted/20'
                "
                :style="
                  size === opt.value
                    ? {
                        background: primaryHex + '12',
                        boxShadow: `0 0 0 1.5px ${primaryHex}`,
                        color: primaryHex,
                      }
                    : {}
                "
                @click="size = opt.value"
              >
                <span class="flex items-end gap-[1.5px]" style="height: 10px">
                  <span
                    class="w-0.5 rounded-[1px]"
                    :style="{
                      height:
                        opt.value === 'small'
                          ? '3px'
                          : opt.value === 'medium'
                            ? '5px'
                            : '7px',
                      backgroundColor: 'currentColor',
                      opacity: 0.6,
                    }"
                  />
                  <span
                    class="w-0.5 rounded-[1px]"
                    :style="{
                      height:
                        opt.value === 'small'
                          ? '6px'
                          : opt.value === 'medium'
                            ? '8px'
                            : '9px',
                      backgroundColor: 'currentColor',
                    }"
                  />
                  <span
                    class="w-0.5 rounded-[1px]"
                    :style="{
                      height:
                        opt.value === 'small'
                          ? '4px'
                          : opt.value === 'medium'
                            ? '6px'
                            : '8px',
                      backgroundColor: 'currentColor',
                      opacity: 0.75,
                    }"
                  />
                </span>
              </button>
            </div>
          </section>

          <!-- divider -->
          <div class="h-px bg-border/40" />

          <!-- ── Surface (Dark) ── -->
          <section>
            <div class="flex items-center justify-between mb-1.5">
              <span
                class="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em]"
                >{{ t("settings.surface") }}</span
              >
              <span
                class="text-[8px] font-medium text-muted-foreground capitalize"
                >{{ darkSurface }}</span
              >
            </div>
            <div class="grid grid-cols-3 gap-1">
              <button
                v-for="opt in surfaceOptions"
                :key="opt.value"
                type="button"
                class="flex flex-col gap-1 p-[5px] rounded-xl border overflow-hidden transition-all duration-100"
                :class="
                  darkSurface === opt.value
                    ? 'border-transparent'
                    : 'border-border hover:border-foreground/15'
                "
                :style="
                  darkSurface === opt.value
                    ? { boxShadow: `0 0 0 1.5px ${primaryHex}` }
                    : {}
                "
                @click="darkSurface = opt.value"
              >
                <div
                  class="w-full rounded-md ring-1 ring-inset ring-white/10 relative overflow-hidden"
                  :style="{ background: opt.sample, height: '26px' }"
                >
                  <div class="absolute top-[4px] left-[4px] flex gap-[2px]">
                    <span class="size-[3.5px] rounded-full bg-white/30" />
                    <span class="size-[3.5px] rounded-full bg-white/18" />
                    <span class="size-[3.5px] rounded-full bg-white/10" />
                  </div>
                  <div
                    class="absolute bottom-[4px] left-[4px] right-[4px] flex flex-col gap-[2px]"
                  >
                    <span class="h-[1.5px] rounded-full bg-white/20 w-4/5" />
                    <span class="h-[1.5px] rounded-full bg-white/10 w-3/5" />
                  </div>
                </div>
                <span
                  class="text-[7.5px] font-semibold text-muted-foreground text-center leading-none truncate px-0.5"
                  >{{ opt.label }}</span
                >
              </button>
            </div>
          </section>
        </div>
      </div>

      <!-- ── Footer ── -->
      <div
        class="flex items-center justify-between px-3 py-2 border-t border-border/40 shrink-0"
      >
        <button
          type="button"
          class="flex items-center gap-1 text-[8px] font-semibold transition-colors"
          :class="
            copied
              ? 'text-success'
              : 'text-muted-foreground/70 hover:text-foreground'
          "
          @click="copyConfig"
        >
          <component
            :is="copied ? CheckIcon : ClipboardDocumentIcon"
            class="w-[11px] h-[11px]"
          />
          {{ copied ? t("settings.copied") : t("settings.copyConfig") }}
        </button>
        <button
          type="button"
          class="text-[8px] font-semibold text-muted-foreground/50 hover:text-foreground transition-colors"
          @click="resetTheme()"
        >
          {{ t("labels.resetAll") }}
        </button>
      </div>
    </div>
  </PopoverPanel>
</template>
