<script setup lang="ts">
import {
    UsersIcon, BanknotesIcon, ShoppingCartIcon, ArrowTrendingUpIcon,
} from '@heroicons/vue/24/outline';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Stat from '../../../components/data-display/Stat.vue';
</script>

<template>
    <DocPage
        title="Stat"
        category="Data display"
        import-path="import { Stat } from 'mood-ui'"
        description="Tarjeta KPI compacta para mostrar métricas con tendencia. Soporta variantes, colores y estado de loading."
    >
        <template #examples>
            <Example title="Básico" :code="`<Stat label=\&quot;Revenue\&quot; value=\&quot;$48,592\&quot; />`">
                <Stat label="Revenue" value="$48,592" />
            </Example>

            <Example title="Con tendencia" :code="`<Stat\n  label=\&quot;Active users\&quot;\n  value=\&quot;12,403\&quot;\n  :trend=\&quot;{ value: 12.5 }\&quot;\n  description=\&quot;vs. last month\&quot;\n/>`">
                <Stat
                    label="Active users"
                    value="12,403"
                    :trend="{ value: 12.5 }"
                    description="vs. mes pasado"
                />
            </Example>

            <Example title="Variantes">
                <div class="grid sm:grid-cols-3 gap-4">
                    <Stat label="Plain" value="123" :trend="{ value: 5 }" />
                    <Stat label="Outlined" value="123" variant="outlined" :trend="{ value: 5 }" />
                    <Stat label="Filled" value="123" variant="filled" :trend="{ value: 5 }" />
                </div>
            </Example>

            <Example title="Con icono y color">
                <div class="grid sm:grid-cols-2 gap-4">
                    <Stat
                        label="Revenue"
                        value="$48,592"
                        :icon="BanknotesIcon"
                        color="success"
                        variant="outlined"
                        :trend="{ value: 12.5 }"
                    />
                    <Stat
                        label="Users"
                        value="12,403"
                        :icon="UsersIcon"
                        color="primary"
                        variant="outlined"
                        :trend="{ value: 8.2 }"
                    />
                    <Stat
                        label="Orders"
                        value="3,201"
                        :icon="ShoppingCartIcon"
                        color="warning"
                        variant="outlined"
                        :trend="{ value: -3.1 }"
                    />
                    <Stat
                        label="Conversion"
                        value="3.42%"
                        :icon="ArrowTrendingUpIcon"
                        color="danger"
                        variant="outlined"
                        :trend="{ value: -1.5, label: '-1.5pp' }"
                    />
                </div>
            </Example>

            <Example title="Tamaños">
                <div class="grid sm:grid-cols-3 gap-4">
                    <Stat label="Small" value="123" size="small" variant="outlined" :trend="{ value: 5 }" />
                    <Stat label="Medium" value="123" size="medium" variant="outlined" :trend="{ value: 5 }" />
                    <Stat label="Large" value="123" size="large" variant="outlined" :trend="{ value: 5 }" />
                </div>
            </Example>

            <Example title="Loading">
                <div class="grid sm:grid-cols-2 gap-4">
                    <Stat label="Cargando…" value="" loading variant="outlined" />
                    <Stat label="Cargando…" value="" loading variant="filled" />
                </div>
            </Example>
        </template>
    </DocPage>
</template>
