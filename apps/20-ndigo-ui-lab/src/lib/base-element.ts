/**
 * Shared base class for ndigo-ui custom elements.
 *
 * Elements stay in the light DOM: registry items must work in Astro, EJS, and
 * Ndigo islands without a shadow-root build step. The base only standardises
 * the lifecycle and the `nd-` event contract.
 */
export class NdElement extends HTMLElement {
    /** Called after the element is connected to the document. */
    protected onConnect(): void {}

    /** Called after the element is removed from the document. */
    protected onDisconnect(): void {}

    connectedCallback(): void {
        this.onConnect();
    }

    disconnectedCallback(): void {
        this.onDisconnect();
    }

    /**
     * Emits a bubbling, composed event under the `nd-` namespace.
     * @param type - Event name without the `nd-` prefix.
     * @param detail - Event payload.
     */
    protected emit<T>(type: string, detail?: T): void {
        this.dispatchEvent(new CustomEvent(`nd-${type}`, { detail, bubbles: true, composed: true }));
    }
}

/**
 * Defines a custom element once per document.
 * @param tagName - Custom element name, e.g. `nd-dialog`.
 * @param ctor - Element constructor.
 */
export function defineElement(tagName: string, ctor: CustomElementConstructor): void {
    if (typeof customElements !== 'undefined' && !customElements.get(tagName)) {
        customElements.define(tagName, ctor);
    }
}
