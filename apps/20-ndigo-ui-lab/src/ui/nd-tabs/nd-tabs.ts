/**
 * `<nd-tabs>` — tab set built on the Zag.js tabs machine.
 *
 * Markup: a `[data-part="list"]` with `[data-part="trigger"][data-value]`
 * buttons and matching `[data-part="content"][data-value]` panels. A root
 * wrapper is created when absent.
 */
import { connect as connectTabs, machine as tabsMachine } from '@zag-js/tabs';
import type { Api as TabsApi } from '@zag-js/tabs';
import { normalizeProps, spreadProps } from '@zag-js/vanilla';
import { defineElement, NdElement } from '@/lib/base-element';
import { createZagElement } from '@/lib/zag-element';
import { ensureRootElement } from '@/lib/structure-element';

let nextId = 0;

export class NdTabs extends NdElement {
    static observedAttributes = ['value'];

    #machineId = '';
    #controller = createZagElement({
        machine: tabsMachine,
        connect: (service) => connectTabs(service, normalizeProps),
        props: () => ({
            id: this.#machineId,
            defaultValue: this.#defaultValue(),
            loopFocus: true,
            onValueChange: (details) => {
                this.dataset.value = details.value ?? '';
                this.emit('value-change', details);
            },
        }),
        render: (api) => this.#render(api),
    });

    protected onConnect(): void {
        this.#machineId ||= this.id || `nd-tabs-${++nextId}`;
        ensureRootElement(this);
        this.#controller.start();
    }

    protected onDisconnect(): void {
        this.#controller.stop();
    }

    attributeChangedCallback(name: string, _previous: string | null, _value: string | null): void {
        if (name === 'value') {
            const value = this.#defaultValue();
            if (value !== undefined) this.#controller.api?.setValue(value);
        }
    }

    /** Selects a tab by value. */
    select(value: string): void {
        this.#controller.api?.setValue(value);
    }

    #defaultValue(): string | undefined {
        const value = this.getAttribute('value');
        if (value !== null) return value;
        return this.querySelector<HTMLElement>('[data-part="trigger"][data-value]')?.dataset.value;
    }

    #render(api: TabsApi): void {
        const root = this.querySelector<HTMLElement>('[data-part="root"]');
        const list = this.querySelector<HTMLElement>('[data-part="list"]');
        const indicator = this.querySelector<HTMLElement>('[data-part="indicator"]');

        if (root) spreadProps(root, api.getRootProps());
        if (list) spreadProps(list, api.getListProps());
        if (indicator) spreadProps(indicator, api.getIndicatorProps());

        for (const trigger of this.querySelectorAll<HTMLElement>('[data-part="trigger"]')) {
            const value = trigger.dataset.value;
            if (value === undefined) continue;
            spreadProps(trigger, api.getTriggerProps({ value, disabled: trigger.hasAttribute('disabled') }));
        }

        for (const content of this.querySelectorAll<HTMLElement>('[data-part="content"]')) {
            const value = content.dataset.value;
            if (value === undefined) continue;
            spreadProps(content, api.getContentProps({ value }));
        }
    }
}

defineElement('nd-tabs', NdTabs);
