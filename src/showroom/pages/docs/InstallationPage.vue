<script setup lang="ts">
import {
    BoltIcon,
    CubeIcon,
    BookOpenIcon,
    ArrowTopRightOnSquareIcon,
} from '@heroicons/vue/24/outline';
import Typography from '../../../components/data-display/Typography.vue';
import Card from '../../../components/data-display/Card.vue';
import Stack from '../../../components/layout/Stack.vue';
import Badge from '../../../components/feedback/Badge.vue';
import Button from '../../../components/forms/Button.vue';
import Banner from '../../../components/feedback/Banner.vue';
import CodePreview from '../../components/CodePreview.vue';
import { useShowroomRouter } from '../../composables/useShowroomRouter';

const { go } = useShowroomRouter();

const installCmd = `npm install mood-ui`;
const yarnCmd = `yarn add mood-ui`;
const pnpmCmd = `pnpm add mood-ui`;

const peerDeps = `npm install vue@^3.5 tailwindcss@^4`;

const setupCss = `/* main.ts or main.css */
@import "tailwindcss";
@import "mood-ui/style.css";`;

const setupApp = `// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

createApp(App).mount('#app');`;

const wrapApp = `<!-- App.vue -->
<script setup lang="ts">
import { ModoProvider } from 'mood-ui';
<\/script>

<template>
  <ModoProvider
    color="primary"
    theme="system"
    radius="medium"
    size="medium"
    locale="es"
  >
    <RouterView />
  </ModoProvider>
</template>`;

const useComponent = `<script setup lang="ts">
import { Button, Input, Card } from 'mood-ui';
import { ref } from 'vue';

const email = ref('');
<\/script>

<template>
  <Card padding="large">
    <Input v-model="email" label="Email" placeholder="you@example.com" />
    <Button color="primary">Suscribirme</Button>
  </Card>
</template>`;
</script>

<template>
    <div class="flex flex-col gap-10">
        <!-- Header -->
        <header class="flex flex-col gap-3">
            <Typography variant="overline" size="medium" color="muted">
                Documentación
            </Typography>
            <Typography variant="display" size="medium" as="h1" weight="medium" class="tracking-tight leading-[1.05]">
                Instalación
            </Typography>
            <Typography variant="body"
                size="medium"
                color="muted"
                weight="light">
                Mood-UI se instala como un paquete npm estándar. Compatible con
                Vue 3.5+ y Tailwind CSS v4.
            </Typography>
        </header>

        <!-- Steps: timeline -->
        <ol class="relative flex flex-col gap-10 pl-8 border-l border-border ml-3">
            <!-- Step 1 -->
            <li class="relative flex flex-col gap-4">
                <span class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none">1</span>
                <Typography variant="title" size="large" weight="medium">Instala el paquete</Typography>
                <CodePreview :code="installCmd" lang="bash" code-only />
                <details class="group">
                    <summary class="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors select-none">
                        ¿Usas yarn o pnpm?
                    </summary>
                    <div class="mt-3 flex flex-col gap-3">
                        <CodePreview :code="yarnCmd" lang="bash" code-only />
                        <CodePreview :code="pnpmCmd" lang="bash" code-only />
                    </div>
                </details>
            </li>

            <!-- Step 2 -->
            <li class="relative flex flex-col gap-4">
                <span class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none">2</span>
                <Typography variant="title" size="large" weight="medium">Peer dependencies</Typography>
                <Typography variant="body" size="small" color="muted" weight="light">
                    Asegúrate de tener Vue 3.5+ y Tailwind CSS v4 instalados:
                </Typography>
                <CodePreview :code="peerDeps" lang="bash" code-only />
            </li>

            <!-- Step 3 -->
            <li class="relative flex flex-col gap-4">
                <span class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none">3</span>
                <Typography variant="title" size="large" weight="medium">Importa los estilos</Typography>
                <Typography variant="body" size="small" color="muted" weight="light">
                    Importa <code class="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">mood-ui/style.css</code>
                    después de Tailwind. Esto registra los design tokens y todos los utilities que usan los componentes.
                </Typography>
                <CodePreview :code="setupCss" lang="css" code-only />
                <Banner color="info" variant="subtle">
                    <strong>Tip:</strong> mood-ui usa <code>@theme inline</code> para mapear sus
                    CSS vars a tokens de Tailwind. No necesitas configurar nada en
                    <code>tailwind.config</code>.
                </Banner>
            </li>

            <!-- Step 4 -->
            <li class="relative flex flex-col gap-4">
                <span class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none">4</span>
                <Typography variant="title" size="large" weight="medium">Envuelve tu app con ModoProvider</Typography>
                <Typography variant="body" size="small" color="muted" weight="light">
                    <code>ModoProvider</code> propaga el theming, idioma y tokens a todos los descendientes.
                    Solo se necesita uno por aplicación (aunque puedes anidar varios para temas locales).
                </Typography>
                <CodePreview :code="wrapApp" lang="vue" code-only />
            </li>

            <!-- Step 5 -->
            <li class="relative flex flex-col gap-4">
                <span class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none">5</span>
                <Typography variant="title" size="large" weight="medium">Usa los componentes</Typography>
                <Typography variant="body" size="small" color="muted" weight="light">
                    Importa cualquier componente desde el package root. Todo es tree-shakeable, así que
                    solo se incluye en tu bundle lo que realmente uses.
                </Typography>
                <CodePreview :code="useComponent" lang="vue" code-only />
            </li>
        </ol>

        <!-- Next steps -->
        <section class="flex flex-col gap-4">
            <Typography variant="heading" size="large" weight="medium">
                Próximos pasos
            </Typography>
            <div class="grid sm:grid-cols-2 gap-4">
                <Card
                    variant="outlined"
                    padding="large"
                    class="relative overflow-hidden cursor-pointer hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-300 group"
                    @click="go('theming')"
                >
                    <div class="pointer-events-none absolute inset-0 opacity-[0.065] text-primary [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:20px_20px]" />
                    <Stack direction="column" spacing="small" class="relative">
                        <div class="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <BoltIcon class="size-5" />
                        </div>
                        <Typography variant="title" size="medium" weight="medium" as="h3">Personaliza el tema</Typography>
                        <Typography variant="body" size="small" color="muted" weight="light">
                            Color, radius, surfaces, dark mode presets…
                        </Typography>
                    </Stack>
                </Card>
                <Card
                    variant="outlined"
                    padding="large"
                    class="relative overflow-hidden cursor-pointer hover:border-success/40 hover:-translate-y-0.5 transition-all duration-300 group"
                    @click="go('button')"
                >
                    <div class="pointer-events-none absolute inset-0 opacity-[0.065] text-success [background-image:radial-gradient(circle,currentColor_1.5px,transparent_1.5px)] [background-size:18px_18px]" />
                    <Stack direction="column" spacing="small" class="relative">
                        <div class="size-10 rounded-xl bg-success/10 text-success grid place-items-center group-hover:bg-success group-hover:text-white transition-colors">
                            <CubeIcon class="size-5" />
                        </div>
                        <Typography variant="title" size="medium" weight="medium" as="h3">Explora componentes</Typography>
                        <Typography variant="body" size="small" color="muted" weight="light">
                            70+ componentes listos para usar.
                        </Typography>
                    </Stack>
                </Card>
            </div>

            <div class="flex gap-2 pt-2">
                <Button
                    as="a"
                    href="https://www.npmjs.com/package/mood-ui"
                    target="_blank"
                    rel="noopener"
                    variant="outline"
                    size="small"
                >
                    <span class="inline-flex items-center gap-1.5">
                        Ver en npm
                        <ArrowTopRightOnSquareIcon class="size-3.5" />
                    </span>
                </Button>
                <Button
                    as="a"
                    href="https://github.com/alansinbailarin/mood-ui"
                    target="_blank"
                    rel="noopener"
                    variant="outline"
                    size="small"
                >
                    <span class="inline-flex items-center gap-1.5">
                        GitHub
                        <ArrowTopRightOnSquareIcon class="size-3.5" />
                    </span>
                </Button>
            </div>
        </section>
    </div>
</template>
