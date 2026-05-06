<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import FormField from '../../../components/forms/FormField.vue';
import Input from '../../../components/forms/Input.vue';
import Select from '../../../components/forms/Select.vue';
import Textarea from '../../../components/forms/Textarea.vue';
import type { PropDoc, SlotDoc } from '../../types';

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
const propsList: PropDoc[] = [
    { name: 'label',       type: 'string',                                                                  description: 'Texto del label visible. Se enlaza al control mediante for/id.' },
    { name: 'helperText',  type: 'string',                                                                  description: 'Texto de ayuda bajo el control. Oculto cuando hay errorText.' },
    { name: 'errorText',   type: 'string',                                                                  description: 'Mensaje de error. Activa aria-invalid y color danger en el control.' },
    { name: 'required',    type: 'boolean',                              default: 'false',                  description: 'Muestra el asterisco rojo y propaga required al slot.' },
    { name: 'disabled',    type: 'boolean',                              default: 'false',                  description: 'Aplica estado deshabilitado y lo propaga al control hijo.' },
    { name: 'id',          type: 'string',                                                                  description: 'id que se enlaza con el label. Se autogenera si se omite.' },
    { name: 'orientation', type: "'vertical' | 'horizontal'",            default: "'vertical'",             description: 'Disposición del label respecto al control.' },
    { name: 'labelWidth',  type: 'string',                               default: "'10rem'",                description: 'Ancho del label cuando orientation="horizontal".' },
    { name: 'fullWidth',   type: 'boolean',                              default: 'false',                  description: 'Aplica w-full al wrapper externo.' },
    { name: 'hint',        type: 'string',                                                                  description: 'Texto auxiliar a la derecha del label (e.g. "Opcional").' },
    { name: 'as',          type: 'string',                               default: "'div'",                  description: 'Tag HTML del wrapper raíz.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Control de formulario. Recibe { id, describedBy, invalid, disabled, required, color } como props del slot.' },
    { name: 'label',   description: 'Reemplaza el contenido del label cuando se necesita HTML personalizado.' },
    { name: 'helper',  description: 'Reemplaza el helperText con contenido enriquecido.' },
];
</script>

<template>
    <ComponentDoc
        title="FormField"
        category="Forms"
        import-path="import { FormField } from 'mood-ui'"
        description="Wrapper accesible que provee label, helper, error y enlazado de id/aria a cualquier control de formulario."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" @reset="resetPlayground">
                <template #controls>
                    <!-- Orientation -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">LAYOUT</span>
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
                    >Required</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDisabled
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDisabled = !pgDisabled"
                    >Disabled</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgError
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgError = !pgError"
                    >Error</button>
                </template>

                <FormField
                    label="Email"
                    helper-text="Lo usaremos para confirmar tu cuenta."
                    :orientation="pgOrientation"
                    :required="pgRequired"
                    :disabled="pgDisabled"
                    :error-text="pgError ? 'Este campo es obligatorio' : undefined"
                    full-width
                    class="w-80"
                >
                    <Input v-model="pgValue" placeholder="tu@email.com" full-width />
                </FormField>
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Con Input"
                description="Wrapping de un campo de texto con label y texto de ayuda."
                :code="inputCode"
            >
                <FormField label="Nombre completo" helper-text="Tal como aparece en tu DNI." class="w-72">
                    <Input v-model="exName" placeholder="Ada Lovelace" full-width />
                </FormField>
            </ComponentPreview>

            <ComponentPreview
                title="Con Select"
                description="FormField también funciona con cualquier control compuesto."
                :code="selectCode"
            >
                <FormField label="País" required class="w-72">
                    <Select v-model="exCountry" :options="countries" placeholder="Elige un país" full-width />
                </FormField>
            </ComponentPreview>

            <ComponentPreview
                title="Con Textarea"
                description="Usa la prop hint para añadir un texto auxiliar a la derecha del label."
                :code="textareaCode"
            >
                <FormField label="Comentarios" hint="Opcional" class="w-80">
                    <Textarea v-model="exMessage" :rows="4" placeholder="Cuéntanos más…" full-width />
                </FormField>
            </ComponentPreview>

            <ComponentPreview
                title="Con error"
                description="errorText reemplaza al helperText y propaga el estado inválido al control."
                :code="errorCode"
            >
                <FormField label="Email" error-text="El email no es válido" required class="w-72">
                    <Input v-model="exEmail" placeholder="tu@email.com" full-width />
                </FormField>
            </ComponentPreview>

            <ComponentPreview
                title="Layout horizontal"
                description="orientation='horizontal' coloca el label a la izquierda con un ancho fijo."
                :code="horizontalCode"
            >
                <FormField
                    label="URL pública"
                    helper-text="Visible en tu perfil."
                    orientation="horizontal"
                    label-width="9rem"
                    full-width
                    class="max-w-xl"
                >
                    <Input v-model="exUrl" placeholder="https://…" full-width />
                </FormField>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
