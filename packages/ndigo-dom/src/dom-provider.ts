/**
 * Provides an isomorphic abstraction over DOM parsing and element creation.
 */
export interface DOMProvider {
    /**
     * Parses an HTML string into a `Document`.
     *
     * @param html - The HTML markup to parse.
     * @returns A `Document` representing the parsed HTML.
     */
    parseHTML(html: string): Document;

    /**
     * Creates a new element with the given tag name.
     *
     * @param tag - The element tag name (e.g., `'div'`, `'span'`).
     * @returns A new `Element` instance.
     */
    createElement(tag: string): Element;

    /**
     * Creates a new empty `DocumentFragment`.
     *
     * @returns A new `DocumentFragment`.
     */
    createFragment(): DocumentFragment;
}
