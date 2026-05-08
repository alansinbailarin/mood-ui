<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Skeleton from '../../../components/feedback/Skeleton.vue';
import Card from '../../../components/data-display/Card.vue';
import type { PropDoc, SlotDoc } from '../../types';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbSep from '../../components/toolbar/TbSep.vue';

const { t } = useI18n();

type Shape = 'text' | 'circle' | 'rect';
type Size  = 'small' | 'medium' | 'large';

const pgShape     = ref<Shape>('rect');
const pgSize      = ref<Size>('medium');
const pgAnimation = ref<'shimmer' | 'pulse' | 'none'>('shimmer');

function resetPlayground() {
    pgShape.value     = 'rect';
    pgSize.value      = 'medium';
    pgAnimation.value = 'shimmer';
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgShape.value     !== 'rect')    parts.push(`shape="${pgShape.value}"`);
    if (pgSize.value      !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgAnimation.value !== 'shimmer') parts.push(`animation="${pgAnimation.value}"`);
    parts.push(':width="160"');
    if (pgShape.value === 'circle') parts.push(':height="48"');
    return `<Skeleton ${parts.join(' ')} />`;
});

const textCode = `<div class="w-80">
  <Skeleton shape="text" :lines="4" />
</div>`;

const profileCode = `<div class="flex items-center gap-3">
  <Skeleton shape="circle" :width="40" :height="40" />
  <div class="flex flex-col gap-2">
    <Skeleton shape="text" :width="160" />
    <Skeleton shape="text" :width="100" />
  </div>
</div>`;

const cardCode = `<Card variant="outlined" padding="medium" class="w-72">
  <Skeleton shape="rect" :height="120" full-width />
  <div class="flex flex-col gap-2 mt-3">
    <Skeleton shape="text" :width="180" />
    <Skeleton shape="text" :lines="2" />
  </div>
</Card>`;

const buttonCode = `<Skeleton shape="button" size="small" :width="96" />
<Skeleton shape="button" size="medium" :width="120" />
<Skeleton shape="button" size="large" :width="144" />`;

const propsList = computed<PropDoc[]>(() => [
    { name: 'shape',     type: "'text' | 'title' | 'rect' | 'circle' | 'avatar' | 'button' | 'input' | 'card' | …", default: "'rect'", description: t('pages.feedback.skeleton.props.shape') },
    { name: 'size',      type: "'small' | 'medium' | 'large'",                       default: "'medium'", description: t('pages.feedback.skeleton.props.size') },
    { name: 'radius',    type: "'none' | 'small' | 'medium' | 'large' | 'full'",                          description: t('pages.feedback.skeleton.props.radius') },
    { name: 'width',     type: 'string | number',                                                          description: t('pages.feedback.skeleton.props.width') },
    { name: 'height',    type: 'string | number',                                                          description: t('pages.feedback.skeleton.props.height') },
    { name: 'fullWidth', type: 'boolean',                                            default: 'false',     description: t('pages.feedback.skeleton.props.fullWidth') },
    { name: 'withLabel', type: 'boolean',                                            default: 'false',     description: t('pages.feedback.skeleton.props.withLabel') },
    { name: 'lines',     type: 'number',                                             default: '1',         description: t('pages.feedback.skeleton.props.lines') },
    { name: 'animation', type: "'shimmer' | 'pulse' | 'none'",                       default: "'shimmer'", description: t('pages.feedback.skeleton.props.animation') },
    { name: 'ariaLabel', type: 'string',                                                                   description: t('pages.feedback.skeleton.props.ariaLabel') },
]);

const slotsList: SlotDoc[] = [];
</script>

<template>
    <ComponentDoc
        :title="t('pages.feedback.skeleton.title')"
        category="Feedback"
        import-path="import { Skeleton } from 'mood-ui'"
        :description="t('pages.feedback.skeleton.description')"
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <TbPills :label="t('pages.feedback.skeleton.controls.shape')" :options="[{value:'text'},{value:'circle'},{value:'rect'}]" v-model="pgShape" />
                    <TbSep />
                    <TbPills :label="t('pages.feedback.skeleton.controls.size')" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbPills :label="t('pages.feedback.skeleton.controls.animation')" :options="[{value:'shimmer'},{value:'pulse'},{value:'none'}]" v-model="pgAnimation" />
                </template>

                <Skeleton
                    :shape="pgShape"
                    :size="pgSize"
                    :animation="pgAnimation"
                    :width="160"
                    :height="pgShape === 'circle' ? 48 : undefined"
                />
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                :title="t('pages.feedback.skeleton.examples.text.title')"
                :description="t('pages.feedback.skeleton.examples.text.desc')"
                :code="textCode"
                min-height="180px"
            >
                <div class="w-80">
                    <Skeleton shape="text" :lines="4" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.skeleton.examples.profile.title')"
                :description="t('pages.feedback.skeleton.examples.profile.desc')"
                :code="profileCode"
                min-height="180px"
            >
                <div class="flex items-center gap-3">
                    <Skeleton shape="circle" :width="40" :height="40" />
                    <div class="flex flex-col gap-2">
                        <Skeleton shape="text" :width="160" />
                        <Skeleton shape="text" :width="100" />
                    </div>
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.skeleton.examples.card.title')"
                :description="t('pages.feedback.skeleton.examples.card.desc')"
                :code="cardCode"
                min-height="280px"
            >
                <Card variant="outlined" padding="medium" class="w-72">
                    <Skeleton shape="rect" :height="120" full-width />
                    <div class="flex flex-col gap-2 mt-3">
                        <Skeleton shape="text" :width="180" />
                        <Skeleton shape="text" :lines="2" />
                    </div>
                </Card>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.feedback.skeleton.examples.button.title')"
                :description="t('pages.feedback.skeleton.examples.button.desc')"
                :code="buttonCode"
                min-height="180px"
            >
                <Skeleton shape="button" size="small"  :width="96" />
                <Skeleton shape="button" size="medium" :width="120" />
                <Skeleton shape="button" size="large"  :width="144" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
