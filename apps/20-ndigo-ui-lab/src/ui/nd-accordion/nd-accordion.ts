/**
 * `<nd-accordion>` — disclosure stack built on the Zag.js accordion machine.
 *
 * Markup: `[data-part="item"][data-value]` rows, each with an
 * `[data-part="item-trigger"][data-value]` button and a matching
 * `[data-part="item-content"][data-value]` region. A root wrapper is created
 * when absent.
 */
import { connect as connectAccordion, machine as accordionMachine } from '@zag-js/accordion';
import type { Api as AccordionApi } from '@zag-js/accordion';
import { normalizeProps, spreadProps } from '@zag-js/vanilla';
import { defineElement, NdElement } from '@/lib/base-element';
import { createZagElement } from '@/lib/zag-element';
import { ensureRootElement } from '@/lib/structure-element';

let nextId = 0;

export class NdAccordion extends NdElement {
    static observedAttributes = ['multiple', 'collapsible', 'value'];

    #machineId = '';
    #controller = createZagElement({
        machine: accordionMachine,
        connect: (service) => connectAccordion(service, normalizeProps),
        props: () => ({
            id: this.#machineId,
            multiple: this.hasAttribute('multiple'),
            collapsible: this.hasAttribute('collapsible'),
            defaultValue: this.#defaultValue(),
            onValueChange: (details) => {
                this.dataset.value = details.value.join(',');
                this.emit('value-change', details);
            },
        }),
        render: (api) => this.#render(api),
    });

    protected onConnect(): void {
        this.#machineId ||= this.id || `nd-accordion-${++nextId}`;
        ensureRootElement(this);
        this.#controller.start();
    }

    protected onDisconnect(): void {
        this.#controller.stop();
    }

    attributeChangedCallback(name: string, _previous: string | null, _value: string | null): void {
        if (name === 'value') {
            this.#controller.api?.setValue(this.#defaultValue());
            return;
        }
        this.#controller.updateProps({
            multiple: this.hasAttribute('multiple'),
            collapsible: this.hasAttribute('collapsible'),
        });
    }

    /** Toggles an item by value. */
    toggle(value: string): void {
        const api = this.#controller.api;
        if (!api) return;
        const current = api.value;
        if (current.includes(value)) {
            if (this.hasAttribute('collapsible')) api.setValue(current.filter((entry) => entry !== value));
            return;
        }
        // Single mode must replace the open item; appending a second value is
        // rejected by the machine and would leave the first item open.
        api.setValue(this.hasAttribute('multiple') ? [...current, value] : [value]);
    }

    #defaultValue(): string[] {
        return (this.getAttribute('value') ?? '')
            .split(',')
            .map((value) => value.trim())
            .filter((value) => value.length > 0);
    }

    #render(api: AccordionApi): void {
        const root = this.querySelector<HTMLElement>('[data-part="root"]');
        if (root) spreadProps(root, api.getRootProps());

        for (const item of this.querySelectorAll<HTMLElement>('[data-part="item"]')) {
            const value = item.dataset.value;
            if (value === undefined) continue;
            const disabled = item.hasAttribute('disabled');
            spreadProps(item, api.getItemProps({ value, disabled }));

            const trigger = item.querySelector<HTMLElement>('[data-part="item-trigger"]');
            const content = item.querySelector<HTMLElement>('[data-part="item-content"]');
            const indicator = item.querySelector<HTMLElement>('[data-part="item-indicator"]');
            if (trigger) spreadProps(trigger, api.getItemTriggerProps({ value, disabled }));
            if (content) spreadProps(content, api.getItemContentProps({ value }));
            if (indicator) spreadProps(indicator, api.getItemIndicatorProps({ value }));
        }
    }
}

defineElement('nd-accordion', NdAccordion);
