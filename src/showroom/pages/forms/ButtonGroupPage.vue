<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import ButtonGroup from '../../../components/forms/ButtonGroup.vue';
import Button from '../../../components/forms/Button.vue';
</script>

<template>
    <DocPage
        title="ButtonGroup"
        category="Forms"
        import-path="import ButtonGroup from '@/components/forms/ButtonGroup.vue'"
        description="Agrupa botones relacionados (filtros, segmentos, toolbar) con bordes compartidos y orientación horizontal o vertical."
    >
        <template #examples>
            <Example title="Horizontal" description="Variante outline con borde compartido.">
                <ButtonGroup variant="outline" color="primary">
                    <Button>Día</Button>
                    <Button>Semana</Button>
                    <Button>Mes</Button>
                </ButtonGroup>
            </Example>

            <Example title="Filled / normal">
                <ButtonGroup variant="normal" color="primary">
                    <Button>Salvar</Button>
                    <Button>Salvar y nuevo</Button>
                </ButtonGroup>
            </Example>

            <Example title="Vertical">
                <ButtonGroup orientation="vertical" variant="outline">
                    <Button>Editar</Button>
                    <Button>Duplicar</Button>
                    <Button>Eliminar</Button>
                </ButtonGroup>
            </Example>

            <Example title="Tamaños">
                <ButtonGroup variant="outline" size="small"><Button>Small</Button><Button>Group</Button></ButtonGroup>
                <ButtonGroup variant="outline" size="medium"><Button>Medium</Button><Button>Group</Button></ButtonGroup>
                <ButtonGroup variant="outline" size="large"><Button>Large</Button><Button>Group</Button></ButtonGroup>
            </Example>
        </template>
    </DocPage>
</template>
