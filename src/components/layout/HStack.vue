<template> 
    <Stack v-bind="$props" direction="row"> 
        <slot /> 
    </Stack> 
</template> 
 
<script setup lang="ts"> 
import Stack from './Stack.vue'; 
import type { HStack } from '../../interfaces/layout/Stack.interface'; 
 
defineProps<HStack>(); 
</script>
