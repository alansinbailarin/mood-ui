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

    // ComponentDoc / ComponentPreview — generic UI strings
    docSection_overview: string;
    docSection_examples: string;
    docSection_api: string;
    docSection_props: string;
    docSection_emits: string;
    docSection_slots: string;
    docCol_prop: string;
    docCol_type: string;
    docCol_default: string;
    docCol_description: string;
    docCol_event: string;
    docCol_payload: string;
    docCol_slot: string;
    docCol_bindings: string;
    docReset: string;
    docPreview: string;
    docCode: string;

    // Button page
    btn_category: string;
    btn_description: string;
    btn_ctrl_variant: string;
    btn_ctrl_color: string;
    btn_ctrl_size: string;
    btn_ctrl_loading: string;
    btn_ctrl_disabled: string;
    btn_ex_variants_title: string;
    btn_ex_variants_desc: string;
    btn_ex_colors_title: string;
    btn_ex_colors_desc: string;
    btn_ex_sizes_title: string;
    btn_ex_sizes_desc: string;
    btn_ex_icons_title: string;
    btn_ex_icons_desc: string;
    btn_ex_states_title: string;
    btn_ex_states_desc: string;
    btn_prop_variant: string;
    btn_prop_color: string;
    btn_prop_size: string;
    btn_prop_label: string;
    btn_prop_loading: string;
    btn_prop_loadingText: string;
    btn_prop_disabled: string;
    btn_prop_icon: string;
    btn_prop_iconPosition: string;
    btn_prop_fullWidth: string;
    btn_prop_as: string;
    btn_prop_ariaLabel: string;
    btn_emit_click: string;
    btn_slot_default: string;
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

    docSection_overview: 'Overview',
    docSection_examples: 'Ejemplos',
    docSection_api: 'API Reference',
    docSection_props: 'Props',
    docSection_emits: 'Emits',
    docSection_slots: 'Slots',
    docCol_prop: 'Prop',
    docCol_type: 'Tipo',
    docCol_default: 'Default',
    docCol_description: 'Descripción',
    docCol_event: 'Evento',
    docCol_payload: 'Payload',
    docCol_slot: 'Slot',
    docCol_bindings: 'Props',
    docReset: 'Resetear',
    docPreview: 'Preview',
    docCode: 'Código',

    btn_category: 'Forms',
    btn_description: 'La acción primaria de cualquier interfaz. Cuatro variantes, cinco colores semánticos, cuatro tamaños, iconos configurables, estado de carga y soporte para renderizar como link o cualquier elemento.',
    btn_ctrl_variant: 'Variante',
    btn_ctrl_color: 'Color',
    btn_ctrl_size: 'Tamaño',
    btn_ctrl_loading: 'Loading',
    btn_ctrl_disabled: 'Disabled',
    btn_ex_variants_title: 'Variantes',
    btn_ex_variants_desc: 'Cuatro estilos visuales para distintos niveles de jerarquía de acción.',
    btn_ex_colors_title: 'Colores',
    btn_ex_colors_desc: 'Cinco colores semánticos que mapean al sistema de design tokens del ModoProvider.',
    btn_ex_sizes_title: 'Tamaños',
    btn_ex_sizes_desc: 'El padding, la fuente y el alto se ajustan proporcionalmente en cada escala.',
    btn_ex_icons_title: 'Con iconos',
    btn_ex_icons_desc: 'Posición izquierda, derecha o solo icono. Usa aria-label en botones icon-only.',
    btn_ex_states_title: 'Estados',
    btn_ex_states_desc: 'Loading bloquea clicks y muestra spinner. Disabled deshabilita visualmente e impide eventos.',
    btn_prop_variant: 'Variante visual. Normal es el botón sólido por defecto.',
    btn_prop_color: 'Color semántico aplicado al botón.',
    btn_prop_size: 'Controla el padding, fuente y alto del botón.',
    btn_prop_label: 'Texto del botón. Equivalente al slot default para contenido plano.',
    btn_prop_loading: 'Muestra un spinner y bloquea clicks mientras está activo.',
    btn_prop_loadingText: 'Texto mostrado junto al spinner durante el estado loading.',
    btn_prop_disabled: 'Deshabilita el botón visualmente e impide cualquier interacción.',
    btn_prop_icon: 'Componente de icono renderizado junto al label (heroicons u otro).',
    btn_prop_iconPosition: 'Lado donde aparece el icono respecto al label.',
    btn_prop_fullWidth: 'El botón se expande para ocupar el 100% del ancho disponible.',
    btn_prop_as: 'Elemento raíz a renderizar. Usa "a" para links o un router-link.',
    btn_prop_ariaLabel: 'Label accesible. Imprescindible en botones icon-only sin texto visible.',
    btn_emit_click: 'Emitido al hacer click cuando el botón no está deshabilitado ni en estado loading.',
    btn_slot_default: 'Contenido personalizado del botón. Reemplaza la prop label cuando se necesita HTML o componentes internos.',
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

    docSection_overview: 'Overview',
    docSection_examples: 'Examples',
    docSection_api: 'API Reference',
    docSection_props: 'Props',
    docSection_emits: 'Emits',
    docSection_slots: 'Slots',
    docCol_prop: 'Prop',
    docCol_type: 'Type',
    docCol_default: 'Default',
    docCol_description: 'Description',
    docCol_event: 'Event',
    docCol_payload: 'Payload',
    docCol_slot: 'Slot',
    docCol_bindings: 'Props',
    docReset: 'Reset',
    docPreview: 'Preview',
    docCode: 'Code',

    btn_category: 'Forms',
    btn_description: 'The primary action of any interface. Four variants, five semantic colors, four sizes, configurable icons, loading state and support for rendering as a link or any element.',
    btn_ctrl_variant: 'Variant',
    btn_ctrl_color: 'Color',
    btn_ctrl_size: 'Size',
    btn_ctrl_loading: 'Loading',
    btn_ctrl_disabled: 'Disabled',
    btn_ex_variants_title: 'Variants',
    btn_ex_variants_desc: 'Four visual styles for different levels of action hierarchy in the interface.',
    btn_ex_colors_title: 'Colors',
    btn_ex_colors_desc: 'Five semantic colors that map directly to the ModoProvider design token system.',
    btn_ex_sizes_title: 'Sizes',
    btn_ex_sizes_desc: 'Padding, font and height scale proportionally at each level.',
    btn_ex_icons_title: 'With icons',
    btn_ex_icons_desc: 'Left, right or icon-only position. Use aria-label on icon-only buttons.',
    btn_ex_states_title: 'States',
    btn_ex_states_desc: 'Loading blocks clicks and shows spinner. Disabled prevents all interaction.',
    btn_prop_variant: 'Visual variant. Normal is the solid button (default).',
    btn_prop_color: 'Semantic color applied to the button.',
    btn_prop_size: 'Controls padding, font size and height.',
    btn_prop_label: 'Button text. Equivalent to the default slot for plain content.',
    btn_prop_loading: 'Shows a spinner and blocks clicks while active.',
    btn_prop_loadingText: 'Text shown alongside the spinner during loading state.',
    btn_prop_disabled: 'Visually disables the button and prevents all interaction.',
    btn_prop_icon: 'Icon component rendered next to the label (heroicons or any component).',
    btn_prop_iconPosition: 'Side where the icon appears relative to the label.',
    btn_prop_fullWidth: 'Button expands to fill 100% of available width.',
    btn_prop_as: 'Root element to render. Use "a" for links or a router-link component.',
    btn_prop_ariaLabel: 'Accessible label. Required for icon-only buttons without visible text.',
    btn_emit_click: 'Emitted on click when the button is not disabled or in loading state.',
    btn_slot_default: 'Custom button content. Replaces the label prop when HTML or inner components are needed.',
};

const DICTS: Record<ShowroomLocale, ShowroomDict> = { es: ES, en: EN };

export function useShowroomI18n(locale: () => ShowroomLocale): ComputedRef<ShowroomDict> {
    return computed(() => DICTS[locale()] ?? ES);
}
