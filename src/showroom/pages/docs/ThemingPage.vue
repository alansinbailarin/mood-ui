<script setup lang="ts">
import { CubeIcon, GlobeAltIcon } from '@heroicons/vue/24/outline';
import Typography from '../../../components/data-display/Typography.vue';
import Card from '../../../components/data-display/Card.vue';
import Stack from '../../../components/layout/Stack.vue';
import Banner from '../../../components/feedback/Banner.vue';
import CodePreview from '../../components/CodePreview.vue';
import { useShowroomRouter } from '../../composables/useShowroomRouter';
import { vReveal } from '../../composables/useScrollReveal';

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

const { go } = useShowroomRouter();
</script>

<template>
    <div class="flex flex-col gap-10 pb-12">
        <header v-reveal class="flex flex-col gap-3">
            <Typography variant="overline" size="medium" color="muted">
                Documentación
            </Typography>
            <Typography variant="display" size="medium" as="h1" weight="medium" class="tracking-tight leading-[1.05]">
                Theming
            </Typography>
            <Typography variant="body" size="medium" color="muted" weight="light">
                mood-ui usa una cascada de configuración basada en CSS custom properties
                + Tailwind v4 tokens. Personaliza desde el provider, surfaces, paletas
                generadas o sobrescribiendo CSS vars directamente.
            </Typography>
        </header>

        <!-- Provider props -->
        <section v-reveal class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="medium" as="h2">Props del Provider</Typography>
            <Typography variant="body" size="small" color="muted" weight="light">
                <code>ModoProvider</code> acepta props que se propagan a todos los descendientes.
                Cualquier componente puede sobrescribir localmente con su propia prop.
            </Typography>
            <CodePreview :code="providerProps" lang="vue" code-only />
        </section>

        <!-- Custom palette -->
        <section v-reveal class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="medium" as="h2">Paleta personalizada desde un HEX</Typography>
            <Typography variant="body" size="small" color="muted" weight="light">
                <code>paletteFromHex()</code> genera una escala completa 50→900 a partir de un solo color.
                Útil para marcas con un único color principal.
            </Typography>
            <CodePreview :code="customPalette" lang="vue" code-only />
        </section>

        <!-- Surfaces -->
        <section v-reveal class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="medium" as="h2">Surfaces (tokens semánticos)</Typography>
            <Typography variant="body" size="small" color="muted" weight="light">
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
        <section v-reveal class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="medium" as="h2">Dark surfaces presets</Typography>
            <Typography variant="body" size="small" color="muted" weight="light">
                6 presets listos para usar: <strong>default</strong>, <strong>navy</strong>,
                <strong>zinc</strong>, <strong>charcoal</strong>, <strong>midnight</strong>,
                <strong>forest</strong>.
            </Typography>
            <CodePreview :code="darkSurfaces" lang="vue" code-only />
        </section>

        <!-- CSS override -->
        <section v-reveal class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="medium" as="h2">Override desde CSS</Typography>
            <Typography variant="body" size="small" color="muted" weight="light">
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

        <!-- Next steps -->
        <section v-reveal class="flex flex-col gap-4">
            <Typography variant="heading" size="large" weight="medium">
                Próximos pasos
            </Typography>
            <div class="grid sm:grid-cols-2 gap-4">
                <Card
                    variant="outlined"
                    padding="large"
                    class="relative overflow-hidden cursor-pointer hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-300 group"
                    @click="go('button')"
                >
                    <div class="pointer-events-none absolute inset-0 opacity-[0.065] text-primary [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:20px_20px]" />
                    <Stack direction="column" spacing="small" class="relative">
                        <div class="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <CubeIcon class="size-5" />
                        </div>
                        <Typography variant="title" size="medium" weight="medium" as="h3">Explora componentes</Typography>
                        <Typography variant="body" size="small" color="muted" weight="light">
                            70+ componentes listos para usar con theming reactivo.
                        </Typography>
                    </Stack>
                </Card>
                <Card
                    variant="outlined"
                    padding="large"
                    class="relative overflow-hidden cursor-pointer hover:border-success/40 hover:-translate-y-0.5 transition-all duration-300 group"
                    @click="go('i18n')"
                >
                    <div class="pointer-events-none absolute inset-0 opacity-[0.065] text-success [background-image:radial-gradient(circle,currentColor_1.5px,transparent_1.5px)] [background-size:18px_18px]" />
                    <Stack direction="column" spacing="small" class="relative">
                        <div class="size-10 rounded-xl bg-success/10 text-success grid place-items-center group-hover:bg-success group-hover:text-white transition-colors">
                            <GlobeAltIcon class="size-5" />
                        </div>
                        <Typography variant="title" size="medium" weight="medium" as="h3">Internacionalización</Typography>
                        <Typography variant="body" size="small" color="muted" weight="light">
                            ES y EN incluidos. Extiende para cualquier idioma.
                        </Typography>
                    </Stack>
                </Card>
            </div>
        </section>
    </div>
</template>
