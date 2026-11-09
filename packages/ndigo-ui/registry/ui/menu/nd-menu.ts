/**
 * `<nd-menu>` — a dropdown menu built on the Zag.js menu machine.
 *
 * Markup contract: a `[data-part="trigger"]` (optional) and menu items inside
 * a `[data-part="content"]`. Items declare their value with `data-value`;
 * separators use `data-part="separator"`.
 */
import { connect as connectMenu, machine as menuMachine } from '@zag-js/menu';
import type { Api as MenuApi } from '@zag-js/menu';
import { normalizeProps, spreadProps } from '@zag-js/vanilla';
import { defineElement, NdElement } from '@/lib/base-element';
import { createZagElement } from '@/lib/zag-element';
import { ensureOverlayStructure } from '@/lib/structure-element';

const DEFAULT_TRIGGER_LABEL = 'Open menu';

let nextId = 0;

export class NdMenu extends NdElement {
    static observedAttributes = ['open'];

    #machineId = '';
    #controller = createZagElement({
        machine: menuMachine,
        connect: (service) => connectMenu(service, normalizeProps),
        props: () => ({
            id: this.#machineId,
            open: this.hasAttribute('open'),
            loopFocus: true,
            onOpenChange: (details) => {
                this.toggleAttribute('open', details.open);
                this.emit('open-change', details);
            },
            onSelect: (details) => this.emit('select', details),
        }),
        render: (api) => this.#render(api),
    });

    protected onConnect(): void {
        this.#machineId ||= this.id || `nd-menu-${++nextId}`;
        ensureOverlayStructure(this, { triggerLabel: DEFAULT_TRIGGER_LABEL });
        this.#controller.start();
    }

    protected onDisconnect(): void {
        this.#controller.stop();
    }

    attributeChangedCallback(name: string, _previous: string | null, value: string | null): void {
        if (name === 'open') this.#controller.updateProps({ open: value !== null });
    }

    #render(api: MenuApi): void {
        const { trigger, positioner, content } = ensureOverlayStructure(this, {
            triggerLabel: DEFAULT_TRIGGER_LABEL,
        });
        spreadProps(trigger, api.getTriggerProps());
        spreadProps(positioner, api.getPositionerProps());
        spreadProps(content, api.getContentProps());

        for (const separator of content.querySelectorAll<HTMLElement>('[data-part="separator"]')) {
            if (separator.closest('[data-part="content"]') !== content) continue;
            spreadProps(separator, api.getSeparatorProps());
        }

        for (const item of content.querySelectorAll<HTMLElement>('[data-part="item"]')) {
            if (item.closest('[data-part="content"]') !== content) continue;
            const value = item.dataset.value;
            if (!value) continue;
            const text = item.getAttribute('data-valuetext') ?? item.textContent?.trim();
            const valueText = text && text.length > 0 ? text : undefined;
            spreadProps(item, api.getItemProps({ value, valueText }));
        }
    }
}

defineElement('nd-menu', NdMenu);
