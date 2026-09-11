/**
 * @blue/view-ejs — EJS view.
 *
 * @module
 * @since 1.0.0
 */

import { AbstractTemplateView, ViewTarget } from '@blue/view';
import { IllegalStateError } from '@blue/core';
import type { Route } from '@blue/router';

import { EjsTemplateEngine } from './ejs-template-engine';
import type { TemplateSourceProvider } from './template-source-provider';

/**
 * Construction options for {@link EJSView}.
 */
export interface EJSViewOptions {
    /**
     * An inline EJS template source. When set, it takes precedence over any
     * `path`/{@link TemplateSourceProvider} during rendering.
     */
    template?: string;

    /**
     * The engine used to render template source. Defaults to a fresh
     * {@link EjsTemplateEngine} when omitted.
     */
    engine?: EjsTemplateEngine;

    /**
     * Provider used to resolve template source by path when no inline
     * `template` is supplied.
     */
    provider?: TemplateSourceProvider;
}

/**
 * A view that renders an EJS template into HTML.
 *
 * The template source comes from one of two places, in order of precedence:
 *
 * 1. an inline {@link EJSView.template | `template`} string, or
 * 2. a `path` resolved through an injected {@link TemplateSourceProvider}.
 *
 * Rendering produces a string committed to the supplied {@link ViewTarget}, so
 * the same view serves Node HTTP responses, browser SSR DOM, or a DOM-free
 * capture target in tests — it never touches a platform directly. This mirrors
 * Spring MVC's self-rendering `View`: the dispatcher resolves the view and lets
 * it render into whatever target the platform provides.
 */
export class EJSView extends AbstractTemplateView {
    readonly #engine: EjsTemplateEngine;
    readonly #provider?: TemplateSourceProvider;

    /**
     * An inline EJS template source. When set, it takes precedence over any
     * `path`/{@link TemplateSourceProvider}.
     */
    template?: string;

    /**
     * Creates a new EJS view.
     *
     * @param path - The template path (used with a {@link TemplateSourceProvider}).
     * @param options - Engine and source-provider options.
     */
    constructor(path: string | null = null, options: EJSViewOptions = {}) {
        super(path);
        this.template = options.template;
        this.#engine = options.engine ?? new EjsTemplateEngine();
        this.#provider = options.provider;
    }

    /** @inheritdoc */
    protected async _renderTemplate(
        templateModel: unknown,
        request: unknown,
        target?: ViewTarget,
    ): Promise<void> {
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
     *   `path` with a {@link TemplateSourceProvider} is available.
     */
    async #resolveSource(): Promise<string> {
        if (this.template != null) {
            return this.template;
        }

        if (this.path && this.#provider) {
            const source = await this.#provider.loadTemplate(this.path);
            if (source == null) {
                throw new IllegalStateError(`EJS template not found: ${this.path}`);
            }
            return source;
        }

        throw new IllegalStateError(
            'EJSView requires either a `template` string or a `path` with a TemplateSourceProvider.',
        );
    }
}
