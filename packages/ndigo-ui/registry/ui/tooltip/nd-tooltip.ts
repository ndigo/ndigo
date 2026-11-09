/**
 * `<nd-tooltip>` — hint surface built on the Zag.js tooltip machine.
 *
 * Markup: a `[data-part="trigger"]` (optional) and a
 * `[data-part="content"]` with optional arrow parts. The tooltip is
 * uncontrolled by default; `show()`/`hide()` drive it programmatically.
 */
import { connect as connectTooltip, machine as tooltipMachine } from '@zag-js/tooltip';
import type { Api as TooltipApi } from '@zag-js/tooltip';
import { normalizeProps, spreadProps } from '@zag-js/vanilla';
import { defineElement, NdElement } from '@/lib/base-element';
import { createZagElement } from '@/lib/zag-element';

const DEFAULT_TRIGGER_LABEL = 'More information';

let nextId = 0;

export class NdTooltip extends NdElement {
    #machineId = '';
    #controller = createZagElement({
        machine: tooltipMachine,
        connect: (service) => connectTooltip(service, normalizeProps),
        props: () => ({
            id: this.#machineId,
            defaultOpen: this.hasAttribute('open'),
            openDelay: this.#delay('open-delay'),
            closeDelay: this.#delay('close-delay'),
            onOpenChange: (details) => {
                this.toggleAttribute('open', details.open);
                this.emit('open-change', details);
            },
        }),
        render: (api) => this.#render(api),
    });

    protected onConnect(): void {
        this.#machineId = this.id || `nd-tooltip-${++nextId}`;
        this.#ensureStructure();
        this.#controller.start();
    }

    protected onDisconnect(): void {
        this.#controller.stop();
    }

    /** Shows the tooltip programmatically. */
    show(): void {
        this.#controller.api?.setOpen(true);
    }

    /** Hides the tooltip programmatically. */
    hide(): void {
        this.#controller.api?.setOpen(false);
    }

    #delay(name: string): number | undefined {
        const raw = this.getAttribute(name);
        if (raw === null) return undefined;
        const value = Number(raw);
        return Number.isFinite(value) && value >= 0 ? value : undefined;
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

    #render(api: TooltipApi): void {
        const trigger = this.querySelector<HTMLElement>('[data-part="trigger"]');
        const positioner = this.querySelector<HTMLElement>('[data-part="positioner"]');
        const content = this.querySelector<HTMLElement>('[data-part="content"]');
        const arrow = this.querySelector<HTMLElement>('[data-part="arrow"]');
        const arrowTip = this.querySelector<HTMLElement>('[data-part="arrow-tip"]');

        if (trigger) spreadProps(trigger, api.getTriggerProps());
        if (positioner) spreadProps(positioner, api.getPositionerProps());
        if (content) spreadProps(content, api.getContentProps());
        if (arrow) spreadProps(arrow, api.getArrowProps());
        if (arrowTip) spreadProps(arrowTip, api.getArrowTipProps());
    }
}

defineElement('nd-tooltip', NdTooltip);
