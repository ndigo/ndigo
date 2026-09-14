/**
 * @module blue-dom
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { DOMProvider } from './dom-provider';

/**
 * A `DOMProvider` backed by the native browser DOM APIs.
 * Requires a browser environment with `DOMParser` and `document` available.
 */
export class BrowserDOMProvider implements DOMProvider {
    #parser: DOMParser;

    get [Symbol.toStringTag](): string {
        return 'BrowserDOMProvider';
    }

    constructor() {
        this.#parser = new DOMParser();
    }

    /**
     * Parses HTML using the native `DOMParser`.
     *
     * @param html - The HTML markup to parse.
     * @returns A `Document` representing the parsed HTML.
     */
    parseHTML(html: string): Document {
        return this.#parser.parseFromString(html, 'text/html');
    }

    /**
     * Creates an element using `document.createElement`.
     *
     * @param tag - The element tag name.
     * @returns A new `Element`.
     */
    createElement(tag: string): Element {
        return document.createElement(tag);
    }

    /**
     * Creates a `DocumentFragment` using `document.createDocumentFragment`.
     *
     * @returns A new `DocumentFragment`.
     */
    createFragment(): DocumentFragment {
        return document.createDocumentFragment();
    }
}
