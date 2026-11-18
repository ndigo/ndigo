/**
 * Provides an isomorphic abstraction over DOM parsing and element creation.
 */
export interface DOMProvider {
    /**
     * Parses an HTML string into a `Document`.
     *
     * @param html - The HTML markup to parse.
     * @returns A `Document` representing the parsed HTML.
     *
     * @example
     * ```ts
     * const provider = await createDOMProvider();
     * const doc = provider.parseHTML('<p>Hello</p>');
     * console.log(doc.body.textContent); // "Hello"
     * ```
     */
    parseHTML(html: string): Document;

    /**
     * Creates a new element with the given tag name.
     *
     * @param tag - The element tag name (e.g., `'div'`, `'span'`).
     * @returns A new `Element` instance.
     *
     * @example
     * ```ts
     * const provider = await createDOMProvider();
     * const div = provider.createElement('div');
     * div.textContent = 'Hello';
     * ```
     */
    createElement(tag: string): Element;

    /**
     * Creates a new empty `DocumentFragment`.
     *
     * @returns A new `DocumentFragment`.
     *
     * @example
     * ```ts
     * const provider = await createDOMProvider();
     * const fragment = provider.createFragment();
     * fragment.appendChild(provider.createElement('span'));
     * ```
     */
    createFragment(): DocumentFragment;
}
