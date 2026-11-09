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
import { ensureOverlayStructure } from '@/lib/structure-element';

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
        this.#machineId ||= this.id || `nd-popover-${++nextId}`;
        ensureOverlayStructure(this, { triggerLabel: DEFAULT_TRIGGER_LABEL });
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

    #render(api: PopoverApi): void {
        const { trigger, positioner, content } = ensureOverlayStructure(this, {
            triggerLabel: DEFAULT_TRIGGER_LABEL,
        });
        const title = content.querySelector<HTMLElement>('[data-part="title"]');
        const description = content.querySelector<HTMLElement>('[data-part="description"]');
        const close = content.querySelector<HTMLElement>('[data-part="close-trigger"]');
        const arrow = content.querySelector<HTMLElement>('[data-part="arrow"]');
        const arrowTip = content.querySelector<HTMLElement>('[data-part="arrow-tip"]');

        spreadProps(trigger, api.getTriggerProps());
        spreadProps(positioner, api.getPositionerProps());
        spreadProps(content, api.getContentProps());
        if (title) spreadProps(title, api.getTitleProps());
        if (description) spreadProps(description, api.getDescriptionProps());
        if (close) spreadProps(close, api.getCloseTriggerProps());
        if (arrow) spreadProps(arrow, api.getArrowProps());
        if (arrowTip) spreadProps(arrowTip, api.getArrowTipProps());
    }
}

defineElement('nd-popover', NdPopover);
