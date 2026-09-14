/**
 * @module blue-view-ejs
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AbstractTemplateView, type ProducerView, type RenderResult, ViewTarget } from '@blue/view';
import { IllegalStateError } from '@blue/core';
import type { ApplicationContext, ResourceLoader } from '@blue/context';
import type { Route } from '@blue/router';

import { EJSTemplateEngine } from './ejs-template-engine';

/**
 * Construction options for {@link EJSView}.
 */
export interface EJSViewOptions {
    /**
     * An inline EJS template source. When set, it takes precedence over any
     * `path`/{@link ResourceLoader} during rendering.
     */
    template?: string;

    /**
     * The engine used to render template source. Defaults to a fresh
     * {@link EJSTemplateEngine} when omitted.
     */
    engine?: EJSTemplateEngine;

    /**
     * Loader used to resolve template source by path when no inline
     * `template` is supplied. Falls back to the view's application context,
     * which is itself a {@link ResourceLoader}.
     */
    loader?: ResourceLoader;
}

/**
 * A view that renders an EJS template into HTML.
 *
 * The template source comes from one of two places, in order of precedence:
 *
 * 1. an inline {@link EJSView.template | `template`} string, or
 * 2. a `path` resolved through a {@link ResourceLoader} — the injected
 *    `loader`, or the view's application context.
 *
 * Like Spring MVC's self-rendering `View`, the view renders into a supplied
 * {@link ViewTarget} for fragment mode (islands, client-side DOM) and —
 * through {@link ProducerView} — produces a whole HTML page for document mode
 * (servlet/JSP-style server-side rendering).
 */
export class EJSView extends AbstractTemplateView implements ProducerView {
    /**
     * The application context, provided by the mixin via `setApplicationContext`.
     * Declared here so TypeScript can see it through the mixin inheritance chain.
     */
    readonly applicationContext?: ApplicationContext;

    readonly #engine: EJSTemplateEngine;
    readonly #loader?: ResourceLoader;
    /** Cached template source for this view's path; null until first load. */
    #source: string | null = null;

    /**
     * An inline EJS template source. When set, it takes precedence over any
     * `path`/{@link ResourceLoader}.
     */
    template?: string;

    /**
     * Creates a new EJS view.
     *
     * @param path - The template path (used with a {@link ResourceLoader}).
     * @param options - Engine and resource-loader options.
     */
    constructor(path: string | null = null, options: EJSViewOptions = {}) {
        super(path);
        this.template = options.template;
        this.#engine = options.engine ?? new EJSTemplateEngine();
        this.#loader = options.loader;
    }

    /** @inheritdoc */
    protected async _renderTemplate(templateModel: unknown, request: unknown, target?: ViewTarget): Promise<void> {
        if (!target) {
            throw new IllegalStateError('EJSView requires a ViewTarget to render.');
        }

        const html = await this.#renderHTML(templateModel);
        await target.commit(html, templateModel, request as Route);
    }

    /** @inheritdoc */
    async renderTo(model: unknown, _route: Route): Promise<RenderResult> {
        void _route;
        return {
            mediaType: this.mediaType ?? undefined,
            body: await this.#renderHTML(model),
        };
    }

    /**
     * Render the template source against the given model.
     *
     * @param model - The data model exposed to the template.
     * @returns The rendered HTML.
     */
    async #renderHTML(model: unknown): Promise<string> {
        return this.#engine.render(await this.#resolveSource(), model as object | null | undefined);
    }

    /**
     * Resolve the EJS template source for this view.
     *
     * @returns The template source text.
     * @throws {IllegalStateError} When neither an inline `template` nor a
     *   `path` with a resource loader is available.
     */
    async #resolveSource(): Promise<string> {
        if (this.template != null) {
            return this.template;
        }

        // Path-backed views load their source once and keep rendering it for
        // the view's lifetime: views are resolved and cached per name by the
        // resolver, so this is one read per template per application run.
        // Template edits on disk therefore require a restart to take effect —
        // the tradeoff that buys a filesystem read off the render path.
        if (this.#source !== null) {
            return this.#source;
        }

        const loader = this.#loader ?? this.applicationContext;
        if (!this.path || !loader) {
            throw new IllegalStateError(
                'EJSView requires either a `template` string or a `path` with a ResourceLoader.'
            );
        }

        const resource = await loader.getResource(this.path);
        if (!resource.exists) {
            throw new IllegalStateError(`EJS template not found: ${this.path}`);
        }
        this.#source = resource.value as string;
        return this.#source;
    }
}
