/**
 * `<nd-switch>` — toggle built on the Zag.js switch machine.
 *
 * Markup can be just text: the element creates the `<label>` root, hidden
 * checkbox, control, thumb, and label span. Authored parts are respected.
 */
import { connect as connectSwitch, machine as switchMachine } from '@zag-js/switch';
import type { Api as SwitchApi } from '@zag-js/switch';
import { normalizeProps, spreadProps } from '@zag-js/vanilla';
import { defineElement, NdElement } from '@/lib/base-element';
import { createZagElement } from '@/lib/zag-element';
import { ownPart } from '@/lib/structure-element';

let nextId = 0;

export class NdSwitch extends NdElement {
    static observedAttributes = ['checked', 'disabled', 'readonly', 'required', 'invalid', 'name'];

    #machineId = '';
    #controller = createZagElement({
        machine: switchMachine,
        connect: (service) => connectSwitch(service, normalizeProps),
        props: () => ({
            id: this.#machineId,
            checked: this.hasAttribute('checked'),
            disabled: this.hasAttribute('disabled'),
            readOnly: this.hasAttribute('readonly'),
            required: this.hasAttribute('required'),
            invalid: this.hasAttribute('invalid'),
            name: this.getAttribute('name') ?? undefined,
            onCheckedChange: (details) => {
                this.toggleAttribute('checked', details.checked);
                this.emit('checked-change', details);
            },
        }),
        render: (api) => this.#render(api),
    });

    protected onConnect(): void {
        this.#machineId ||= this.id || `nd-switch-${++nextId}`;
        this.#ensureStructure();
        this.#controller.start();
    }

    protected onDisconnect(): void {
        this.#controller.stop();
    }

    attributeChangedCallback(name: string, _previous: string | null, value: string | null): void {
        if (name === 'checked') {
            this.#controller.updateProps({ checked: value !== null });
            return;
        }
        this.#controller.updateProps({
            disabled: this.hasAttribute('disabled'),
            readOnly: this.hasAttribute('readonly'),
            required: this.hasAttribute('required'),
            invalid: this.hasAttribute('invalid'),
            name: this.getAttribute('name') ?? undefined,
        });
    }

    #ensureStructure(): void {
        let root = ownPart<HTMLElement>(this, 'root');
        if (!root) {
            root = this.ownerDocument.createElement('label');
            root.dataset.part = 'root';

            const input = this.ownerDocument.createElement('input');
            input.dataset.part = 'hidden-input';

            const control = this.ownerDocument.createElement('span');
            control.dataset.part = 'control';
            const thumb = this.ownerDocument.createElement('span');
            thumb.dataset.part = 'thumb';
            control.append(thumb);

            const label = this.ownerDocument.createElement('span');
            label.dataset.part = 'label';
            label.append(...this.childNodes);

            root.append(input, control, label);
            this.append(root);
            return;
        }

        // Authored nodes beside the root belong inside it.
        for (const node of Array.from(this.childNodes)) {
            if (node !== root) root.append(node);
        }

        if (!ownPart<HTMLElement>(root, 'hidden-input')) {
            const input = this.ownerDocument.createElement('input');
            input.dataset.part = 'hidden-input';
            root.prepend(input);
        }
    }

    #render(api: SwitchApi): void {
        const root = ownPart<HTMLElement>(this, 'root');
        const input = root?.querySelector<HTMLElement>('[data-part="hidden-input"]') ?? null;
        const control = root?.querySelector<HTMLElement>('[data-part="control"]') ?? null;
        const thumb = root?.querySelector<HTMLElement>('[data-part="thumb"]') ?? null;
        const label = root?.querySelector<HTMLElement>('[data-part="label"]') ?? null;

        if (root) spreadProps(root, api.getRootProps());
        if (input) spreadProps(input, api.getHiddenInputProps());
        if (control) spreadProps(control, api.getControlProps());
        if (thumb) spreadProps(thumb, api.getThumbProps());
        if (label) spreadProps(label, api.getLabelProps());
    }
}

defineElement('nd-switch', NdSwitch);
