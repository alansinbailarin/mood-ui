<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Avatar from '../../../components/data-display/avatar/Avatar.vue';
import type { PropDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgSize    = ref<'xs' | 'small' | 'medium' | 'large' | 'xl'>('medium');
const pgRadius  = ref<'full' | 'medium' | 'none'>('full');
const pgColor   = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgMode    = ref<'image' | 'initials' | 'icon'>('image');
const pgBordered = ref(false);

function resetPlayground() {
    pgSize.value = 'medium';
    pgRadius.value = 'full';
    pgColor.value = 'primary';
    pgMode.value = 'image';
    pgBordered.value = false;
}

const colorDots = [
    { value: 'default'  as const, bg: '#64748b',        label: 'Default'  },
    { value: 'primary'  as const, bg: 'var(--primary)', label: 'Primary'  },
    { value: 'success'  as const, bg: '#22c55e',        label: 'Success'  },
    { value: 'warning'  as const, bg: '#f59e0b',        label: 'Warning'  },
    { value: 'danger'   as const, bg: '#ef4444',        label: 'Danger'   },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgSize.value   !== 'medium') parts.push(`size="${pgSize.value}"`);
    if (pgRadius.value !== 'full')   parts.push(`radius="${pgRadius.value}"`);
    if (pgMode.value === 'initials' && pgColor.value !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgBordered.value)            parts.push(':bordered="true"');
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
<Avatar size="large" />
<Avatar size="xl"    />`;

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
const propsList: PropDoc[] = [
    { name: 'src',       type: 'string',                                                              description: 'URL de la imagen del avatar. Si falla, hace fallback a initials o icono.' },
    { name: 'alt',       type: 'string',                                                              description: 'Texto alternativo para la imagen.' },
    { name: 'initials',  type: 'string',                                                              description: 'Iniciales mostradas cuando no hay imagen disponible.' },
    { name: 'size',      type: "'xs' | 'small' | 'medium' | 'large' | 'xl'",     default: "'medium'", description: 'Tamaño del avatar.' },
    { name: 'radius',    type: "'none' | 'small' | 'medium' | 'large' | 'full'",                     description: 'Forma del avatar. full=círculo, none=cuadrado.' },
    { name: 'color',     type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Color de fondo cuando se muestran iniciales.' },
    { name: 'status',    type: "'online' | 'offline' | 'away' | 'busy'",                              description: 'Indicador de estado visible en la esquina inferior.' },
    { name: 'bordered',  type: 'boolean',                                          default: 'false',  description: 'Añade un borde alrededor del avatar.' },
    { name: 'ariaLabel', type: 'string',                                                              description: 'Nombre accesible cuando se muestran iniciales o el icono fallback.' },
    { name: 'skeleton',  type: 'boolean',                                          default: 'false',  description: 'Muestra un placeholder de carga con la misma huella.' },
];
</script>

<template>
    <ComponentDoc
        title="Avatar"
        category="Data Display"
        import-path="import { Avatar } from 'mood-ui'"
        description="Avatar de usuario con imagen, iniciales fallback, indicador de estado y múltiples tamaños y formas."
        :props-list="propsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" @reset="resetPlayground">
                <template #controls>
                    <!-- Mode -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Modo</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="m in ['image', 'initials', 'icon']"
                                :key="m"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgMode === m
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgMode = (m as typeof pgMode)"
                            >{{ m }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <!-- Size -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Size</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in ['xs', 'small', 'medium', 'large', 'xl']"
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

                    <span class="w-px h-4 bg-border shrink-0" />

                    <!-- Shape (radius) -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Shape</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="r in [{v:'full',l:'Circle'},{v:'medium',l:'Rounded'},{v:'none',l:'Square'}]"
                                :key="r.v"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgRadius === r.v
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgRadius = (r.v as typeof pgRadius)"
                            >{{ r.l }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <!-- Color dots (only meaningful for initials) -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Color</span>
                        <div class="flex items-center gap-1">
                            <button
                                v-for="c in colorDots"
                                :key="c.value"
                                type="button"
                                class="size-4 rounded-full transition-all duration-150"
                                :class="pgColor === c.value
                                    ? 'ring-2 ring-offset-1 ring-foreground/30 scale-125'
                                    : 'hover:scale-110 opacity-70 hover:opacity-100'"
                                :style="`background: ${c.bg}`"
                                :title="c.label"
                                @click="pgColor = c.value"
                            />
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgBordered
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgBordered = !pgBordered"
                    >Bordered</button>
                </template>

                <Avatar
                    v-if="pgMode === 'image'"
                    src="https://i.pravatar.cc/80?img=12"
                    :size="pgSize"
                    :radius="pgRadius"
                    :bordered="pgBordered"
                />
                <Avatar
                    v-else-if="pgMode === 'initials'"
                    initials="AP"
                    :size="pgSize"
                    :radius="pgRadius"
                    :color="pgColor"
                    :bordered="pgBordered"
                />
                <Avatar
                    v-else
                    :size="pgSize"
                    :radius="pgRadius"
                    :bordered="pgBordered"
                />
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Imagen"
                description="Carga la imagen desde una URL."
                :code="imageCode"
            >
                <Avatar src="https://i.pravatar.cc/80?img=1" />
                <Avatar src="https://i.pravatar.cc/80?img=2" />
                <Avatar src="https://i.pravatar.cc/80?img=3" />
            </ComponentPreview>

            <ComponentPreview
                title="Iniciales"
                description="Fallback con iniciales y color semántico cuando no hay imagen."
                :code="initialsCode"
            >
                <Avatar initials="AP" color="primary" />
                <Avatar initials="MR" color="success" />
                <Avatar initials="JS" color="warning" />
                <Avatar initials="NK" color="danger" />
            </ComponentPreview>

            <ComponentPreview
                title="Icono fallback"
                description="Si no hay src ni initials, se muestra un icono genérico."
                :code="iconCode"
            >
                <Avatar />
                <Avatar size="large" />
                <Avatar size="xl" />
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Cinco escalas: xs, small, medium, large y xl."
                :code="sizesCode"
            >
                <Avatar src="https://i.pravatar.cc/80?img=4" size="xs" />
                <Avatar src="https://i.pravatar.cc/80?img=4" size="small" />
                <Avatar src="https://i.pravatar.cc/80?img=4" size="medium" />
                <Avatar src="https://i.pravatar.cc/80?img=4" size="large" />
                <Avatar src="https://i.pravatar.cc/80?img=4" size="xl" />
            </ComponentPreview>

            <ComponentPreview
                title="Indicador de estado"
                description="Punto en la esquina inferior derecha para señalar presencia."
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
