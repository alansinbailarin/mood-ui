<script setup lang="ts">
import { PaintBrushIcon } from '@heroicons/vue/24/outline';
import Typography from '../../../components/data-display/Typography.vue';
import Card from '../../../components/data-display/Card.vue';
import Stack from '../../../components/layout/Stack.vue';
import Badge from '../../../components/feedback/Badge.vue';
import Banner from '../../../components/feedback/Banner.vue';
import CodePreview from '../../components/CodePreview.vue';

const providerProps = `<ModoProvider
  color="primary"          // brand color
  theme="system"           // 'light' | 'dark' | 'system'
  radius="medium"          // 'none' | 'small' | 'medium' | 'large' | 'full'
  size="medium"            // 'small' | 'medium' | 'large'
  halo="tinted"            // focus ring style
  locale="es"              // 'es' | 'en' or full ModoLocale
>
  <App />
</ModoProvider>`;

const customPalette = `<script setup lang="ts">
import { ModoProvider, paletteFromHex } from 'mood-ui';

const palettes = {
  primary: paletteFromHex('#6366f1'), // generates 50→900 scale
};
<\/script>

<template>
  <ModoProvider :palettes="palettes" color="primary">
    <App />
  </ModoProvider>
</template>`;

const surfaces = `<script setup lang="ts">
import { ModoProvider, type ModoSurfaces } from 'mood-ui';

const surfaces: ModoSurfaces = {
  background: '#fafafa',
  card:       '#ffffff',
  border:     '#e5e7eb',
  primary:    '#6366f1',
  // …14 semantic tokens total
};
<\/script>

<template>
  <ModoProvider :surfaces="surfaces">
    <App />
  </ModoProvider>
</template>`;

const darkSurfaces = `<script setup lang="ts">
import { ModoProvider, darkSurfaces } from 'mood-ui';

// 6 built-in presets: default · navy · zinc · charcoal · midnight · forest
<\/script>

<template>
  <ModoProvider :dark-surfaces="darkSurfaces.midnight" theme="dark">
    <App />
  </ModoProvider>
</template>`;

const cssOverride = `/* tailwind.config / your global css */
:root {
  --primary:           #6366f1;
  --primary-foreground: #ffffff;
  --background:        #fafafa;
  --foreground:        #0a0a0a;
  --border:            #e5e7eb;
  /* …override any of the 14 semantic tokens */
}

.dark {
  --primary:           #818cf8;
  --background:        #0a0a0a;
  --foreground:        #fafafa;
}`;

const tokens = [
    { name: 'background',        usage: 'App background' },
    { name: 'foreground',        usage: 'Default text color' },
    { name: 'card',              usage: 'Card / panel surfaces' },
    { name: 'card-foreground',   usage: 'Text inside cards' },
    { name: 'popover',           usage: 'Popover / dropdown surfaces' },
    { name: 'popover-foreground',usage: 'Text inside popovers' },
    { name: 'primary',           usage: 'Brand color' },
    { name: 'primary-foreground',usage: 'Text on primary' },
    { name: 'secondary',         usage: 'Secondary surface' },
    { name: 'muted',             usage: 'Muted backgrounds' },
    { name: 'muted-foreground',  usage: 'Subdued text' },
    { name: 'accent',            usage: 'Accent / hover surfaces' },
    { name: 'border',            usage: 'Hairlines, separators' },
    { name: 'input',             usage: 'Input borders' },
    { name: 'ring',              usage: 'Focus ring color' },
];
</script>

<template>
    <div class="flex flex-col gap-10 max-w-3xl">
        <header class="flex flex-col gap-3">
            <Badge color="primary" variant="subtle" class="self-start">
                <PaintBrushIcon class="size-3.5 mr-1" />
                Docs
            </Badge>
            <Typography variant="display" size="medium" weight="bold">
                Theming
            </Typography>
            <Typography variant="body" size="large" color="muted">
                mood-ui usa una cascada de configuración basada en CSS custom properties
                + Tailwind v4 tokens. Personaliza desde el provider, surfaces, paletas
                generadas o sobrescribiendo CSS vars directamente.
            </Typography>
        </header>

        <!-- Provider props -->
        <section class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="bold">Props del Provider</Typography>
            <Typography variant="body" color="muted">
                <code>ModoProvider</code> acepta props que se propagan a todos los descendientes.
                Cualquier componente puede sobrescribir localmente con su propia prop.
            </Typography>
            <CodePreview :code="providerProps" lang="vue" code-only />
        </section>

        <!-- Custom palette -->
        <section class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="bold">Paleta personalizada desde un HEX</Typography>
            <Typography variant="body" color="muted">
                <code>paletteFromHex()</code> genera una escala completa 50→900 a partir de un solo color.
                Útil para marcas con un único color principal.
            </Typography>
            <CodePreview :code="customPalette" lang="vue" code-only />
        </section>

        <!-- Surfaces -->
        <section class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="bold">Surfaces (tokens semánticos)</Typography>
            <Typography variant="body" color="muted">
                Sobrescribe los 14 tokens semánticos directamente. Ideal para temas custom.
            </Typography>
            <CodePreview :code="surfaces" lang="vue" code-only />

            <Card variant="outlined" padding="large">
                <Stack direction="column" spacing="small">
                    <Typography variant="title" size="small" weight="bold">Tokens disponibles</Typography>
                    <div class="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm font-mono">
                        <div v-for="t in tokens" :key="t.name" class="flex items-center gap-2 py-1 border-b border-border/50 last:border-0">
                            <code class="text-primary">{{ t.name }}</code>
                            <span class="text-muted-foreground text-xs ml-auto">{{ t.usage }}</span>
                        </div>
                    </div>
                </Stack>
            </Card>
        </section>

        <!-- Dark surfaces presets -->
        <section class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="bold">Dark surfaces presets</Typography>
            <Typography variant="body" color="muted">
                6 presets listos para usar: <strong>default</strong>, <strong>navy</strong>,
                <strong>zinc</strong>, <strong>charcoal</strong>, <strong>midnight</strong>,
                <strong>forest</strong>.
            </Typography>
            <CodePreview :code="darkSurfaces" lang="vue" code-only />
        </section>

        <!-- CSS override -->
        <section class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="bold">Override desde CSS</Typography>
            <Typography variant="body" color="muted">
                Si prefieres trabajar 100% en CSS, sobrescribe las custom properties en tu hoja de estilos global.
                Funciona con <code>:root</code>, <code>.dark</code> o cualquier selector.
            </Typography>
            <CodePreview :code="cssOverride" lang="css" code-only />

            <Banner color="warning" variant="subtle">
                <strong>Recomendación:</strong> Si tienes lógica reactiva (cambio de color desde un picker, por ejemplo),
                usa <code>:palettes</code> o <code>:surfaces</code> en el Provider. Para temas estáticos,
                el override por CSS es lo más simple.
            </Banner>
        </section>
    </div>
</template>
