<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Card from '../../../components/data-display/Card.vue';
import Typography from '../../../components/data-display/Typography.vue';
import Button from '../../../components/forms/Button.vue';
import type { PropDoc, SlotDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<'elevated' | 'outlined' | 'filled'>('outlined');
const pgPadding = ref<'none' | 'small' | 'medium' | 'large'>('medium');
const pgRadius  = ref<'none' | 'small' | 'medium' | 'large' | 'full'>('medium');
const pgHover   = ref(false);

function resetPlayground() {
    pgVariant.value = 'outlined';
    pgPadding.value = 'medium';
    pgRadius.value  = 'medium';
    pgHover.value   = false;
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgVariant.value !== 'outlined') parts.push(`variant="${pgVariant.value}"`);
    if (pgPadding.value !== 'medium')   parts.push(`padding="${pgPadding.value}"`);
    if (pgRadius.value  !== 'medium')   parts.push(`radius="${pgRadius.value}"`);
    if (pgHover.value)                  parts.push(':hoverable="true"');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Card${attrs} class="w-80">\n  Contenido del card\n</Card>`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const basicCode = `<Card class="w-80">
  <Typography variant="title" size="medium">Plan Pro</Typography>
  <Typography variant="body" color="muted">
    $29 / mes con todas las funciones.
  </Typography>
</Card>`;

const headerFooterCode = `<Card class="w-80">
  <template #header>
    <Typography variant="title" size="small">Suscripción</Typography>
  </template>
  <Typography variant="body">$29 / mes con todas las funciones.</Typography>
  <template #footer>
    <div class="flex justify-end gap-2">
      <Button variant="ghost" size="small">Cancelar</Button>
      <Button color="primary" size="small">Suscribir</Button>
    </div>
  </template>
</Card>`;

const imageCode = `<Card padding="none" class="w-80">
  <template #image>
    <img src="https://picsum.photos/400/200" class="w-full h-32 object-cover" />
  </template>
  <div class="p-5">
    <Typography variant="title" size="small">Mountain view</Typography>
    <Typography variant="body" color="muted">Foto del día.</Typography>
  </div>
</Card>`;

const hoverCode = `<Card hoverable class="w-80">
  <Typography variant="title" size="small">Pasa el cursor</Typography>
  <Typography variant="body" color="muted">Reacciona al hover.</Typography>
</Card>`;

const clickableCode = `<Card clickable hoverable class="w-80" @click="onClick">
  <Typography variant="title" size="small">Card clickeable</Typography>
  <Typography variant="body" color="muted">Botón completo accesible.</Typography>
</Card>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'variant',   type: "'elevated' | 'outlined' | 'filled'",                  default: "'outlined'", description: 'Estilo visual del contenedor.' },
    { name: 'padding',   type: "'none' | 'small' | 'medium' | 'large'",               default: "'medium'",   description: 'Padding interno aplicado a header, body y footer.' },
    { name: 'radius',    type: "'none' | 'small' | 'medium' | 'large' | 'full'",                              description: 'Radio de borde. Hereda del ModoProvider si se omite.' },
    { name: 'hoverable', type: 'boolean',                                              default: 'false',      description: 'Aplica estado hover (sombra, borde) sin convertirlo en botón.' },
    { name: 'clickable', type: 'boolean',                                              default: 'false',      description: 'Renderiza el card como <button> con foco accesible y cursor pointer.' },
    { name: 'divided',   type: 'boolean',                                              default: 'true',       description: 'Muestra una línea divisoria entre header / body / footer.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Contenido principal del card.' },
    { name: 'header',  description: 'Cabecera opcional encima del contenido.' },
    { name: 'image',   description: 'Slot sin padding para imágenes o medios edge-to-edge.' },
    { name: 'footer',  description: 'Footer opcional para acciones o metadatos.' },
];
</script>

<template>
    <ComponentDoc
        title="Card"
        category="Data Display"
        import-path="import { Card } from 'mood-ui'"
        description="Contenedor estructural con tres variantes (elevated, outlined, filled), control de padding, radio y estado hover. Bloque base para métricas, listas, formularios y secciones."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="260px" @reset="resetPlayground">
                <template #controls>
                    <!-- Variant -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Variant</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in ['elevated', 'outlined', 'filled']"
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

                    <!-- Padding -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Padding</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="p in ['none', 'small', 'medium', 'large']"
                                :key="p"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgPadding === p
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgPadding = (p as typeof pgPadding)"
                            >{{ p }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <!-- Radius -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Radius</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="r in ['none', 'small', 'medium', 'large', 'full']"
                                :key="r"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgRadius === r
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgRadius = (r as typeof pgRadius)"
                            >{{ r }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgHover
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgHover = !pgHover"
                    >Hoverable</button>
                </template>

                <Card
                    :variant="pgVariant"
                    :padding="pgPadding"
                    :radius="pgRadius"
                    :hoverable="pgHover"
                    class="w-80"
                >
                    <Typography variant="title" size="small">Card de ejemplo</Typography>
                    <Typography variant="body" color="muted">
                        Ajusta los controles para ver los cambios en vivo.
                    </Typography>
                </Card>
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Card simple con título y descripción."
                :code="basicCode"
            >
                <Card class="w-80">
                    <Typography variant="title" size="medium">Plan Pro</Typography>
                    <Typography variant="body" color="muted">
                        $29 / mes con todas las funciones.
                    </Typography>
                </Card>
            </ComponentPreview>

            <ComponentPreview
                title="Con header y footer"
                description="Slots #header y #footer con divisor entre secciones."
                :code="headerFooterCode"
            >
                <Card class="w-80">
                    <template #header>
                        <Typography variant="title" size="small">Suscripción</Typography>
                    </template>
                    <Typography variant="body">$29 / mes con todas las funciones.</Typography>
                    <template #footer>
                        <div class="flex justify-end gap-2">
                            <Button variant="ghost" size="small">Cancelar</Button>
                            <Button color="primary" size="small">Suscribir</Button>
                        </div>
                    </template>
                </Card>
            </ComponentPreview>

            <ComponentPreview
                title="Con imagen"
                description="Slot #image edge-to-edge combinado con padding=none."
                :code="imageCode"
            >
                <Card padding="none" class="w-80">
                    <template #image>
                        <img src="https://picsum.photos/400/200" class="w-full h-32 object-cover" />
                    </template>
                    <div class="p-5">
                        <Typography variant="title" size="small">Mountain view</Typography>
                        <Typography variant="body" color="muted">Foto del día.</Typography>
                    </div>
                </Card>
            </ComponentPreview>

            <ComponentPreview
                title="Hover effect"
                description="Activa hoverable para realzar el card al pasar el cursor."
                :code="hoverCode"
            >
                <Card hoverable class="w-80">
                    <Typography variant="title" size="small">Pasa el cursor</Typography>
                    <Typography variant="body" color="muted">Reacciona al hover.</Typography>
                </Card>
            </ComponentPreview>

            <ComponentPreview
                title="Clickeable"
                description="Renderiza el card como <button> accesible con foco visible."
                :code="clickableCode"
            >
                <Card clickable hoverable class="w-80">
                    <Typography variant="title" size="small">Card clickeable</Typography>
                    <Typography variant="body" color="muted">Botón completo accesible.</Typography>
                </Card>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
