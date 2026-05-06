<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Chip from '../../../components/feedback/Chip.vue';
import Avatar from '../../../components/data-display/avatar/Avatar.vue';
import { BellIcon, EnvelopeIcon, ChatBubbleLeftIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<'solid' | 'subtle' | 'outline'>('solid');
const pgColor   = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('danger');
const pgSize    = ref<'small' | 'medium' | 'large'>('medium');
const pgDot     = ref(false);

function resetPlayground() {
    pgVariant.value = 'solid';
    pgColor.value   = 'danger';
    pgSize.value    = 'medium';
    pgDot.value     = false;
}

const colorDots = [
    { value: 'default' as const, bg: '#64748b',        label: 'Default' },
    { value: 'primary' as const, bg: 'var(--primary)', label: 'Primary' },
    { value: 'success' as const, bg: '#22c55e',        label: 'Success' },
    { value: 'warning' as const, bg: '#f59e0b',        label: 'Warning' },
    { value: 'danger'  as const, bg: '#ef4444',        label: 'Danger'  },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgVariant.value !== 'solid')  parts.push(`variant="${pgVariant.value}"`);
    if (pgColor.value   !== 'danger') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value    !== 'medium') parts.push(`size="${pgSize.value}"`);
    if (pgDot.value)                  parts.push('dot');
    else                              parts.push(':content="3"');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Chip${attrs}>
  <BellIcon class="w-7 h-7" />
</Chip>`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const counterCode = `<Chip :content="3"  color="danger"  placement="top-right">
  <BellIcon class="w-7 h-7" />
</Chip>
<Chip :content="12" color="primary" placement="top-right">
  <EnvelopeIcon class="w-7 h-7" />
</Chip>
<Chip :content="125" :max="99" color="primary" placement="top-right">
  <ChatBubbleLeftIcon class="w-7 h-7" />
</Chip>`;

const dotCode = `<Chip dot color="success" placement="bottom-right">
  <Avatar src="https://i.pravatar.cc/40?img=1" />
</Chip>
<Chip dot color="warning" placement="bottom-right">
  <Avatar src="https://i.pravatar.cc/40?img=2" />
</Chip>
<Chip dot color="danger" placement="bottom-right">
  <Avatar src="https://i.pravatar.cc/40?img=3" />
</Chip>`;

const variantsCode = `<Chip :content="5" variant="solid"   color="primary"><BellIcon class="w-6 h-6" /></Chip>
<Chip :content="5" variant="subtle"  color="primary"><BellIcon class="w-6 h-6" /></Chip>
<Chip :content="5" variant="outline" color="primary"><BellIcon class="w-6 h-6" /></Chip>`;

const inlineCode = `<Chip :content="'Nuevo'" color="primary" variant="subtle" />
<Chip :content="'Beta'"  color="warning" variant="outline" />
<Chip :content="42"      color="success" variant="solid" />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'content',    type: 'string | number',                                                              description: 'Contenido visible (número o string corto). Se ignora si dot está activo.' },
    { name: 'dot',        type: 'boolean',                                          default: 'false',           description: 'Renderiza un indicador pequeño sin contenido.' },
    { name: 'max',        type: 'number',                                           default: '99',              description: 'Cap superior para contenido numérico (ej. 99 → "99+").' },
    { name: 'invisible',  type: 'boolean',                                          default: 'false',           description: 'Oculta el chip manteniéndolo en el árbol.' },
    { name: 'showZero',   type: 'boolean',                                          default: 'false',           description: 'Muestra el chip aun cuando content sea 0 (por defecto se oculta).' },
    { name: 'variant',    type: "'solid' | 'subtle' | 'outline'",                   default: "'solid'",         description: 'Estilo visual aplicado al chip.' },
    { name: 'color',      type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'danger'", description: 'Color semántico aplicado al chip.' },
    { name: 'size',       type: "'small' | 'medium' | 'large'",                                                  description: 'Tamaño del chip. Cascada desde ModoProvider si se omite.' },
    { name: 'radius',     type: "'none' | 'small' | 'medium' | 'large' | 'full'",                               description: 'Radio de las esquinas. Cascada desde ModoProvider.' },
    { name: 'placement',  type: "'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'", default: "'top-right'", description: 'Esquina del anchor donde se posiciona el chip overlay.' },
    { name: 'icon',       type: 'Component',                                                                    description: 'Icono decorativo opcional (ignorado en modo dot).' },
    { name: 'ariaLabel',  type: 'string',                                                                       description: 'Nombre accesible. Recomendado para chips numéricos o dot.' },
];

const emitsList: EmitDoc[] = [];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Anchor del chip overlay. Si se omite, el chip se renderiza inline como pill.' },
];
</script>

<template>
    <ComponentDoc
        title="Chip"
        category="Feedback"
        import-path="import { Chip } from 'mood-ui'"
        description="Indicador overlay (counter o dot) que se posiciona sobre otro elemento como un avatar o icono. También funciona como pill inline cuando no hay anchor."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <!-- Variant -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Variante</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in ['solid', 'subtle', 'outline']"
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

                    <!-- Color dots -->
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

                    <!-- Size -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Tamaño</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in ['small', 'medium', 'large']"
                                :key="s"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgSize === s
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgSize = (s as typeof pgSize)"
                            >{{ s }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDot
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDot = !pgDot"
                    >Dot</button>
                </template>

                <Chip
                    :variant="pgVariant"
                    :color="pgColor"
                    :size="pgSize"
                    :dot="pgDot"
                    :content="pgDot ? undefined : 3"
                    placement="top-right"
                >
                    <BellIcon class="w-7 h-7" />
                </Chip>
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Counter sobre icono"
                description="Contador overlay sobre un icono. Con max se trunca el valor a 99+."
                :code="counterCode"
            >
                <Chip :content="3"  color="danger"  placement="top-right">
                    <BellIcon class="w-7 h-7" />
                </Chip>
                <Chip :content="12" color="primary" placement="top-right">
                    <EnvelopeIcon class="w-7 h-7" />
                </Chip>
                <Chip :content="125" :max="99" color="primary" placement="top-right">
                    <ChatBubbleLeftIcon class="w-7 h-7" />
                </Chip>
            </ComponentPreview>

            <ComponentPreview
                title="Dot sobre avatar"
                description="Indicador de presencia sin contenido sobre un avatar."
                :code="dotCode"
            >
                <Chip dot color="success" placement="bottom-right">
                    <Avatar src="https://i.pravatar.cc/40?img=1" />
                </Chip>
                <Chip dot color="warning" placement="bottom-right">
                    <Avatar src="https://i.pravatar.cc/40?img=2" />
                </Chip>
                <Chip dot color="danger" placement="bottom-right">
                    <Avatar src="https://i.pravatar.cc/40?img=3" />
                </Chip>
            </ComponentPreview>

            <ComponentPreview
                title="Variantes"
                description="Tres tratamientos visuales para el chip overlay."
                :code="variantsCode"
            >
                <Chip :content="5" variant="solid"   color="primary"><BellIcon class="w-6 h-6" /></Chip>
                <Chip :content="5" variant="subtle"  color="primary"><BellIcon class="w-6 h-6" /></Chip>
                <Chip :content="5" variant="outline" color="primary"><BellIcon class="w-6 h-6" /></Chip>
            </ComponentPreview>

            <ComponentPreview
                title="Inline (sin anchor)"
                description="Cuando no hay slot default, el chip se renderiza en flujo como pill."
                :code="inlineCode"
            >
                <Chip :content="'Nuevo'" color="primary" variant="subtle" />
                <Chip :content="'Beta'"  color="warning" variant="outline" />
                <Chip :content="42"      color="success" variant="solid" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
