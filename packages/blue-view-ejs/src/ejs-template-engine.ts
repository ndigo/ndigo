/**
 * @blue/view-ejs — EJS template engine adapter.
 *
 * @module
 * @since 1.0.0
 */

import ejs from 'ejs';

/**
 * Options accepted by {@link EJSTemplateEngine}.
 */
export interface EJSTemplateEngineOptions {
    /**
     * EJS render options forwarded to `ejs.render` (delimiter, cache, root,
     * strict, etc.).
     */
    options?: ejs.Options;
}

/** A compiled EJS template function: model in, rendered string out. */
type CompiledTemplate = (data: object) => string;

/** Cap on concurrently compiled template sources. */
const MAX_COMPILED = 64;

/**
 * Renders EJS template strings to HTML using the `ejs` package.
 *
 * The adapter operates purely on a source string and returns a string, so it is
 * platform-agnostic: it runs identically in Node and in a browser/jsdom test
 * environment. File resolution for path-backed views is owned by an injected
 * {@link ResourceLoader}, keeping this package free of platform I/O.
 *
 * Templates are **compiled once per source string** and the compiled function
 * reused for every subsequent render — `ejs.render` re-compiles on every call,
 * and ejs's own cache requires a `filename` (+ `cache: true`), which the
 * engine never had. The compiled cache is bounded: when it exceeds
 * {@link MAX_COMPILED} entries it resets so long-lived processes cannot grow
 * it without limit. A template's compiled form therefore reflects the first
 * source seen for that string; inline templates are immutable strings, so
 * this is unobservable for all practical usage.
 */
export class EJSTemplateEngine {
    readonly #options: ejs.Options;
    readonly #compiled = new Map<string, CompiledTemplate>();

    constructor(options: EJSTemplateEngineOptions = {}) {
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
        let compiled = this.#compiled.get(template);
        if (compiled === undefined) {
            const compileSync = ejs.compile as (source: string, options?: ejs.Options) => CompiledTemplate;
            compiled = compileSync(template, this.#options);
            if (this.#compiled.size >= MAX_COMPILED) {
                this.#compiled.clear();
            }
            this.#compiled.set(template, compiled);
        }
        return compiled(model ?? {});
    }
}