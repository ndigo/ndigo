/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { getLogger } from '@ndigo/log';

/**
 * Module logger: hydration failures are logged per island, following the
 * configured logger (console bridge or OpenTelemetry), instead of being thrown
 * — one broken marker cannot take the page down (HI-2/WC-A).
 */
const logger = getLogger('ndigo-view-webcomponent:hydrate');

/**
 * Marker attribute set on an island once its hydration completed, so a
 * repeated scan skips it (WC-B idempotence).
 */
const HYDRATED_ATTRIBUTE = 'data-ndigo-hydrated';

/**
 * Sentinel returned by {@link readModel} for a `data-ndigo-model` value that is
 * present but not valid JSON.
 *
 * `@ndigo/view`'s `parseModel` returns `null` for both the absent/empty case and
 * the malformed case; hydration must tell them apart so a garbage payload can
 * keep the server fallback instead of being assigned to the component as
 * `null` (WC-A).
 */
const UNPARSEABLE = Symbol('unparseable model');

/**
 * Hydrates all islands in a root element: finds every `[data-ndigo-island]`
 * marker, connects it to its serialized `data-ndigo-model`, and drives the
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
 * Each marker is hydrated in isolation: a component whose setter or render
 * throws is logged and skipped, and hydration continues with the remaining
 * markers instead of aborting the whole page (HI-2). A marker whose model is
 * present but unparseable is not hydrated either — the server fallback stays
 * in place and the tag is logged (WC-A). Only markers that hydrate are
 * counted. Successfully hydrated markers are tagged `data-ndigo-hydrated` and
 * excluded from later scans, so calling this function twice hydrates each
 * island exactly once (WC-B).
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
 * import { hydrateIslands } from '@ndigo/view-webcomponent';
 * const n = hydrateIslands();
 * ```
 *
 * @since 1.0.0
 */
export function hydrateIslands(root: ParentNode = document): number {
    const markers = root.querySelectorAll<HTMLElement>(
        `[data-ndigo-island][data-ndigo-model]:not([${HYDRATED_ATTRIBUTE}])`
    );
    let hydrated = 0;

    markers.forEach((inert) => {
        const tagName = inert.tagName.toLowerCase();
        if (!customElements.get(tagName)) {
            return; // not defined on the client — leave as static markup
        }

        try {
            if (hydrateMarker(inert, tagName)) {
                hydrated += 1;
            }
        } catch (error) {
            // HI-2: one misbehaving island MUST NOT abort hydration for the
            // rest of the page. Log the tag, leave the marker as it was, and
            // do not count it as a success.
            logger.error(`island hydration failed for <${tagName}>`, error instanceof Error ? error : String(error));
        }
    });

    return hydrated;
}

/**
 * Hydrates a single marker: parses its model, upgrades it in place (DSD) or
 * replaces it with a live element (legacy), and records the hydrated marker.
 *
 * @param inert - The inert marker element.
 * @param tagName - Its lowercased tag name (already known by the caller).
 * @returns `true` when the marker hydrated; `false` when it was skipped
 *   because the model payload was malformed.
 */
function hydrateMarker(inert: HTMLElement, tagName: string): boolean {
    const serialized = inert.getAttribute('data-ndigo-model');
    const model = readModel(serialized);
    if (model === UNPARSEABLE) {
        // WC-A: never hand a garbage payload to the component as `null` (its
        // render would throw) and never abort the remaining markers.
        logger.error(
            `island <${tagName}> has an unparseable data-ndigo-model attribute; leaving the server fallback in place`
        );
        return false;
    }

    const locale = inert.getAttribute('data-ndigo-locale');

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
        inert.setAttribute(HYDRATED_ATTRIBUTE, '');
        return true;
    }

    const live = document.createElement(tagName);
    live.setAttribute('data-ndigo-island', '');
    live.setAttribute('data-ndigo-model', serialized ?? '');
    live.setAttribute(HYDRATED_ATTRIBUTE, '');

    // Order matters: set the locale and model (which may read on connect)
    // before replacing, so connectedCallback sees them.
    if (locale) {
        assignLocale(live, locale);
    }
    assignModel(live, model);
    inert.replaceWith(live);
    return true;
}

/**
 * Reads the serialized model from a `data-ndigo-model` attribute value.
 *
 * Mirrors `@ndigo/view`'s `parseModel` (one-level HTML-decoded JSON) but
 * reports a present-but-malformed payload with the {@link UNPARSEABLE}
 * sentinel instead of conflating it with the absent/empty case.
 *
 * @param raw - The attribute value, or `null` when the attribute is absent.
 * @returns The parsed model, `null` for an absent/empty attribute, or
 *   {@link UNPARSEABLE} when the value is not valid JSON.
 */
function readModel(raw: string | null): unknown | typeof UNPARSEABLE {
    if (raw === null || raw === '') {
        return null;
    }
    try {
        return JSON.parse(raw);
    } catch {
        return UNPARSEABLE;
    }
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
