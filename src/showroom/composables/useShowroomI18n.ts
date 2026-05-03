/**
 * Tiny i18n dictionary for showroom-only UI strings (Spanish + English).
 * Component-level strings live in the `mood-ui` locale (`useLocale()`),
 * this is just for the showroom shell.
 */
import { computed, type ComputedRef } from 'vue';

export type ShowroomLocale = 'es' | 'en';

export interface ShowroomDict {
    // Header / navigation
    home: string;
    components: string;
    templates: string;
    themeStudio: string;
    docs: string;
    backHome: string;
    // Search
    search: string;
    searchLong: string;
    // Settings
    customizeTheme: string;
    colorMode: string;
    accent: string;
    primary: string;
    radius: string;
    density: string;
    focusHalo: string;
    language: string;
    base: string;
    baseHelp: string;
    reset: string;
    // Color modes
    light: string;
    dark: string;
    system: string;
    // Sidebar
    openMenu: string;
    closeMenu: string;
    expandSidebar: string;
    collapseSidebar: string;
    // Misc
    soon: string;
}

const ES: ShowroomDict = {
    home: 'Inicio',
    components: 'Componentes',
    templates: 'Plantillas',
    themeStudio: 'Theme Studio',
    docs: 'Docs',
    backHome: 'Volver al inicio',
    search: 'Buscar',
    searchLong: 'Buscar componentes…',
    customizeTheme: 'Personalizar tema',
    colorMode: 'Modo',
    accent: 'Accent',
    primary: 'Primary',
    radius: 'Radius',
    density: 'Densidad',
    focusHalo: 'Halo de focus',
    language: 'Idioma',
    base: 'Base',
    baseHelp: 'Tinta el fondo con el color accent',
    reset: 'Restablecer',
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Sistema',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    expandSidebar: 'Expandir sidebar',
    collapseSidebar: 'Colapsar sidebar',
    soon: 'Próximamente',
};

const EN: ShowroomDict = {
    home: 'Home',
    components: 'Components',
    templates: 'Templates',
    themeStudio: 'Theme Studio',
    docs: 'Docs',
    backHome: 'Back to home',
    search: 'Search',
    searchLong: 'Search components…',
    customizeTheme: 'Customize theme',
    colorMode: 'Mode',
    accent: 'Accent',
    primary: 'Primary',
    radius: 'Radius',
    density: 'Density',
    focusHalo: 'Focus halo',
    language: 'Language',
    base: 'Base',
    baseHelp: 'Tints background with accent color',
    reset: 'Reset',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    expandSidebar: 'Expand sidebar',
    collapseSidebar: 'Collapse sidebar',
    soon: 'Soon',
};

const DICTS: Record<ShowroomLocale, ShowroomDict> = { es: ES, en: EN };

export function useShowroomI18n(locale: () => ShowroomLocale): ComputedRef<ShowroomDict> {
    return computed(() => DICTS[locale()] ?? ES);
}
