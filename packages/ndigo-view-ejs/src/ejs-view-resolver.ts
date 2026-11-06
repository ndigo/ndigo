/**
 */
import { AbstractPathBasedViewResolver, View } from '@ndigo/view';
import { MediaTypes } from '@ndigo/core';

import { EJSView, EJSViewOptions } from './ejs-view';

/**
 * Construction options for {@link EJSViewResolver}. Extends the shared view
 * options with the path framing this resolver applies around each name.
 */
export interface EJSViewResolverOptions extends EJSViewOptions {
    /** Prefix applied before the resolved view name (e.g. `views/`). */
    prefix?: string;
    /** Suffix applied after the resolved view name (e.g. `.html`). */
    suffix?: string;
}

/**
 * Resolves logical view names to {@link EJSView} instances by applying a
 * prefix and suffix around the name (e.g. `views/` + name + `.html`).
 *
 * This is the Ndigo equivalent of the classic `InternalResourceViewResolver`: it
 * maps a controller's returned view name to a template on disk. Restrict the
 * names it serves by setting {@link EJSViewResolver.viewNames}; when left null
 * every name is resolved.
 */
export class EJSViewResolver extends AbstractPathBasedViewResolver {
    readonly #options: EJSViewResolverOptions;

    /**
     * Creates a new EJS view resolver.
     *
     * @param options - Engine, resource-loader, and path-framing options shared by resolved views.
     */
    constructor(options: EJSViewResolverOptions = {}) {
        super();
        this.mediaType = MediaTypes.TEXT_HTML?.withCharset('UTF-8') ?? null;
        if (options.prefix != null) {
            this.prefix = options.prefix;
        }
        if (options.suffix != null) {
            this.suffix = options.suffix;
        }
        this.#options = options;
    }

    /** @inheritdoc */
    protected async _loadView(name: string, language?: unknown): Promise<View | null> {
        if (this.viewNames && !this.supports(name, language)) {
            return null;
        }

        // A request-derived name must never escape the prefix: a
        // `..`/absolute/NUL name is unresolved (not-found), so the template
        // outside the views root is never read or evaluated.
        if (!this.isSafeViewName(name)) {
            return null;
        }

        return new EJSView(`${this.prefix}${name}${this.suffix}`, {
            engine: this.#options.engine,
            loader: this.#options.loader,
        });
    }
}
