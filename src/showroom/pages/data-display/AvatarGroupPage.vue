<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import AvatarGroup from '../../../components/data-display/avatar/AvatarGroup.vue';
import Avatar from '../../../components/data-display/avatar/Avatar.vue';
import type { PropDoc, SlotDoc } from '../../types';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep from '../../components/toolbar/TbSep.vue';

// ── Overview playground state ─────────────────────────────────────────────────
const pgSize     = ref<'xs' | 'small' | 'medium' | 'large' | 'xl'>('medium');
const pgMax      = ref<3 | 4 | 5 | 6>(4);
const pgBordered = ref(true);
const pgRadius   = ref<'none' | 'small' | 'medium' | 'large' | 'full'>('full');

function resetPlayground() {
    pgSize.value = 'medium';
    pgMax.value = 4;
    pgBordered.value = true;
    pgRadius.value = 'full';
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgSize.value !== 'medium') parts.push(`size="${pgSize.value}"`);
    parts.push(`:max="${pgMax.value}"`);
    if (!pgBordered.value)         parts.push(':bordered="false"');
    if (pgRadius.value !== 'full')  parts.push(`radius="${pgRadius.value}"`);
    const attrs = ' ' + parts.join(' ');
    return `<AvatarGroup${attrs}>
  <Avatar src="https://i.pravatar.cc/80?img=1" />
  <Avatar src="https://i.pravatar.cc/80?img=2" />
  <Avatar src="https://i.pravatar.cc/80?img=3" />
  <Avatar src="https://i.pravatar.cc/80?img=4" />
  <Avatar src="https://i.pravatar.cc/80?img=5" />
  <Avatar src="https://i.pravatar.cc/80?img=6" />
</AvatarGroup>`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const basicCode = `<AvatarGroup>
  <Avatar src="https://i.pravatar.cc/80?img=1" />
  <Avatar src="https://i.pravatar.cc/80?img=2" />
  <Avatar src="https://i.pravatar.cc/80?img=3" />
</AvatarGroup>`;

const maxCode = `<AvatarGroup :max="3">
  <Avatar src="https://i.pravatar.cc/80?img=5" />
  <Avatar src="https://i.pravatar.cc/80?img=6" />
  <Avatar src="https://i.pravatar.cc/80?img=7" />
  <Avatar src="https://i.pravatar.cc/80?img=8" />
  <Avatar src="https://i.pravatar.cc/80?img=9" />
  <Avatar src="https://i.pravatar.cc/80?img=10" />
</AvatarGroup>`;

const sizesCode = `<AvatarGroup size="small">…</AvatarGroup>
<AvatarGroup size="medium">…</AvatarGroup>
<AvatarGroup size="large">…</AvatarGroup>`;

const mixedCode = `<AvatarGroup :max="4">
  <Avatar src="https://i.pravatar.cc/80?img=20" />
  <Avatar initials="AP" color="primary" />
  <Avatar src="https://i.pravatar.cc/80?img=21" />
  <Avatar initials="MR" color="success" />
  <Avatar />
</AvatarGroup>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'max',       type: 'number',                                                                description: 'Número máximo de avatares visibles. Los restantes se agrupan en un contador +N.' },
    { name: 'size',      type: "'xs' | 'small' | 'medium' | 'large' | 'xl'",       default: "'medium'", description: 'Tamaño aplicado a todos los avatares hijos.' },
    { name: 'radius',    type: "'none' | 'small' | 'medium' | 'large' | 'full'",                        description: 'Forma compartida por todos los avatares del grupo.' },
    { name: 'bordered',  type: 'boolean',                                            default: 'true',    description: 'Borde alrededor de cada avatar para separarlos visualmente.' },
    { name: 'ariaLabel', type: 'string',                                                                 description: 'Nombre accesible para el grupo.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Lista de componentes <Avatar>. El grupo controla su tamaño y forma.' },
];
</script>

<template>
    <ComponentDoc
        title="AvatarGroup"
        category="Data Display"
        import-path="import { AvatarGroup } from 'mood-ui'"
        description="Apila avatares solapados mostrando hasta N visibles y un contador con el resto. Ideal para listas de colaboradores, asignados o miembros."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="180px" @reset="resetPlayground">
                <template #controls>
                    <TbPills label="Size" :options="[{value:'xs'},{value:'small'},{value:'medium'},{value:'large'},{value:'xl'}]" v-model="pgSize" />
                    <TbSep />
                    <TbPills label="Max" :options="[{value:'3'},{value:'4'},{value:'5'},{value:'6'}]" :model-value="String(pgMax)" @update:model-value="pgMax = Number($event) as 3|4|5|6" />
                    <TbSep />
                    <TbPills label="Radius" :options="[{value:'none'},{value:'small'},{value:'medium'},{value:'large'},{value:'full'}]" v-model="pgRadius" />
                    <TbSep />
                    <TbToggle label="Bordered" v-model="pgBordered" />
                </template>

                <AvatarGroup :size="pgSize" :max="pgMax" :bordered="pgBordered" :radius="pgRadius">
                    <Avatar src="https://i.pravatar.cc/80?img=1" />
                    <Avatar src="https://i.pravatar.cc/80?img=2" />
                    <Avatar src="https://i.pravatar.cc/80?img=3" />
                    <Avatar src="https://i.pravatar.cc/80?img=4" />
                    <Avatar src="https://i.pravatar.cc/80?img=5" />
                    <Avatar src="https://i.pravatar.cc/80?img=6" />
                </AvatarGroup>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Tres avatares solapados sin límite."
                :code="basicCode"
            >
                <AvatarGroup>
                    <Avatar src="https://i.pravatar.cc/80?img=1" />
                    <Avatar src="https://i.pravatar.cc/80?img=2" />
                    <Avatar src="https://i.pravatar.cc/80?img=3" />
                </AvatarGroup>
            </ComponentPreview>

            <ComponentPreview
                title="Con max y overflow"
                description="Limita los visibles y muestra un contador +N con el resto."
                :code="maxCode"
            >
                <AvatarGroup :max="3">
                    <Avatar src="https://i.pravatar.cc/80?img=5" />
                    <Avatar src="https://i.pravatar.cc/80?img=6" />
                    <Avatar src="https://i.pravatar.cc/80?img=7" />
                    <Avatar src="https://i.pravatar.cc/80?img=8" />
                    <Avatar src="https://i.pravatar.cc/80?img=9" />
                    <Avatar src="https://i.pravatar.cc/80?img=10" />
                </AvatarGroup>
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="El size se aplica a todos los avatares hijos."
                :code="sizesCode"
            >
                <div class="flex flex-col gap-4 items-start">
                    <AvatarGroup size="small">
                        <Avatar src="https://i.pravatar.cc/80?img=11" />
                        <Avatar src="https://i.pravatar.cc/80?img=12" />
                        <Avatar src="https://i.pravatar.cc/80?img=13" />
                    </AvatarGroup>
                    <AvatarGroup size="medium">
                        <Avatar src="https://i.pravatar.cc/80?img=14" />
                        <Avatar src="https://i.pravatar.cc/80?img=15" />
                        <Avatar src="https://i.pravatar.cc/80?img=16" />
                    </AvatarGroup>
                    <AvatarGroup size="large">
                        <Avatar src="https://i.pravatar.cc/80?img=17" />
                        <Avatar src="https://i.pravatar.cc/80?img=18" />
                        <Avatar src="https://i.pravatar.cc/80?img=19" />
                    </AvatarGroup>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Mixto"
                description="Combina imágenes, iniciales e icono fallback en el mismo grupo."
                :code="mixedCode"
            >
                <AvatarGroup :max="4">
                    <Avatar src="https://i.pravatar.cc/80?img=20" />
                    <Avatar initials="AP" color="primary" />
                    <Avatar src="https://i.pravatar.cc/80?img=21" />
                    <Avatar initials="MR" color="success" />
                    <Avatar />
                </AvatarGroup>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
