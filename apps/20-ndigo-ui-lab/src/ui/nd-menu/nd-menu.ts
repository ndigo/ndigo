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
        this.#machineId = this.id || `nd-menu-${++nextId}`;
        this.#ensureStructure();
        this.#controller.start();
    }

    protected onDisconnect(): void {
        this.#controller.stop();
    }

    attributeChangedCallback(name: string, _previous: string | null, value: string | null): void {
        if (name === 'open') this.#controller.updateProps({ open: value !== null });
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

    #render(api: MenuApi): void {
        const trigger = this.querySelector<HTMLElement>('[data-part="trigger"]');
        const positioner = this.querySelector<HTMLElement>('[data-part="positioner"]');
        const content = this.querySelector<HTMLElement>('[data-part="content"]');
        if (trigger) spreadProps(trigger, api.getTriggerProps());
        if (positioner) spreadProps(positioner, api.getPositionerProps());
        if (content) spreadProps(content, api.getContentProps());

        for (const separator of this.querySelectorAll<HTMLElement>('[data-part="separator"]')) {
            spreadProps(separator, api.getSeparatorProps());
        }

        for (const item of this.querySelectorAll<HTMLElement>('[data-part="item"]')) {
            const value = item.dataset.value;
            if (!value) continue;
            const text = item.getAttribute('data-valuetext') ?? item.textContent?.trim();
            const valueText = text && text.length > 0 ? text : undefined;
            spreadProps(item, api.getItemProps({ value, valueText }));
        }
    }
}

defineElement('nd-menu', NdMenu);
