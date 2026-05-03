import type { NavCategory } from './types'; 
 
/** 
 * Showroom navigation registry. Order = order shown in the sidebar. 
 * 
 * Pages are lazy-loaded via dynamic `import()` so the initial bundle 
 * only ships the layout + the active page. Add a new page by: 
 * 
 *   1. Creating `pages/<category>/<Name>Page.vue`. 
 *   2. Adding a `NavEntry` here. 
 */ 
export const showroomNav: NavCategory[] = [ 
    {
        id: 'getting-started',
        title: 'Getting started',
        entries: [
            {
                id: 'welcome',
                label: 'Welcome',
                page: () => import('./pages/welcome/WelcomePage.vue'),
            },
        ],
    },
    {
        id: 'docs',
        title: 'Docs',
        entries: [
            {
                id: 'installation',
                label: 'Installation',
                page: () => import('./pages/docs/InstallationPage.vue'),
            },
            {
                id: 'theming',
                label: 'Theming',
                page: () => import('./pages/docs/ThemingPage.vue'),
            },
            {
                id: 'i18n',
                label: 'i18n',
                page: () => import('./pages/docs/I18nPage.vue'),
            },
        ],
    },
    {
        id: 'templates',
        title: 'Templates',
        entries: [
            {
                id: 'dashboard',
                label: 'Dashboard',
                page: () => import('./pages/templates/DashboardTemplatePage.vue'),
                badge: 'New',
            },
            {
                id: 'auth',
                label: 'Auth',
                page: () => import('./pages/templates/AuthTemplatePage.vue'),
                badge: 'New',
            },
            {
                id: 'pricing',
                label: 'Pricing',
                page: () => import('./pages/templates/PricingTemplatePage.vue'),
                badge: 'New',
            },
            {
                id: 'settings',
                label: 'Settings',
                page: () => import('./pages/templates/SettingsTemplatePage.vue'),
                badge: 'New',
            },
        ],
    },
    {
        id: 'theme-studio',
        title: 'Theme Studio',
        entries: [
            {
                id: 'theme-studio',
                label: 'Theme Studio',
                page: () => import('./pages/theme-studio/ThemeStudioPage.vue'),
                badge: 'Beta',
            },
        ],
    },
    { 
        id: 'forms', 
        title: 'Forms', 
        entries: [ 
            { 
                id: 'button', 
                label: 'Button', 
                page: () => import('./pages/forms/ButtonPage.vue'), 
            }, 
            { 
                id: 'button-group', 
                label: 'ButtonGroup', 
                page: () => import('./pages/forms/ButtonGroupPage.vue'), 
            }, 
            { 
                id: 'form-field', 
                label: 'FormField', 
                page: () => import('./pages/forms/FormFieldPage.vue'), 
                badge: 'New', 
            }, 
            { 
                id: 'input', 
                label: 'Input', 
                page: () => import('./pages/forms/InputPage.vue'), 
            }, 
            { 
                id: 'textarea', 
                label: 'Textarea', 
                page: () => import('./pages/forms/TextareaPage.vue'), 
            }, 
            { 
                id: 'password-input', 
                label: 'PasswordInput', 
                page: () => import('./pages/forms/PasswordInputPage.vue'), 
            }, 
            { 
                id: 'number-input', 
                label: 'NumberInput', 
                page: () => import('./pages/forms/NumberInputPage.vue'), 
            }, 
            { 
                id: 'search-input', 
                label: 'SearchInput', 
                page: () => import('./pages/forms/SearchInputPage.vue'), 
            }, 
            { 
                id: 'select', 
                label: 'Select', 
                page: () => import('./pages/forms/SelectPage.vue'), 
            }, 
            { 
                id: 'multi-select', 
                label: 'MultiSelect', 
                page: () => import('./pages/forms/MultiSelectPage.vue'), 
            }, 
            { 
                id: 'combobox', 
                label: 'Combobox', 
                page: () => import('./pages/forms/ComboboxPage.vue'), 
            }, 
            { 
                id: 'checkbox', 
                label: 'Checkbox', 
                page: () => import('./pages/forms/CheckboxPage.vue'), 
            }, 
            { 
                id: 'radio', 
                label: 'Radio', 
                page: () => import('./pages/forms/RadioPage.vue'), 
            }, 
            { 
                id: 'radio-group', 
                label: 'Radio & RadioGroup', 
                page: () => import('./pages/forms/RadioGroupPage.vue'), 
            }, 
            { 
                id: 'switch', 
                label: 'Switch', 
                page: () => import('./pages/forms/SwitchPage.vue'), 
            }, 
            { 
                id: 'date-field', 
                label: 'DateField', 
                page: () => import('./pages/forms/DateFieldPage.vue'), 
            }, 
            { 
                id: 'date-time-field', 
                label: 'DateTimeField', 
                page: () => import('./pages/forms/DateTimeFieldPage.vue'), 
            }, 
            { 
                id: 'date-range-field', 
                label: 'DateRangeField', 
                page: () => import('./pages/forms/DateRangeFieldPage.vue'), 
            }, 
            { 
                id: 'file-input', 
                label: 'FileInput', 
                page: () => import('./pages/forms/FileInputPage.vue'), 
            }, 
            { 
                id: 'slider', 
                label: 'Slider', 
                page: () => import('./pages/forms/SliderPage.vue'), 
            }, 
            { 
                id: 'range-slider', 
                label: 'RangeSlider', 
                page: () => import('./pages/forms/RangeSliderPage.vue'), 
            }, 
            { 
                id: 'segmented', 
                label: 'Segmented', 
                page: () => import('./pages/forms/SegmentedPage.vue'), 
                badge: 'New', 
            }, 
            { 
                id: 'rating', 
                label: 'Rating', 
                page: () => import('./pages/forms/RatingPage.vue'), 
                badge: 'New', 
            }, 
            { 
                id: 'color-picker', 
                label: 'ColorPicker', 
                page: () => import('./pages/forms/ColorPickerPage.vue'), 
                badge: 'New', 
            }, 
            { 
                id: 'tag-input', 
                label: 'TagInput', 
                page: () => import('./pages/forms/TagInputPage.vue'), 
                badge: 'New', 
            }, 
        ], 
    }, 
    { 
        id: 'feedback', 
        title: 'Feedback', 
        entries: [ 
            { 
                id: 'badge', 
                label: 'Badge', 
                page: () => import('./pages/feedback/BadgePage.vue'), 
            }, 
            { 
                id: 'banner', 
                label: 'Banner', 
                page: () => import('./pages/feedback/BannerPage.vue'), 
            }, 
            { 
                id: 'chip', 
                label: 'Chip', 
                page: () => import('./pages/feedback/ChipPage.vue'), 
            }, 
            { 
                id: 'drawer', 
                label: 'Drawer', 
                page: () => import('./pages/feedback/DrawerPage.vue'), 
            }, 
            { 
                id: 'loader', 
                label: 'Loader', 
                page: () => import('./pages/feedback/LoaderPage.vue'), 
            }, 
            { 
                id: 'modal', 
                label: 'Modal', 
                page: () => import('./pages/feedback/ModalPage.vue'), 
            }, 
            { 
                id: 'skeleton', 
                label: 'Skeleton', 
                page: () => import('./pages/feedback/SkeletonPage.vue'), 
            }, 
            { 
                id: 'tooltip', 
                label: 'Tooltip', 
                page: () => import('./pages/feedback/TooltipPage.vue'), 
            }, 
            { 
                id: 'toast', 
                label: 'Toast', 
                page: () => import('./pages/feedback/ToastPage.vue'), 
                badge: 'New', 
            }, 
            { 
                id: 'toast-item', 
                label: 'Toast (item)', 
                page: () => import('./pages/feedback/ToastItemPage.vue'), 
            }, 
            { 
                id: 'confirm-dialog', 
                label: 'ConfirmDialog', 
                page: () => import('./pages/feedback/ConfirmDialogPage.vue'), 
                badge: 'New', 
            }, 
            { 
                id: 'empty-state', 
                label: 'EmptyState', 
                page: () => import('./pages/feedback/EmptyStatePage.vue'), 
                badge: 'New', 
            }, 
            { 
                id: 'progress-bar', 
                label: 'ProgressBar', 
                page: () => import('./pages/feedback/ProgressBarPage.vue'), 
                badge: 'New', 
            }, 
        ], 
    }, 
    { 
        id: 'data-display', 
        title: 'Data display', 
        entries: [ 
            { 
                id: 'card', 
                label: 'Card', 
                page: () => import('./pages/data-display/CardPage.vue'), 
            }, 
            { 
                id: 'typography', 
                label: 'Typography', 
                page: () => import('./pages/data-display/TypographyPage.vue'), 
            }, 
            { 
                id: 'avatar', 
                label: 'Avatar', 
                page: () => import('./pages/data-display/AvatarPage.vue'), 
            }, 
            { 
                id: 'avatar-group', 
                label: 'AvatarGroup', 
                page: () => import('./pages/data-display/AvatarGroupPage.vue'), 
            }, 
            { 
                id: 'accordion', 
                label: 'Accordion', 
                page: () => import('./pages/data-display/AccordionPage.vue'), 
                badge: 'New', 
            }, 
            { 
                id: 'kbd', 
                label: 'Kbd', 
                page: () => import('./pages/data-display/KbdPage.vue'), 
                badge: 'New', 
            }, 
            { 
                id: 'code', 
                label: 'Code', 
                page: () => import('./pages/data-display/CodePage.vue'), 
                badge: 'New', 
            }, 
            { 
                id: 'stat', 
                label: 'Stat', 
                page: () => import('./pages/data-display/StatPage.vue'), 
                badge: 'New', 
            }, 
            { 
                id: 'timeline', 
                label: 'Timeline', 
                page: () => import('./pages/data-display/TimelinePage.vue'), 
                badge: 'New', 
            }, 
            { 
                id: 'table', 
                label: 'Table', 
                page: () => import('./pages/data-display/TablePage.vue'), 
            }, 
        ], 
    }, 
    { 
        id: 'calendar', 
        title: 'Calendar', 
        entries: [ 
            { 
                id: 'calendar', 
                label: 'Calendar', 
                page: () => import('./pages/data-display/CalendarPage.vue'), 
            }, 
            { 
                id: 'month-view', 
                label: 'MonthView', 
                page: () => import('./pages/data-display/MonthViewPage.vue'), 
            }, 
            { 
                id: 'week-view', 
                label: 'WeekView', 
                page: () => import('./pages/data-display/WeekViewPage.vue'), 
            }, 
            { 
                id: 'day-view', 
                label: 'DayView', 
                page: () => import('./pages/data-display/DayViewPage.vue'), 
            }, 
            { 
                id: 'agenda-view', 
                label: 'AgendaView', 
                page: () => import('./pages/data-display/AgendaViewPage.vue'), 
            }, 
            { 
                id: 'scheduler', 
                label: 'Scheduler', 
                page: () => import('./pages/data-display/SchedulerPage.vue'), 
            }, 
        ], 
    }, 
    { 
        id: 'date-picker', 
        title: 'Date picker', 
        entries: [ 
            { 
                id: 'date-time-picker', 
                label: 'DateTimePicker', 
                page: () => import('./pages/data-display/DateTimePickerPage.vue'), 
            }, 
            { 
                id: 'date-range-picker', 
                label: 'DateRangePicker', 
                page: () => import('./pages/data-display/DateRangePickerPage.vue'), 
            }, 
        ], 
    }, 
    { 
        id: 'layout', 
        title: 'Layout', 
        entries: [ 
            { 
                id: 'app-shell', 
                label: 'AppShell', 
                page: () => import('./pages/layout/AppShellPage.vue'), 
            }, 
            { 
                id: 'canvas', 
                label: 'Canvas', 
                page: () => import('./pages/layout/CanvasPage.vue'), 
            }, 
            { 
                id: 'sidebar', 
                label: 'Sidebar', 
                page: () => import('./pages/layout/SidebarPage.vue'), 
            }, 
            { 
                id: 'topbar', 
                label: 'Topbar', 
                page: () => import('./pages/layout/TopbarPage.vue'), 
            }, 
            { 
                id: 'page-header', 
                label: 'PageHeader', 
                page: () => import('./pages/layout/PageHeaderPage.vue'), 
            }, 
            { 
                id: 'container', 
                label: 'Container', 
                page: () => import('./pages/layout/ContainerPage.vue'), 
            }, 
            { 
                id: 'divider', 
                label: 'Divider', 
                page: () => import('./pages/layout/DividerPage.vue'), 
                badge: 'New', 
            }, 
            { 
                id: 'stack', 
                label: 'Stack', 
                page: () => import('./pages/layout/StackPage.vue'), 
                badge: 'New', 
            }, 
            { 
                id: 'hstack', 
                label: 'HStack', 
                page: () => import('./pages/layout/HStackPage.vue'), 
            }, 
            { 
                id: 'vstack', 
                label: 'VStack', 
                page: () => import('./pages/layout/VStackPage.vue'), 
            }, 
            { 
                id: 'popover-panel', 
                label: 'PopoverPanel', 
                page: () => import('./pages/layout/PopoverPanelPage.vue'), 
            }, 
        ], 
    }, 
    { 
        id: 'navigation', 
        title: 'Navigation', 
        entries: [ 
            { 
                id: 'tabs', 
                label: 'Tabs', 
                page: () => import('./pages/navigation/TabsPage.vue'), 
            }, 
            { 
                id: 'breadcrumbs', 
                label: 'Breadcrumbs', 
                page: () => import('./pages/navigation/BreadcrumbsPage.vue'), 
                badge: 'New', 
            }, 
            { 
                id: 'dropdown-menu', 
                label: 'DropdownMenu', 
                page: () => import('./pages/navigation/DropdownMenuPage.vue'), 
                badge: 'New', 
            }, 
            { 
                id: 'pagination', 
                label: 'Pagination', 
                page: () => import('./pages/navigation/PaginationPage.vue'), 
                badge: 'New', 
            }, 
            { 
                id: 'stepper', 
                label: 'Stepper', 
                page: () => import('./pages/navigation/StepperPage.vue'), 
                badge: 'New', 
            }, 
        ], 
    }, 
]; 
 
/** Find an entry by id across all categories. */ 
export function findEntry(id: string) { 
    for (const cat of showroomNav) { 
        const found = cat.entries.find((e) => e.id === id); 
        if (found) return found; 
    } 
    return undefined; 
}
