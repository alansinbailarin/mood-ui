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
    <div class="flex flex-col gap-10 max-w-3xl">
        <!-- Header -->
        <header class="flex flex-col gap-3">
            <Badge color="primary" variant="subtle" class="self-start">
                <BookOpenIcon class="size-3.5 mr-1" />
                Docs
            </Badge>
            <Typography variant="display" size="medium" weight="bold">
                Instalación
            </Typography>
            <Typography variant="body" size="large" color="muted">
                mood-ui se instala como un paquete npm estándar. Compatible con
                Vue 3.5+ y Tailwind CSS v4.
            </Typography>
        </header>

        <!-- Step 1: install -->
        <section class="flex flex-col gap-4">
            <div class="flex items-baseline gap-3">
                <span class="size-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-bold">1</span>
                <Typography variant="title" size="large" weight="bold">Instala el paquete</Typography>
            </div>

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
        </section>

        <!-- Peer deps -->
        <section class="flex flex-col gap-4">
            <div class="flex items-baseline gap-3">
                <span class="size-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-bold">2</span>
                <Typography variant="title" size="large" weight="bold">Peer dependencies</Typography>
            </div>
            <Typography variant="body" color="muted">
                Asegúrate de tener Vue 3.5+ y Tailwind CSS v4 instalados:
            </Typography>
            <CodePreview :code="peerDeps" lang="bash" code-only />
        </section>

        <!-- CSS import -->
        <section class="flex flex-col gap-4">
            <div class="flex items-baseline gap-3">
                <span class="size-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-bold">3</span>
                <Typography variant="title" size="large" weight="bold">Importa los estilos</Typography>
            </div>
            <Typography variant="body" color="muted">
                Importa <code class="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">mood-ui/style.css</code>
                después de Tailwind. Esto registra los design tokens y todos los utilities que usan los componentes.
            </Typography>
            <CodePreview :code="setupCss" lang="css" code-only />

            <Banner color="info" variant="subtle">
                <strong>Tip:</strong> mood-ui usa <code>@theme inline</code> para mapear sus
                CSS vars a tokens de Tailwind. No necesitas configurar nada en
                <code>tailwind.config</code>.
            </Banner>
        </section>

        <!-- Wrap app -->
        <section class="flex flex-col gap-4">
            <div class="flex items-baseline gap-3">
                <span class="size-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-bold">4</span>
                <Typography variant="title" size="large" weight="bold">Envuelve tu app con ModoProvider</Typography>
            </div>
            <Typography variant="body" color="muted">
                <code>ModoProvider</code> propaga el theming, idioma y tokens a todos los descendientes.
                Solo se necesita uno por aplicación (aunque puedes anidar varios para temas locales).
            </Typography>
            <CodePreview :code="wrapApp" lang="vue" code-only />
        </section>

        <!-- Use components -->
        <section class="flex flex-col gap-4">
            <div class="flex items-baseline gap-3">
                <span class="size-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-bold">5</span>
                <Typography variant="title" size="large" weight="bold">Usa los componentes</Typography>
            </div>
            <Typography variant="body" color="muted">
                Importa cualquier componente desde el package root. Todo es tree-shakeable, así que
                solo se incluye en tu bundle lo que realmente uses.
            </Typography>
            <CodePreview :code="useComponent" lang="vue" code-only />
        </section>

        <!-- Next steps -->
        <section class="flex flex-col gap-4">
            <Typography variant="heading" size="medium" weight="bold">
                Próximos pasos
            </Typography>
            <div class="grid sm:grid-cols-2 gap-3">
                <Card variant="outlined" padding="large" class="cursor-pointer hover:border-primary/50 transition-colors" @click="go('theming')">
                    <Stack direction="column" spacing="small">
                        <BoltIcon class="size-6 text-primary" />
                        <Typography variant="title" size="medium" weight="bold">Personaliza el tema</Typography>
                        <Typography variant="body" color="muted">
                            Color, radius, surfaces, dark mode presets…
                        </Typography>
                    </Stack>
                </Card>
                <Card variant="outlined" padding="large" class="cursor-pointer hover:border-primary/50 transition-colors" @click="go('button')">
                    <Stack direction="column" spacing="small">
                        <CubeIcon class="size-6 text-primary" />
                        <Typography variant="title" size="medium" weight="bold">Explora componentes</Typography>
                        <Typography variant="body" color="muted">
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
