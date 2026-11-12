/**
 * `<nd-dialog>` — a modal dialog built on the Zag.js dialog machine.
 *
 * Markup contract: a `[data-part="trigger"]` (optional) and a
 * `[data-part="content"]` with optional title, description, and close parts.
 * Missing wrappers are created on connect so the component also accepts the
 * body markup on its own.
 */
import { connect as connectDialog, machine as dialogMachine } from '@zag-js/dialog';
import type { Api as DialogApi } from '@zag-js/dialog';
import { normalizeProps, spreadProps } from '@zag-js/vanilla';
import { defineElement, NdElement } from '@/lib/base-element';
import { createZagElement } from '@/lib/zag-element';
import { ensureOverlayStructure } from '@/lib/structure-element';

const DEFAULT_TRIGGER_LABEL = 'Open dialog';

let nextId = 0;

export class NdDialog extends NdElement {
    static observedAttributes = ['open'];

    #machineId = '';
    #controller = createZagElement({
        machine: dialogMachine,
        connect: (service) => connectDialog(service, normalizeProps),
        props: () => ({
            id: this.#machineId,
            open: this.hasAttribute('open'),
            initialFocusEl: this.#initialFocusElement(),
            onOpenChange: (details) => {
                this.toggleAttribute('open', details.open);
                this.emit('open-change', details);
                if (details.open) this.#focusInitial();
            },
        }),
        render: (api) => this.#render(api),
    });

    protected onConnect(): void {
        this.#machineId ||= this.id || `nd-dialog-${++nextId}`;
        ensureOverlayStructure(this, { triggerLabel: DEFAULT_TRIGGER_LABEL, backdrop: true });
        this.#controller.start();
    }

    protected onDisconnect(): void {
        this.#controller.stop();
    }

    attributeChangedCallback(name: string, _previous: string | null, value: string | null): void {
        if (name === 'open') this.#controller.updateProps({ open: value !== null });
    }

    /** Opens the dialog programmatically. */
    show(): void {
        this.#controller.api?.setOpen(true);
    }

    /** Closes the dialog programmatically. */
    hide(): void {
        this.#controller.api?.setOpen(false);
    }

    /**
     * Resolves `initial-focus` — a selector for the element that receives focus
     * when the dialog opens. Falls back to Zag's first-focusable default.
     */
    #initialFocusElement(): (() => HTMLElement | null) | undefined {
        const selector = this.getAttribute('initial-focus');
        if (selector === null || selector.trim().length === 0) return undefined;
        return () => this.querySelector<HTMLElement>(selector);
    }

    /**
     * Moves focus after the open render. Zag also receives `initialFocusEl`,
     * but this frame pass keeps the target correct once the content is visible.
     */
    #focusInitial(): void {
        const selector = this.getAttribute('initial-focus');
        if (selector === null || selector.trim().length === 0) return;
        const focus = (): void => {
            this.querySelector<HTMLElement>(selector)?.focus();
        };
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(focus);
        else focus();
    }

    #render(api: DialogApi): void {
        const { trigger, backdrop, positioner, content } = ensureOverlayStructure(this, {
            triggerLabel: DEFAULT_TRIGGER_LABEL,
            backdrop: true,
        });
        const title = content.querySelector<HTMLElement>('[data-part="title"]');
        const description = content.querySelector<HTMLElement>('[data-part="description"]');
        const close = content.querySelector<HTMLElement>('[data-part="close-trigger"]');

        spreadProps(trigger, api.getTriggerProps());
        // Zag hides everything outside the content — the authored trigger
        // included — with `aria-hidden` while the modal is open. An
        // aria-hidden control that is still tabbable is an axe violation, so
        // take the trigger out of the page for as long as it is hidden. It is
        // re-enabled on close, before Zag restores focus to it.
        trigger.toggleAttribute('inert', api.open);
        if (backdrop) spreadProps(backdrop, api.getBackdropProps());
        spreadProps(positioner, api.getPositionerProps());
        spreadProps(content, api.getContentProps());
        if (title) spreadProps(title, api.getTitleProps());
        if (description) spreadProps(description, api.getDescriptionProps());
        if (close) spreadProps(close, api.getCloseTriggerProps());
    }
}

defineElement('nd-dialog', NdDialog);
