<script setup lang="ts">
import Typography from '../../../components/data-display/Typography.vue';
import Card from '../../../components/data-display/Card.vue';
import Stack from '../../../components/layout/Stack.vue';
import Divider from '../../../components/layout/Divider.vue';
import Badge from '../../../components/feedback/Badge.vue';
import Button from '../../../components/forms/Button.vue';
import { showroomNav } from '../../registry';
import { useShowroomRouter } from '../../composables/useShowroomRouter';

const { go } = useShowroomRouter();
const totalComponents = showroomNav.reduce((acc, c) => acc + c.entries.length, 0);
</script>

<template>
    <div class="flex flex-col gap-8">
        <header class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
                <Badge color="primary" variant="subtle">v1.0</Badge>
                <Badge color="success" variant="subtle">Vue 3 · TS · Tailwind v4</Badge>
            </div>
            <Typography variant="display" size="medium">modo-ui Showroom</Typography>
            <Typography variant="body" size="large" color="muted">
                Catálogo interactivo y documentación viva de los {{ totalComponents }} componentes
                de la librería <strong>modo-components</strong>. Usa el panel <em>Tema</em> en la
                barra superior para cambiar color, radius, tamaño, halo, idioma y modo claro/oscuro
                en vivo.
            </Typography>
        </header>

        <Divider />

        <section class="flex flex-col gap-3">
            <Typography variant="heading" size="medium">Empezar</Typography>
            <Card variant="outlined" padding="large">
                <Stack direction="column" spacing="medium">
                    <Typography variant="title" size="medium">1. Envuelve tu app</Typography>
<pre class="text-xs bg-muted/60 border border-border rounded-md p-4 overflow-x-auto font-mono text-muted-foreground"><code>&lt;ModoProvider color="primary" theme="system" radius="medium" size="medium"&gt;
  &lt;App /&gt;
&lt;/ModoProvider&gt;</code></pre>

                    <Typography variant="title" size="medium">2. Usa los componentes</Typography>
<pre class="text-xs bg-muted/60 border border-border rounded-md p-4 overflow-x-auto font-mono text-muted-foreground"><code>import Button from 'modo-components/forms/Button.vue';

&lt;Button color="primary" size="medium"&gt;Hola modo&lt;/Button&gt;</code></pre>
                </Stack>
            </Card>
        </section>

        <section class="flex flex-col gap-3">
            <Typography variant="heading" size="medium">Categorías</Typography>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card
                    v-for="cat in showroomNav"
                    :key="cat.id"
                    variant="outlined"
                    padding="large"
                    class="hover:border-primary/60 transition-colors"
                >
                    <Stack direction="column" spacing="small">
                        <div class="flex items-center justify-between">
                            <Typography variant="title" size="medium">{{ cat.title }}</Typography>
                            <Badge color="primary" variant="subtle">{{ cat.entries.length }}</Badge>
                        </div>
                        <div class="flex flex-wrap gap-1.5">
                            <button
                                v-for="entry in cat.entries.slice(0, 8)"
                                :key="entry.id"
                                type="button"
                                class="text-xs px-2 py-1 rounded bg-muted/60 hover:bg-muted text-foreground/80 transition-colors"
                                @click="go(entry.id)"
                            >
                                {{ entry.label }}
                            </button>
                            <span v-if="cat.entries.length > 8" class="text-xs text-muted-foreground self-center">
                                +{{ cat.entries.length - 8 }} más
                            </span>
                        </div>
                        <Button variant="ghost" size="small" @click="go(cat.entries[0].id)">
                            Explorar →
                        </Button>
                    </Stack>
                </Card>
            </div>
        </section>

        <section class="flex flex-col gap-3">
            <Typography variant="heading" size="medium">Convenciones</Typography>
            <Card variant="outlined" padding="large">
                <Stack direction="column" spacing="medium">
                    <div>
                        <Typography variant="title" size="small">Tamaños</Typography>
                        <Typography variant="body" color="muted">
                            Todos los componentes interactivos exponen <code>size: 'small' | 'medium' | 'large'</code>.
                        </Typography>
                    </div>
                    <div>
                        <Typography variant="title" size="small">Colores semánticos</Typography>
                        <Typography variant="body" color="muted">
                            <code>default · primary · danger · success · warning</code>. La paleta primaria
                            se puede personalizar pasando <code>palettes</code> al provider.
                        </Typography>
                    </div>
                    <div>
                        <Typography variant="title" size="small">Radius compartido</Typography>
                        <Typography variant="body" color="muted">
                            <code>none · small · medium · large · full</code>, propagado por el provider.
                        </Typography>
                    </div>
                    <div>
                        <Typography variant="title" size="small">Halo y elevación</Typography>
                        <Typography variant="body" color="muted">
                            El halo de focus puede ser <code>tinted</code>, <code>neutral</code> u <code>off</code>,
                            y todos los estados de hover/focus respetan el color global.
                        </Typography>
                    </div>
                </Stack>
            </Card>
        </section>
    </div>
</template>
