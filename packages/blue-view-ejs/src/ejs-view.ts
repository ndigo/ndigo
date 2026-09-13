/**
 * @blue/view-ejs — EJS view.
 *
 * @module
 * @since 1.0.0
 */

import { AbstractTemplateView, ViewTarget } from '@blue/view';
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
 * Rendering produces a string committed to the supplied {@link ViewTarget}, so
 * the same view serves Node HTTP responses, browser SSR DOM, or a DOM-free
 * capture target in tests — it never touches a platform directly. This mirrors
 * Spring MVC's self-rendering `View`: the dispatcher resolves the view and lets
 * it render into whatever target the platform provides.
 */
export class EJSView extends AbstractTemplateView {
    /**
     * The application context, provided by the mixin via `setApplicationContext`.
     * Declared here so TypeScript can see it through the mixin inheritance chain.
     */
    readonly applicationContext?: ApplicationContext;

    readonly #engine: EJSTemplateEngine;
    readonly #loader?: ResourceLoader;

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

        const html = await this.#engine.render(await this.#resolveSource(), templateModel as object | null | undefined);
        await target.commit(html, templateModel, request as Route);
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
        return resource.value as string;
    }
}
