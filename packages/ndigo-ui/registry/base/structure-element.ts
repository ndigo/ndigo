/**
 * Shared structure helpers for copy-in elements.
 *
 * Overlays share the same authored contract — an optional trigger plus content,
 * optionally wrapped in a positioner and backdrop — and must not confuse a
 * nested component's parts with their own. `ownPart` scopes the lookup to the
 * host's direct children (and one level into its own positioner); the ensure
 * helpers create missing wrappers and preserve authored text nodes.
 */

/** Options for {@link ensureOverlayStructure}. */
export interface OverlayStructureOptions {
    /** Default label for a generated trigger. */
    readonly triggerLabel: string;
    /** Create a backdrop sibling for modal overlays. */
    readonly backdrop?: boolean;
}

/** Parts resolved or created by {@link ensureOverlayStructure}. */
export interface OverlayStructure {
    readonly trigger: HTMLElement;
    readonly backdrop: HTMLElement | null;
    readonly positioner: HTMLElement;
    readonly content: HTMLElement;
}

function directChildPart<T extends HTMLElement = HTMLElement>(host: HTMLElement, name: string): T | null {
    for (const child of host.children) {
        if (child instanceof HTMLElement && child.dataset.part === name) return child as T;
    }
    return null;
}

/**
 * Finds one of the host's own parts without matching a nested component's parts.
 * A nested combobox or popover also uses `[data-part]`, so an unscoped descendant
 * query would steal its positioner or trigger.
 * @param host - Overlay host element.
 * @param name - Part name to find.
 * @returns The part, or `null` when the host does not own it.
 */
export function ownPart<T extends HTMLElement = HTMLElement>(host: HTMLElement, name: string): T | null {
    const direct = directChildPart<T>(host, name);
    if (direct) return direct;
    const positioner = directChildPart<HTMLElement>(host, 'positioner');
    if (!positioner) return null;
    return directChildPart<T>(positioner, name);
}

/**
 * Returns the host's direct `[data-part="root"]` child, creating one that adopts
 * every existing child node (including text) when absent.
 * @param host - Element that owns the root wrapper.
 * @returns The existing or created root element.
 */
export function ensureRootElement(host: HTMLElement): HTMLElement {
    const existing = directChildPart<HTMLElement>(host, 'root');
    if (existing) return existing;
    const root = host.ownerDocument.createElement('div');
    root.dataset.part = 'root';
    root.append(...host.childNodes);
    host.append(root);
    return root;
}

/**
 * Ensures the trigger, positioner, content, and optional backdrop wrappers and
 * returns the host's own parts. Idempotent: authored parts are reused, missing
 * wrappers are created, and direct text nodes are moved into the content.
 * @param host - Overlay host element.
 * @param options - Trigger label and whether the overlay has a backdrop.
 * @returns The host's own overlay parts.
 */
export function ensureOverlayStructure(host: HTMLElement, options: OverlayStructureOptions): OverlayStructure {
    const trigger = ensureTrigger(host, options.triggerLabel);
    const withBackdrop = options.backdrop === true;
    let content = ownPart(host, 'content');
    let positioner = ownPart(host, 'positioner');

    if (!content) {
        content = host.ownerDocument.createElement('div');
        content.dataset.part = 'content';
        const movable = positioner
            ? [...positioner.childNodes]
            : [...host.childNodes].filter(
                  (node) =>
                      node !== trigger &&
                      !(node instanceof HTMLElement && ['backdrop', 'positioner'].includes(node.dataset.part ?? ''))
              );
        content.append(...movable);
        (positioner ?? host).append(content);
    }

    if (!positioner) {
        positioner = host.ownerDocument.createElement('div');
        positioner.dataset.part = 'positioner';
        content.replaceWith(positioner);
        positioner.append(content);
    }

    if (content.parentElement !== positioner) positioner.append(content);

    let backdrop: HTMLElement | null = null;
    if (withBackdrop) {
        backdrop = ownPart(host, 'backdrop');
        if (!backdrop) {
            backdrop = host.ownerDocument.createElement('div');
            backdrop.dataset.part = 'backdrop';
            positioner.before(backdrop);
        }
    }

    // Authored text/comments beside the content belong inside it.
    for (const node of Array.from(host.childNodes)) {
        if (node === trigger || node === positioner || node === content || node === backdrop) continue;
        content.append(node);
    }

    return { trigger, backdrop, positioner, content };
}

function ensureTrigger(host: HTMLElement, label: string): HTMLElement {
    const existing = ownPart(host, 'trigger');
    if (existing) return existing;
    const trigger = host.ownerDocument.createElement('button');
    trigger.type = 'button';
    trigger.dataset.part = 'trigger';
    trigger.textContent = host.getAttribute('trigger-label') ?? label;
    host.prepend(trigger);
    return trigger;
}
