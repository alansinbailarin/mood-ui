/**
 * Tiny i18n dictionary for showroom-only UI strings (Spanish + English).
 * Component-level strings live in the `mood-ui` locale (`useLocale()`),
 * this is just for the showroom shell.
 */
import { computed, type ComputedRef } from 'vue';

export type ShowroomLocale = 'es' | 'en';

export interface ShowroomDict {
    /** Identifier for the active locale (handy for code paths that depend on language). */
    lang: ShowroomLocale;
    // Header / navigation
    home: string;
    components: string;
    templates: string;
    themeStudio: string;
    docs: string;
    backHome: string;
    starOnGithub: string;
    // Search
    search: string;
    searchLong: string;
    searchPlaceholder: string;
    searchEmpty: (q: string) => string;
    searchNavigate: string;
    searchSelect: string;
    searchEsc: string;
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
    surface: string;
    surfaceHelp: string;
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

    // Welcome / hero
    welcomeBadge: string;
    welcomeHeadline1: string;
    welcomeHeadline2: string;
    welcomeLead: (n: number) => string;
    ctaExplore: string;
    ctaGithub: string;
    trustLine: string;
    featuresKicker: string;
    featuresTitle: string;
    featuresSubtitle: string;
    installKicker: string;
    installTitle: string;
    nextSteps: string;
    nextStepsBody: string;
    catalogKicker: string;
    catalogTitle: (n: number) => string;
    catalogSubtitle: string;
    clickToExplore: string;
    viewComponents: string;
    finalCtaTitle: string;
    finalCtaBody: string;
    // Templates index
    templatesPickTitle: string;
    templatesPickSubtitle: string;
    openTemplate: string;
    // Docs sidebar labels
    introduction: string;
    installation: string;
    theming: string;
    i18n: string;
    changelog: string;
}

const ES: ShowroomDict = {
    lang: 'es',
    home: 'Inicio',
    components: 'Componentes',
    templates: 'Plantillas',
    themeStudio: 'Theme Studio',
    docs: 'Documentación',
    backHome: 'Volver al inicio',
    starOnGithub: 'Star en GitHub',

    search: 'Buscar',
    searchLong: 'Buscar componentes…',
    searchPlaceholder: 'Buscar componentes, acciones, docs…',
    searchEmpty: (q) => `Sin resultados para "${q}"`,
    searchNavigate: 'navegar',
    searchSelect: 'seleccionar',
    searchEsc: 'cerrar',

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
    surface: 'Surface (oscuro)',
    surfaceHelp: 'Preset de superficies para el modo oscuro',
    reset: 'Restablecer',
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Sistema',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    expandSidebar: 'Expandir sidebar',
    collapseSidebar: 'Colapsar sidebar',
    soon: 'Próximamente',

    welcomeBadge: 'Última versión',
    welcomeHeadline1: 'Componentes Vue 3',
    welcomeHeadline2: 'que vibran con tu marca.',
    welcomeLead: (n) =>
        `${n}+ componentes accesibles, theming reactivo en tiempo real, dark mode con superficies personalizables e i18n integrado. Diseñado para shippear en horas, no semanas.`,
    ctaExplore: 'Explorar componentes',
    ctaGithub: 'Ver en GitHub',
    trustLine: 'developers ya construyendo con mood-ui',

    featuresKicker: 'Por qué mood-ui',
    featuresTitle: 'Todo lo que necesitas, nada de lo que estorba.',
    featuresSubtitle:
        'Pensado para diseñadores y developers que quieren shipping rápido sin sacrificar calidad ni accesibilidad.',
    installKicker: 'Empezar en 60 segundos',
    installTitle: 'Instalación',
    nextSteps: 'Próximos pasos',
    nextStepsBody: 'Configura el provider, explora componentes o personaliza el theming.',
    catalogKicker: 'Catálogo',
    catalogTitle: (n) => `${n} componentes listos para usar`,
    catalogSubtitle:
        'Forms, feedback, layout, navegación, calendario, tabla… todo con la misma API y los mismos design tokens.',
    clickToExplore: 'Click para explorar',
    viewComponents: 'Ver componentes',
    finalCtaTitle: 'Empieza a construir hoy.',
    finalCtaBody: 'Open source, MIT, sin lock-in. Solo Vue 3 + Tailwind v4 + tu propia creatividad.',

    templatesPickTitle: 'Plantillas',
    templatesPickSubtitle:
        'Pantallas completas listas para copiar/pegar — dashboards, auth, pricing y más.',
    openTemplate: 'Abrir plantilla',

    introduction: 'Introducción',
    installation: 'Instalación',
    theming: 'Theming',
    i18n: 'i18n',
    changelog: 'Changelog',
};

const EN: ShowroomDict = {
    lang: 'en',
    home: 'Home',
    components: 'Components',
    templates: 'Templates',
    themeStudio: 'Theme Studio',
    docs: 'Documentation',
    backHome: 'Back to home',
    starOnGithub: 'Star on GitHub',

    search: 'Search',
    searchLong: 'Search components…',
    searchPlaceholder: 'Search components, actions, docs…',
    searchEmpty: (q) => `No results for "${q}"`,
    searchNavigate: 'navigate',
    searchSelect: 'select',
    searchEsc: 'close',

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
    surface: 'Surface (dark)',
    surfaceHelp: 'Dark-mode surface preset',
    reset: 'Reset',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    expandSidebar: 'Expand sidebar',
    collapseSidebar: 'Collapse sidebar',
    soon: 'Soon',

    welcomeBadge: 'Latest release',
    welcomeHeadline1: 'Vue 3 components',
    welcomeHeadline2: 'that vibe with your brand.',
    welcomeLead: (n) =>
        `${n}+ accessible components, live reactive theming, dark mode with custom surfaces and built-in i18n. Built to ship in hours — not weeks.`,
    ctaExplore: 'Explore components',
    ctaGithub: 'View on GitHub',
    trustLine: 'developers already building with mood-ui',

    featuresKicker: 'Why mood-ui',
    featuresTitle: 'Everything you need, nothing in the way.',
    featuresSubtitle:
        'Built for designers and developers who want to ship fast without sacrificing quality or a11y.',
    installKicker: 'Start in 60 seconds',
    installTitle: 'Installation',
    nextSteps: 'Next steps',
    nextStepsBody: 'Configure the provider, explore components or customize theming.',
    catalogKicker: 'Catalog',
    catalogTitle: (n) => `${n} components ready to use`,
    catalogSubtitle:
        'Forms, feedback, layout, navigation, calendar, table… all share the same API and design tokens.',
    clickToExplore: 'Click to explore',
    viewComponents: 'View components',
    finalCtaTitle: 'Start building today.',
    finalCtaBody: 'Open source, MIT, no lock-in. Just Vue 3 + Tailwind v4 + your own creativity.',

    templatesPickTitle: 'Templates',
    templatesPickSubtitle:
        'Full screens ready to copy/paste — dashboards, auth, pricing and more.',
    openTemplate: 'Open template',

    introduction: 'Introduction',
    installation: 'Installation',
    theming: 'Theming',
    i18n: 'i18n',
    changelog: 'Changelog',
};

const DICTS: Record<ShowroomLocale, ShowroomDict> = { es: ES, en: EN };

export function useShowroomI18n(locale: () => ShowroomLocale): ComputedRef<ShowroomDict> {
    return computed(() => DICTS[locale()] ?? ES);
}
