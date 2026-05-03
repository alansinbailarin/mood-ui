<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Typography from '../../../components/data-display/Typography.vue';
</script>

<template>
    <DocPage
        title="AppShell"
        category="Layout"
        import-path="import AppShell from '@/components/layout/AppShell.vue'"
        description="Composición de aplicación: topbar + sidebar + contenido principal con drawer móvil automático. Esta misma página vive dentro de un AppShell."
    >
        <template #examples>
            <Example title="Uso típico">
                <Typography variant="body" color="muted">
                    El AppShell expone los slots <code class="font-mono">#topbar</code>,
                    <code class="font-mono">#sidebar</code>,
                    <code class="font-mono">#default</code> (main) y
                    <code class="font-mono">#footer</code>. Los modelos
                    <code class="font-mono">v-model:collapsed</code> y
                    <code class="font-mono">v-model:mobile-open</code> permiten controlar el sidebar.
                </Typography>
            </Example>

            <Example title="Variantes">
                <Typography variant="caption" color="muted">
                    <strong>standard</strong> · sidebar visible con label.<br />
                    <strong>rail</strong> · sidebar tipo rail (solo iconos).<br />
                    <strong>dual</strong> · rail + panel secundario.
                </Typography>
            </Example>

            <Example title="Breakpoints">
                <Typography variant="caption" color="muted">
                    Por debajo del breakpoint (<code class="font-mono">md|lg|xl</code>) el sidebar se convierte
                    automáticamente en un drawer accesible vía <code class="font-mono">mobileOpen</code>.
                </Typography>
            </Example>
        </template>
    </DocPage>
</template>
