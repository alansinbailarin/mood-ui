<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import DateRangePicker from '../../../components/data-display/date-picker/DateRangePicker.vue';

const r = ref<[Date | null, Date | null]>([new Date(), new Date(Date.now() + 7 * 86400000)]);
</script>

<template>
    <DocPage
        title="DateRangePicker"
        category="Data display"
        import-path="import DateRangePicker from '@/components/data-display/date-picker/DateRangePicker.vue'"
        description="Selector inline de rango con uno o dos meses, presets y restricciones de longitud mínima/máxima."
    >
        <template #examples>
            <Example title="Default (2 meses + presets)">
                <DateRangePicker v-model="r" :months="2" show-presets />
            </Example>

            <Example title="1 mes">
                <DateRangePicker v-model="r" :months="1" color="primary" />
            </Example>
        </template>
    </DocPage>
</template>
