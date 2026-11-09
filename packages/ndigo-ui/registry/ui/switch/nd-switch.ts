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

let nextId = 0;

export class NdSwitch extends NdElement {
    static observedAttributes = ['checked'];

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
        this.#machineId = this.id || `nd-switch-${++nextId}`;
        this.#ensureStructure();
        this.#controller.start();
    }

    protected onDisconnect(): void {
        this.#controller.stop();
    }

    attributeChangedCallback(name: string, _previous: string | null, value: string | null): void {
        if (name === 'checked') this.#controller.updateProps({ checked: value !== null });
    }

    #ensureStructure(): void {
        let root = this.querySelector<HTMLElement>('[data-part="root"]');
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

        if (!root.querySelector('[data-part="hidden-input"]')) {
            const input = this.ownerDocument.createElement('input');
            input.dataset.part = 'hidden-input';
            root.prepend(input);
        }
    }

    #render(api: SwitchApi): void {
        const root = this.querySelector<HTMLElement>('[data-part="root"]');
        const input = this.querySelector<HTMLElement>('[data-part="hidden-input"]');
        const control = this.querySelector<HTMLElement>('[data-part="control"]');
        const thumb = this.querySelector<HTMLElement>('[data-part="thumb"]');
        const label = this.querySelector<HTMLElement>('[data-part="label"]');

        if (root) spreadProps(root, api.getRootProps());
        if (input) spreadProps(input, api.getHiddenInputProps());
        if (control) spreadProps(control, api.getControlProps());
        if (thumb) spreadProps(thumb, api.getThumbProps());
        if (label) spreadProps(label, api.getLabelProps());
    }
}

defineElement('nd-switch', NdSwitch);
