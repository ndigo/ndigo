/**
 * `<nd-select>` — single-select dropdown built on the Zag.js select machine.
 *
 * Items are authored as `[data-part="item"][data-value]` elements; the
 * collection, hidden native `<select>`, and value text are derived from them.
 */
import { ListCollection } from '@zag-js/collection';
import { connect as connectSelect, machine as selectMachine } from '@zag-js/select';
import type { Api as SelectApi } from '@zag-js/select';
import { normalizeProps, spreadProps } from '@zag-js/vanilla';
import { defineElement, NdElement } from '@/lib/base-element';
import { createZagElement } from '@/lib/zag-element';

interface SelectItem {
    readonly value: string;
    readonly label: string;
    readonly disabled: boolean;
}

let nextId = 0;

export class NdSelect extends NdElement {
    static observedAttributes = ['open'];

    #machineId = '';
    #collection = new ListCollection<SelectItem>({ items: [] });
    #controller = createZagElement({
        machine: selectMachine,
        connect: (service) => connectSelect(service, normalizeProps),
        props: () => ({
            id: this.#machineId,
            collection: this.#collection,
            name: this.getAttribute('name') ?? undefined,
            disabled: this.hasAttribute('disabled'),
            invalid: this.hasAttribute('invalid'),
            required: this.hasAttribute('required'),
            readOnly: this.hasAttribute('readonly'),
            open: this.hasAttribute('open'),
            defaultValue: this.#initialValue(),
            onOpenChange: (details) => {
                this.toggleAttribute('open', details.open);
                this.emit('open-change', details);
            },
            onValueChange: (details) => {
                this.dataset.value = details.value.join(',');
                this.#syncValueText(details.value);
                this.#syncHiddenSelect(details.value);
                this.emit('value-change', details);
            },
        }),
        render: (api) => this.#render(api),
    });

    protected onConnect(): void {
        this.#machineId = this.id || `nd-select-${++nextId}`;
        const root = this.#ensureRoot();
        this.#ensureHiddenSelect(root);
        this.#collection = new ListCollection<SelectItem>({
            items: this.#readItems(),
            itemToValue: (item) => item.value,
            itemToString: (item) => item.label,
            isItemDisabled: (item) => item.disabled,
        });
        this.#controller.start();
        const value = this.#controller.api?.value ?? [];
        this.#syncValueText(value);
        this.#syncHiddenSelect(value);
    }

    protected onDisconnect(): void {
        this.#controller.stop();
    }

    attributeChangedCallback(name: string, _previous: string | null, value: string | null): void {
        if (name === 'open') this.#controller.updateProps({ open: value !== null });
    }

    /** Selects one value programmatically. */
    select(value: string): void {
        this.#controller.api?.setValue([value]);
    }

    #initialValue(): string[] {
        const value = this.getAttribute('value');
        return value === null || value.length === 0 ? [] : [value];
    }

    #ensureRoot(): HTMLElement {
        const existing = this.querySelector<HTMLElement>('[data-part="root"]');
        if (existing) return existing;
        const root = this.ownerDocument.createElement('div');
        root.dataset.part = 'root';
        root.append(...this.children);
        this.append(root);
        return root;
    }

    #ensureHiddenSelect(root: HTMLElement): void {
        if (root.querySelector('[data-part="hidden-select"]')) return;
        const select = this.ownerDocument.createElement('select');
        select.dataset.part = 'hidden-select';
        root.append(select);
    }

    #readItems(): SelectItem[] {
        return [...this.querySelectorAll<HTMLElement>('[data-part="item"][data-value]')].map((item) => {
            const text =
                item.querySelector<HTMLElement>('[data-part="item-text"]')?.textContent ?? item.textContent ?? '';
            return {
                value: item.dataset.value ?? '',
                label: text.trim(),
                disabled: item.hasAttribute('data-disabled') || item.hasAttribute('disabled'),
            };
        });
    }

    #syncValueText(values: readonly string[]): void {
        const target = this.querySelector<HTMLElement>('[data-part="value-text"]');
        if (!target) return;
        const labels = values
            .map((value) => this.#collection.find(value)?.label)
            .filter((label): label is string => label !== undefined && label.length > 0);
        target.textContent = labels.length > 0 ? labels.join(', ') : (this.getAttribute('placeholder') ?? 'Select');
        target.toggleAttribute('data-placeholder', labels.length === 0);
    }

    #syncHiddenSelect(values: readonly string[]): void {
        const select = this.querySelector<HTMLSelectElement>('[data-part="hidden-select"]');
        if (!select) return;
        select.replaceChildren(
            ...this.#collection.items.map((item) => {
                const option = this.ownerDocument.createElement('option');
                option.value = item.value;
                option.textContent = item.label;
                option.selected = values.includes(item.value);
                return option;
            })
        );
    }

    #render(api: SelectApi): void {
        const root = this.querySelector<HTMLElement>('[data-part="root"]');
        const label = this.querySelector<HTMLElement>('[data-part="label"]');
        const control = this.querySelector<HTMLElement>('[data-part="control"]');
        const trigger = this.querySelector<HTMLElement>('[data-part="trigger"]');
        const indicator = this.querySelector<HTMLElement>('[data-part="indicator"]');
        const valueText = this.querySelector<HTMLElement>('[data-part="value-text"]');
        const clear = this.querySelector<HTMLElement>('[data-part="clear-trigger"]');
        const positioner = this.querySelector<HTMLElement>('[data-part="positioner"]');
        const content = this.querySelector<HTMLElement>('[data-part="content"]');
        const list = this.querySelector<HTMLElement>('[data-part="list"]');
        const hiddenSelect = this.querySelector<HTMLElement>('[data-part="hidden-select"]');

        if (root) spreadProps(root, api.getRootProps());
        if (label) spreadProps(label, api.getLabelProps());
        if (control) spreadProps(control, api.getControlProps());
        if (trigger) spreadProps(trigger, api.getTriggerProps());
        if (indicator) spreadProps(indicator, api.getIndicatorProps());
        if (valueText) spreadProps(valueText, api.getValueTextProps());
        if (clear) spreadProps(clear, api.getClearTriggerProps());
        if (positioner) spreadProps(positioner, api.getPositionerProps());
        if (content) spreadProps(content, api.getContentProps());
        if (list) spreadProps(list, api.getListProps());
        if (hiddenSelect) spreadProps(hiddenSelect, api.getHiddenSelectProps());

        for (const element of this.querySelectorAll<HTMLElement>('[data-part="item"][data-value]')) {
            const item = this.#collection.find(element.dataset.value);
            if (!item) continue;
            spreadProps(element, api.getItemProps({ item }));
            const text = element.querySelector<HTMLElement>('[data-part="item-text"]');
            if (text) spreadProps(text, api.getItemTextProps({ item }));
            const itemIndicator = element.querySelector<HTMLElement>('[data-part="item-indicator"]');
            if (itemIndicator) spreadProps(itemIndicator, api.getItemIndicatorProps({ item }));
        }
    }
}

defineElement('nd-select', NdSelect);
