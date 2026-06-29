<template>
  <div :class="['flex flex-col gap-1.5', fullWidth ? 'w-full' : 'inline-flex']">
    <!-- Label -->
    <label v-if="label" class="text-caption font-medium text-foreground">
      {{ label }}
      <span v-if="required" aria-hidden="true" class="text-destructive ml-0.5"
        >*</span
      >
    </label>

    <!-- Slot row -->
    <div
      role="group"
      :aria-label="ariaLabel ?? label"
      :aria-describedby="describedBy || undefined"
      :aria-disabled="isDisabled || undefined"
      class="flex items-center gap-2"
    >
      <template v-for="n in resolvedLength" :key="n - 1">
        <!-- Separator -->
        <span
          v-if="separator !== undefined && n - 1 === separator"
          class="text-muted-foreground font-medium select-none"
          aria-hidden="true"
          >—</span
        >

        <!-- Slot wrapper (same pattern as modo-field-wrapper in Input.vue) -->
        <div
          :class="[
            'modo-field-wrapper flex items-center justify-center',
            wrapperVariantClasses,
            slotSizeClasses,
            radiusClasses,
            isDisabled ? 'opacity-60 cursor-not-allowed' : '',
          ]"
        >
          <input
            ref="slotEls"
            :type="mask ? 'password' : 'text'"
            :inputmode="numeric ? 'numeric' : 'text'"
            :autocomplete="n === 1 ? 'one-time-code' : 'off'"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            maxlength="1"
            :value="internalSlots[n - 1]"
            :disabled="isDisabled"
            :readonly="readonly"
            :aria-label="`${loc.otpInput.digit} ${n}`"
            :aria-invalid="hasError || invalid || undefined"
            :class="[
              'modo-field-native bg-transparent text-center font-mono tabular-nums outline-none w-full h-full',
              slotTextClasses,
              isDisabled ? 'cursor-not-allowed' : '',
            ]"
            @input="onInput($event, n - 1)"
            @keydown="onKeydown($event, n - 1)"
            @focus="onSlotFocus($event)"
            @paste.prevent="onPaste($event, n - 1)"
          />
        </div>
      </template>

      <!-- Loading spinner -->
      <Loader
        v-if="loading"
        :size="sz.value.control === 'h-12' ? 'medium' : 'small'"
        class="ml-1 text-muted-foreground shrink-0"
      />
    </div>

    <!-- Hidden input for form submission -->
    <input v-if="name" type="hidden" :name="name" :value="currentValue" />

    <!-- Helper / Error text -->
    <Typography
      v-if="errorText"
      :id="errorId"
      variant="caption"
      size="medium"
      color="danger"
      as="p"
    >
      {{ errorText }}
    </Typography>
    <Typography
      v-else-if="helperText"
      :id="helperId"
      variant="caption"
      size="medium"
      color="muted"
      as="p"
    >
      {{ helperText }}
    </Typography>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from "vue";
import {
  useSizeTokens,
  useResolvedRadius,
  useModoLocale,
} from "../../composables/useModoConfig";
import { useFieldState, useFieldClasses } from "../../composables/useField";
import Typography from "../data-display/Typography.vue";
import Loader from "../feedback/Loader.vue";
import type { OTPInput as OTPInputProps } from "../../interfaces/forms/OTPInput.interface";

defineOptions({ name: "OTPInput" });

const props = withDefaults(defineProps<OTPInputProps>(), {
  length: 6,
  mask: false,
  numeric: true,
  disabled: false,
  readonly: false,
  required: false,
  autofocus: false,
  loading: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
  complete: [value: string];
}>();

const loc = useModoLocale();

// ── Resolved length (clamped 1–12) ───────────────────────────────────────────
const resolvedLength = computed(() =>
  Math.max(1, Math.min(props.length ?? 6, 12)),
);

// ── Field state ───────────────────────────────────────────────────────────────
const { stateColor, hasError, isDisabled, errorId, helperId, describedBy } =
  useFieldState(props, { componentName: "OTPInput", idPrefix: "modo-otp" });

const sz = useSizeTokens(() => props.size);
const radius = useResolvedRadius(() => props.radius);

const { wrapperVariantClasses, radiusClasses } = useFieldClasses({
  variant: () => "outline" as const,
  stateColor,
  hasError,
  radius,
  halo: () => props.halo,
});

// ── Internal slots ────────────────────────────────────────────────────────────
const internalSlots = ref<string[]>(Array(resolvedLength.value).fill(""));

function syncFromModelValue(v: string | undefined) {
  const chars = (v ?? "").split("");
  internalSlots.value = Array.from(
    { length: resolvedLength.value },
    (_, i) => chars[i] ?? "",
  );
}

watch(() => props.modelValue, syncFromModelValue, { immediate: true });

watch(resolvedLength, (len) => {
  internalSlots.value = Array.from(
    { length: len },
    (_, i) => internalSlots.value[i] ?? "",
  );
});

const currentValue = computed(() => internalSlots.value.join(""));

function emitValue() {
  const val = currentValue.value;
  emit("update:modelValue", val);
  emit("change", val);
  if (internalSlots.value.every((s) => s.length > 0)) {
    emit("complete", val);
  }
}

// ── DOM refs ──────────────────────────────────────────────────────────────────
const slotEls = ref<HTMLInputElement[]>([]);

function focusSlot(index: number) {
  const el = slotEls.value[index];
  if (el) {
    el.focus();
    el.select();
  }
}

onMounted(() => {
  if (props.autofocus) focusSlot(0);
});

// ── Event handlers ────────────────────────────────────────────────────────────
function onInput(e: Event, index: number) {
  const input = e.target as HTMLInputElement;
  const raw = input.value;
  const char = raw.slice(-1);

  if (props.numeric && char && !/^\d$/.test(char)) {
    input.value = internalSlots.value[index] ?? "";
    return;
  }

  internalSlots.value[index] = char;
  emitValue();

  if (char && index < resolvedLength.value - 1) {
    nextTick(() => focusSlot(index + 1));
  }
}

function onKeydown(e: KeyboardEvent, index: number) {
  if (e.key === "Backspace") {
    e.preventDefault();
    if (internalSlots.value[index]) {
      internalSlots.value[index] = "";
      emitValue();
    } else if (index > 0) {
      internalSlots.value[index - 1] = "";
      emitValue();
      focusSlot(index - 1);
    }
  } else if (e.key === "Delete") {
    e.preventDefault();
    internalSlots.value[index] = "";
    emitValue();
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    if (index > 0) focusSlot(index - 1);
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    if (index < resolvedLength.value - 1) focusSlot(index + 1);
  } else if (e.key === "Home") {
    e.preventDefault();
    focusSlot(0);
  } else if (e.key === "End") {
    e.preventDefault();
    focusSlot(resolvedLength.value - 1);
  }
}

function onSlotFocus(e: FocusEvent) {
  (e.target as HTMLInputElement).select();
}

function onPaste(e: ClipboardEvent, startIndex: number) {
  const text = e.clipboardData?.getData("text") ?? "";
  const filtered = props.numeric
    ? text.replace(/\D/g, "")
    : text.replace(/\s/g, "");
  const chars = filtered.split("");

  let filled = 0;
  chars.forEach((char, i) => {
    const slotIndex = startIndex + i;
    if (slotIndex < resolvedLength.value) {
      internalSlots.value[slotIndex] = char;
      filled++;
    }
  });

  emitValue();
  const nextFocus = Math.min(startIndex + filled, resolvedLength.value - 1);
  nextTick(() => focusSlot(nextFocus));
}

// ── Slot size / text classes ──────────────────────────────────────────────────
const slotSizeClasses = computed(() => `${sz.value.control} aspect-square`);
const slotTextClasses = computed(() => sz.value.text);

// ── Public API ────────────────────────────────────────────────────────────────
defineExpose({
  focus: () => focusSlot(0),
  clear: () => {
    internalSlots.value = Array(resolvedLength.value).fill("");
    emitValue();
    nextTick(() => focusSlot(0));
  },
});
</script>
