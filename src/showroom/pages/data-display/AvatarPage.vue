<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Avatar from '../../../components/data-display/avatar/Avatar.vue';
import type { PropDoc } from '../../types';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbDots from '../../components/toolbar/TbDots.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep from '../../components/toolbar/TbSep.vue';

const { t } = useI18n();

// ── Overview playground state ─────────────────────────────────────────────────
const pgSize    = ref<'xs' | 'small' | 'medium' | 'large' | 'xl'>('medium');
const pgRadius  = ref<'none' | 'small' | 'medium' | 'large' | 'full'>('full');
const pgColor   = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgMode    = ref<'image' | 'initials' | 'icon'>('image');
const pgBordered = ref(false);
const pgStatus  = ref<'' | 'online' | 'offline' | 'away' | 'busy'>('');

function resetPlayground() {
    pgSize.value = 'medium';
    pgRadius.value = 'full';
    pgColor.value = 'primary';
    pgMode.value = 'image';
    pgBordered.value = false;
    pgStatus.value = '';
}

const colorDots = [
    { value: 'default'  as const, bg: 'var(--color-slate-400)',  label: 'Default'  },
    { value: 'primary'  as const, bg: 'var(--primary)',           label: 'Primary'  },
    { value: 'success'  as const, bg: 'var(--color-emerald-500)', label: 'Success'  },
    { value: 'warning'  as const, bg: 'var(--color-amber-500)',   label: 'Warning'  },
    { value: 'danger'   as const, bg: 'var(--color-red-500)',     label: 'Danger'   },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgSize.value   !== 'medium') parts.push(`size="${pgSize.value}"`);
    if (pgRadius.value !== 'full')   parts.push(`radius="${pgRadius.value}"`);
    if ((pgMode.value === 'initials' || pgMode.value === 'icon') && pgColor.value !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgBordered.value)            parts.push(':bordered="true"');
    if (pgStatus.value)              parts.push(`status="${pgStatus.value}"`);
    if (pgMode.value === 'image')    parts.push('src="https://i.pravatar.cc/80?img=12"');
    if (pgMode.value === 'initials') parts.push('initials="AP"');
    return `<Avatar ${parts.join(' ')} />`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const imageCode = `<Avatar src="https://i.pravatar.cc/80?img=1" />
<Avatar src="https://i.pravatar.cc/80?img=2" />
<Avatar src="https://i.pravatar.cc/80?img=3" />`;

const initialsCode = `<Avatar initials="AP" color="primary" />
<Avatar initials="MR" color="success" />
<Avatar initials="JS" color="warning" />
<Avatar initials="NK" color="danger"  />`;

const iconCode = `<Avatar />
<Avatar color="primary" />
<Avatar color="success" />
<Avatar color="danger"  />`;

const sizesCode = `<Avatar src="https://i.pravatar.cc/80?img=4" size="xs"     />
<Avatar src="https://i.pravatar.cc/80?img=4" size="small"  />
<Avatar src="https://i.pravatar.cc/80?img=4" size="medium" />
<Avatar src="https://i.pravatar.cc/80?img=4" size="large"  />
<Avatar src="https://i.pravatar.cc/80?img=4" size="xl"     />`;

const statusCode = `<Avatar src="https://i.pravatar.cc/80?img=5" status="online"  />
<Avatar src="https://i.pravatar.cc/80?img=6" status="busy"    />
<Avatar src="https://i.pravatar.cc/80?img=7" status="away"    />
<Avatar src="https://i.pravatar.cc/80?img=8" status="offline" />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
    { name: 'src',       type: 'string',                                                              description: t('pages.dataDisplay.avatar.props.src') },
    { name: 'alt',       type: 'string',                                                              description: t('pages.dataDisplay.avatar.props.alt') },
    { name: 'initials',  type: 'string',                                                              description: t('pages.dataDisplay.avatar.props.initials') },
    { name: 'size',      type: "'xs' | 'small' | 'medium' | 'large' | 'xl'",     default: "'medium'", description: t('pages.dataDisplay.avatar.props.size') },
    { name: 'radius',    type: "'none' | 'small' | 'medium' | 'large' | 'full'",                     description: t('pages.dataDisplay.avatar.props.radius') },
    { name: 'color',     type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: t('pages.dataDisplay.avatar.props.color') },
    { name: 'status',    type: "'online' | 'offline' | 'away' | 'busy'",                              description: t('pages.dataDisplay.avatar.props.status') },
    { name: 'bordered',  type: 'boolean',                                          default: 'false',  description: t('pages.dataDisplay.avatar.props.bordered') },
    { name: 'ariaLabel', type: 'string',                                                              description: t('pages.dataDisplay.avatar.props.ariaLabel') },
    { name: 'skeleton',  type: 'boolean',                                          default: 'false',  description: t('pages.dataDisplay.avatar.props.skeleton') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.dataDisplay.avatar.title')"
        category="Data Display"
        import-path="import { Avatar } from 'mood-ui'"
        :description="t('pages.dataDisplay.avatar.description')"
        :props-list="propsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" @reset="resetPlayground">
                <template #controls>
                    <TbPills :label="t('pages.dataDisplay.avatar.controls.mode')" :options="[{value:'image'},{value:'initials'},{value:'icon'}]" v-model="pgMode" />
                    <TbSep />
                    <TbPills :label="t('pages.dataDisplay.avatar.controls.size')" :options="[{value:'xs'},{value:'small'},{value:'medium'},{value:'large'},{value:'xl'}]" v-model="pgSize" />
                    <TbSep />
                    <TbPills :label="t('pages.dataDisplay.avatar.controls.radius')" :options="[{value:'none'},{value:'small'},{value:'medium'},{value:'large'},{value:'full'}]" v-model="pgRadius" />
                    <TbSep />
                    <TbDots :label="t('pages.dataDisplay.avatar.controls.color')" :options="colorDots" v-model="pgColor" />
                    <TbSep />
                    <TbPills :label="t('pages.dataDisplay.avatar.controls.status')" :options="[{value:'',label:'none'},{value:'online'},{value:'offline'},{value:'away'},{value:'busy'}]" v-model="pgStatus" />
                    <TbSep />
                    <TbToggle :label="t('pages.dataDisplay.avatar.controls.bordered')" v-model="pgBordered" />
                </template>

                <Avatar
                    v-if="pgMode === 'image'"
                    src="https://i.pravatar.cc/80?img=12"
                    :size="pgSize"
                    :radius="pgRadius"
                    :bordered="pgBordered"
                    :status="pgStatus || undefined"
                />
                <Avatar
                    v-else-if="pgMode === 'initials'"
                    initials="AP"
                    :size="pgSize"
                    :radius="pgRadius"
                    :color="pgColor"
                    :bordered="pgBordered"
                    :status="pgStatus || undefined"
                />
                <Avatar
                    v-else
                    :size="pgSize"
                    :radius="pgRadius"
                    :color="pgColor"
                    :bordered="pgBordered"
                    :status="pgStatus || undefined"
                />
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                :title="t('pages.dataDisplay.avatar.examples.image.title')"
                :description="t('pages.dataDisplay.avatar.examples.image.desc')"
                :code="imageCode"
            >
                <Avatar src="https://i.pravatar.cc/80?img=1" />
                <Avatar src="https://i.pravatar.cc/80?img=2" />
                <Avatar src="https://i.pravatar.cc/80?img=3" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.dataDisplay.avatar.examples.initials.title')"
                :description="t('pages.dataDisplay.avatar.examples.initials.desc')"
                :code="initialsCode"
            >
                <Avatar initials="AP" color="primary" />
                <Avatar initials="MR" color="success" />
                <Avatar initials="JS" color="warning" />
                <Avatar initials="NK" color="danger" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.dataDisplay.avatar.examples.iconFallback.title')"
                :description="t('pages.dataDisplay.avatar.examples.iconFallback.desc')"
                :code="iconCode"
            >
                <Avatar />
                <Avatar color="primary" />
                <Avatar color="success" />
                <Avatar color="danger" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.dataDisplay.avatar.examples.sizes.title')"
                :description="t('pages.dataDisplay.avatar.examples.sizes.desc')"
                :code="sizesCode"
            >
                <Avatar src="https://i.pravatar.cc/80?img=4" size="xs" />
                <Avatar src="https://i.pravatar.cc/80?img=4" size="small" />
                <Avatar src="https://i.pravatar.cc/80?img=4" size="medium" />
                <Avatar src="https://i.pravatar.cc/80?img=4" size="large" />
                <Avatar src="https://i.pravatar.cc/80?img=4" size="xl" />
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.dataDisplay.avatar.examples.status.title')"
                :description="t('pages.dataDisplay.avatar.examples.status.desc')"
                :code="statusCode"
            >
                <Avatar src="https://i.pravatar.cc/80?img=5" status="online" />
                <Avatar src="https://i.pravatar.cc/80?img=6" status="busy" />
                <Avatar src="https://i.pravatar.cc/80?img=7" status="away" />
                <Avatar src="https://i.pravatar.cc/80?img=8" status="offline" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
