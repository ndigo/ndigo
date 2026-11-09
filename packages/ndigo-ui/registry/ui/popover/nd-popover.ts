/**
 * `<nd-popover>` — non-modal overlay built on the Zag.js popover machine.
 *
 * Markup: a `[data-part="trigger"]` (optional) and a
 * `[data-part="content"]` with optional title, description, close, and arrow
 * parts. Missing wrappers are created on connect.
 */
import { connect as connectPopover, machine as popoverMachine } from '@zag-js/popover';
import type { Api as PopoverApi } from '@zag-js/popover';
import { normalizeProps, spreadProps } from '@zag-js/vanilla';
import { defineElement, NdElement } from '@/lib/base-element';
import { createZagElement } from '@/lib/zag-element';

const DEFAULT_TRIGGER_LABEL = 'Open popover';

let nextId = 0;

export class NdPopover extends NdElement {
    static observedAttributes = ['open'];

    #machineId = '';
    #controller = createZagElement({
        machine: popoverMachine,
        connect: (service) => connectPopover(service, normalizeProps),
        props: () => ({
            id: this.#machineId,
            modal: false,
            open: this.hasAttribute('open'),
            onOpenChange: (details) => {
                this.toggleAttribute('open', details.open);
                this.emit('open-change', details);
            },
        }),
        render: (api) => this.#render(api),
    });

    protected onConnect(): void {
        this.#machineId = this.id || `nd-popover-${++nextId}`;
        this.#ensureStructure();
        this.#controller.start();
    }

    protected onDisconnect(): void {
        this.#controller.stop();
    }

    attributeChangedCallback(name: string, _previous: string | null, value: string | null): void {
        if (name === 'open') this.#controller.updateProps({ open: value !== null });
    }

    /** Opens the popover programmatically. */
    show(): void {
        this.#controller.api?.setOpen(true);
    }

    /** Closes the popover programmatically. */
    hide(): void {
        this.#controller.api?.setOpen(false);
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
                          child !== trigger && !(child instanceof HTMLElement && child.dataset.part === 'positioner')
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
    }

    #render(api: PopoverApi): void {
        const trigger = this.querySelector<HTMLElement>('[data-part="trigger"]');
        const positioner = this.querySelector<HTMLElement>('[data-part="positioner"]');
        const content = this.querySelector<HTMLElement>('[data-part="content"]');
        const title = this.querySelector<HTMLElement>('[data-part="title"]');
        const description = this.querySelector<HTMLElement>('[data-part="description"]');
        const close = this.querySelector<HTMLElement>('[data-part="close-trigger"]');
        const arrow = this.querySelector<HTMLElement>('[data-part="arrow"]');
        const arrowTip = this.querySelector<HTMLElement>('[data-part="arrow-tip"]');

        if (trigger) spreadProps(trigger, api.getTriggerProps());
        if (positioner) spreadProps(positioner, api.getPositionerProps());
        if (content) spreadProps(content, api.getContentProps());
        if (title) spreadProps(title, api.getTitleProps());
        if (description) spreadProps(description, api.getDescriptionProps());
        if (close) spreadProps(close, api.getCloseTriggerProps());
        if (arrow) spreadProps(arrow, api.getArrowProps());
        if (arrowTip) spreadProps(arrowTip, api.getArrowTipProps());
    }
}

defineElement('nd-popover', NdPopover);
