<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import ButtonGroup from '../../../components/forms/ButtonGroup.vue';
import Button from '../../../components/forms/Button.vue';
import { HeartIcon, ArrowRightIcon, BoltIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, SlotDoc } from '../../types';
import TbPills  from '../../components/toolbar/TbPills.vue';
import TbDots   from '../../components/toolbar/TbDots.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep    from '../../components/toolbar/TbSep.vue';

const { t } = useI18n();

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant  = ref<'normal' | 'outline' | 'ghost' | 'text'>('normal');
const pgColor    = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize     = ref<'small' | 'medium' | 'large'>('medium');
const pgGradient = ref(false);
const pgDisabled = ref(false);

function resetPlayground() {
    pgVariant.value  = 'normal';
    pgColor.value    = 'primary';
    pgSize.value     = 'medium';
    pgGradient.value = false;
    pgDisabled.value = false;
}

const colorDots = [
    { value: 'default' as const, bg: 'var(--color-slate-400)',   label: 'Default' },
    { value: 'primary' as const, bg: 'var(--primary)',            label: 'Primary' },
    { value: 'success' as const, bg: 'var(--color-emerald-500)', label: 'Success' },
    { value: 'warning' as const, bg: 'var(--color-amber-500)',   label: 'Warning' },
    { value: 'danger'  as const, bg: 'var(--color-red-500)',     label: 'Danger'  },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgVariant.value  !== 'normal')  parts.push(`variant="${pgVariant.value}"`);
    if (pgColor.value    !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value     !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgGradient.value)               parts.push(':gradient="true"');
    if (pgDisabled.value)               parts.push(':disabled="true"');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<ButtonGroup${attrs}>
    <Button>Uno</Button>
    <Button>Dos</Button>
    <Button>Tres</Button>
</ButtonGroup>`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<ButtonGroup color="primary">
    <Button>Izquierda</Button>
    <Button>Centro</Button>
    <Button>Derecha</Button>
</ButtonGroup>`;

const mixedCode = `<ButtonGroup variant="outline">
    <Button color="success">Aprobar</Button>
    <Button color="warning">Revisar</Button>
    <Button color="danger">Rechazar</Button>
</ButtonGroup>`;

const fullWidthCode = `<ButtonGroup color="primary" class="w-full">
    <Button full-width>Día</Button>
    <Button full-width>Semana</Button>
    <Button full-width>Mes</Button>
    <Button full-width>Año</Button>
</ButtonGroup>`;

const verticalCode = `<ButtonGroup orientation="vertical" variant="outline" color="primary">
    <Button>Editar</Button>
    <Button>Duplicar</Button>
    <Button>Archivar</Button>
    <Button>Eliminar</Button>
</ButtonGroup>`;

const iconsCode = `<ButtonGroup color="primary">
    <Button :icon="HeartIcon" aria-label="Like" />
    <Button :icon="BoltIcon" aria-label="Boost" />
    <Button :icon="ArrowRightIcon" aria-label="Next" />
</ButtonGroup>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
    { name: 'orientation', type: "'horizontal' | 'vertical'",                                       default: "'horizontal'", description: t('pages.forms.buttonGroup.props.orientation') },
    { name: 'variant',     type: "'normal' | 'outline' | 'ghost' | 'text'",                         default: "'normal'",     description: t('pages.forms.buttonGroup.props.variant') },
    { name: 'color',       type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",        default: "'default'",    description: t('pages.forms.buttonGroup.props.color') },
    { name: 'size',        type: "'small' | 'medium' | 'large'",                                    default: "'medium'",     description: t('pages.forms.buttonGroup.props.size') },
    { name: 'radius',      type: "'none' | 'small' | 'medium' | 'large' | 'full'",                  default: "'medium'",     description: t('pages.forms.buttonGroup.props.radius') },
    { name: 'disabled',    type: 'boolean',                                                          default: 'false',        description: t('pages.forms.buttonGroup.props.disabled') },
    { name: 'gradient',    type: 'boolean',                                                          default: 'false',        description: t('pages.forms.buttonGroup.props.gradient') },
]);

const slotsList = computed<SlotDoc[]>(() => [
    { name: 'default', description: t('pages.forms.buttonGroup.slots.default') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.forms.buttonGroup.title')"
        :category="t('pages.forms.buttonGroup.category')"
        import-path="import { ButtonGroup, Button } from 'mood-ui'"
        :description="t('pages.forms.buttonGroup.description')"
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <TbPills :label="t('pages.forms.buttonGroup.controls.variant')" :options="[{value:'normal'},{value:'outline'},{value:'ghost'},{value:'text'}]" v-model="pgVariant" />
                    <TbSep />
                    <TbDots :label="t('pages.forms.buttonGroup.controls.color')" :options="colorDots" v-model="pgColor" />
                    <TbSep />
                    <TbPills :label="t('pages.forms.buttonGroup.controls.size')" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbToggle :label="t('pages.forms.buttonGroup.controls.gradient')" v-model="pgGradient" />
                    <TbToggle :label="t('pages.forms.buttonGroup.controls.disabled')" v-model="pgDisabled" />
                </template>

                <ButtonGroup
                    :variant="pgVariant"
                    :color="pgColor"
                    :size="pgSize"
                    :gradient="pgGradient"
                    :disabled="pgDisabled"
                >
                    <Button>Uno</Button>
                    <Button>Dos</Button>
                    <Button>Tres</Button>
                </ButtonGroup>
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                :title="t('pages.forms.buttonGroup.examples.basic.title')"
                :description="t('pages.forms.buttonGroup.examples.basic.desc')"
                :code="basicCode"
            >
                <ButtonGroup color="primary">
                    <Button>Izquierda</Button>
                    <Button>Centro</Button>
                    <Button>Derecha</Button>
                </ButtonGroup>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.buttonGroup.examples.mixed.title')"
                :description="t('pages.forms.buttonGroup.examples.mixed.desc')"
                :code="mixedCode"
            >
                <ButtonGroup variant="outline">
                    <Button color="success">Aprobar</Button>
                    <Button color="warning">Revisar</Button>
                    <Button color="danger">Rechazar</Button>
                </ButtonGroup>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.buttonGroup.examples.fullWidth.title')"
                :description="t('pages.forms.buttonGroup.examples.fullWidth.desc')"
                :code="fullWidthCode"
            >
                <ButtonGroup color="primary" class="w-full">
                    <Button full-width>Día</Button>
                    <Button full-width>Semana</Button>
                    <Button full-width>Mes</Button>
                    <Button full-width>Año</Button>
                </ButtonGroup>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.buttonGroup.examples.vertical.title')"
                :description="t('pages.forms.buttonGroup.examples.vertical.desc')"
                :code="verticalCode"
            >
                <ButtonGroup orientation="vertical" variant="outline" color="primary">
                    <Button>Editar</Button>
                    <Button>Duplicar</Button>
                    <Button>Archivar</Button>
                    <Button>Eliminar</Button>
                </ButtonGroup>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.forms.buttonGroup.examples.icons.title')"
                :description="t('pages.forms.buttonGroup.examples.icons.desc')"
                :code="iconsCode"
            >
                <ButtonGroup color="primary">
                    <Button :icon="HeartIcon" aria-label="Like" />
                    <Button :icon="BoltIcon" aria-label="Boost" />
                    <Button :icon="ArrowRightIcon" aria-label="Next" />
                </ButtonGroup>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
