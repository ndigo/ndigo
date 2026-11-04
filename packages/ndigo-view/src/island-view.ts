/**
 * @module ndigo-view
 * @since 1.0.0
 * @author Jeff Rose
 */
import { FrameworkError } from '@ndigo/core';
import type { Route } from '@ndigo/router';
import { LANGUAGE_ATTRIBUTE } from '@ndigo/router';
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
 * `data-ndigo-model`, so this function treats `raw` as plain JSON and parses it
 * directly. Decoding a second time here would corrupt any model text that was
 * entity-escaped by {@link serializeModel} (e.g. a literal `&lt;script&gt;`
 * would become a live element after hydration).
 *
 * @param raw - The `data-ndigo-model` attribute value as returned by
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
 * Pattern for a valid custom-element tag name (the autonomous-custom-element
 * subset of the HTML "valid custom element name" grammar): a lowercase ASCII
 * letter, then name characters with at least one hyphen. Uppercase, leading
 * hyphens, spaces, and markup metacharacters are rejected — the name is
 * interpolated raw into generated markup, so an unvalidated name is an
 * injection vector.
 *
 * Deliberately a strict ASCII subset: the spec's non-ASCII PCENChar range
 * (e.g. `x-føø`, `x-你好`) is rejected until the grammar is widened — see
 * {@link isValidCustomElementName} (VIEW-6).
 */
export const customElementNamePattern = /^[a-z][a-z0-9._]*-[a-z0-9._-]*$/;

/**
 * Custom element names the platform reserves for built-in elements; the HTML
 * spec forbids registering these as custom elements.
 */
const RESERVED_CUSTOM_ELEMENT_NAMES: Record<string, true> = {
    'annotation-xml': true,
    'color-profile': true,
    'font-face': true,
    'font-face-src': true,
    'font-face-uri': true,
    'font-face-format': true,
    'font-face-name': true,
    'missing-glyph': true,
};

/**
 * Returns whether `name` is a valid, non-reserved custom-element tag name.
 *
 * The check is intentionally stricter than the platform grammar: only ASCII
 * names are accepted (see `customElementNamePattern`), so a
 * spec-valid non-ASCII component name is rejected (VIEW-6 — widen the
 * grammar when a real consumer needs it).
 *
 * @param name - The candidate tag name.
 * @returns `true` when the name may be used as a custom element tag.
 */
export function isValidCustomElementName(name: string): boolean {
    return customElementNamePattern.test(name) && !(name in RESERVED_CUSTOM_ELEMENT_NAMES);
}

/**
 * Construction options for {@link IslandView}.
 */
export interface IslandViewOptions {
    /**
     * Trusted, author/design-system-supplied markup rendered inside a
     * Declarative Shadow DOM `<template shadowrootmode="open">` wrapper
     * (Baseline since 2024).
     *
     * **Trusted markup only — never user input.** The value is interpolated
     * raw into the generated markup (exactly like an inline template), so an
     * untrusted value would be a direct XSS vector. Its purpose is
     * content-first paint — the first byte of HTML shows real content instead
     * of an empty element — and third-party components that cannot
     * server-render. Browsers parse the template into a real shadow root
     * before any script runs; `hydrateIslands()` then upgrades the element in
     * place and the component's first render replaces this fallback.
     */
    shadowHtml?: string;
}

/**
 * A server-rendered HTML view for partial hydration ("islands").
 *
 * Renders an inert custom-element marker carrying the serialized view model:
 *
 * ```html
 * <my-element data-ndigo-island data-ndigo-model="&quot;{...}&quot;"></my-element>
 * ```
 *
 * When {@link IslandViewOptions.shadowHtml} is supplied, the marker also
 * carries a declarative shadow root so the first paint shows real content:
 *
 * ```html
 * <my-element data-ndigo-island data-ndigo-model="&quot;{...}&quot;"><template shadowrootmode="open">…fallback…</template></my-element>
 * ```
 *
 * It is fully server-safe (no `customElements`, no DOM, no component-module
 * import): it serializes only the model into markup. On the client,
 * `hydrateIslands()` (from `@ndigo/view-webcomponent`) finds the marker,
 * adopts the parser-created shadow root (when present) or constructs the
 * element, sets `.model`, and lets `connectedCallback` run.
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
     * Trusted first-paint markup for a declarative shadow root, when supplied.
     */
    readonly shadowHtml: string | undefined;

    /**
     * Creates an island view for the given custom element tag.
     *
     * The tag name is interpolated raw into the rendered markup, so it is
     * validated against the custom-element grammar here — construction fails
     * loudly instead of emitting attacker-controlled markup.
     *
     * @param name - The custom element tag name.
     * @param options - Island rendering options ({@link IslandViewOptions.shadowHtml}).
     * @throws {FrameworkError} When `name` is not a valid custom-element name.
     */
    constructor(name: string, options: IslandViewOptions = {}) {
        super();
        if (!isValidCustomElementName(name)) {
            throw new FrameworkError(
                `IslandView requires a valid custom-element tag name (lowercase, hyphenated, non-reserved): received "${name}".`
            );
        }
        this.tagName = name;
        this.shadowHtml = options.shadowHtml;
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

        // `shadowHtml` is trusted markup (see {@link IslandViewOptions.shadowHtml});
        // it is deliberately NOT escaped — the browser parses it into a real
        // shadow root, giving the island a content-first paint.
        const shadowRoot =
            this.shadowHtml != null ? `<template shadowrootmode="open">${this.shadowHtml}</template>` : '';

        const html = `<${this.tagName} data-ndigo-island data-ndigo-locale="${escapeAttributeValue(locale)}" data-ndigo-model="${serializeModel(templateModel)}">${shadowRoot}</${this.tagName}>`;
        // The view target's commit slot expects the route; the request is what the view pipeline supplies.
        await target.commit(html, templateModel, request as Route);
    }
}
