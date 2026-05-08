<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import FormField from '../../../components/forms/FormField.vue';
import Input from '../../../components/forms/Input.vue';
import Select from '../../../components/forms/Select.vue';
import Textarea from '../../../components/forms/Textarea.vue';
import type { PropDoc, SlotDoc } from '../../types';

const { t } = useI18n();

const countries = [
    { value: 'es', label: 'España' },
    { value: 'mx', label: 'México' },
    { value: 'ar', label: 'Argentina' },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgRequired    = ref(false);
const pgDisabled    = ref(false);
const pgError       = ref(false);
const pgOrientation = ref<'vertical' | 'horizontal'>('vertical');

function resetPlayground() {
    pgRequired.value    = false;
    pgDisabled.value    = false;
    pgError.value       = false;
    pgOrientation.value = 'vertical';
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgOrientation.value !== 'vertical') parts.push(`orientation="${pgOrientation.value}"`);
    if (pgRequired.value) parts.push(':required="true"');
    if (pgDisabled.value) parts.push(':disabled="true"');
    if (pgError.value)    parts.push('error-text="Este campo es obligatorio"');
    const attrs = parts.length ? '\n    ' + parts.join('\n    ') : '';
    return `<FormField
    label="Email"
    helper-text="Lo usaremos para confirmar tu cuenta."${attrs}
>
    <Input v-model="email" placeholder="tu@email.com" />
</FormField>`;
});

// Playground state
const pgValue = ref('');

// ── Example code strings ──────────────────────────────────────────────────────
const inputCode = `<FormField label="Nombre completo" helper-text="Tal como aparece en tu DNI.">
    <Input v-model="name" placeholder="Ada Lovelace" />
</FormField>`;

const selectCode = `<FormField label="País" required>
    <Select v-model="country" :options="countries" placeholder="Elige un país" />
</FormField>`;

const textareaCode = `<FormField label="Comentarios" hint="Opcional">
    <Textarea v-model="message" rows="4" placeholder="Cuéntanos más…" />
</FormField>`;

const errorCode = `<FormField
    label="Email"
    error-text="El email no es válido"
    required
>
    <Input v-model="email" placeholder="tu@email.com" />
</FormField>`;

const horizontalCode = `<FormField
    label="URL pública"
    helper-text="Visible en tu perfil."
    orientation="horizontal"
    label-width="9rem"
    full-width
>
    <Input v-model="url" placeholder="https://…" full-width />
</FormField>`;

// Example state
const exName    = ref('');
const exCountry = ref<string | number | null>(null);
const exMessage = ref('');
const exEmail   = ref('invalido');
const exUrl     = ref('');

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
    { name: 'label',       type: 'string',                                                                  description: t('pages.forms.formField.props.label') },
    { name: 'helperText',  type: 'string',                                                                  description: t('pages.forms.formField.props.helperText') },
    { name: 'errorText',   type: 'string',                                                                  description: t('pages.forms.formField.props.errorText') },
    { name: 'required',    type: 'boolean',                              default: 'false',                  description: t('pages.forms.formField.props.required') },
    { name: 'disabled',    type: 'boolean',                              default: 'false',                  description: t('pages.forms.formField.props.disabled') },
    { name: 'id',          type: 'string',                                                                  description: t('pages.forms.formField.props.id') },
    { name: 'orientation', type: "'vertical' | 'horizontal'",            default: "'vertical'",             description: t('pages.forms.formField.props.orientation') },
    { name: 'labelWidth',  type: 'string',                               default: "'10rem'",                description: t('pages.forms.formField.props.labelWidth') },
    { name: 'fullWidth',   type: 'boolean',                              default: 'false',                  description: t('pages.forms.formField.props.fullWidth') },
    { name: 'hint',        type: 'string',                                                                  description: t('pages.forms.formField.props.hint') },
    { name: 'as',          type: 'string',                               default: "'div'",                  description: t('pages.forms.formField.props.as') },
]);

const slotsList = computed<SlotDoc[]>(() => [
    { name: 'default', description: t('pages.forms.formField.slots.default') },
    { name: 'label',   description: t('pages.forms.formField.slots.label') },
    { name: 'helper',  description: t('pages.forms.formField.slots.helper') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.forms.formField.title')"
        :category="t('pages.forms.formField.category')"
        import-path="import { FormField } from 'mood-ui'"
        :description="t('pages.forms.formField.description')"
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" @reset="resetPlayground">
                <template #controls>
                    <!-- Orientation -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">{{ t('pages.forms.formField.controls.layout').toUpperCase() }}</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="o in ['vertical', 'horizontal']"
                                :key="o"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgOrientation === o
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgOrientation = (o as typeof pgOrientation)"
                            >{{ o }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgRequired
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgRequired = !pgRequired"
                    >{{ t('pages.forms.formField.controls.required') }}</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDisabled
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDisabled = !pgDisabled"
                    >{{ t('pages.forms.formField.controls.disabled') }}</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgError
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgError = !pgError"
                    >{{ t('pages.forms.formField.controls.error') }}</button>
                </template>

                <FormField
                    v-slot="{ id, disabled, describedBy, invalid, color }"
                    :label="t('pages.forms.formField.playground.label')"
                    :helper-text="t('pages.forms.formField.playground.helperText')"
                    :orientation="pgOrientation"
                    :required="pgRequired"
                    :disabled="pgDisabled"
                    :error-text="pgError ? t('pages.forms.formField.playground.errorText') : undefined"
                    full-width
                    class="w-80"
                >
                    <Input
                        :id="id"
                        v-model="pgValue"
                        :disabled="disabled"
                        :aria-describedby="describedBy"
                        :invalid="invalid"
                        :color="(color as 'danger' | undefined)"
                        :placeholder="t('pages.forms.formField.playground.placeholder')"
                        full-width
                    />
                </FormField>
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                :title="t('pages.forms.formField.examples.input.title')"
                :description="t('pages.forms.formField.examples.input.desc')"
                :code="inputCode"
            >
                <FormField v-slot="{ id }" label="Nombre completo" helper-text="Tal como aparece en tu DNI." class="w-72">
                    <Input :id="id" v-model="exName" placeholder="Ada Lovelace" full-width />
                </FormField>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.formField.examples.select.title')"
                :description="t('pages.forms.formField.examples.select.desc')"
                :code="selectCode"
            >
                <FormField v-slot="{ id }" label="País" required class="w-72">
                    <Select :id="id" v-model="exCountry" :options="countries" placeholder="Elige un país" full-width />
                </FormField>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.formField.examples.textarea.title')"
                :description="t('pages.forms.formField.examples.textarea.desc')"
                :code="textareaCode"
            >
                <FormField v-slot="{ id }" label="Comentarios" hint="Opcional" class="w-80">
                    <Textarea :id="id" v-model="exMessage" :rows="4" placeholder="Cuéntanos más…" full-width />
                </FormField>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.formField.examples.error.title')"
                :description="t('pages.forms.formField.examples.error.desc')"
                :code="errorCode"
            >
                <FormField v-slot="{ id, invalid, color }" label="Email" error-text="El email no es válido" required class="w-72">
                    <Input :id="id" v-model="exEmail" :invalid="invalid" :color="(color as 'danger' | undefined)" placeholder="tu@email.com" full-width />
                </FormField>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.formField.examples.horizontal.title')"
                :description="t('pages.forms.formField.examples.horizontal.desc')"
                :code="horizontalCode"
            >
                <FormField
                    v-slot="{ id }"
                    label="URL pública"
                    helper-text="Visible en tu perfil."
                    orientation="horizontal"
                    label-width="9rem"
                    full-width
                    class="max-w-xl"
                >
                    <Input :id="id" v-model="exUrl" placeholder="https://…" full-width />
                </FormField>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
