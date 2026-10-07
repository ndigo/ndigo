/**
 * @module blue-dom
 * @since 1.0.0
 * @author Jeff Rose
 *
 * Cross-provider parity: `LinkedomDOMProvider` (server-side linkedom) and
 * `BrowserDOMProvider` (native `DOMParser`, backed by jsdom in this suite)
 * must expose the same document shape for the same input — including bare
 * fragments and plain text (KRN-REV-DOM-03).
 */
import { describe, expect, it } from 'vitest';

import { BrowserDOMProvider } from '../src/browser-dom-provider';
import { LinkedomDOMProvider } from '../src/linkedom-dom-provider';

/**
 * The provider-independent, serialization-safe view of a parsed document used
 * to compare the two implementations without depending on markup formatting
 * (quoting, self-closing tags, attribute order).
 */
function describeDocument(document: Document) {
    return {
        nodeType: document.nodeType,
        documentElement: document.documentElement?.tagName.toLowerCase() ?? null,
        headHtml: document.head?.innerHTML ?? null,
        bodyText: document.body.textContent,
        bodyElements: Array.from(document.body.children).map((element) => ({
            tag: element.tagName.toLowerCase(),
            text: element.textContent,
        })),
    };
}

const cases: ReadonlyArray<readonly [label: string, html: string]> = [
    ['a single element fragment', '<div class="greeting">hello</div>'],
    ['multiple sibling elements', '<p>a</p><p>b</p>'],
    ['a nested fragment', '<section><span>deep</span></section>'],
    ['plain text', 'just some text'],
    ['an empty string', ''],
    ['a lone doctype', '<!DOCTYPE html>'],
    [
        'a whole document with a doctype',
        '<!DOCTYPE html><html><head><title>T</title></head><body><b>x</b></body></html>',
    ],
    ['a whole document without a doctype', '<html><head></head><body><i>y</i></body></html>'],
];

describe('DOMProvider cross-provider parity', () => {
    for (const [label, html] of cases) {
        it(`produces the same document shape for ${label}`, () => {
            const linkedom = new LinkedomDOMProvider().parseHTML(html);
            const browser = new BrowserDOMProvider().parseHTML(html);

            expect(describeDocument(linkedom)).toEqual(describeDocument(browser));
        });
    }

    it('places a bare fragment in the body (regression: KRN-REV-DOM-03)', () => {
        const document = new LinkedomDOMProvider().parseHTML('<div id="root">hello</div>');

        expect(document.documentElement?.tagName.toLowerCase()).toBe('html');
        expect(document.body.querySelector('#root')?.textContent).toBe('hello');
    });

    it('parses plain text into a reachable body instead of throwing', () => {
        const document = new LinkedomDOMProvider().parseHTML('plain text');

        expect(() => document.body).not.toThrow();
        expect(document.body.textContent).toBe('plain text');
    });

    it('parses an empty string into a reachable, empty body', () => {
        const document = new LinkedomDOMProvider().parseHTML('');

        expect(() => document.body).not.toThrow();
        expect(document.body.childNodes.length).toBe(0);
    });
});
