/**
 */
import { AbstractTemplateView, type ProducerView, type RenderResult, ViewTarget } from '@ndigo/view';
import { IllegalStateError } from '@ndigo/core';
import {
    createFormattingService,
    type DateTimeFormatOptions,
    type ListFormatOptions,
    type NumberFormatOptions,
    type RelativeTimeFormatOptions,
} from '@ndigo/core';
import type { MessageParams } from '@ndigo/content';
import { normalizeLocale } from '@ndigo/content';
import type { ApplicationContext, ResourceLoader } from '@ndigo/context';
import { LANGUAGE_ATTRIBUTE, type Route } from '@ndigo/router';

import { EJSTemplateEngine } from './ejs-template-engine';

const DEFAULT_LOCALE = 'en-US';

/**
 * Locale-aware template locals injected by {@link EJSView}.
 *
 * `t` resolves messages through the view's application context (itself a
 * MessageSource from `@ndigo/content`); the formatter helpers wrap `Intl` through
 * `@ndigo/core` formatters and use the request's negotiated language.
 */
export interface EJSLocaleHelpers {
    /**
     * The negotiated language for the current request.
     */
    locale: string;
    /**
     * Formats a message key; falls back to the key when unavailable.
     * Async by convention — templates call it as `await t(…)`.
     */
    t(key: string, params?: MessageParams): Promise<string>;
    /**
     * Formats a date value in the request locale.
     */
    formatDate(value: Date | string | number, options?: DateTimeFormatOptions): string;
    /**
     * Formats a number in the request locale.
     */
    formatNumber(value: number, options?: NumberFormatOptions): string;
    /**
     * Formats a relative-time delta in the request locale.
     */
    formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit, options?: RelativeTimeFormatOptions): string;
    /**
     * Formats a string list in the request locale.
     */
    formatList(values: readonly string[], options?: ListFormatOptions): string;
}

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
 * Like a self-rendering `View`, the view renders into a supplied
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

    /** {@inheritDoc} */
    protected async _renderTemplate(templateModel: unknown, request: unknown, target?: ViewTarget): Promise<void> {
        if (!target) {
            throw new IllegalStateError('EJSView requires a ViewTarget to render.');
        }

        const html = await this.#renderHTML(templateModel, request as Route);
        await target.commit(html, templateModel, request as Route);
    }

    /** {@inheritDoc} */
    async renderTo(model: unknown, route: Route): Promise<RenderResult> {
        return {
            mediaType: this.mediaType ?? undefined,
            body: await this.#renderHTML(model, route),
        };
    }

    /**
     * Render the template source against the given model, enriched with the
     * locale helpers for the current request.
     *
     * @param model - The data model exposed to the template.
     * @param route - The current route (provides the negotiated language).
     * @returns The rendered HTML.
     */
    async #renderHTML(model: unknown, route: Route): Promise<string> {
        const helpers = this.#localeHelpers(route);
        // Spread the model first (arrays, objects, and scalar strings all
        // contribute their enumerable slots) so non-object models keep their
        // data accessible; helpers win on collision. A `null`/undefined model
        // contributes nothing (spreading null throws).
        const base = model != null ? { ...(model as object) } : {};
        const locals = { ...base, ...helpers };

        // Thread the template path so `include(...)` can resolve relative
        // includes next to the template. Inline templates have no path, so
        // relative includes cannot resolve for them.
        const filename = this.template != null ? undefined : (this.path ?? undefined);
        return this.#engine.render(await this.#resolveSource(), locals, filename);
    }

    /**
     * Builds the locale-aware template helpers for a request.
     *
     * @param route - The current route.
     * @returns The helper locals.
     */
    #localeHelpers(route: Route): EJSLocaleHelpers {
        const rawLocale = route.attributes?.[LANGUAGE_ATTRIBUTE];
        // Validated at the boundary: junk attributes (hand-rolled routes,
        // corrupted adapters) fall back instead of throwing inside Intl.
        const locale = normalizeLocale(rawLocale) ?? DEFAULT_LOCALE;
        const format = createFormattingService({ locale });
        const messages = this.applicationContext;

        return {
            locale,
            t: async (key: string, params?: MessageParams) => (await messages?.getMessage(key, params, locale)) ?? key,
            formatDate: (value: Date | string | number, options?: DateTimeFormatOptions) =>
                format.date(options).format(value),
            formatNumber: (value: number, options?: NumberFormatOptions) => format.number(options).format(value),
            formatRelativeTime: (
                value: number,
                unit: Intl.RelativeTimeFormatUnit,
                options?: RelativeTimeFormatOptions
            ) => format.relativeTime(options).format(value, unit),
            formatList: (values: readonly string[], options?: ListFormatOptions) => format.list(options).format(values),
        };
    }

    /**
     * Resolve the EJS template source for this view.
     *
     * @returns The template source text.
     * @throws When neither an inline `template` nor a
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
