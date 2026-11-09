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
        this.#machineId = this.id || `nd-drawer-${++nextId}`;
        this.#applyPlacement();
        this.#ensureStructure();
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

    #ensureTrigger(): HTMLElement {
        const existing = this.querySelector<HTMLElement>('[data-part="trigger"]');
        if (existing) return existing;
        const trigger = this.ownerDocument.createElement('button');
        trigger.type = 'button';
        trigger.dataset.part = 'trigger';
        trigger.textContent = this.getAttribute('trigger-label') ?? DEFAULT_TRIGGER_LABEL;
        this.prepend(trigger);
        return trigger;
    }

    #ensureStructure(): void {
        const trigger = this.#ensureTrigger();
        let content = this.querySelector<HTMLElement>('[data-part="content"]');
        let positioner = this.querySelector<HTMLElement>('[data-part="positioner"]');

        if (!content) {
            content = this.ownerDocument.createElement('div');
            content.dataset.part = 'content';
            const movable = positioner
                ? [...positioner.children]
                : [...this.children].filter(
                      (child) =>
                          child !== trigger &&
                          !(
                              child instanceof HTMLElement &&
                              ['backdrop', 'positioner'].includes(child.dataset.part ?? '')
                          )
                  );
            content.append(...movable);
            (positioner ?? this).append(content);
        }

        if (!positioner) {
            positioner = this.ownerDocument.createElement('div');
            positioner.dataset.part = 'positioner';
            content.replaceWith(positioner);
            positioner.append(content);
        }

        if (content.parentElement !== positioner) positioner.append(content);

        if (!this.querySelector('[data-part="backdrop"]')) {
            const backdrop = this.ownerDocument.createElement('div');
            backdrop.dataset.part = 'backdrop';
            positioner.before(backdrop);
        }
    }

    #render(api: DialogApi): void {
        const trigger = this.querySelector<HTMLElement>('[data-part="trigger"]');
        const backdrop = this.querySelector<HTMLElement>('[data-part="backdrop"]');
        const positioner = this.querySelector<HTMLElement>('[data-part="positioner"]');
        const content = this.querySelector<HTMLElement>('[data-part="content"]');
        const title = this.querySelector<HTMLElement>('[data-part="title"]');
        const description = this.querySelector<HTMLElement>('[data-part="description"]');
        const close = this.querySelector<HTMLElement>('[data-part="close-trigger"]');

        if (trigger) spreadProps(trigger, api.getTriggerProps());
        if (backdrop) spreadProps(backdrop, api.getBackdropProps());
        if (positioner) spreadProps(positioner, api.getPositionerProps());
        if (content) spreadProps(content, api.getContentProps());
        if (title) spreadProps(title, api.getTitleProps());
        if (description) spreadProps(description, api.getDescriptionProps());
        if (close) spreadProps(close, api.getCloseTriggerProps());
    }
}

defineElement('nd-drawer', NdDrawer);
