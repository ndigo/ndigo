/**
 * `<nd-a2ui-surface>`: renders with installed elements and rejects unknown ones.
 */
import { SpecVersion } from '@a2ui/web_core';
import { afterEach, describe, expect, it } from 'vitest';
import { flush } from './_fixtures';
import '../registry/ui/switch/nd-switch';
import { NdA2uiSurface } from '../registry/ui/a2ui-surface/nd-a2ui-surface';

function mount(): NdA2uiSurface {
    const surface = document.createElement('nd-a2ui-surface') as NdA2uiSurface;
    document.body.append(surface);
    return surface;
}

afterEach(() => {
    document.body.innerHTML = '';
});

describe('<nd-a2ui-surface>', () => {
    it('pins the A2UI 1.0 protocol', () => {
        expect(SpecVersion.V1_0).toBe('1.0');
    });

    it('renders an installed component with its props', async () => {
        expect(customElements.get('nd-a2ui-surface')).toBeDefined();
        expect(customElements.get('nd-switch')).toBeDefined();
        const surface = mount();
        expect(surface).toBeInstanceOf(NdA2uiSurface);
        surface.messages = [
            { version: '1.0', createSurface: { surfaceId: 's1', catalogId: 'ndigo-ui' } },
            {
                version: '1.0',
                updateComponents: {
                    surfaceId: 's1',
                    components: [{ id: 'root', component: 'Switch', checked: true, label: 'Notifications' }],
                },
            },
        ];
        await flush();

        const toggle = surface.querySelector('nd-switch');
        expect(toggle).not.toBeNull();
        expect(toggle?.getAttribute('data-a2ui-id')).toBe('root');
        expect(toggle?.getAttribute('checked')).toBe('true');
        expect(toggle?.getAttribute('label')).toBe('Notifications');
        expect(surface.hasAttribute('data-error')).toBe(false);
    });

    it('drops dangerous props instead of writing arbitrary attributes', async () => {
        const surface = mount();
        surface.messages = [
            { version: '1.0', createSurface: { surfaceId: 's1', catalogId: 'ndigo-ui' } },
            {
                version: '1.0',
                updateComponents: {
                    surfaceId: 's1',
                    components: [
                        {
                            id: 'root',
                            component: 'Switch',
                            checked: true,
                            label: 'Notifications',
                            onclick: 'alert()',
                            on_label: '<script>',
                            href: 'javascript:alert()',
                            srcdoc: '<script>alert()</script>',
                        },
                    ],
                },
            },
        ];
        await flush();

        const toggle = surface.querySelector('nd-switch');
        expect(toggle).not.toBeNull();
        expect(toggle?.getAttribute('checked')).toBe('true');
        expect(toggle?.getAttribute('label')).toBe('Notifications');
        expect(toggle?.getAttribute('onclick')).toBeNull();
        expect(toggle?.getAttribute('on_label')).toBeNull();
        expect(toggle?.getAttribute('href')).toBeNull();
        expect(toggle?.getAttribute('srcdoc')).toBeNull();
    });

    it('renders multiple surfaces under one element', async () => {
        const surface = mount();
        surface.messages = [
            { version: '1.0', createSurface: { surfaceId: 's1', catalogId: 'ndigo-ui' } },
            { version: '1.0', createSurface: { surfaceId: 's2', catalogId: 'ndigo-ui' } },
        ];
        await flush();

        const sections = [...surface.children]
            .filter((node): node is HTMLElement => node instanceof HTMLElement)
            .filter((node) => node.getAttribute('data-a2ui-surface-id') !== null);
        expect(sections.length).toBe(2);
        expect(sections.map((section) => section.getAttribute('data-a2ui-surface-id'))).toEqual(['s1', 's2']);
    });

    it('reports an unknown or uninstalled component instead of rendering it', async () => {
        const surface = mount();
        const errors: string[] = [];
        surface.addEventListener('nd-a2ui-error', (event) => {
            errors.push((event as CustomEvent<{ message: string }>).detail.message);
        });
        surface.messages = [
            { version: '1.0', createSurface: { surfaceId: 's1', catalogId: 'ndigo-ui' } },
            {
                version: '1.0',
                updateComponents: {
                    surfaceId: 's1',
                    components: [{ id: 'root', component: 'Mystery' }],
                },
            },
        ];
        await flush();

        expect(surface.querySelector('nd-switch')).toBeNull();
        expect(surface.getAttribute('data-error')).toBeTruthy();
        expect(errors.length).toBeGreaterThan(0);
    });
});
