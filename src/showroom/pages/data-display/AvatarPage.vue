<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Avatar from '../../../components/data-display/avatar/Avatar.vue';
</script>

<template>
    <DocPage
        title="Avatar"
        category="Data display"
        import-path="import Avatar from '@/components/data-display/avatar/Avatar.vue'"
        description="Avatar de usuario con imagen, iniciales fallback, indicador de estado y múltiples tamaños."
    >
        <template #examples>
            <Example title="Imagen">
                <Avatar src="https://i.pravatar.cc/80?img=1" />
                <Avatar src="https://i.pravatar.cc/80?img=2" />
                <Avatar src="https://i.pravatar.cc/80?img=3" />
            </Example>

            <Example title="Iniciales (fallback)">
                <Avatar initials="AP" color="primary" />
                <Avatar initials="MR" color="success" />
                <Avatar initials="JS" color="warning" />
            </Example>

            <Example title="Tamaños">
                <Avatar src="https://i.pravatar.cc/80?img=4" size="xs" />
                <Avatar src="https://i.pravatar.cc/80?img=4" size="small" />
                <Avatar src="https://i.pravatar.cc/80?img=4" size="medium" />
                <Avatar src="https://i.pravatar.cc/80?img=4" size="large" />
                <Avatar src="https://i.pravatar.cc/80?img=4" size="xl" />
            </Example>

            <Example title="Status indicator">
                <Avatar src="https://i.pravatar.cc/80?img=5" status="online" />
                <Avatar src="https://i.pravatar.cc/80?img=6" status="busy" />
                <Avatar src="https://i.pravatar.cc/80?img=7" status="away" />
                <Avatar src="https://i.pravatar.cc/80?img=8" status="offline" />
            </Example>

            <Example title="Bordered + radius">
                <Avatar src="https://i.pravatar.cc/80?img=9" bordered />
                <Avatar src="https://i.pravatar.cc/80?img=10" radius="medium" />
                <Avatar src="https://i.pravatar.cc/80?img=11" radius="small" />
            </Example>

            <Example title="Skeleton">
                <Avatar skeleton size="medium" />
            </Example>
        </template>
    </DocPage>
</template>
