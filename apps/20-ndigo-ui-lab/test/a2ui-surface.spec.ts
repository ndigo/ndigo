// @vitest-environment jsdom
/**
 * Installed A2UI surface: renders the app's own `nd-switch` and rejects an
 * unknown component.
 */
import { afterEach, describe, expect, it } from 'vitest';
import '../src/ui/nd-switch/nd-switch';
import '../src/ui/nd-a2ui-surface/nd-a2ui-surface';
import type { NdA2uiSurface } from '../src/ui/nd-a2ui-surface/nd-a2ui-surface';

afterEach(() => {
    document.body.innerHTML = '';
});

describe('<nd-a2ui-surface> (installed item)', () => {
    it('renders an installed ndigo-ui component', async () => {
        const surface = document.createElement('nd-a2ui-surface') as NdA2uiSurface;
        document.body.append(surface);
        surface.messages = [
            { version: '1.0', createSurface: { surfaceId: 's1', catalogId: 'ndigo-ui' } },
            {
                version: '1.0',
                updateComponents: {
                    surfaceId: 's1',
                    components: [{ id: 'root', component: 'Switch', checked: true }],
                },
            },
        ];
        await new Promise<void>((resolve) => setTimeout(resolve, 0));

        expect(surface.querySelector('nd-switch')).not.toBeNull();
    });

    it('rejects an unknown component', async () => {
        const surface = document.createElement('nd-a2ui-surface') as NdA2uiSurface;
        document.body.append(surface);
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
        await new Promise<void>((resolve) => setTimeout(resolve, 0));

        expect(surface.querySelector('nd-switch')).toBeNull();
        expect(surface.getAttribute('data-error')).toBeTruthy();
    });
});
