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
import { ensureOverlayStructure } from '@/lib/structure-element';

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
        this.#machineId ||= this.id || `nd-tooltip-${++nextId}`;
        ensureOverlayStructure(this, { triggerLabel: DEFAULT_TRIGGER_LABEL });
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

    #render(api: TooltipApi): void {
        const { trigger, positioner, content } = ensureOverlayStructure(this, {
            triggerLabel: DEFAULT_TRIGGER_LABEL,
        });
        const arrow = content.querySelector<HTMLElement>('[data-part="arrow"]');
        const arrowTip = content.querySelector<HTMLElement>('[data-part="arrow-tip"]');

        spreadProps(trigger, api.getTriggerProps());
        spreadProps(positioner, api.getPositionerProps());
        spreadProps(content, api.getContentProps());
        if (arrow) spreadProps(arrow, api.getArrowProps());
        if (arrowTip) spreadProps(arrowTip, api.getArrowTipProps());
    }
}

defineElement('nd-tooltip', NdTooltip);
