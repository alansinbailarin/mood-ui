<script setup lang="ts">
import { ref } from 'vue';
import { UserIcon, CreditCardIcon, CheckBadgeIcon } from '@heroicons/vue/24/outline';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Stepper from '../../../components/navigation/Stepper.vue';
import Button from '../../../components/forms/Button.vue';

const current = ref(1);
const errorCurrent = ref(2);

const steps = [
    { id: 'account', label: 'Cuenta', description: 'Datos básicos' },
    { id: 'billing', label: 'Pago',   description: 'Tarjeta o PayPal' },
    { id: 'review',  label: 'Revisar', description: 'Confirma tu pedido' },
];

const iconSteps = [
    { id: 'account', label: 'Cuenta', icon: UserIcon },
    { id: 'billing', label: 'Pago',   icon: CreditCardIcon },
    { id: 'done',    label: 'Listo',  icon: CheckBadgeIcon },
];

const errorSteps = [
    { id: 'a', label: 'Datos' },
    { id: 'b', label: 'Pago', state: 'error' as const, description: 'Tarjeta declinada' },
    { id: 'c', label: 'Confirmar' },
];

function next() {
    current.value = Math.min(current.value + 1, steps.length - 1);
}
function prev() {
    current.value = Math.max(current.value - 1, 0);
}
</script>

<template>
    <DocPage
        title="Stepper"
        category="Navigation"
        import-path="import { Stepper } from 'mood-ui'"
        description="Indicador de progreso por pasos. Útil para wizards, onboarding y checkouts. Soporta variantes numbered, dots y orientación horizontal/vertical."
    >
        <template #examples>
            <Example title="Numbered (horizontal)" :code="`<Stepper :steps=\&quot;steps\&quot; :current=\&quot;1\&quot; />`">
                <Stepper :steps="steps" :current="1" />
            </Example>

            <Example title="Interactivo" description="Usa los botones para avanzar o retroceder. Pasa `clickable` para permitir navegar haciendo click en pasos completados.">
                <div class="flex flex-col gap-4 w-full">
                    <Stepper
                        :steps="steps"
                        :current="current"
                        clickable
                        @step-click="(_step, idx) => current = idx"
                    />
                    <div class="flex gap-2">
                        <Button variant="outline" size="small" :disabled="current === 0" @click="prev">Anterior</Button>
                        <Button color="primary" size="small" :disabled="current === steps.length - 1" @click="next">Siguiente</Button>
                    </div>
                </div>
            </Example>

            <Example title="Con iconos personalizados">
                <Stepper :steps="iconSteps" :current="1" />
            </Example>

            <Example title="Dots (compacto)">
                <Stepper :steps="steps" :current="1" variant="dots" />
            </Example>

            <Example title="Estado de error">
                <Stepper :steps="errorSteps" :current="errorCurrent" color="primary" />
            </Example>

            <Example title="Vertical">
                <Stepper :steps="steps" :current="1" orientation="vertical" />
            </Example>

            <Example title="Colores">
                <div class="flex flex-col gap-6 w-full">
                    <Stepper :steps="steps" :current="1" color="success" />
                    <Stepper :steps="steps" :current="1" color="warning" />
                    <Stepper :steps="steps" :current="1" color="danger" />
                </div>
            </Example>
        </template>
    </DocPage>
</template>
