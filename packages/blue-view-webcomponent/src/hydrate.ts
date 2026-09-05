/**
 * @author Jeff Rose
 */

import { parseModel } from '@blue/view';

/**
 * Hydrates all islands in a root element: finds every `[data-blue-island]`
 * marker, constructs the corresponding custom element, sets its `.model` from
 * the serialized `data-blue-model`, and replaces the inert SSR markup with the
 * live element (its `connectedCallback`/render runs on connect).
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

        const live = document.createElement(tagName);
        live.setAttribute('data-blue-island', '');
        live.setAttribute('data-blue-model', inert.getAttribute('data-blue-model') ?? '');

        const model = parseModel(live.getAttribute('data-blue-model') ?? undefined);
        // Order matters: set the model (which may read on connect) before
        // replacing, so connectedCallback sees it.
        assignModel(live, model);

        inert.replaceWith(live);
        hydrated += 1;
    });

    return hydrated;
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
