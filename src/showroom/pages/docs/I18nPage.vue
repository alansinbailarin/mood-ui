<script setup lang="ts">
import { PaintBrushIcon, BookOpenIcon } from '@heroicons/vue/24/outline';
import Typography from '../../../components/data-display/Typography.vue';
import Card from '../../../components/data-display/Card.vue';
import Stack from '../../../components/layout/Stack.vue';
import Badge from '../../../components/feedback/Badge.vue';
import Banner from '../../../components/feedback/Banner.vue';
import CodePreview from '../../components/CodePreview.vue';
import { useShowroomRouter } from '../../composables/useShowroomRouter';
import { vReveal } from '../../composables/useScrollReveal';

const usePreset = `<script setup lang="ts">
import { ModoProvider, locales } from 'mood-ui';
<\/script>

<template>
  <ModoProvider :locale="locales.es">
    <App />
  </ModoProvider>
</template>`;

const useLocaleComposable = `<script setup lang="ts">
import { ModoProvider, useLocale } from 'mood-ui';

const { locale, current, set } = useLocale();
<\/script>

<template>
  <ModoProvider :locale="locale">
    <button @click="set('es')">Español</button>
    <button @click="set('en')">English</button>
    <p>Idioma actual: {{ current }}</p>
  </ModoProvider>
</template>`;

const partialOverride = `<script setup lang="ts">
import { ModoProvider, locales, type PartialLocale } from 'mood-ui';

// Start from Spanish, override only the strings you want
const customEs: PartialLocale = {
  common: {
    clear: 'Borrar',  // override
  },
  table: {
    empty: 'No hay datos para mostrar',
  },
};
<\/script>

<template>
  <ModoProvider :locale="customEs">
    <App />
  </ModoProvider>
</template>`;

const customLocale = `<script setup lang="ts">
import { ModoProvider, defaultLocale, mergeLocale, type ModoLocale } from 'mood-ui';

// Build a full Portuguese locale by deep-merging from English
const pt: ModoLocale = mergeLocale(defaultLocale, {
  common: {
    clear:   'Limpar',
    loading: 'Carregando',
  },
  table: {
    empty:     'Sem dados',
    noResults: 'Nenhum resultado',
  },
  // …override any namespace
});
<\/script>

<template>
  <ModoProvider :locale="pt">
    <App />
  </ModoProvider>
</template>`;

const namespaces = [
    'common',
    'input',
    'textarea',
    'select',
    'multiSelect',
    'combobox',
    'numberInput',
    'searchInput',
    'passwordInput',
    'dateField',
    'dateTimeField',
    'dateRangeField',
    'calendar',
    'agenda',
    'fileInput',
    'banner',
    'badge',
    'avatarGroup',
    'slider',
    'skeleton',
    'table',
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
                i18n
            </Typography>
            <Typography variant="body" size="medium" color="muted" weight="light">
                mood-ui incluye soporte completo para internacionalización con
                <strong>Español</strong> e <strong>Inglés</strong> built-in. Cambia idioma
                globalmente, override por componente o crea locales completos para
                otros idiomas.
            </Typography>
        </header>

        <!-- Preset -->
        <section v-reveal class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="medium" as="h2">Usar un locale preset</Typography>
            <Typography variant="body" size="small" color="muted" weight="light">
                La forma más simple: importa <code>locales</code> y pasa el preset que quieras
                al provider.
            </Typography>
            <CodePreview :code="usePreset" lang="vue" code-only />
        </section>

        <!-- useLocale composable -->
        <section v-reveal class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="medium" as="h2">Cambio dinámico con useLocale()</Typography>
            <Typography variant="body" size="small" color="muted" weight="light">
                <code>useLocale()</code> es un singleton reactivo. Cualquier llamada a
                <code>set('en')</code> actualiza globalmente el idioma en toda la app.
            </Typography>
            <CodePreview :code="useLocaleComposable" lang="vue" code-only />

            <Banner color="info" variant="subtle">
                <strong>Tip:</strong> El singleton es módulo-level, así que <code>useLocale()</code> en
                cualquier componente devuelve el mismo estado. No necesitas pinia ni stores.
            </Banner>
        </section>

        <!-- Partial override -->
        <section v-reveal class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="medium" as="h2">Override parcial</Typography>
            <Typography variant="body" size="small" color="muted" weight="light">
                <code>PartialLocale</code> permite sobrescribir solo las cadenas que necesitas.
                Las demás se heredan del default (inglés).
            </Typography>
            <CodePreview :code="partialOverride" lang="vue" code-only />
        </section>

        <!-- Custom locale -->
        <section v-reveal class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="medium" as="h2">Crear un locale completo (otro idioma)</Typography>
            <Typography variant="body" size="small" color="muted" weight="light">
                Usa <code>mergeLocale()</code> para combinar tu locale con el default. Garantiza
                que todas las strings tengan un fallback en inglés.
            </Typography>
            <CodePreview :code="customLocale" lang="vue" code-only />
        </section>

        <!-- Namespaces -->
        <section v-reveal class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="medium" as="h2">Namespaces disponibles</Typography>
            <Typography variant="body" size="small" color="muted" weight="light">
                El tipo <code>ModoLocale</code> está organizado en namespaces, uno por componente
                o categoría:
            </Typography>
            <Card variant="outlined" padding="large">
                <Stack direction="column" spacing="small">
                    <div class="flex flex-wrap gap-1.5">
                        <Badge
                            v-for="ns in namespaces"
                            :key="ns"
                            color="default"
                            variant="subtle"
                            class="font-mono text-xs"
                        >
                            {{ ns }}
                        </Badge>
                    </div>
                </Stack>
            </Card>
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
                    @click="go('theming')"
                >
                    <div class="pointer-events-none absolute inset-0 opacity-[0.065] text-primary [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:20px_20px]" />
                    <Stack direction="column" spacing="small" class="relative">
                        <div class="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <PaintBrushIcon class="size-5" />
                        </div>
                        <Typography variant="title" size="medium" weight="medium" as="h3">Personaliza el tema</Typography>
                        <Typography variant="body" size="small" color="muted" weight="light">
                            Tokens, palettes, surfaces y dark mode presets.
                        </Typography>
                    </Stack>
                </Card>
                <Card
                    variant="outlined"
                    padding="large"
                    class="relative overflow-hidden cursor-pointer hover:border-success/40 hover:-translate-y-0.5 transition-all duration-300 group"
                    @click="go('introduction')"
                >
                    <div class="pointer-events-none absolute inset-0 opacity-[0.065] text-success [background-image:radial-gradient(circle,currentColor_1.5px,transparent_1.5px)] [background-size:18px_18px]" />
                    <Stack direction="column" spacing="small" class="relative">
                        <div class="size-10 rounded-xl bg-success/10 text-success grid place-items-center group-hover:bg-success group-hover:text-white transition-colors">
                            <BookOpenIcon class="size-5" />
                        </div>
                        <Typography variant="title" size="medium" weight="medium" as="h3">Volver a Introducción</Typography>
                        <Typography variant="body" size="small" color="muted" weight="light">
                            Fundamentos y arquitectura de mood-ui.
                        </Typography>
                    </Stack>
                </Card>
            </div>
        </section>
    </div>
</template>
