/**
 * @module blue-view-webcomponent
 * @since 1.0.0
 * @author Jeff Rose
 */
import { parseModel } from '@blue/view';

/**
 * Hydrates all islands in a root element: finds every `[data-blue-island]`
 * marker, connects it to its serialized `data-blue-model`, and drives the
 * element's first render.
 *
 * Two shapes are supported:
 *
 * - **Declarative Shadow DOM (DSD).** When the server emitted a
 *   `<template shadowrootmode="open">` child, the browser's HTML parser has
 *   already created a real shadow root on the marker before any script runs.
 *   That root is adopted *in place* — the element is upgraded (not re-created)
 *   and handed the locale/model, so the component's first render replaces the
 *   server-rendered fallback. Re-creating the element would discard the
 *   parsed root (and re-parse the fallback); `replaceWith` is therefore never
 *   used on this path.
 * - **Legacy light-DOM markers.** Without a shadow root, the inert SSR
 *   markup is replaced with a freshly constructed live element, as before.
 *
 * Custom elements must already be defined (`customElements.define` via
 * `@TagMapping` at module import) for synchronous upgrade; otherwise the
 * element stays an `HTMLUnknownElement` and is left untouched.
 *
 * @param root - The root element to scan; defaults to `document`.
 * @returns The number of islands hydrated.
 *
 * @example
 * ```ts
 * import { hydrateIslands } from '@blue/view-webcomponent';
 * const n = hydrateIslands();
 * ```
 *
 * @since 1.0.0
 */
export function hydrateIslands(root: ParentNode = document): number {
    const markers = root.querySelectorAll<HTMLElement>('[data-blue-island][data-blue-model]');
    let hydrated = 0;

    markers.forEach((inert) => {
        const tagName = inert.tagName.toLowerCase();
        if (!customElements.get(tagName)) {
            return; // not defined on the client — leave as static markup
        }

        const model = parseModel(inert.getAttribute('data-blue-model') ?? undefined);
        const locale = inert.getAttribute('data-blue-locale');

        // DSD: the HTML parser already attached the declarative shadow root
        // (`inert.shadowRoot`) before the element was defined. Upgrade the
        // marker in place — re-creating it would drop the parsed root — and
        // let the component's first render replace the server fallback.
        if (inert.shadowRoot) {
            customElements.upgrade(inert);
            // Order matters: set the locale and model (which may read on
            // connect) after upgrade, so the component's setters/render see them.
            if (locale) {
                assignLocale(inert, locale);
            }
            assignModel(inert, model);
            hydrated += 1;
            return;
        }

        const live = document.createElement(tagName);
        live.setAttribute('data-blue-island', '');
        live.setAttribute('data-blue-model', inert.getAttribute('data-blue-model') ?? '');

        // Order matters: set the locale and model (which may read on connect)
        // before replacing, so connectedCallback sees them.
        if (locale) {
            assignLocale(live, locale);
        }
        assignModel(live, model);

        inert.replaceWith(live);
        hydrated += 1;
    });

    return hydrated;
}

/**
 * Copies the negotiated locale onto a web-component element via its `locale`
 * setter (or an expando when no setter exists).
 */
function assignLocale(element: HTMLElement, locale: string): void {
    const localeAware = element as HTMLElement & { locale?: string };
    localeAware.locale = locale;
}

/**
 * Copies the parsed model onto a web-component element via its `.model` setter
 * (or an expando when no setter exists).
 */
function assignModel(element: HTMLElement, model: unknown): void {
    const modelAware = element as HTMLElement & { model?: unknown };
    // Setting .model invokes the component's model setter when declared;
    // otherwise it becomes an expando the render can read.
    modelAware.model = model;
}
