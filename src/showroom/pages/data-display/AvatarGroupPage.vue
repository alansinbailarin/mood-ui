<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import AvatarGroup from '../../../components/data-display/avatar/AvatarGroup.vue';
import Avatar from '../../../components/data-display/avatar/Avatar.vue';
</script>

<template>
    <DocPage
        title="AvatarGroup"
        category="Data display"
        import-path="import AvatarGroup from '@/components/data-display/avatar/AvatarGroup.vue'"
        description="Agrupa avatares solapados mostrando hasta N visibles y un contador con el resto."
    >
        <template #examples>
            <Example title="Default">
                <AvatarGroup>
                    <Avatar src="https://i.pravatar.cc/80?img=1" />
                    <Avatar src="https://i.pravatar.cc/80?img=2" />
                    <Avatar src="https://i.pravatar.cc/80?img=3" />
                    <Avatar src="https://i.pravatar.cc/80?img=4" />
                </AvatarGroup>
            </Example>

            <Example title="Con max">
                <AvatarGroup :max="3">
                    <Avatar src="https://i.pravatar.cc/80?img=5" />
                    <Avatar src="https://i.pravatar.cc/80?img=6" />
                    <Avatar src="https://i.pravatar.cc/80?img=7" />
                    <Avatar src="https://i.pravatar.cc/80?img=8" />
                    <Avatar src="https://i.pravatar.cc/80?img=9" />
                    <Avatar src="https://i.pravatar.cc/80?img=10" />
                </AvatarGroup>
            </Example>

            <Example title="Tamaños">
                <AvatarGroup size="small">
                    <Avatar src="https://i.pravatar.cc/80?img=11" />
                    <Avatar src="https://i.pravatar.cc/80?img=12" />
                    <Avatar src="https://i.pravatar.cc/80?img=13" />
                </AvatarGroup>
                <AvatarGroup size="large">
                    <Avatar src="https://i.pravatar.cc/80?img=14" />
                    <Avatar src="https://i.pravatar.cc/80?img=15" />
                    <Avatar src="https://i.pravatar.cc/80?img=16" />
                </AvatarGroup>
            </Example>
        </template>
    </DocPage>
</template>
