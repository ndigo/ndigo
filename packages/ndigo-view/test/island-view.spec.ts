/**
 */
// @vitest-environment jsdom
import { describe, test, expect, beforeEach } from 'vitest';
import { LANGUAGE_ATTRIBUTE } from '@ndigo/router';
import type { Route } from '@ndigo/router';
import { ViewTarget } from '@ndigo/view';
import { IslandView, parseModel, serializeModel } from '../src/island-view';

// IslandView._renderTemplate is protected; expose a structural view of it so
// the specs can drive the render pipeline without widening the public API
// (same pattern as the webcomponent specs' ExposedView).
interface ExposedIslandView {
    _renderTemplate(templateModel: unknown, request: unknown, target?: ViewTarget): void | Promise<void>;
}

const stringifyHtml = (html: string) => html;

/**
 * Drives a serialized model through real markup the way the production
 * hydration path does: embed the escaped attribute value, let the DOM parser
 * decode entities once, then read it back via `getAttribute`. This is the
 * ONE-LEVEL-decoded input `parseModel` is contracted to receive.
 */
const decodedAttributeValue = (escapedAttributeValue: string): string => {
    document.body.innerHTML = `<div data-ndigo-model="${escapedAttributeValue}"></div>`;
    return document.querySelector<HTMLDivElement>('div')?.getAttribute('data-ndigo-model') ?? '';
};

beforeEach(() => {
    document.body.innerHTML = '';
});

describe('IslandView (server-side island render)', () => {
    test('renders an inert custom element with a serialized model attribute', async () => {
        const view = new IslandView('todo-app') as unknown as IslandView & ExposedIslandView;
        const model = { items: ['a', 'b'], filter: 'all' };
        let committed = '';

        await view._renderTemplate(model, null, {
            async commit(html: unknown) {
                committed = stringifyHtml(html as string);
            },
            async prepare() {},
            async clear() {},
        });

        expect(committed).toContain('<todo-app data-ndigo-island data-ndigo-locale="" data-ndigo-model=');
        expect(committed).toMatch(/^<todo-app /); // pure markup, no children needed
        expect(committed).not.toContain('<section'); // no DOM rendering happened
    });

    test('carries the resolved request language on the marker', async () => {
        const view = new IslandView('todo-app') as unknown as IslandView & ExposedIslandView;
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

        expect(committed).toContain('data-ndigo-locale="fr-CA"');
    });

    test('escapes hostile locale values so the attribute cannot break out', async () => {
        const view = new IslandView('todo-app') as unknown as IslandView & ExposedIslandView;
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
        expect(committed).toContain('data-ndigo-locale="&quot; autofocus onfocus=&quot;alert(1)"');
        expect(committed).not.toContain('onfocus="alert(1)"');
    });

    test('serialized model round-trips via parseModel through real markup', () => {
        const model = { n: 1, s: 'x<&"y', list: [1, 2] };
        const encoded = serializeModel(model);
        expect(encoded).not.toContain('"'); // attribute-safe (quotes escaped)

        // The browser decodes attribute entities once before parseModel sees
        // the value — feed that already-decoded form, not the escaped string.
        const decoded = decodedAttributeValue(encoded);
        expect(parseModel(decoded)).toEqual(model);
    });

    test('model survives HTML-entity escaping', () => {
        const model = { text: '<b>&</b>' };
        const encoded = serializeModel(model);
        expect(encoded).toContain('&lt;b&gt;');

        const decoded = decodedAttributeValue(encoded);
        expect(parseModel(decoded)).toEqual(model);
    });

    test('rejects tag names that are not valid custom elements (DSV-WEBCOMP-2)', () => {
        // The tag is interpolated raw into markup, so construction must fail
        // loudly rather than emit attacker- or route-derived junk as a tag.
        for (const name of ['user', 'Todo-App', '-todo', 'todo app', '<script>', 'a"b', 'font-face']) {
            expect(() => new IslandView(name)).toThrow(/custom-element/);
        }
        expect(() => new IslandView('todo-app')).not.toThrow();
        expect(() => new IslandView('x-foo')).not.toThrow();
    });

    test('does not double-decode entity literals in the model', () => {
        // Original model text intentionally contains entity *literals* — the
        // text `&lt;b&gt;` is data, not markup. serializeModel escapes the
        // JSON once; the DOM parser decodes attribute entities once; parseModel
        // must stop there and not decode a second time.
        const model = { html: '<b>&amp; &lt;b&gt;</b>' };
        const encoded = serializeModel(model);

        const decoded = decodedAttributeValue(encoded);
        expect(parseModel(decoded)).toEqual(model);

        // And the hydration safety invariant: a literal `&lt;script&gt;` in the
        // model stays literal text after parsing — it must never come back as
        // a real `<script>` element, nor decode to `null`.
        const scriptText = '&lt;script&gt;alert(1)&lt;/script&gt;';
        const fromMarkup = parseModel(decodedAttributeValue(serializeModel({ payload: scriptText })));
        expect(fromMarkup).toEqual({ payload: scriptText });
    });

    test('embeds trusted shadowHtml as a declarative shadow root (DSD first paint)', async () => {
        const view = new IslandView('todo-app', {
            shadowHtml: '<ul><li>⬜ Buy milk</li></ul>',
        }) as unknown as IslandView & ExposedIslandView;
        let committed = '';

        await view._renderTemplate({ items: [{ text: 'Buy milk', done: false }] }, null, {
            async commit(html: unknown) {
                committed = stringifyHtml(html as string);
            },
            async prepare() {},
            async clear() {},
        });

        expect(committed).toContain('<template shadowrootmode="open"><ul><li>⬜ Buy milk</li></ul></template>');
        // The element shape is unchanged apart from the template child.
        expect(committed).toMatch(
            /^<todo-app data-ndigo-island data-ndigo-locale="" data-ndigo-model="[^"]*"><template shadowrootmode="open">.*<\/template><\/todo-app>$/
        );
    });

    test('omits the declarative shadow root when no shadowHtml is supplied', async () => {
        const view = new IslandView('todo-app') as unknown as IslandView & ExposedIslandView;
        let committed = '';

        await view._renderTemplate({}, null, {
            async commit(html: unknown) {
                committed = stringifyHtml(html as string);
            },
            async prepare() {},
            async clear() {},
        });

        expect(committed).not.toContain('<template');
        expect(committed).toBe('<todo-app data-ndigo-island data-ndigo-locale="" data-ndigo-model="{}"></todo-app>');
    });

    test('passes shadowHtml through unescaped (trusted markup only)', async () => {
        const view = new IslandView('x-panel', { shadowHtml: '<b>bold</b>' }) as unknown as IslandView &
            ExposedIslandView;
        let committed = '';

        await view._renderTemplate({}, null, {
            async commit(html: unknown) {
                committed = stringifyHtml(html as string);
            },
            async prepare() {},
            async clear() {},
        });

        expect(committed).toContain('<template shadowrootmode="open"><b>bold</b></template>');
        expect(committed).not.toContain('&lt;b&gt;');
    });
});
