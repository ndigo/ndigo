/**
 * @module blue-view
 * @since 1.0.0
 * @author Jeff Rose
 */
import { FrameworkError } from '@blue/core';
import type { Route } from '@blue/router';
import { LANGUAGE_ATTRIBUTE } from '@blue/router';
import { AbstractTemplateView } from './view';
import { ViewTarget } from './view-target';

/**
 * Escapes a string for safe embedding in a double-quoted HTML attribute.
 *
 * @param value - The raw value.
 * @returns The value with HTML metacharacters entity-escaped.
 */
const escapeAttributeValue = (value: string): string =>
    value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Serializes a view model into a JSON string safe to embed in an HTML attribute.
 *
 * @param model - The model to serialize.
 * @returns The JSON string with HTML entities escaped.
 */
export function serializeModel(model: unknown): string {
    const json = JSON.stringify(model ?? null);
    return escapeAttributeValue(json);
}

/**
 * Parses a serialized island model back into a JS value.
 *
 * The input MUST already be the browser-delivered, ONE-LEVEL-decoded attribute
 * value: the HTML parser decodes `&quot;`/`&amp;`/`&lt;`/`&gt;` when it reads
 * `data-blue-model`, so this function treats `raw` as plain JSON and parses it
 * directly. Decoding a second time here would corrupt any model text that was
 * entity-escaped by {@link serializeModel} (e.g. a literal `&lt;script&gt;`
 * would become a live element after hydration).
 *
 * @param raw - The `data-blue-model` attribute value as returned by
 *   `getAttribute` (one-level HTML-decoded by the DOM parser).
 * @returns The parsed model, or `null` when absent/invalid.
 */
export function parseModel(raw: string | undefined): unknown {
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

/**
 * A server-rendered HTML view for partial hydration ("islands").
 *
 * Renders an inert custom-element marker carrying the serialized view model:
 *
 * ```html
 * <my-element data-blue-island data-blue-model="&quot;{...}&quot;"></my-element>
 * ```
 *
 * It is fully server-safe (no `customElements`, no DOM, no component-module
 * import): it serializes only the model into markup. On the client,
 * `hydrateIslands()` (from `@blue/view-webcomponent`) finds the marker,
 * constructs the element, sets `.model`, and lets `connectedCallback` run.
 *
 * @example
 * ```ts
 * return new ModelAndView(new IslandView('todo-app'), { items: [...], filter: 'all' });
 * ```
 *
 * @since 1.0.0
 */
export class IslandView extends AbstractTemplateView {
    /**
     * The custom element tag name hydrated on the client.
     */
    readonly tagName: string;

    /**
     * Creates an island view for the given custom element tag.
     *
     * @param name - The custom element tag name.
     */
    constructor(name: string) {
        super();
        this.tagName = name;
    }

    /**
     * Renders the island markup: the element tag with the serialized model.
     *
     * @param templateModel - The view model to serialize.
     * @param request - The current request (unused).
     * @param target - The view target to commit the HTML string to.
     */
    protected async _renderTemplate(templateModel: unknown, request: unknown, target?: ViewTarget): Promise<void> {
        if (!target) {
            throw new FrameworkError('IslandView requires a ViewTarget to render.');
        }

        // The resolved request language rides along so the hydrated element
        // can format identically to the server-rendered output (AD-19 D5).
        // Escaped like the model: the attribute sits in generated markup and
        // the value may originate from request headers.
        const rawLocale = (request as Route | null)?.attributes?.[LANGUAGE_ATTRIBUTE];
        const locale = typeof rawLocale === 'string' ? rawLocale : '';

        const html = `<${this.tagName} data-blue-island data-blue-locale="${escapeAttributeValue(locale)}" data-blue-model="${serializeModel(templateModel)}"></${this.tagName}>`;
        // The view target's commit slot expects the route; the request is what the view pipeline supplies.
        await target.commit(html, templateModel, request as Route);
    }
}
