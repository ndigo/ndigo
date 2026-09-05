/**
 * @author Jeff Rose
 */

import { parseHTML as linkedomParseHTML } from 'linkedom';
import type { DOMProvider } from './dom-provider';

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
     * @param html - The HTML markup to parse.
     * @returns A `Document` representing the parsed HTML.
     */
    parseHTML(html: string): Document {
        const { document } = linkedomParseHTML(html);
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
