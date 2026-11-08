/**
 * `<nd-dialog>` — a modal dialog built on the Zag.js dialog machine.
 *
 * Markup contract: a `[data-part="trigger"]` (optional) and a
 * `[data-part="content"]` with optional title, description, and close parts.
 * Missing wrappers are created on connect so the component also accepts the
 * body markup on its own.
 */
import { connect as connectDialog, machine as dialogMachine } from '@zag-js/dialog';
import type { Api as DialogApi } from '@zag-js/dialog';
import { normalizeProps, spreadProps } from '@zag-js/vanilla';
import { defineElement, NdElement } from '@/lib/base-element';
import { createZagElement } from '@/lib/zag-element';

const DEFAULT_TRIGGER_LABEL = 'Open dialog';

let nextId = 0;

export class NdDialog extends NdElement {
    static observedAttributes = ['open'];

    #machineId = '';
    #controller = createZagElement({
        machine: dialogMachine,
        connect: (service) => connectDialog(service, normalizeProps),
        props: () => ({
            id: this.#machineId,
            open: this.hasAttribute('open'),
            onOpenChange: (details) => {
                this.toggleAttribute('open', details.open);
                this.emit('open-change', details);
            },
        }),
        render: (api) => this.#render(api),
    });

    protected onConnect(): void {
        this.#machineId = this.id || `nd-dialog-${++nextId}`;
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
                          child !== trigger &&
                          !(
                              child instanceof HTMLElement &&
                              ['backdrop', 'positioner'].includes(child.dataset.part ?? '')
                          )
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

        if (!this.querySelector('[data-part="backdrop"]')) {
            const backdrop = this.ownerDocument.createElement('div');
            backdrop.dataset.part = 'backdrop';
            positioner.before(backdrop);
        }
    }

    #render(api: DialogApi): void {
        const parts = {
            trigger: this.querySelector<HTMLElement>('[data-part="trigger"]'),
            backdrop: this.querySelector<HTMLElement>('[data-part="backdrop"]'),
            positioner: this.querySelector<HTMLElement>('[data-part="positioner"]'),
            content: this.querySelector<HTMLElement>('[data-part="content"]'),
            title: this.querySelector<HTMLElement>('[data-part="title"]'),
            description: this.querySelector<HTMLElement>('[data-part="description"]'),
            close: this.querySelector<HTMLElement>('[data-part="close-trigger"]'),
        };
        if (parts.trigger) spreadProps(parts.trigger, api.getTriggerProps());
        if (parts.backdrop) spreadProps(parts.backdrop, api.getBackdropProps());
        if (parts.positioner) spreadProps(parts.positioner, api.getPositionerProps());
        if (parts.content) spreadProps(parts.content, api.getContentProps());
        if (parts.title) spreadProps(parts.title, api.getTitleProps());
        if (parts.description) spreadProps(parts.description, api.getDescriptionProps());
        if (parts.close) spreadProps(parts.close, api.getCloseTriggerProps());
    }
}

defineElement('nd-dialog', NdDialog);
