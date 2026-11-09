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
            initialFocusEl: this.#initialFocusElement(),
            onOpenChange: (details) => {
                this.toggleAttribute('open', details.open);
                this.emit('open-change', details);
                if (details.open) this.#focusInitial();
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

    /** Opens the dialog programmatically. */
    show(): void {
        this.#controller.api?.setOpen(true);
    }

    /** Closes the dialog programmatically. */
    hide(): void {
        this.#controller.api?.setOpen(false);
    }

    /**
     * Resolves `initial-focus` — a selector for the element that receives focus
     * when the dialog opens. Falls back to Zag's first-focusable default.
     */
    #initialFocusElement(): (() => HTMLElement | null) | undefined {
        const selector = this.getAttribute('initial-focus');
        if (selector === null || selector.trim().length === 0) return undefined;
        return () => this.querySelector<HTMLElement>(selector);
    }

    /**
     * Moves focus after the open render. Zag also receives `initialFocusEl`,
     * but this frame pass keeps the target correct once the content is visible.
     */
    #focusInitial(): void {
        const selector = this.getAttribute('initial-focus');
        if (selector === null || selector.trim().length === 0) return;
        const focus = (): void => {
            this.querySelector<HTMLElement>(selector)?.focus();
        };
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(focus);
        else focus();
    }

    #ensureTrigger(): HTMLElement {
        const existing = this.#ownPart('trigger');
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
        let content = this.#ownPart('content');
        let positioner = this.#ownPart('positioner');

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

        if (!this.#ownPart('backdrop')) {
            const backdrop = this.ownerDocument.createElement('div');
            backdrop.dataset.part = 'backdrop';
            positioner.before(backdrop);
        }
    }

    /**
     * Finds one of the dialog's own parts without matching a nested component's
     * parts. A nested combobox or popover also uses `[data-part]`, so an
     * unscoped descendant query would steal its positioner or trigger.
     */
    #ownPart<T extends HTMLElement = HTMLElement>(name: string): T | null {
        for (const child of this.children) {
            if (!(child instanceof HTMLElement)) continue;
            if (child.dataset.part === name) return child as T;
            if (child.dataset.part !== 'positioner') continue;
            for (const nested of child.children) {
                if (nested instanceof HTMLElement && nested.dataset.part === name) return nested as T;
            }
        }
        return null;
    }

    #render(api: DialogApi): void {
        const trigger = this.#ownPart('trigger');
        const backdrop = this.#ownPart('backdrop');
        const positioner = this.#ownPart('positioner');
        const content = this.#ownPart('content');
        const title = content?.querySelector<HTMLElement>('[data-part="title"]') ?? null;
        const description = content?.querySelector<HTMLElement>('[data-part="description"]') ?? null;
        const close = content?.querySelector<HTMLElement>('[data-part="close-trigger"]') ?? null;

        if (trigger) spreadProps(trigger, api.getTriggerProps());
        if (backdrop) spreadProps(backdrop, api.getBackdropProps());
        if (positioner) spreadProps(positioner, api.getPositionerProps());
        if (content) spreadProps(content, api.getContentProps());
        if (title) spreadProps(title, api.getTitleProps());
        if (description) spreadProps(description, api.getDescriptionProps());
        if (close) spreadProps(close, api.getCloseTriggerProps());
    }
}

defineElement('nd-dialog', NdDialog);
