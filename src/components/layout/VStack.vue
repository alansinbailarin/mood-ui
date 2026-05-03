<template> 
    <Stack v-bind="$props" direction="column"> 
        <slot /> 
    </Stack> 
</template> 
 
<script setup lang="ts"> 
import Stack from './Stack.vue'; 
import type { VStack } from '../../interfaces/layout/Stack.interface'; 
 
defineProps<VStack>(); 
</script>
