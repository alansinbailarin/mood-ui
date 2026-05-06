<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Button from '../../../components/forms/Button.vue';
import { HeartIcon, ArrowRightIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant  = ref<'normal' | 'outline' | 'ghost' | 'text'>('normal');
const pgColor    = ref<'default' | 'primary' | 'danger' | 'success' | 'warning'>('primary');
const pgSize     = ref<'xs' | 'small' | 'medium' | 'large'>('medium');
const pgLoading  = ref(false);
const pgDisabled = ref(false);

const colorDots = [
    { value: 'default'  as const, bg: '#64748b',        label: 'Default'  },
    { value: 'primary'  as const, bg: 'var(--primary)', label: 'Primary'  },
    { value: 'success'  as const, bg: '#22c55e',        label: 'Success'  },
    { value: 'warning'  as const, bg: '#f59e0b',        label: 'Warning'  },
    { value: 'danger'   as const, bg: '#ef4444',        label: 'Danger'   },
];

// Reactive code — only non-default attrs appear
const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgVariant.value  !== 'normal')  parts.push(`variant="${pgVariant.value}"`);
    if (pgColor.value    !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value     !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgLoading.value)                parts.push(':loading="true"');
    if (pgDisabled.value)               parts.push(':disabled="true"');

    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Button${attrs}>Click me</Button>`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const variantsCode = `<Button variant="normal"  color="primary">Normal</Button>
<Button variant="outline" color="primary">Outline</Button>
<Button variant="ghost"   color="primary">Ghost</Button>
<Button variant="text"    color="primary">Text</Button>`;

const colorsCode = `<Button color="default">Default</Button>
<Button color="primary">Primary</Button>
<Button color="success">Success</Button>
<Button color="warning">Warning</Button>
<Button color="danger">Danger</Button>`;

const sizesCode = `<Button size="xs"     color="primary">XS</Button>
<Button size="small"  color="primary">Small</Button>
<Button size="medium" color="primary">Medium</Button>
<Button size="large"  color="primary">Large</Button>`;

const iconsCode = `<Button :icon="HeartIcon"     color="danger"   variant="outline">Me gusta</Button>
<Button :icon="ArrowRightIcon" icon-position="right" color="primary">Continuar</Button>
<Button :icon="HeartIcon"      color="primary" aria-label="Like" />`;

const statesCode = `<Button loading                          color="primary">Guardando…</Button>
<Button loading loading-text="Procesando" color="primary">Enviar</Button>
<Button disabled                          color="primary">Disabled</Button>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'variant',      type: "'normal' | 'outline' | 'ghost' | 'text'",                   default: "'normal'",  description: 'Variante visual. Normal es el botón sólido por defecto.' },
    { name: 'color',        type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",  default: "'default'", description: 'Color semántico aplicado al botón.' },
    { name: 'size',         type: "'xs' | 'small' | 'medium' | 'large'",                       default: "'medium'",  description: 'Controla el padding, fuente y alto del botón.' },
    { name: 'label',        type: 'string',                                                                           description: 'Texto del botón. Equivalente al slot default para contenido plano.' },
    { name: 'loading',      type: 'boolean',                                                    default: 'false',     description: 'Muestra un spinner y bloquea clicks mientras está activo.' },
    { name: 'loadingText',  type: 'string',                                                                           description: 'Texto mostrado junto al spinner durante el estado loading.' },
    { name: 'disabled',     type: 'boolean',                                                    default: 'false',     description: 'Deshabilita el botón visualmente e impide cualquier interacción.' },
    { name: 'icon',         type: 'Component',                                                                        description: 'Componente de icono renderizado junto al label (heroicons u otro).' },
    { name: 'iconPosition', type: "'left' | 'right'",                                          default: "'left'",    description: 'Lado donde aparece el icono respecto al label.' },
    { name: 'fullWidth',    type: 'boolean',                                                    default: 'false',     description: 'El botón se expande para ocupar el 100% del ancho disponible.' },
    { name: 'as',           type: 'string | Component',                                         default: "'button'",  description: "Elemento raíz a renderizar. Usa \"a\" para links o un router-link." },
    { name: 'ariaLabel',    type: 'string',                                                                           description: 'Label accesible. Imprescindible en botones icon-only sin texto visible.' },
];

const emitsList: EmitDoc[] = [
    { name: 'click', payload: 'MouseEvent', description: 'Emitido al hacer click cuando el botón no está deshabilitado ni en estado loading.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Contenido personalizado del botón. Reemplaza la prop label cuando se necesita HTML o componentes internos.' },
];
</script>

<template>
    <ComponentDoc
        title="Button"
        category="Forms"
        import-path="import { Button } from 'mood-ui'"
        description="La acción primaria de cualquier interfaz. Cuatro variantes, cinco colores semánticos, cuatro tamaños, iconos configurables, estado de carga y soporte para renderizar como link o cualquier elemento."
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px">
                <template #controls>
                    <!-- Variant -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Variant</span>
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
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Size</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in ['xs', 'small', 'medium', 'large']"
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

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgLoading
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgLoading = !pgLoading"
                    >Loading</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDisabled
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDisabled = !pgDisabled"
                    >Disabled</button>
                </template>

                <Button
                    :variant="pgVariant"
                    :color="pgColor"
                    :size="pgSize"
                    :loading="pgLoading"
                    :disabled="pgDisabled"
                >
                    Click me
                </Button>
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Variantes"
                description="Cuatro estilos visuales para distintos niveles de jerarquía de acción."
                :code="variantsCode"
            >
                <Button variant="normal"  color="primary">Normal</Button>
                <Button variant="outline" color="primary">Outline</Button>
                <Button variant="ghost"   color="primary">Ghost</Button>
                <Button variant="text"    color="primary">Text</Button>
            </ComponentPreview>

            <ComponentPreview
                title="Colores"
                description="Cinco colores semánticos que mapean al sistema de design tokens del ModoProvider."
                :code="colorsCode"
            >
                <Button color="default">Default</Button>
                <Button color="primary">Primary</Button>
                <Button color="success">Success</Button>
                <Button color="warning">Warning</Button>
                <Button color="danger">Danger</Button>
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="El padding, la fuente y el alto se ajustan proporcionalmente en cada escala."
                :code="sizesCode"
            >
                <Button size="xs"     color="primary">XS</Button>
                <Button size="small"  color="primary">Small</Button>
                <Button size="medium" color="primary">Medium</Button>
                <Button size="large"  color="primary">Large</Button>
            </ComponentPreview>

            <ComponentPreview
                title="Con iconos"
                description="Posición izquierda, derecha o solo icono. Usa aria-label en botones icon-only."
                :code="iconsCode"
            >
                <Button :icon="HeartIcon"      color="danger"   variant="outline">Me gusta</Button>
                <Button :icon="ArrowRightIcon" icon-position="right" color="primary">Continuar</Button>
                <Button :icon="HeartIcon"      color="primary"  aria-label="Like" />
            </ComponentPreview>

            <ComponentPreview
                title="Estados"
                description="Loading bloquea clicks y muestra spinner. Disabled deshabilita visualmente e impide eventos."
                :code="statesCode"
            >
                <Button loading                           color="primary">Guardando…</Button>
                <Button loading loading-text="Procesando" color="primary">Enviar</Button>
                <Button disabled                          color="primary">Disabled</Button>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
