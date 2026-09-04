// @vitest-environment node
import { describe, test, expect } from 'vitest';
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

        expect(committed).toContain('<todo-app data-blue-island data-blue-model=');
        expect(committed).toMatch(/^<todo-app /); // pure markup, no children needed
        expect(committed).not.toContain('<section'); // no DOM rendering happened
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