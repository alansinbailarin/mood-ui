<script setup lang="ts">
import { ref } from 'vue';
import {
    UserIcon, BuildingOfficeIcon, CreditCardIcon, BellIcon, ShieldCheckIcon, KeyIcon,
} from '@heroicons/vue/24/outline';

import Card from '../../../components/data-display/Card.vue';
import Typography from '../../../components/data-display/Typography.vue';
import Button from '../../../components/forms/Button.vue';
import FormField from '../../../components/forms/FormField.vue';
import Input from '../../../components/forms/Input.vue';
import Textarea from '../../../components/forms/Textarea.vue';
import Switch from '../../../components/forms/Switch.vue';
import Avatar from '../../../components/data-display/avatar/Avatar.vue';
import Badge from '../../../components/feedback/Badge.vue';
import Banner from '../../../components/feedback/Banner.vue';

const sections = [
    { id: 'account',  label: 'Cuenta',          icon: UserIcon },
    { id: 'team',     label: 'Equipo',          icon: BuildingOfficeIcon },
    { id: 'billing',  label: 'Facturación',     icon: CreditCardIcon },
    { id: 'notif',    label: 'Notificaciones',  icon: BellIcon },
    { id: 'security', label: 'Seguridad',       icon: ShieldCheckIcon },
    { id: 'apikeys',  label: 'API keys',        icon: KeyIcon },
];

const active = ref('account');
const fullName = ref('Alan Sin Bailarín');
const email = ref('alan@mood-ui.dev');
const bio = ref('Creador de mood-ui. Diseño y código.');
const notifyEmail = ref(true);
const notifyPush = ref(false);
const notifyMarketing = ref(false);
</script>

<template>
    <div class="min-h-[800px] grid grid-cols-[260px_1fr] bg-background rounded-2xl border border-border overflow-hidden">
        <!-- Sidebar -->
        <aside class="border-r border-border bg-card p-4 flex flex-col gap-1">
            <div class="px-2 py-3 mb-2 flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-black">m</div>
                <div class="flex flex-col">
                    <span class="text-sm font-semibold leading-tight">Settings</span>
                    <span class="text-xs text-muted-foreground">mood-ui workspace</span>
                </div>
            </div>
            <button
                v-for="s in sections"
                :key="s.id"
                :class="[
                    'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-left transition-colors',
                    active === s.id
                        ? 'bg-muted text-foreground font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                ]"
                @click="active = s.id"
            >
                <component :is="s.icon" class="w-4 h-4" aria-hidden="true" />
                {{ s.label }}
            </button>
        </aside>

        <!-- Content -->
        <main class="p-8 max-w-3xl flex flex-col gap-6">
            <!-- Cuenta -->
            <template v-if="active === 'account'">
                <div class="flex flex-col gap-1">
                    <Typography variant="title" size="medium">Cuenta</Typography>
                    <Typography variant="body" color="muted">Información pública de tu perfil.</Typography>
                </div>

                <Card class="p-6 flex flex-col gap-5">
                    <div class="flex items-center gap-4">
                        <Avatar fallback="AS" size="large" />
                        <div class="flex flex-col gap-2">
                            <Button size="small" variant="outline">Cambiar foto</Button>
                            <Typography variant="caption" color="muted">JPG/PNG, 2MB máximo.</Typography>
                        </div>
                    </div>
                    <FormField label="Nombre completo">
                        <Input v-model="fullName" />
                    </FormField>
                    <FormField label="Email" hint="Te enviaremos un email de confirmación si lo cambias.">
                        <Input v-model="email" type="email" />
                    </FormField>
                    <FormField label="Bio">
                        <Textarea v-model="bio" :rows="3" />
                    </FormField>
                    <div class="flex justify-end gap-2 pt-2 border-t border-border">
                        <Button variant="ghost">Cancelar</Button>
                        <Button color="primary">Guardar cambios</Button>
                    </div>
                </Card>
            </template>

            <!-- Notificaciones -->
            <template v-else-if="active === 'notif'">
                <div class="flex flex-col gap-1">
                    <Typography variant="title" size="medium">Notificaciones</Typography>
                    <Typography variant="body" color="muted">Elige cómo quieres recibir actualizaciones.</Typography>
                </div>
                <Card class="p-6 flex flex-col divide-y divide-border">
                    <div class="flex items-start justify-between gap-4 py-4 first:pt-0">
                        <div>
                            <p class="font-medium">Email</p>
                            <Typography variant="caption" color="muted">Resumen diario de actividad de tu workspace.</Typography>
                        </div>
                        <Switch v-model="notifyEmail" />
                    </div>
                    <div class="flex items-start justify-between gap-4 py-4">
                        <div>
                            <p class="font-medium">Push</p>
                            <Typography variant="caption" color="muted">Notificaciones en tiempo real en el navegador.</Typography>
                        </div>
                        <Switch v-model="notifyPush" />
                    </div>
                    <div class="flex items-start justify-between gap-4 py-4 last:pb-0">
                        <div>
                            <p class="font-medium">Marketing</p>
                            <Typography variant="caption" color="muted">Newsletter mensual con novedades y consejos.</Typography>
                        </div>
                        <Switch v-model="notifyMarketing" />
                    </div>
                </Card>
            </template>

            <!-- Facturación -->
            <template v-else-if="active === 'billing'">
                <div class="flex flex-col gap-1">
                    <Typography variant="title" size="medium">Facturación</Typography>
                    <Typography variant="body" color="muted">Tu plan actual y método de pago.</Typography>
                </div>
                <Banner color="info" title="Estás en el plan Pro" description="Renueva el 12 de junio. Puedes cambiar de plan en cualquier momento." />
                <Card class="p-6 flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-md bg-muted grid place-items-center">
                            <CreditCardIcon class="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p class="font-medium">Visa **** 4242</p>
                            <Typography variant="caption" color="muted">Vence 09/27</Typography>
                        </div>
                    </div>
                    <Button variant="outline" size="small">Cambiar</Button>
                </Card>
            </template>

            <!-- Default placeholder -->
            <template v-else>
                <div class="flex flex-col gap-1">
                    <Typography variant="title" size="medium">{{ sections.find((s) => s.id === active)?.label ?? '' }}</Typography>
                    <Typography variant="body" color="muted">Sección de demo. Reemplaza con tu contenido.</Typography>
                </div>
                <Card class="p-12 text-center flex flex-col items-center gap-3">
                    <Badge color="default" variant="subtle">Coming soon</Badge>
                    <Typography variant="body" color="muted" class="text-sm max-w-sm">
                        Este es un espacio reservado. Combina los componentes que necesites para esta sección.
                    </Typography>
                </Card>
            </template>
        </main>
    </div>
</template>
