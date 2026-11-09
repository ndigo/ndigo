/**
 * Shared DOM helpers for the custom-element specs.
 */
class TestResizeObserver implements ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}

// The menu's popper positioning uses ResizeObserver; jsdom does not ship one.
if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = TestResizeObserver;
}

// Select scrolls the content into view on open; jsdom does not implement it.
if (typeof Element !== 'undefined' && typeof Element.prototype.scrollTo !== 'function') {
    Element.prototype.scrollTo = () => {};
}

export async function flush(): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    if (typeof requestAnimationFrame === 'function') {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
}

/**
 * Creates an element, fills it with markup, and connects it to the document.
 */
export function mountElement<T extends HTMLElement>(
    tagName: string,
    markup: string,
    attributes: Record<string, string> = {}
): T {
    const element = document.createElement(tagName) as T;
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
    element.innerHTML = markup;
    document.body.append(element);
    return element;
}

/**
 * Queries a required descendant and fails loudly when the markup contract is broken.
 */
export function getPart<T extends Element>(root: ParentNode, selector: string): T {
    const element = root.querySelector<T>(selector);
    if (!element) throw new Error(`Missing element: ${selector}`);
    return element;
}
