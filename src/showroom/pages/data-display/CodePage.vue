<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Code from '../../../components/data-display/Code.vue';
</script>

<template>
    <DocPage
        title="Code"
        category="Data display"
        import-path="import { Code } from 'mood-ui'"
        description="Fragmentos de código inline. Soporta variantes y colores semánticos para resaltar valores, props o errores en docs."
    >
        <template #examples>
            <Example title="Básico" :code="`<Code>npm install mood-ui</Code>`">
                <Code>npm install mood-ui</Code>
            </Example>

            <Example title="Variantes" :code="`<Code variant=\&quot;subtle\&quot;>useLocale()</Code>\n<Code variant=\&quot;outline\&quot;>useLocale()</Code>\n<Code variant=\&quot;ghost\&quot;>useLocale()</Code>`">
                <div class="flex items-center gap-3">
                    <Code variant="subtle">useLocale()</Code>
                    <Code variant="outline">useLocale()</Code>
                    <Code variant="ghost">useLocale()</Code>
                </div>
            </Example>

            <Example title="Colores" :code="`<Code color=\&quot;default\&quot;>foo</Code>\n<Code color=\&quot;primary\&quot;>foo</Code>\n<Code color=\&quot;success\&quot;>foo</Code>\n<Code color=\&quot;warning\&quot;>foo</Code>\n<Code color=\&quot;danger\&quot;>foo</Code>`">
                <div class="flex flex-wrap items-center gap-3">
                    <Code color="default">foo</Code>
                    <Code color="primary">primary</Code>
                    <Code color="success">success</Code>
                    <Code color="warning">warning</Code>
                    <Code color="danger">danger</Code>
                </div>
            </Example>

            <Example title="Tamaños" :code="`<Code size=\&quot;small\&quot;>v0.4.0</Code>\n<Code size=\&quot;medium\&quot;>v0.4.0</Code>\n<Code size=\&quot;large\&quot;>v0.4.0</Code>`">
                <div class="flex items-center gap-3">
                    <Code size="small">v0.4.0</Code>
                    <Code size="medium">v0.4.0</Code>
                    <Code size="large">v0.4.0</Code>
                </div>
            </Example>

            <Example title="En docs" :code="`<p>Llama a <Code color=\&quot;primary\&quot;>useLocale().set('es')</Code> para cambiar el idioma.</p>`">
                <p class="text-sm">
                    Llama a <Code color="primary">useLocale().set('es')</Code> para cambiar el idioma.
                </p>
            </Example>
        </template>
    </DocPage>
</template>
