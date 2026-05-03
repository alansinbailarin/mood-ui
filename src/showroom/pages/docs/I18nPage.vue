<script setup lang="ts">
import { LanguageIcon } from '@heroicons/vue/24/outline';
import Typography from '../../../components/data-display/Typography.vue';
import Card from '../../../components/data-display/Card.vue';
import Stack from '../../../components/layout/Stack.vue';
import Badge from '../../../components/feedback/Badge.vue';
import Banner from '../../../components/feedback/Banner.vue';
import CodePreview from '../../components/CodePreview.vue';

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
</script>

<template>
    <div class="flex flex-col gap-10 max-w-3xl">
        <header class="flex flex-col gap-3">
            <Badge color="primary" variant="subtle" class="self-start">
                <LanguageIcon class="size-3.5 mr-1" />
                Docs
            </Badge>
            <Typography variant="display" size="medium" weight="bold">
                i18n
            </Typography>
            <Typography variant="body" size="large" color="muted">
                mood-ui incluye soporte completo para internacionalización con
                <strong>Español</strong> e <strong>Inglés</strong> built-in. Cambia idioma
                globalmente, override por componente o crea locales completos para
                otros idiomas.
            </Typography>
        </header>

        <!-- Preset -->
        <section class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="bold">Usar un locale preset</Typography>
            <Typography variant="body" color="muted">
                La forma más simple: importa <code>locales</code> y pasa el preset que quieras
                al provider.
            </Typography>
            <CodePreview :code="usePreset" lang="vue" code-only />
        </section>

        <!-- useLocale composable -->
        <section class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="bold">Cambio dinámico con useLocale()</Typography>
            <Typography variant="body" color="muted">
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
        <section class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="bold">Override parcial</Typography>
            <Typography variant="body" color="muted">
                <code>PartialLocale</code> permite sobrescribir solo las cadenas que necesitas.
                Las demás se heredan del default (inglés).
            </Typography>
            <CodePreview :code="partialOverride" lang="vue" code-only />
        </section>

        <!-- Custom locale -->
        <section class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="bold">Crear un locale completo (otro idioma)</Typography>
            <Typography variant="body" color="muted">
                Usa <code>mergeLocale()</code> para combinar tu locale con el default. Garantiza
                que todas las strings tengan un fallback en inglés.
            </Typography>
            <CodePreview :code="customLocale" lang="vue" code-only />
        </section>

        <!-- Namespaces -->
        <section class="flex flex-col gap-4">
            <Typography variant="title" size="large" weight="bold">Namespaces disponibles</Typography>
            <Typography variant="body" color="muted">
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
    </div>
</template>
