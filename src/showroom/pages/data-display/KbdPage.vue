<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Kbd from '../../../components/data-display/Kbd.vue';
</script>

<template>
    <DocPage
        title="Kbd"
        category="Data display"
        import-path="import { Kbd } from 'mood-ui'"
        description="Representación visual de teclas o atajos de teclado. Útil en docs, tooltips y command palettes."
    >
        <template #examples>
            <Example title="Básico" :code="`<Kbd>\u2318K</Kbd>`">
                <Kbd>⌘K</Kbd>
            </Example>

            <Example
                title="Atajo combinado"
                description="Combina varios Kbd con + o ↵."
                :code="`<Kbd>\u2318</Kbd>\n<span class=\&quot;text-muted-foreground\&quot;>+</span>\n<Kbd>Shift</Kbd>\n<span class=\&quot;text-muted-foreground\&quot;>+</span>\n<Kbd>P</Kbd>`"
            >
                <div class="inline-flex items-center gap-1">
                    <Kbd>⌘</Kbd>
                    <span class="text-muted-foreground">+</span>
                    <Kbd>Shift</Kbd>
                    <span class="text-muted-foreground">+</span>
                    <Kbd>P</Kbd>
                </div>
            </Example>

            <Example title="Variantes" :code="`<Kbd variant=\&quot;subtle\&quot;>Esc</Kbd>\n<Kbd variant=\&quot;outline\&quot;>Esc</Kbd>\n<Kbd variant=\&quot;solid\&quot;>Esc</Kbd>`">
                <div class="flex items-center gap-3">
                    <Kbd variant="subtle">Esc</Kbd>
                    <Kbd variant="outline">Esc</Kbd>
                    <Kbd variant="solid">Esc</Kbd>
                </div>
            </Example>

            <Example title="Tamaños" :code="`<Kbd size=\&quot;small\&quot;>Tab</Kbd>\n<Kbd size=\&quot;medium\&quot;>Tab</Kbd>\n<Kbd size=\&quot;large\&quot;>Tab</Kbd>`">
                <div class="flex items-center gap-3">
                    <Kbd size="small">Tab</Kbd>
                    <Kbd size="medium">Tab</Kbd>
                    <Kbd size="large">Tab</Kbd>
                </div>
            </Example>

            <Example title="En texto" :code="`<p>Pulsa <Kbd>\u2318K</Kbd> para abrir la b\u00fasqueda r\u00e1pida.</p>`">
                <p class="text-sm">
                    Pulsa <Kbd>⌘K</Kbd> para abrir la búsqueda rápida.
                </p>
            </Example>
        </template>
    </DocPage>
</template>
