/**
 * @blue/view-ejs — EJS template engine adapter.
 *
 * @module
 * @since 1.0.0
 */

import ejs from 'ejs';

/**
 * Options accepted by {@link EjsTemplateEngine}.
 */
export interface EjsTemplateEngineOptions {
    /**
     * EJS render options forwarded to `ejs.render` (delimiter, cache, root,
     * strict, etc.).
     */
    options?: ejs.Options;
}

/**
 * Renders EJS template strings to HTML using the `ejs` package.
 *
 * The adapter operates purely on a source string and returns a string, so it is
 * platform-agnostic: it runs identically in Node and in a browser/jsdom test
 * environment. File resolution for path-backed views is owned by an injected
 * {@link TemplateSourceProvider}, keeping this package free of platform I/O.
 */
export class EjsTemplateEngine {
    readonly #options: ejs.Options;

    constructor(options: EjsTemplateEngineOptions = {}) {
        this.#options = options.options ?? {};
    }

    /**
     * Render an EJS template string against the given model.
     *
     * @param template - The EJS template source.
     * @param model - The data model exposed to the template.
     * @returns The rendered HTML string.
     */
    async render(template: string, model: object | null | undefined): Promise<string> {
        return ejs.render(template, model ?? {}, this.#options);
    }
}
