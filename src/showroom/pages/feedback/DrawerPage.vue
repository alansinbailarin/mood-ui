<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Drawer from '../../../components/feedback/Drawer.vue';
import Button from '../../../components/forms/Button.vue';
import Typography from '../../../components/data-display/Typography.vue';

const open1 = ref(false);
const open2 = ref(false);
const open3 = ref(false);
const open4 = ref(false);
</script>

<template>
    <DocPage
        title="Drawer"
        category="Feedback"
        import-path="import Drawer from '@/components/feedback/Drawer.vue'"
        description="Panel deslizable lateral. Útil para filtros, settings, detalles y formularios secundarios. Soporta cualquier lado (left/right/top/bottom)."
    >
        <template #examples>
            <Example title="Right (default)">
                <Button @click="open1 = true">Abrir drawer derecho</Button>
                <Drawer v-model="open1" side="right" title="Filtros" description="Refina los resultados">
                    <Typography>Contenido del drawer.</Typography>
                </Drawer>
            </Example>

            <Example title="Left">
                <Button @click="open2 = true">Abrir drawer izquierdo</Button>
                <Drawer v-model="open2" side="left" title="Menú" />
            </Example>

            <Example title="Top">
                <Button @click="open3 = true">Abrir drawer superior</Button>
                <Drawer v-model="open3" side="top" title="Notificaciones" />
            </Example>

            <Example title="Bottom (mobile sheet)">
                <Button @click="open4 = true">Abrir bottom sheet</Button>
                <Drawer v-model="open4" side="bottom" title="Compartir" />
            </Example>
        </template>
    </DocPage>
</template>
