/**
 * `<nd-tags-input>` — editable tag chips built on the Zag.js tags-input machine.
 *
 * Tags are rendered from the machine value; the authored input adds new tags on
 * Enter or the delimiter. A hidden input carries the comma-separated form value.
 */
import { connect as connectTagsInput, machine as tagsInputMachine } from '@zag-js/tags-input';
import type { Api as TagsInputApi } from '@zag-js/tags-input';
import { normalizeProps, spreadProps } from '@zag-js/vanilla';
import { defineElement, NdElement } from '@/lib/base-element';
import { createZagElement } from '@/lib/zag-element';

const DEFAULT_DELIMITER = ',';
const DEFAULT_MAX = Number.POSITIVE_INFINITY;

let nextId = 0;

export class NdTagsInput extends NdElement {
    static observedAttributes = [
        'value',
        'name',
        'max',
        'delimiter',
        'placeholder',
        'add-on-paste',
        'blur-behavior',
        'disabled',
        'readonly',
        'invalid',
        'required',
    ];

    #machineId = '';
    #items = new Map<string, HTMLElement>();
    #controller = createZagElement({
        machine: tagsInputMachine,
        connect: (service): TagsInputApi => connectTagsInput(service, normalizeProps),
        props: () => ({
            id: this.#machineId,
            defaultValue: this.#initialValue(),
            name: this.getAttribute('name') ?? undefined,
            max: this.#numberAttribute('max', DEFAULT_MAX),
            delimiter: this.#delimiter(),
            placeholder: this.getAttribute('placeholder') ?? undefined,
            addOnPaste: this.hasAttribute('add-on-paste'),
            blurBehavior: this.#blurBehavior(),
            disabled: this.hasAttribute('disabled'),
            readOnly: this.hasAttribute('readonly'),
            invalid: this.hasAttribute('invalid'),
            required: this.hasAttribute('required'),
            onValueChange: (details) => {
                this.dataset.value = details.value.join(', ');
                this.emit('value-change', details);
            },
        }),
        render: (api) => this.#render(api),
    });

    protected onConnect(): void {
        this.#machineId ||= this.id || `nd-tags-input-${++nextId}`;
        this.#ensureHiddenInput();
        this.#controller.start();
        this.dataset.value = (this.#controller.api?.value ?? []).join(', ');
    }

    protected onDisconnect(): void {
        this.#controller.stop();
    }

    attributeChangedCallback(name: string, _previous: string | null, _value: string | null): void {
        if (name === 'value') {
            this.#controller.api?.setValue(this.#initialValue());
            return;
        }
        this.#controller.updateProps({
            name: this.getAttribute('name') ?? undefined,
            max: this.#numberAttribute('max', DEFAULT_MAX),
            delimiter: this.#delimiter(),
            placeholder: this.getAttribute('placeholder') ?? undefined,
            addOnPaste: this.hasAttribute('add-on-paste'),
            blurBehavior: this.#blurBehavior(),
            disabled: this.hasAttribute('disabled'),
            readOnly: this.hasAttribute('readonly'),
            invalid: this.hasAttribute('invalid'),
            required: this.hasAttribute('required'),
        });
    }

    /** Adds one tag, subject to the max limit. */
    add(value: string): void {
        this.#controller.api?.addValue(value);
    }

    /** Removes one tag by value. */
    removeTag(value: string): void {
        const api = this.#controller.api;
        if (api) api.setValue(api.value.filter((tag) => tag !== value));
    }

    /** Removes every tag. */
    clear(): void {
        this.#controller.api?.clearValue();
    }

    #delimiter(): string {
        const delimiter = this.getAttribute('delimiter');
        return delimiter === null || delimiter.length === 0 ? DEFAULT_DELIMITER : delimiter;
    }

    #initialValue(): string[] {
        const raw = this.getAttribute('value');
        if (raw === null || raw.trim().length === 0) return [];
        return raw
            .split(this.#delimiter())
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);
    }

    #blurBehavior(): 'add' | 'clear' | undefined {
        const behavior = this.getAttribute('blur-behavior');
        return behavior === 'add' || behavior === 'clear' ? behavior : undefined;
    }

    #numberAttribute(name: string, fallback: number): number {
        const raw = this.getAttribute(name);
        if (raw === null) return fallback;
        const value = Number(raw);
        return Number.isFinite(value) && value > 0 ? value : fallback;
    }

    #ensureHiddenInput(): void {
        if (this.querySelector('[data-part="hidden-input"]')) return;
        const input = this.ownerDocument.createElement('input');
        input.type = 'text';
        input.hidden = true;
        input.dataset.part = 'hidden-input';
        this.append(input);
    }

    #createItem(value: string): HTMLElement {
        const item = this.ownerDocument.createElement('span');
        item.dataset.part = 'item';

        const preview = this.ownerDocument.createElement('span');
        preview.dataset.part = 'item-preview';
        const text = this.ownerDocument.createElement('span');
        text.dataset.part = 'item-text';
        text.textContent = value;
        const remove = this.ownerDocument.createElement('button');
        remove.type = 'button';
        remove.dataset.part = 'item-delete-trigger';
        remove.textContent = '×';
        preview.append(text, remove);

        const editor = this.ownerDocument.createElement('input');
        editor.dataset.part = 'item-input';
        editor.hidden = true;

        item.append(preview, editor);
        return item;
    }

    #syncItems(api: TagsInputApi, control: HTMLElement | null, input: HTMLElement | null): void {
        const values = api.value;
        for (const [value, element] of this.#items) {
            if (values.includes(value)) continue;
            element.remove();
            this.#items.delete(value);
        }

        for (const [index, value] of values.entries()) {
            let item = this.#items.get(value);
            if (!item) {
                item = this.#createItem(value);
                this.#items.set(value, item);
                control?.insertBefore(item, input);
            }

            spreadProps(item, api.getItemProps({ value, index }));
            const preview = item.querySelector<HTMLElement>('[data-part="item-preview"]');
            const text = item.querySelector<HTMLElement>('[data-part="item-text"]');
            const remove = item.querySelector<HTMLElement>('[data-part="item-delete-trigger"]');
            const editor = item.querySelector<HTMLElement>('[data-part="item-input"]');
            if (preview) spreadProps(preview, api.getItemPreviewProps({ value, index }));
            if (text) spreadProps(text, api.getItemTextProps({ value, index }));
            if (remove) spreadProps(remove, api.getItemDeleteTriggerProps({ value, index }));
            if (editor) spreadProps(editor, api.getItemInputProps({ value, index }));
        }
    }

    #render(api: TagsInputApi): void {
        spreadProps(this, api.getRootProps());
        const label = this.querySelector<HTMLElement>('[data-part="label"]');
        const control = this.querySelector<HTMLElement>('[data-part="control"]');
        const input = this.querySelector<HTMLElement>('[data-part="input"]');
        const clear = this.querySelector<HTMLElement>('[data-part="clear-trigger"]');
        const hidden = this.querySelector<HTMLElement>('[data-part="hidden-input"]');

        if (label) spreadProps(label, api.getLabelProps());
        if (control) spreadProps(control, api.getControlProps());
        if (input) spreadProps(input, api.getInputProps());
        if (clear) spreadProps(clear, api.getClearTriggerProps());
        if (hidden) spreadProps(hidden, api.getHiddenInputProps());
        this.#syncItems(api, control, input);
    }
}

defineElement('nd-tags-input', NdTagsInput);
