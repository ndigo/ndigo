/**
 * Error-page view resolution.
 *
 * BlueJS views produce `200` by default; a status-bearing page (the reference
 * app answers an unknown owner with the 404 page, not with a problem
 * document) therefore needs a view that carries the status. This module is
 * that seam, and it is the only place in the app that knows about it:
 *
 * - {@link NOT_FOUND_VIEW} is the logical name controllers return.
 * - {@link StatusEJSView} is an `@blue/view-ejs` page that produces its status
 *   alongside the rendered document — it extends `EJSView`, so the dispatcher
 *   injects the application context into it exactly as it does for a plain
 *   page and the template's `t(...)` helpers keep resolving messages.
 * - {@link StatusViewResolver} is the view resolver registered by the app
 *   configuration: it maps the configured names to status-bearing pages and
 *   delegates every other name to the standard `EJSViewResolver`.
 *
 * @module blue-petclinic
 * @since 1.0.0
 * @author Jeff Rose
 */
import { EJSView, type EJSViewOptions } from '@blue/view-ejs';
import type { ResourceLoader } from '@blue/context';
import type { Route } from '@blue/router';
import type { RenderResult, View, ViewResolver } from '@blue/view';

/** The 404 page's logical view name (`views/error/not-found.ejs`). */
export const NOT_FOUND_VIEW = 'error/not-found';

/** An EJS page that produces an explicit HTTP status with its document. */
export class StatusEJSView extends EJSView {
    readonly #status: number;

    /**
     * @param path - The template path (prefix + name + suffix).
     * @param status - The HTTP status to produce.
     * @param options - The template engine/loader options of the page resolver.
     */
    constructor(path: string, status: number, options: EJSViewOptions) {
        super(path, options);
        this.#status = status;
    }

    /** @inheritdoc */
    override async renderTo(model: unknown, route: Route): Promise<RenderResult> {
        return { ...(await super.renderTo(model, route)), status: this.#status };
    }
}

/** The path framing and media type of the pages this resolver builds. */
export interface StatusViewResolverOptions {
    /** Directory holding the EJS templates, with a trailing separator. */
    prefix: string;
    /** Template file extension (e.g. `.ejs`). */
    suffix: string;
    /** Loader the pages read their template source through. */
    loader: ResourceLoader;
    /** Logical view name → HTTP status. Names outside the table are delegated. */
    statuses: Record<string, number | undefined>;
}

/**
 * Resolves error pages with their status, and everything else through the
 * standard EJS resolver.
 *
 * Status views are built once and cached: their names come from configuration
 * (never from the request), so the cache is fixed-size and the template source
 * is read a single time per page.
 */
export class StatusViewResolver implements ViewResolver {
    readonly #delegate: ViewResolver;
    readonly #options: StatusViewResolverOptions;
    readonly #cached = new Map<string, StatusEJSView>();

    /**
     * @param delegate - The resolver serving every non-status view name.
     * @param options - Path framing, loader and the status table.
     */
    constructor(delegate: ViewResolver, options: StatusViewResolverOptions) {
        this.#delegate = delegate;
        this.#options = options;
    }

    /**
     * Resolves a view name to a page, attaching the configured status when the
     * name is a status-bearing page.
     *
     * @param name - The logical view name.
     * @param language - Optional locale hint (delegated resolvers may use it).
     * @param request - Optional per-call request (delegated resolvers may use it).
     * @returns The view, or `null` when nothing resolves the name.
     */
    async resolveViewName(name: string, language?: unknown, request?: unknown): Promise<View | null> {
        const status = this.#options.statuses[name];
        if (status !== undefined) {
            const cached = this.#cached.get(name);
            if (cached !== undefined) {
                return cached;
            }
            const { prefix, suffix, loader } = this.#options;
            const page = new StatusEJSView(`${prefix}${name}${suffix}`, status, { loader });
            this.#cached.set(name, page);
            return page;
        }
        return this.#delegate.resolveViewName(name, language, request);
    }
}
