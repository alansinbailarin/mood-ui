import { ref, watch, type App } from 'vue'; 
import { MODO_CONFIG, defaultModoConfig, type ModoConfig } from './ModoConfig'; 
import { mergePalettes, palettesToCssVars, type ModoPalette } from './palettes'; 
 
export interface ModoUIOptions { 
    color?: ModoConfig['color']; 
    radius?: ModoConfig['radius']; 
    theme?: ModoConfig['theme']; 
    palettes?: { default?: Partial<ModoPalette>; primary?: Partial<ModoPalette> }; 
} 
 
export function createModoUI(options: ModoUIOptions = {}) { 
    const config = ref<ModoConfig>({ 
        ...defaultModoConfig, 
        ...options, 
        palettes: mergePalettes(options.palettes), 
    }); 
 
    if (typeof document !== 'undefined') { 
        watch( 
            () => config.value.theme, 
            (t) => document.documentElement.classList.toggle('dark', t === 'dark'), 
            { immediate: true }, 
        ); 
        watch( 
            () => config.value.palettes, 
            (p) => { 
                const vars = palettesToCssVars(p); 
                for (const [k, v] of Object.entries(vars)) { 
                    document.documentElement.style.setProperty(k, v); 
                } 
            }, 
            { immediate: true, deep: true }, 
        ); 
    } 
 
    return { 
        install(app: App) { 
            app.provide(MODO_CONFIG, config); 
        }, 
        config, 
        set(next: Partial<ModoUIOptions>) { 
            if (next.color !== undefined) config.value.color = next.color; 
            if (next.radius !== undefined) config.value.radius = next.radius; 
            if (next.theme !== undefined) config.value.theme = next.theme; 
            if (next.palettes) config.value.palettes = mergePalettes(next.palettes); 
        }, 
    }; 
}
