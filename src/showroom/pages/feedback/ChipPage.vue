<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Chip from '../../../components/feedback/Chip.vue';
import Avatar from '../../../components/data-display/avatar/Avatar.vue';
import { BellIcon } from '@heroicons/vue/24/outline';
</script>

<template>
    <DocPage
        title="Chip"
        category="Feedback"
        import-path="import Chip from '@/components/feedback/Chip.vue'"
        description="Indicador overlay (badge counter / dot) que se posiciona sobre otro elemento como un avatar o icono."
    >
        <template #examples>
            <Example title="Counter sobre icono">
                <Chip :content="3" color="danger" placement="top-right">
                    <BellIcon class="w-7 h-7" />
                </Chip>
                <Chip :content="99" color="primary" placement="top-right">
                    <BellIcon class="w-7 h-7" />
                </Chip>
                <Chip :content="125" :max="99" color="primary" placement="top-right">
                    <BellIcon class="w-7 h-7" />
                </Chip>
            </Example>

            <Example title="Dot sobre avatar">
                <Chip dot color="success" placement="bottom-right">
                    <Avatar src="https://i.pravatar.cc/40?img=1" />
                </Chip>
                <Chip dot color="warning" placement="bottom-right">
                    <Avatar src="https://i.pravatar.cc/40?img=2" />
                </Chip>
                <Chip dot color="danger" placement="bottom-right">
                    <Avatar src="https://i.pravatar.cc/40?img=3" />
                </Chip>
            </Example>

            <Example title="Variantes">
                <Chip :content="5" variant="solid" color="primary"><BellIcon class="w-6 h-6" /></Chip>
                <Chip :content="5" variant="subtle" color="primary"><BellIcon class="w-6 h-6" /></Chip>
                <Chip :content="5" variant="outline" color="primary"><BellIcon class="w-6 h-6" /></Chip>
            </Example>
        </template>
    </DocPage>
</template>
