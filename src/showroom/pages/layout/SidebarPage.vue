<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Sidebar from '../../../components/layout/Sidebar.vue';
import { HomeIcon, UsersIcon, ChartBarIcon, Cog6ToothIcon, InboxIcon } from '@heroicons/vue/24/outline';

const active = ref<string | number>('home');
const sections = [
    {
        id: 'main',
        title: 'Main',
        items: [
            { id: 'home', label: 'Inicio', icon: HomeIcon },
            { id: 'inbox', label: 'Inbox', icon: InboxIcon, badge: 4, badgeColor: 'primary' as const },
            { id: 'team', label: 'Equipo', icon: UsersIcon },
            { id: 'reports', label: 'Reportes', icon: ChartBarIcon },
        ],
    },
    {
        id: 'cfg',
        title: 'Configuración',
        items: [{ id: 'settings', label: 'Ajustes', icon: Cog6ToothIcon }],
    },
];
</script>

<template>
    <DocPage
        title="Sidebar"
        category="Layout"
        import-path="import Sidebar from '@/components/layout/Sidebar.vue'"
        description="Navegación lateral con secciones, items, iconos y badges. Soporta modo colapsado (solo iconos) e items anidados."
    >
        <template #examples>
            <Example title="Standalone">
                <div class="h-96 w-64 border border-border rounded-lg overflow-hidden">
                    <Sidebar
                        :sections="sections"
                        :active-id="active"
                        color="primary"
                        active-variant="tonal"
                        @select="(item: { id: string | number }) => (active = item.id)"
                    />
                </div>
            </Example>

            <Example title="Colapsado (rail)">
                <div class="h-96 w-16 border border-border rounded-lg overflow-hidden">
                    <Sidebar :sections="sections" :active-id="active" collapsed />
                </div>
            </Example>
        </template>
    </DocPage>
</template>
