<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Topbar from '../../../components/layout/Topbar.vue';
import Button from '../../../components/forms/Button.vue';
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline';
</script>

<template>
    <DocPage
        title="Topbar"
        category="Layout"
        import-path="import Topbar from '@/components/layout/Topbar.vue'"
        description="Barra superior con slots logo, title, subtitle, nav, search, actions y user. Diseñada para usarse dentro de AppShell."
    >
        <template #examples>
            <Example title="Estructura completa">
                <div class="w-full border border-border rounded-lg overflow-hidden">
                    <Topbar :divider="true">
                        <template #logo>
                            <div class="w-8 h-8 rounded bg-primary" />
                        </template>
                        <template #title>App</template>
                        <template #subtitle>Workspace #1</template>
                        <template #search>
                            <Button variant="ghost" size="small" icon-only><MagnifyingGlassIcon class="w-5 h-5" /></Button>
                        </template>
                        <template #actions>
                            <Button variant="ghost" size="small" icon-only><BellIcon class="w-5 h-5" /></Button>
                        </template>
                        <template #user>
                            <div class="w-8 h-8 rounded-full bg-surface-muted" />
                        </template>
                    </Topbar>
                </div>
            </Example>
        </template>
    </DocPage>
</template>
