<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import ButtonGroup from '../../../components/forms/ButtonGroup.vue';
import Button from '../../../components/forms/Button.vue';
import { HeartIcon, ArrowRightIcon, BoltIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, SlotDoc } from '../../types';

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
    { value: 'default' as const, bg: '#64748b',        label: 'Default' },
    { value: 'primary' as const, bg: 'var(--primary)', label: 'Primary' },
    { value: 'success' as const, bg: '#22c55e',        label: 'Success' },
    { value: 'warning' as const, bg: '#f59e0b',        label: 'Warning' },
    { value: 'danger'  as const, bg: '#ef4444',        label: 'Danger'  },
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
const propsList: PropDoc[] = [
    { name: 'orientation', type: "'horizontal' | 'vertical'",                                       default: "'horizontal'", description: 'Eje en el que se apilan los botones.' },
    { name: 'variant',     type: "'normal' | 'outline' | 'ghost' | 'text'",                         default: "'normal'",     description: 'Variante visual heredada por todos los botones del grupo.' },
    { name: 'color',       type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",        default: "'default'",    description: 'Color semántico aplicado a los botones del grupo.' },
    { name: 'size',        type: "'small' | 'medium' | 'large'",                                    default: "'medium'",     description: 'Tamaño compartido por todos los botones del grupo.' },
    { name: 'radius',      type: "'none' | 'small' | 'medium' | 'large' | 'full'",                  default: "'medium'",     description: 'Radio aplicado al wrapper. Los botones colapsan sus esquinas internas.' },
    { name: 'disabled',    type: 'boolean',                                                          default: 'false',        description: 'Deshabilita todos los botones del grupo.' },
    { name: 'gradient',    type: 'boolean',                                                          default: 'false',        description: 'Aplica un degradado sutil compatible con la variante normal.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Lista de componentes <Button> que forman parte del grupo.' },
];
</script>

<template>
    <ComponentDoc
        title="ButtonGroup"
        category="Forms"
        import-path="import { ButtonGroup, Button } from 'mood-ui'"
        description="Agrupa varios botones en una unidad visual compartiendo variante, color y tamaño. Soporta orientación horizontal y vertical."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <!-- Variant -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">VARIANT</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in ['normal', 'outline', 'ghost', 'text']"
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
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">COLOR</span>
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
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">SIZE</span>
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
                        :class="pgGradient
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgGradient = !pgGradient"
                    >Gradient</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDisabled
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDisabled = !pgDisabled"
                    >Disabled</button>
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
                title="Uso básico"
                description="Tres botones agrupados que comparten color y variante."
                :code="basicCode"
            >
                <ButtonGroup color="primary">
                    <Button>Izquierda</Button>
                    <Button>Centro</Button>
                    <Button>Derecha</Button>
                </ButtonGroup>
            </ComponentPreview>

            <ComponentPreview
                title="Colores mixtos"
                description="Cada botón puede sobreescribir el color del grupo para destacar acciones."
                :code="mixedCode"
            >
                <ButtonGroup variant="outline">
                    <Button color="success">Aprobar</Button>
                    <Button color="warning">Revisar</Button>
                    <Button color="danger">Rechazar</Button>
                </ButtonGroup>
            </ComponentPreview>

            <ComponentPreview
                title="Ancho completo"
                description="El grupo se expande al 100% y los botones reparten el ancho proporcionalmente."
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
                title="Vertical"
                description="Apila los botones en columna — útil para menús contextuales o listas de acciones."
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
                title="Con iconos"
                description="Botones icon-only agrupados para barras de herramientas compactas."
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
