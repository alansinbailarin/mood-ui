<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Card from '../../../components/data-display/Card.vue';
import Typography from '../../../components/data-display/Typography.vue';
import Stack from '../../../components/layout/Stack.vue';
import FormField from '../../../components/forms/FormField.vue';
import Input from '../../../components/forms/Input.vue';
import Textarea from '../../../components/forms/Textarea.vue';
import Select from '../../../components/forms/Select.vue';
import Switch from '../../../components/forms/Switch.vue';
import type { PropDoc, SlotDoc } from '../../types';

const v1 = ref('');
const v2 = ref('');
const v3 = ref('');
const v4 = ref('');
const opts = [
    { value: 'a', label: 'Opción A' },
    { value: 'b', label: 'Opción B' },
];

// playground
const label = ref('Email');
const helperText = ref('Lo usaremos para enviarte notificaciones.');
const errorText = ref('');
const hint = ref('');
const required = ref(false);
const disabled = ref(false);
const fullWidth = ref(false);
const orientation = ref<'vertical' | 'horizontal'>('vertical');
const labelWidth = ref('120px');
const playValue = ref('');

const orientationOpts = [
    { value: 'vertical', label: 'vertical' },
    { value: 'horizontal', label: 'horizontal' },
];

const propsList: PropDoc[] = [
    { name: 'label', type: 'string', description: 'Texto del <label> asociado al control.' },
    { name: 'helperText', type: 'string', description: 'Texto auxiliar bajo el control.' },
    { name: 'errorText', type: 'string', description: 'Mensaje de error; tiñe el control en danger.' },
    { name: 'hint', type: 'string', description: 'Texto secundario junto al label.' },
    { name: 'required', type: 'boolean', default: 'false' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'" },
    { name: 'labelWidth', type: 'string', description: 'Ancho del label cuando orientation="horizontal".' },
    { name: 'fullWidth', type: 'boolean', default: 'false' },
    { name: 'id', type: 'string', description: 'Si no se pasa se autogenera.' },
    { name: 'as', type: 'string', default: "'div'" },
];
const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Recibe { id, describedBy, invalid, color, disabled, required } para conectar el control.' },
    { name: 'label', description: 'Override del label.' },
    { name: 'helper', description: 'Override del helper/error text.' },
];
</script>

<template>
    <DocPage
        title="FormField"
        category="Forms"
        import-path="import FormField from '@/components/forms/FormField.vue'"
        description="Wrapper que añade label, helperText, errorText y la marca de campo requerido a cualquier control de formulario. Se ocupa también de la accesibilidad (aria-describedby, htmlFor)."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #examples>
            <Example title="Label + helper text" description="Un FormField envolviendo un Input.">
                <FormField label="Nombre" helper-text="Como aparecerá en tu perfil." class="w-72">
                    <template #default="{ id, describedBy, invalid }">
                        <Input :id="id" v-model="v1" :aria-describedby="describedBy" :aria-invalid="invalid" placeholder="Ada Lovelace" />
                    </template>
                </FormField>
            </Example>

            <Example title="Required + error" description="errorText pinta automáticamente el control en danger.">
                <FormField label="Email" required error-text="Email inválido" class="w-72">
                    <template #default="{ id, describedBy, invalid, color }">
                        <Input :id="id" v-model="v2" :aria-describedby="describedBy" :aria-invalid="invalid" :color="(color as 'default' | 'primary' | 'danger' | 'success' | 'warning' | undefined)" placeholder="tu@email.com" />
                    </template>
                </FormField>
            </Example>

            <Example title="Orientación horizontal" description="Label a la izquierda, control a la derecha.">
                <FormField label="País" orientation="horizontal" label-width="120px" class="w-96">
                    <template #default="{ id }">
                        <Select :id="id" v-model="v3" :options="opts" />
                    </template>
                </FormField>
            </Example>

            <Example title="Con Textarea" description="Cualquier control encaja en el slot.">
                <FormField label="Comentario" hint="Máximo 200 caracteres." class="w-96">
                    <template #default="{ id }">
                        <Textarea :id="id" v-model="v4" :rows="3" placeholder="Tu mensaje…" />
                    </template>
                </FormField>
            </Example>
        </template>

        <template #playground>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card variant="outlined" padding="large" class="lg:col-span-2">
                    <div class="min-h-[180px] flex items-center justify-center">
                        <FormField
                            :label="label"
                            :helper-text="helperText || undefined"
                            :error-text="errorText || undefined"
                            :hint="hint || undefined"
                            :required="required"
                            :disabled="disabled"
                            :orientation="orientation"
                            :label-width="labelWidth"
                            :full-width="fullWidth"
                            :class="fullWidth ? 'w-full' : 'w-80'"
                        >
                            <template #default="{ id, describedBy, invalid, color, disabled: d }">
                                <Input
                                    :id="id"
                                    v-model="playValue"
                                    :aria-describedby="describedBy"
                                    :aria-invalid="invalid"
                                    :color="(color as 'default' | 'primary' | 'danger' | 'success' | 'warning' | undefined)"
                                    :disabled="d"
                                    placeholder="Escribe algo…"
                                />
                            </template>
                        </FormField>
                    </div>
                </Card>
                <Card variant="outlined" padding="large">
                    <Stack direction="column" spacing="medium">
                        <Typography variant="title" size="small">Controles</Typography>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Label</Typography>
                            <Input v-model="label" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Helper text</Typography>
                            <Input v-model="helperText" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Error text</Typography>
                            <Input v-model="errorText" size="small" placeholder="(vacío para sin error)" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Hint</Typography>
                            <Input v-model="hint" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Orientation</Typography>
                            <Select v-model="orientation" :options="orientationOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Label width (horizontal)</Typography>
                            <Input v-model="labelWidth" size="small" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Required</Typography>
                            <Switch v-model="required" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Disabled</Typography>
                            <Switch v-model="disabled" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Full width</Typography>
                            <Switch v-model="fullWidth" />
                        </label>
                    </Stack>
                </Card>
            </div>
        </template>
    </DocPage>
</template>
