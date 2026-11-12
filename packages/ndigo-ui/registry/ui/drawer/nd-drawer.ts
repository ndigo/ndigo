/**
 * `<nd-drawer>` — edge-anchored dialog built on the Zag.js dialog machine.
 *
 * Same parts and behaviour as `nd-dialog`, plus `placement` (`end`, `start`,
 * `bottom`, `top`) which is reflected as `data-placement` for the layout.
 */
import { connect as connectDialog, machine as dialogMachine } from '@zag-js/dialog';
import type { Api as DialogApi } from '@zag-js/dialog';
import { normalizeProps, spreadProps } from '@zag-js/vanilla';
import { defineElement, NdElement } from '@/lib/base-element';
import { createZagElement } from '@/lib/zag-element';
import { ensureOverlayStructure } from '@/lib/structure-element';

const DEFAULT_TRIGGER_LABEL = 'Open drawer';
const PLACEMENTS = new Set(['end', 'start', 'bottom', 'top']);

let nextId = 0;

export class NdDrawer extends NdElement {
    static observedAttributes = ['open', 'placement'];

    #machineId = '';
    #controller = createZagElement({
        machine: dialogMachine,
        connect: (service) => connectDialog(service, normalizeProps),
        props: () => ({
            id: this.#machineId,
            open: this.hasAttribute('open'),
            onOpenChange: (details) => {
                this.toggleAttribute('open', details.open);
                this.emit('open-change', details);
            },
        }),
        render: (api) => this.#render(api),
    });

    protected onConnect(): void {
        this.#machineId ||= this.id || `nd-drawer-${++nextId}`;
        this.#applyPlacement();
        ensureOverlayStructure(this, { triggerLabel: DEFAULT_TRIGGER_LABEL, backdrop: true });
        this.#controller.start();
    }

    protected onDisconnect(): void {
        this.#controller.stop();
    }

    attributeChangedCallback(name: string, _previous: string | null, value: string | null): void {
        if (name === 'open') this.#controller.updateProps({ open: value !== null });
        if (name === 'placement') this.#applyPlacement();
    }

    /** Opens the drawer programmatically. */
    show(): void {
        this.#controller.api?.setOpen(true);
    }

    /** Closes the drawer programmatically. */
    hide(): void {
        this.#controller.api?.setOpen(false);
    }

    #applyPlacement(): void {
        const requested = this.getAttribute('placement') ?? 'end';
        this.dataset.placement = PLACEMENTS.has(requested) ? requested : 'end';
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

defineElement('nd-drawer', NdDrawer);
