/**
 * @module ndigo-dom
 * @since 1.0.0
 * @author Jeff Rose
 */
import { parseHTML as linkedomParseHTML } from 'linkedom';
import type { DOMProvider } from './dom-provider';

/**
 * Matches input that already carries an `<html>` root, so it is handed to
 * linkedom verbatim instead of being wrapped as a fragment. Detection keys on
 * `<html>` (not the doctype): a lone `<!DOCTYPE html>` is still not a document
 * linkedom can build, so it must be wrapped like any other fragment.
 */
const fullDocumentPattern = /<html[\s>]/i;

/**
 * A `DOMProvider` backed by linkedom for server-side or isomorphic
 * DOM operations without a real browser environment.
 */
export class LinkedomDOMProvider implements DOMProvider {
    #document: Document;

    get [Symbol.toStringTag](): string {
        return 'LinkedomDOMProvider';
    }

    constructor() {
        // Create an initial empty document as a baseline for element/fragment creation
        const { document } = linkedomParseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
        this.#document = document as Document;
    }

    /**
     * Parses HTML using linkedom.
     *
     * linkedom only assembles a real document when given a whole document: a
     * bare fragment like `<div>hello</div>` becomes the *document element*
     * (with an empty `<head>`/`<body>` nested inside it), and plain text or an
     * empty string leave `document.documentElement` null so any `body` access
     * throws. A browser `DOMParser` always yields `<html><head></head><body>…
     * fragment …</body></html>` instead. Fragments are therefore wrapped in
     * that skeleton so the `DOMProvider` contract holds identically across
     * providers.
     *
     * @param html - The HTML markup to parse.
     * @returns A `Document` representing the parsed HTML.
     */
    parseHTML(html: string): Document {
        const markup = fullDocumentPattern.test(html)
            ? html
            : `<!DOCTYPE html><html><head></head><body>${html}</body></html>`;
        const { document } = linkedomParseHTML(markup);
        return document as Document;
    }

    /**
     * Creates an element using the linkedom document.
     *
     * @param tag - The element tag name.
     * @returns A new `Element`.
     */
    createElement(tag: string): Element {
        return this.#document.createElement(tag) as Element;
    }

    /**
     * Creates a `DocumentFragment` using the linkedom document.
     *
     * @returns A new `DocumentFragment`.
     */
    createFragment(): DocumentFragment {
        return this.#document.createDocumentFragment() as DocumentFragment;
    }
}
