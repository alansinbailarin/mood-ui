import { describe, it, expect } from 'vitest'; 
import { defineComponent, h, provide, ref } from 'vue'; 
import { mount } from '@vue/test-utils'; 
import { 
    useResolvedRadius, 
    useResolvedColor, 
    useResolvedTheme, 
    useResolvedSize, 
} from '../../src/composables/useModoConfig'; 
import { MODO_CONFIG, defaultModoConfig, type ModoConfig } from '../../src/config/ModoConfig'; 
 
/** 
 * Helper: render a tiny component that resolves a value via the composable 
 * under a (optional) ModoProvider-like injection. Returns the resolved 
 * value (read once after mount) plus a way to mutate the provided ref. 
 */ 
function harness<T>(factory: () => { value: T }, provided?: ModoConfig) { 
    const cfgRef = provided ? ref<ModoConfig>(provided) : null; 
 
    const Probe = defineComponent({ 
        setup() { 
            const r = factory(); 
            return () => h('div', String(r.value)); 
        }, 
    }); 
 
    const Host = defineComponent({ 
        setup() { 
            if (cfgRef) provide(MODO_CONFIG, cfgRef); 
            return () => h(Probe); 
        }, 
    }); 
 
    return { wrapper: mount(Host), cfgRef }; 
} 
 
describe('useResolvedRadius', () => { 
    it('falls back to the provider radius when local prop is undefined', () => { 
        const { wrapper } = harness( 
            () => useResolvedRadius(() => undefined), 
            { ...defaultModoConfig, radius: 'large' }, 
        ); 
        expect(wrapper.text()).toBe('large'); 
    }); 
 
    it('local prop wins over provider radius', () => { 
        const { wrapper } = harness( 
            () => useResolvedRadius(() => 'none'), 
            { ...defaultModoConfig, radius: 'large' }, 
        ); 
        expect(wrapper.text()).toBe('none'); 
    }); 
 
    it('falls back to defaultModoConfig.radius outside of a provider', () => { 
        const { wrapper } = harness(() => useResolvedRadius(() => undefined)); 
        expect(wrapper.text()).toBe(defaultModoConfig.radius); 
    }); 
 
    it('reacts to provider changes', async () => { 
        const { wrapper, cfgRef } = harness( 
            () => useResolvedRadius(() => undefined), 
            { ...defaultModoConfig, radius: 'small' }, 
        ); 
        expect(wrapper.text()).toBe('small'); 
        cfgRef!.value = { ...cfgRef!.value, radius: 'full' }; 
        await wrapper.vm.$nextTick(); 
        expect(wrapper.text()).toBe('full'); 
    }); 
}); 
 
describe('useResolvedColor', () => { 
    it('semantic local color always wins over provider', () => { 
        const { wrapper } = harness( 
            () => useResolvedColor(() => 'danger'), 
            { ...defaultModoConfig, color: 'primary' }, 
        ); 
        expect(wrapper.text()).toBe('danger'); 
    }); 
 
    it("'default' falls back to provider color", () => { 
        const { wrapper } = harness( 
            () => useResolvedColor(() => 'default'), 
            { ...defaultModoConfig, color: 'success' }, 
        ); 
        expect(wrapper.text()).toBe('success'); 
    }); 
 
    it('undefined falls back to provider color', () => { 
        const { wrapper } = harness( 
            () => useResolvedColor(() => undefined), 
            { ...defaultModoConfig, color: 'warning' }, 
        ); 
        expect(wrapper.text()).toBe('warning'); 
    }); 
}); 
 
describe('useResolvedTheme', () => { 
    it('local prop wins', () => { 
        const { wrapper } = harness( 
            () => useResolvedTheme(() => 'dark'), 
            { ...defaultModoConfig, theme: 'light' }, 
        ); 
        expect(wrapper.text()).toBe('dark'); 
    }); 
 
    it('falls back to provider', () => { 
        const { wrapper } = harness( 
            () => useResolvedTheme(() => undefined), 
            { ...defaultModoConfig, theme: 'dark' }, 
        ); 
        expect(wrapper.text()).toBe('dark'); 
    }); 
}); 
 
describe('useResolvedSize', () => { 
    it('local prop wins over provider', () => { 
        const { wrapper } = harness( 
            () => useResolvedSize(() => 'small'), 
            { ...defaultModoConfig, size: 'large' }, 
        ); 
        expect(wrapper.text()).toBe('small'); 
    }); 
 
    it('falls back to provider when undefined', () => { 
        const { wrapper } = harness( 
            () => useResolvedSize(() => undefined), 
            { ...defaultModoConfig, size: 'large' }, 
        ); 
        expect(wrapper.text()).toBe('large'); 
    }); 
 
    it('falls back to default outside of a provider', () => { 
        const { wrapper } = harness(() => useResolvedSize(() => undefined)); 
        expect(wrapper.text()).toBe(defaultModoConfig.size); 
    }); 
});
