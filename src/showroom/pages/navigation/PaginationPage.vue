<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Pagination from '../../../components/navigation/Pagination.vue';
import NumberInput from '../../../components/forms/NumberInput.vue';
import Button from '../../../components/forms/Button.vue';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbDots from '../../components/toolbar/TbDots.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep from '../../components/toolbar/TbSep.vue';
import type { PropDoc, EmitDoc } from '../../types';

const { t } = useI18n();

const pgSize     = ref<'small' | 'medium' | 'large'>('medium');
const pgTotal    = ref<number>(50);
const pgSiblings = ref<number>(1);
const pgPage     = ref(1);
const pgColor    = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgDisabled = ref(false);

const colorDots = [
    { value: 'default'  as const, bg: 'var(--color-slate-400)', label: 'Default'  },
    { value: 'primary'  as const, bg: 'var(--primary)',          label: 'Primary'  },
    { value: 'success'  as const, bg: 'var(--color-emerald-500)',label: 'Success'  },
    { value: 'warning'  as const, bg: 'var(--color-amber-500)',  label: 'Warning'  },
    { value: 'danger'   as const, bg: 'var(--color-red-500)',    label: 'Danger'   },
];

function resetPlayground() {
    pgSize.value     = 'medium';
    pgTotal.value    = 50;
    pgSiblings.value = 1;
    pgPage.value     = 1;
    pgColor.value    = 'primary';
    pgDisabled.value = false;
}

const overviewCode = computed(() => {
    const parts: string[] = [`v-model="page"`, `:page-count="${pgTotal.value}"`];
    if (pgSiblings.value !== 1)        parts.push(`:sibling-count="${pgSiblings.value}"`);
    if (pgSize.value     !== 'medium') parts.push(`size="${pgSize.value}"`);
    if (pgColor.value    !== 'primary') parts.push(`color="${pgColor.value}"`);
    if (pgDisabled.value) parts.push('disabled');
    return `<Pagination ${parts.join(' ')} class="w-full" />`;
});

const basicPage    = ref(3);
const siblingsPage = ref(7);
const jumpPage     = ref(1);
const sizesPage    = ref(2);
const compactPage  = ref(4);

const jumpInput = ref<number | null>(null);
function jumpTo() {
    if (jumpInput.value && jumpInput.value >= 1 && jumpInput.value <= 20) {
        jumpPage.value = jumpInput.value;
    }
}

const basicCode = `<Pagination v-model="page" :page-count="10" class="w-full" />`;
const siblingsCode = `<Pagination v-model="page" :page-count="20" :sibling-count="2" class="w-full" />`;
const jumpCode = `<Pagination v-model="page" :page-count="20" />`;
const sizesCode = `<Pagination v-model="page" :page-count="10" size="small" />
<Pagination v-model="page" :page-count="10" size="medium" />
<Pagination v-model="page" :page-count="10" size="large" />`;
const compactCode = `<Pagination v-model="page" :page-count="10" :show-first-last="false" />`;

const propsList = computed<PropDoc[]>(() => [
    { name: 'modelValue',    type: 'number',                                                    required: true,          description: t('pages.navigation.pagination.props.modelValue') },
    { name: 'pageCount',     type: 'number',                                                    required: true,          description: t('pages.navigation.pagination.props.pageCount') },
    { name: 'siblingCount',  type: 'number',                                                    default: '1',            description: t('pages.navigation.pagination.props.siblingCount') },
    { name: 'boundaryCount', type: 'number',                                                    default: '1',            description: t('pages.navigation.pagination.props.boundaryCount') },
    { name: 'showFirstLast', type: 'boolean',                                                   default: 'true',         description: t('pages.navigation.pagination.props.showFirstLast') },
    { name: 'showPrevNext',  type: 'boolean',                                                   default: 'true',         description: t('pages.navigation.pagination.props.showPrevNext') },
    { name: 'color',         type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",  default: "'primary'",    description: t('pages.navigation.pagination.props.color') },
    { name: 'size',          type: "'small' | 'medium' | 'large'",                              default: "'medium'",     description: t('pages.navigation.pagination.props.size') },
    { name: 'radius',        type: "'none' | 'small' | 'medium' | 'large' | 'full'",                                     description: t('pages.navigation.pagination.props.radius') },
    { name: 'disabled',      type: 'boolean',                                                   default: 'false',        description: t('pages.navigation.pagination.props.disabled') },
    { name: 'ariaLabel',     type: 'string',                                                    default: "'Pagination'", description: t('pages.navigation.pagination.props.ariaLabel') },
]);

const emitsList = computed<EmitDoc[]>(() => [
    { name: 'update:modelValue', payload: 'number', description: t('pages.navigation.pagination.emits.updateModelValue') },
    { name: 'change',            payload: 'number', description: t('pages.navigation.pagination.emits.change') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.navigation.pagination.title')"
        :category="t('pages.navigation.pagination.category')"
        import-path="import { Pagination } from 'mood-ui'"
        :description="t('pages.navigation.pagination.description')"
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="180px" @reset="resetPlayground">
                <template #controls>
                    <TbPills label="Size" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbDots label="Color" :options="colorDots" v-model="pgColor" />
                    <TbSep />
                    <TbPills label="Total" :options="[{value:'50'},{value:'100'},{value:'500'}]" :model-value="String(pgTotal)" @update:model-value="pgTotal = Number($event)" />
                    <TbSep />
                    <TbPills label="Siblings" :options="[{value:'0'},{value:'1'},{value:'2'}]" :model-value="String(pgSiblings)" @update:model-value="pgSiblings = Number($event)" />
                    <TbSep />
                    <TbToggle label="Disabled" v-model="pgDisabled" />
                </template>

                <Pagination
                    v-model="pgPage"
                    :page-count="pgTotal"
                    :sibling-count="pgSiblings"
                    :size="pgSize"
                    :color="pgColor"
                    :disabled="pgDisabled"
                    class="w-full"
                />
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                :title="t('pages.navigation.pagination.examples.basic.title')"
                :description="t('pages.navigation.pagination.examples.basic.desc')"
                :code="basicCode"
            >
                <Pagination v-model="basicPage" :page-count="10" class="w-full" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.navigation.pagination.examples.siblings.title')"
                :description="t('pages.navigation.pagination.examples.siblings.desc')"
                :code="siblingsCode"
            >
                <Pagination v-model="siblingsPage" :page-count="20" :sibling-count="2" class="w-full" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.navigation.pagination.examples.jump.title')"
                :description="t('pages.navigation.pagination.examples.jump.desc')"
                :code="jumpCode"
            >
                <div class="flex items-center gap-3 w-full">
                    <Pagination v-model="jumpPage" :page-count="20" />
                    <NumberInput
                        v-model="jumpInput"
                        :min="1"
                        :max="20"
                        :steppers="false"
                        :placeholder="t('pages.navigation.pagination.demo.pagePh')"
                        class="w-24"
                        @keydown.enter="jumpTo"
                    />
                    <Button variant="outline" :label="t('pages.navigation.pagination.demo.go')" @click="jumpTo" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.navigation.pagination.examples.sizes.title')"
                :description="t('pages.navigation.pagination.examples.sizes.desc')"
                :code="sizesCode"
            >
                <div class="flex flex-col gap-3 w-full">
                    <Pagination v-model="sizesPage" :page-count="10" size="small"  class="w-full" />
                    <Pagination v-model="sizesPage" :page-count="10" size="medium" class="w-full" />
                    <Pagination v-model="sizesPage" :page-count="10" size="large"  class="w-full" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.navigation.pagination.examples.compact.title')"
                :description="t('pages.navigation.pagination.examples.compact.desc')"
                :code="compactCode"
            >
                <Pagination v-model="compactPage" :page-count="10" :show-first-last="false" class="w-full" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
