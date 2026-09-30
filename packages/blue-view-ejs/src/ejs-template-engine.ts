/**
 * @module blue-view-ejs
 * @since 1.0.0
 * @author Jeff Rose
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

/** Cap on concurrently compiled template sources. */
const MAX_COMPILED = 64;

/**
 * Renders EJS template strings to HTML using the `ejs` package.
 *
 * The adapter operates purely on a source string and returns a string, so it is
 * platform-agnostic: it runs identically in Node and in a browser/jsdom test
 * environment. File resolution for path-backed views is owned by an injected
 * `ResourceLoader` (see `@blue/context`), keeping this package free of
 * platform I/O.
 *
 * Templates are compiled in **async mode** (`async: true`): methods are async
 * by convention in BlueJS, so locale helpers like `t` resolve to promises and
 * template expressions await them (`<%= await t('key') %>`). Plain synchronous
 * interpolations are unaffected.
 *
 * Templates are **compiled once per source string** and the compiled function
 * reused for every subsequent render — `ejs.render` re-compiles on every call,
 * and ejs's own cache requires a `filename` (+ `cache: true`), which the
 * engine never had. The compiled cache is bounded: when it exceeds its cap
 * it resets so long-lived processes cannot grow
 * it without limit. A template's compiled form therefore reflects the first
 * source seen for that string; inline templates are immutable strings, so
 * this is unobservable for all practical usage.
 */
export class EJSTemplateEngine {
    readonly #options: ejs.Options;
    readonly #compiled = new Map<string, ejs.AsyncTemplateFunction>();

    constructor(options: EJSTemplateEngineOptions = {}) {
        // `async: true` is non-negotiable: locale helpers resolve to promises,
        // so `await` must be legal in template bodies.
        this.#options = { ...options.options, async: true };
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
            const asyncOptions = this.#options as ejs.Options & { async: true; client?: false };
            // Options always carry `async: true` (forced in the constructor),
            // so the compile overload resolution picks the async template fn.
            compiled = ejs.compile(template, asyncOptions) as ejs.AsyncTemplateFunction;
            if (this.#compiled.size >= MAX_COMPILED) {
                this.#compiled.clear();
            }
            this.#compiled.set(template, compiled);
        }
        return compiled(model ?? {});
    }
}
