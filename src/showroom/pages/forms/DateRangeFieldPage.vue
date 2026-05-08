<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import DateRangeField from '../../../components/forms/DateRangeField.vue';
import type { PropDoc, EmitDoc } from '../../types';

const { t } = useI18n();

type Range = [Date | null, Date | null];

// ── Overview playground state ─────────────────────────────────────────────────
const pgSize     = ref<'small' | 'medium' | 'large'>('medium');
const pgPresets  = ref(false);
const pgClearable = ref(false);
const pgDisabled = ref(false);

const pgValue = ref<Range>([new Date(), new Date(Date.now() + 5 * 86400000)]);

function resetPlayground() {
    pgSize.value      = 'medium';
    pgPresets.value   = false;
    pgClearable.value = false;
    pgDisabled.value  = false;
    pgValue.value     = [new Date(), new Date(Date.now() + 5 * 86400000)];
}

const overviewCode = computed(() => {
    const parts: string[] = ['v-model="range"', 'label="Periodo"'];
    if (pgSize.value !== 'medium') parts.push(`size="${pgSize.value}"`);
    if (pgPresets.value)           parts.push('show-presets');
    if (pgClearable.value)         parts.push('clearable');
    if (pgDisabled.value)          parts.push('disabled');
    return `<DateRangeField\n    ${parts.join('\n    ')}\n    class="w-96"\n/>`;
});

// ── Examples state ────────────────────────────────────────────────────────────
const rBasic       = ref<Range>([new Date(), new Date(Date.now() + 3 * 86400000)]);
const rPresets     = ref<Range>([null, null]);
const rConstrained = ref<Range>([null, null]);
const rDisabled    = ref<Range>([new Date(), new Date(Date.now() + 7 * 86400000)]);
const today        = new Date();
const maxDate      = new Date(Date.now() + 60 * 86400000);

const basicCode = `<DateRangeField v-model="range" label="Periodo" class="w-96" />`;

const presetsCode = `<DateRangeField v-model="range" label="Periodo" show-presets class="w-96" />`;

const constraintsCode = `<DateRangeField
    v-model="range"
    label="Reservar en los próximos 60 días"
    :min-date="new Date()"
    :max-date="new Date(Date.now() + 60 * 86400000)"
    class="w-96"
/>`;

const disabledCode = `<DateRangeField :model-value="range" label="Periodo" disabled class="w-96" />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
    { name: 'modelValue',  type: '[Date | null, Date | null]',           default: '[null, null]', description: t('pages.forms.dateRangeField.props.modelValue') },
    { name: 'label',       type: 'string',                                                        description: t('pages.forms.dateRangeField.props.label') },
    { name: 'placeholder', type: 'string',                                default: "'Select date range…'", description: t('pages.forms.dateRangeField.props.placeholder') },
    { name: 'size',        type: "'small' | 'medium' | 'large'",         default: "'medium'",     description: t('pages.forms.dateRangeField.props.size') },
    { name: 'months',      type: 'number',                                default: '2',           description: t('pages.forms.dateRangeField.props.months') },
    { name: 'showPresets', type: 'boolean',                               default: 'false',       description: t('pages.forms.dateRangeField.props.showPresets') },
    { name: 'minDate',     type: 'Date',                                                          description: t('pages.forms.dateRangeField.props.minDate') },
    { name: 'maxDate',     type: 'Date',                                                          description: t('pages.forms.dateRangeField.props.maxDate') },
    { name: 'minRange',    type: 'number',                                                        description: t('pages.forms.dateRangeField.props.minRange') },
    { name: 'maxRange',    type: 'number',                                                        description: t('pages.forms.dateRangeField.props.maxRange') },
    { name: 'clearable',   type: 'boolean',                               default: 'false',       description: t('pages.forms.dateRangeField.props.clearable') },
    { name: 'disabled',    type: 'boolean',                               default: 'false',       description: t('pages.forms.dateRangeField.props.disabled') },
    { name: 'readonly',    type: 'boolean',                               default: 'false',       description: t('pages.forms.dateRangeField.props.readonly') },
    { name: 'fullWidth',   type: 'boolean',                               default: 'false',       description: t('pages.forms.dateRangeField.props.fullWidth') },
]);

const emitsList = computed<EmitDoc[]>(() => [
    { name: 'update:modelValue', payload: '[Date | null, Date | null]', description: t('pages.forms.dateRangeField.emits.updateModelValue') },
    { name: 'change',            payload: '[Date | null, Date | null]', description: t('pages.forms.dateRangeField.emits.change') },
    { name: 'open',              payload: 'void',                       description: t('pages.forms.dateRangeField.emits.open') },
    { name: 'close',             payload: 'void',                       description: t('pages.forms.dateRangeField.emits.close') },
    { name: 'clear',             payload: 'void',                       description: t('pages.forms.dateRangeField.emits.clear') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.forms.dateRangeField.title')"
        :category="t('pages.forms.dateRangeField.category')"
        import-path="import { DateRangeField } from 'mood-ui'"
        :description="t('pages.forms.dateRangeField.description')"
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="300px" @reset="resetPlayground">
                <template #controls>
                    <!-- Size -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">{{ t('pages.forms.dateRangeField.controls.size').toUpperCase() }}</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in ['small', 'medium', 'large']"
                                :key="s"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgSize === s
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgSize = (s as typeof pgSize)"
                            >{{ s }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgPresets
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgPresets = !pgPresets"
                    >{{ t('pages.forms.dateRangeField.controls.presets') }}</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgClearable
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgClearable = !pgClearable"
                    >{{ t('pages.forms.dateRangeField.controls.clearable') }}</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDisabled
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDisabled = !pgDisabled"
                    >{{ t('pages.forms.dateRangeField.controls.disabled') }}</button>
                </template>

                <DateRangeField
                    v-model="pgValue"
                    :label="t('pages.forms.dateRangeField.playground.label')"
                    :size="pgSize"
                    :show-presets="pgPresets"
                    :clearable="pgClearable"
                    :disabled="pgDisabled"
                    class="w-96"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                :title="t('pages.forms.dateRangeField.examples.basic.title')"
                :description="t('pages.forms.dateRangeField.examples.basic.desc')"
                :code="basicCode"
            >
                <DateRangeField v-model="rBasic" label="Periodo" class="w-96" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.dateRangeField.examples.presets.title')"
                :description="t('pages.forms.dateRangeField.examples.presets.desc')"
                :code="presetsCode"
            >
                <DateRangeField v-model="rPresets" label="Periodo" show-presets class="w-96" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.dateRangeField.examples.minMax.title')"
                :description="t('pages.forms.dateRangeField.examples.minMax.desc')"
                :code="constraintsCode"
            >
                <DateRangeField
                    v-model="rConstrained"
                    label="Reservar en los próximos 60 días"
                    :min-date="today"
                    :max-date="maxDate"
                    class="w-96"
                />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.dateRangeField.examples.disabled.title')"
                :description="t('pages.forms.dateRangeField.examples.disabled.desc')"
                :code="disabledCode"
            >
                <DateRangeField :model-value="rDisabled" label="Periodo" disabled class="w-96" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
