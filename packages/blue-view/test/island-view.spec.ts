/**
 * @module blue-view
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { LANGUAGE_ATTRIBUTE } from '@blue/router';
import { IslandView, serializeModel } from '../src/island-view';

const stringifyHtml = (html: string) => html;

describe('IslandView (server-side island render)', () => {
    test('renders an inert custom element with a serialized model attribute', async () => {
        const view = new IslandView('todo-app');
        const model = { items: ['a', 'b'], filter: 'all' };
        let committed = '';

        await view._renderTemplate(model, null, {
            async commit(html: unknown) {
                committed = stringifyHtml(html as string);
            },
            async prepare() {},
            async clear() {},
        });

        expect(committed).toContain('<todo-app data-blue-island data-blue-locale="" data-blue-model=');
        expect(committed).toMatch(/^<todo-app /); // pure markup, no children needed
        expect(committed).not.toContain('<section'); // no DOM rendering happened
    });

    test('carries the resolved request language on the marker', async () => {
        const view = new IslandView('todo-app');
        let committed = '';

        await view._renderTemplate(
            { items: [] },
            { attributes: { [LANGUAGE_ATTRIBUTE]: 'fr-CA' } } as unknown as Route,
            {
                async commit(html: unknown) {
                    committed = stringifyHtml(html as string);
                },
                async prepare() {},
                async clear() {},
            }
        );

        expect(committed).toContain('data-blue-locale="fr-CA"');
    });

    test('escapes hostile locale values so the attribute cannot break out', async () => {
        const view = new IslandView('todo-app');
        let committed = '';

        await view._renderTemplate(
            { items: [] },
            { attributes: { [LANGUAGE_ATTRIBUTE]: '" autofocus onfocus="alert(1)' } } as unknown as Route,
            {
                async commit(html: unknown) {
                    committed = stringifyHtml(html as string);
                },
                async prepare() {},
                async clear() {},
            }
        );

        // The whole hostile value stays inside the quoted attribute —
        // escaped quotes, no key-value breakout.
        expect(committed).toContain('data-blue-locale="&quot; autofocus onfocus=&quot;alert(1)"');
        expect(committed).not.toContain('onfocus="alert(1)"');
    });

    test('serialized model round-trips via parseModel', async () => {
        const model = { n: 1, s: 'x<&"y', list: [1, 2] };
        const encoded = serializeModel(model);
        expect(encoded).not.toContain('"'); // attribute-safe (quotes escaped)
        const { parseModel } = await import('../src/island-view');
        expect(parseModel(encoded)).toEqual(model);
    });

    test('model survives HTML-entity escaping', async () => {
        const model = { text: '<b>&</b>' };
        const encoded = serializeModel(model);
        expect(encoded).toContain('&lt;b&gt;');
        const { parseModel } = await import('../src/island-view');
        expect(parseModel(encoded)).toEqual(model);
    });
});
