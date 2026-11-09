/**
 * `<nd-combobox>` — filterable single-select built on the Zag.js combobox
 * machine. Items are authored with `data-value`; typing filters the collection
 * and hides non-matching item elements.
 */
import { ListCollection } from '@zag-js/collection';
import { connect as connectCombobox, machine as comboboxMachine } from '@zag-js/combobox';
import type { Api as ComboboxApi } from '@zag-js/combobox';
import { normalizeProps, spreadProps } from '@zag-js/vanilla';
import { defineElement, NdElement } from '@/lib/base-element';
import { createZagElement } from '@/lib/zag-element';

interface ComboboxItem {
    readonly value: string;
    readonly label: string;
    readonly disabled: boolean;
}

let nextId = 0;

export class NdCombobox extends NdElement {
    static observedAttributes = ['open'];

    #machineId = '';
    #allItems: ComboboxItem[] = [];
    #collection = new ListCollection<ComboboxItem>({ items: [] });
    #controller = createZagElement({
        machine: comboboxMachine,
        connect: (service) => connectCombobox(service, normalizeProps),
        props: () => ({
            id: this.#machineId,
            collection: this.#collection,
            name: this.getAttribute('name') ?? undefined,
            disabled: this.hasAttribute('disabled'),
            required: this.hasAttribute('required'),
            readOnly: this.hasAttribute('readonly'),
            invalid: this.hasAttribute('invalid'),
            defaultOpen: this.hasAttribute('open'),
            defaultInputValue: this.getAttribute('value') ?? '',
            onOpenChange: (details) => {
                this.toggleAttribute('open', details.open);
                this.emit('open-change', details);
            },
            onInputValueChange: (details) => {
                this.#filter(details.inputValue);
            },
            onValueChange: (details) => {
                this.dataset.value = details.value.join(',');
                const label = this.#allItems.find((item) => item.value === details.value[0])?.label;
                const input = this.querySelector<HTMLInputElement>('[data-part="input"]');
                if (input && label !== undefined) input.value = label;
                this.emit('value-change', details);
            },
        }),
        render: (api) => this.#render(api),
    });

    protected onConnect(): void {
        this.#machineId = this.id || `nd-combobox-${++nextId}`;
        this.#ensureRoot();
        this.#allItems = this.#readItems();
        this.#collection = this.#buildCollection(this.#allItems);
        this.#controller.start();
        this.#filter(this.getAttribute('value') ?? '');
    }

    protected onDisconnect(): void {
        this.#controller.stop();
    }

    attributeChangedCallback(name: string, _previous: string | null, value: string | null): void {
        if (name === 'open') this.#controller.updateProps({ open: value !== null });
    }

    /** Opens the listbox programmatically. */
    show(): void {
        this.#controller.api?.setOpen(true);
    }

    /** Closes the listbox programmatically. */
    hide(): void {
        this.#controller.api?.setOpen(false);
    }

    /** Clears the selected value and the query. */
    clear(): void {
        this.#controller.api?.clearValue();
        this.#controller.api?.setInputValue('');
    }

    /** Selects one value programmatically. */
    select(value: string): void {
        this.#controller.api?.setValue([value]);
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

    #readItems(): ComboboxItem[] {
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

    #buildCollection(items: readonly ComboboxItem[]): ListCollection<ComboboxItem> {
        return new ListCollection<ComboboxItem>({
            items,
            itemToValue: (item) => item.value,
            itemToString: (item) => item.label,
            isItemDisabled: (item) => item.disabled,
        });
    }

    #filter(inputValue: string): void {
        const term = inputValue.trim().toLowerCase();
        const items =
            term.length === 0
                ? this.#allItems
                : this.#allItems.filter((item) => item.label.toLowerCase().includes(term));
        this.#collection = this.#buildCollection(items);
        this.#controller.updateProps({ collection: this.#collection });

        const visible = new Set(items.map((item) => item.value));
        for (const element of this.querySelectorAll<HTMLElement>('[data-part="item"][data-value]')) {
            element.hidden = !visible.has(element.dataset.value ?? '');
        }
    }

    #render(api: ComboboxApi): void {
        const root = this.querySelector<HTMLElement>('[data-part="root"]');
        const label = this.querySelector<HTMLElement>('[data-part="label"]');
        const control = this.querySelector<HTMLElement>('[data-part="control"]');
        const input = this.querySelector<HTMLElement>('[data-part="input"]');
        const trigger = this.querySelector<HTMLElement>('[data-part="trigger"]');
        const clear = this.querySelector<HTMLElement>('[data-part="clear-trigger"]');
        const positioner = this.querySelector<HTMLElement>('[data-part="positioner"]');
        const content = this.querySelector<HTMLElement>('[data-part="content"]');

        if (root) spreadProps(root, api.getRootProps());
        if (label) spreadProps(label, api.getLabelProps());
        if (control) spreadProps(control, api.getControlProps());
        if (input) spreadProps(input, api.getInputProps());
        if (trigger) spreadProps(trigger, api.getTriggerProps());
        if (clear) spreadProps(clear, api.getClearTriggerProps());
        // `inline` keeps the list in normal flow (a command palette), so the
        // popper's fixed positioning must not be applied to the positioner.
        if (positioner && !this.hasAttribute('inline')) spreadProps(positioner, api.getPositionerProps());
        if (content) spreadProps(content, api.getContentProps());

        for (const element of this.querySelectorAll<HTMLElement>('[data-part="item"][data-value]')) {
            const item = this.#collection.find(element.dataset.value);
            if (!item) continue;
            spreadProps(element, api.getItemProps({ item }));
            const text = element.querySelector<HTMLElement>('[data-part="item-text"]');
            if (text) spreadProps(text, api.getItemTextProps({ item }));
            const indicator = element.querySelector<HTMLElement>('[data-part="item-indicator"]');
            if (indicator) spreadProps(indicator, api.getItemIndicatorProps({ item }));
        }
    }
}

defineElement('nd-combobox', NdCombobox);
