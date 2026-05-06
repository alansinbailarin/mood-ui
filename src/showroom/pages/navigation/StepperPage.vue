<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Stepper from '../../../components/navigation/Stepper.vue';
import { UserIcon, CreditCardIcon, CheckBadgeIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, EmitDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgOrientation = ref<'horizontal' | 'vertical'>('horizontal');
const pgVariant     = ref<'numbered' | 'dots' | 'progress'>('numbered');
const pgSize        = ref<'small' | 'medium' | 'large'>('medium');

function resetPlayground() {
    pgOrientation.value = 'horizontal';
    pgVariant.value     = 'numbered';
    pgSize.value        = 'medium';
}

const playgroundSteps = [
    { id: 'account', label: 'Cuenta',  description: 'Datos básicos' },
    { id: 'billing', label: 'Pago',    description: 'Tarjeta o PayPal' },
    { id: 'review',  label: 'Revisar', description: 'Confirma tu pedido' },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgOrientation.value !== 'horizontal') parts.push(`orientation="${pgOrientation.value}"`);
    if (pgVariant.value     !== 'numbered')   parts.push(`variant="${pgVariant.value}"`);
    if (pgSize.value        !== 'medium')     parts.push(`size="${pgSize.value}"`);
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Stepper :steps="steps" :current="1"${attrs} />`;
});

// ── Example data ──────────────────────────────────────────────────────────────
const basicSteps = [
    { id: 'a', label: 'Carrito' },
    { id: 'b', label: 'Envío' },
    { id: 'c', label: 'Pago' },
];

const detailedSteps = [
    { id: 'account', label: 'Cuenta',  description: 'Email y contraseña', icon: UserIcon },
    { id: 'billing', label: 'Pago',    description: 'Método de pago',     icon: CreditCardIcon },
    { id: 'review',  label: 'Revisar', description: 'Confirma tu pedido', icon: CheckBadgeIcon },
];

const verticalSteps = [
    { id: 'a', label: 'Datos personales', description: 'Nombre, email y teléfono' },
    { id: 'b', label: 'Dirección',        description: 'Datos de envío' },
    { id: 'c', label: 'Pago',             description: 'Tarjeta o transferencia' },
    { id: 'd', label: 'Confirmación',     description: 'Revisa antes de enviar' },
];

const errorSteps = [
    { id: 'a', label: 'Datos' },
    { id: 'b', label: 'Pago',       description: 'Tarjeta declinada', state: 'error' as const },
    { id: 'c', label: 'Confirmar' },
];

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `const steps = [
    { id: 'a', label: 'Carrito' },
    { id: 'b', label: 'Envío' },
    { id: 'c', label: 'Pago' },
];

<Stepper :steps="steps" :current="1" />`;

const descriptionsCode = `const steps = [
    { id: 'account', label: 'Cuenta',  description: 'Email y contraseña', icon: UserIcon },
    { id: 'billing', label: 'Pago',    description: 'Método de pago',     icon: CreditCardIcon },
    { id: 'review',  label: 'Revisar', description: 'Confirma tu pedido', icon: CheckBadgeIcon },
];

<Stepper :steps="steps" :current="1" />`;

const verticalCode = `<Stepper :steps="verticalSteps" :current="1" orientation="vertical" />`;

const errorsCode = `const steps = [
    { id: 'a', label: 'Datos' },
    { id: 'b', label: 'Pago', description: 'Tarjeta declinada', state: 'error' },
    { id: 'c', label: 'Confirmar' },
];

<Stepper :steps="steps" :current="1" />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'steps',       type: 'StepperStep[]',                                             required: true,          description: 'Pasos a renderizar en orden. Cada paso acepta id, label, description, icon, disabled y state.' },
    { name: 'current',     type: 'number',                                                    default: '0',            description: 'Índice 0-based del paso activo. Los anteriores se marcan como completados.' },
    { name: 'variant',     type: "'numbered' | 'dots' | 'progress'",                          default: "'numbered'",   description: 'Estilo del indicador (número, punto o barra de progreso).' },
    { name: 'orientation', type: "'horizontal' | 'vertical'",                                 default: "'horizontal'", description: 'Disposición del stepper.' },
    { name: 'color',       type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",  default: "'primary'",    description: 'Color semántico de los pasos activo y completados.' },
    { name: 'size',        type: "'small' | 'medium' | 'large'",                              default: "'medium'",     description: 'Tamaño del indicador y de los labels.' },
    { name: 'clickable',   type: 'boolean',                                                   default: 'false',        description: 'Permite click en pasos completados; emite `step-click`.' },
];

const emitsList: EmitDoc[] = [
    { name: 'step-click', payload: '(step: StepperStep, index: number)', description: 'Emitido al hacer click en un paso cuando `clickable` es true.' },
];
</script>

<template>
    <ComponentDoc
        title="Stepper"
        category="Navigation"
        import-path="import { Stepper } from 'mood-ui'"
        description="Indicador de progreso por pasos. Útil para wizards, onboarding y checkouts. Soporta variantes numbered, dots y progress, en horizontal o vertical."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="240px" @reset="resetPlayground">
                <template #controls>
                    <!-- Orientation -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Orientation</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="o in ['horizontal', 'vertical']"
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

                    <!-- Variant -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Variant</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in ['numbered', 'dots', 'progress']"
                                :key="v"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgVariant === v
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgVariant = (v as typeof pgVariant)"
                            >{{ v }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <!-- Size -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Size</span>
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
                </template>

                <Stepper
                    :steps="playgroundSteps"
                    :current="1"
                    :orientation="pgOrientation"
                    :variant="pgVariant"
                    :size="pgSize"
                    class="w-full max-w-xl"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Tres pasos numerados; el `current` marca el activo y todos los anteriores quedan completados."
                :code="basicCode"
            >
                <Stepper :steps="basicSteps" :current="1" class="w-full max-w-xl" />
            </ComponentPreview>

            <ComponentPreview
                title="Con descripciones e iconos"
                description="Cada paso acepta `description` y un `icon` propio para reforzar el contexto."
                :code="descriptionsCode"
            >
                <Stepper :steps="detailedSteps" :current="1" class="w-full max-w-xl" />
            </ComponentPreview>

            <ComponentPreview
                title="Vertical"
                description="Cambia `orientation` a vertical para flujos largos con descripciones extensas."
                :code="verticalCode"
                min-height="320px"
            >
                <Stepper :steps="verticalSteps" :current="1" orientation="vertical" />
            </ComponentPreview>

            <ComponentPreview
                title="Con error"
                description="Override el estado de un paso a `error` para señalar un problema sin bloquear el resto del flujo."
                :code="errorsCode"
            >
                <Stepper :steps="errorSteps" :current="1" class="w-full max-w-xl" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
