/**
 * Showroom i18n setup (vue-i18n v9+, composition API mode).
 *
 * Translation files live under `./locales/<lang>/` as JSON. The loader merges
 * them into `messages.<lang>` using the file path as the namespace:
 *
 *   locales/es/common.json                  → messages.es.* (root, flat)
 *   locales/es/doc.json                     → messages.es.doc.*
 *   locales/es/pages/welcome.json           → messages.es.pages.welcome.*
 *   locales/es/pages/forms/button.json      → messages.es.pages.forms.button.*
 *
 * `common.json` is special: its keys are merged at the root of the locale
 * (so shell strings like `t('home')` keep their short names). Every other
 * file becomes a nested namespace mirroring its directory layout.
 */
import { createI18n } from 'vue-i18n';

export type ShowroomLocale = 'es' | 'en';

const esModules = import.meta.glob('./locales/es/**/*.json', { eager: true, import: 'default' });
const enModules = import.meta.glob('./locales/en/**/*.json', { eager: true, import: 'default' });

function buildMessages(modules: Record<string, unknown>, lang: ShowroomLocale): Record<string, unknown> {
    const out: Record<string, any> = {};
    const prefix = `./locales/${lang}/`;
    for (const [path, mod] of Object.entries(modules)) {
        const rel = path.slice(prefix.length).replace(/\.json$/, '');
        if (rel === 'common') {
            Object.assign(out, mod as Record<string, unknown>);
            continue;
        }
        const segments = rel.split('/');
        let target = out;
        for (let i = 0; i < segments.length - 1; i++) {
            target[segments[i]] ??= {};
            target = target[segments[i]];
        }
        target[segments[segments.length - 1]] = mod;
    }
    return out;
}

const messages = {
    es: buildMessages(esModules, 'es'),
    en: buildMessages(enModules, 'en'),
};

const i18n = createI18n({
    legacy: false,
    locale: 'es',
    fallbackLocale: 'en',
    messages: messages as never,
});

export default i18n;

type LocaleRef = { value: ShowroomLocale };

export function setShowroomI18nLocale(locale: ShowroomLocale): void {
    const ref = i18n.global.locale as unknown as LocaleRef;
    if (ref.value !== locale) {
        ref.value = locale;
    }
}

export function getShowroomI18nLocale(): ShowroomLocale {
    return (i18n.global.locale as unknown as LocaleRef).value;
}
