/**
 * `<nd-navigation-menu>` — horizontal site navigation built on the Zag.js
 * navigation-menu machine.
 *
 * Items are authored as `[data-part="item"][data-value]`; items with a trigger
 * and content open a dropdown, items with only a link navigate directly. The
 * basic inline-content pattern is used — no shared viewport or proxies.
 */
import { connect as connectNavigationMenu, machine as navigationMenuMachine } from '@zag-js/navigation-menu';
import type { Api as NavigationMenuApi } from '@zag-js/navigation-menu';
import { normalizeProps, spreadProps } from '@zag-js/vanilla';
import { defineElement, NdElement } from '@/lib/base-element';
import { createZagElement } from '@/lib/zag-element';

const DEFAULT_OPEN_DELAY = 200;
const DEFAULT_CLOSE_DELAY = 300;

let nextId = 0;

export class NdNavigationMenu extends NdElement {
    static observedAttributes = ['orientation'];

    #machineId = '';
    #controller = createZagElement({
        machine: navigationMenuMachine,
        connect: (service): NavigationMenuApi => connectNavigationMenu(service, normalizeProps),
        props: () => ({
            id: this.#machineId,
            orientation: this.#orientation(),
            defaultValue: this.getAttribute('value') ?? this.getAttribute('default-value') ?? undefined,
            openDelay: this.#numberAttribute('open-delay', DEFAULT_OPEN_DELAY),
            closeDelay: this.#numberAttribute('close-delay', DEFAULT_CLOSE_DELAY),
            disableClickTrigger: this.hasAttribute('disable-click-trigger'),
            disableHoverTrigger: this.hasAttribute('disable-hover-trigger'),
            disablePointerLeaveClose: this.hasAttribute('disable-pointer-leave-close'),
            onValueChange: (details) => {
                this.dataset.value = details.value;
                this.emit('value-change', details);
            },
        }),
        render: (api) => this.#render(api),
    });

    protected onConnect(): void {
        this.#machineId = this.id || `nd-navigation-menu-${++nextId}`;
        this.#controller.start();
    }

    protected onDisconnect(): void {
        this.#controller.stop();
    }

    attributeChangedCallback(name: string, _previous: string | null, value: string | null): void {
        if (name === 'orientation') this.#controller.updateProps({ orientation: this.#orientation() });
    }

    /** Opens the dropdown for one item value. */
    show(value: string): void {
        this.#controller.api?.setValue(value);
    }

    /** Closes any open dropdown. */
    hide(): void {
        this.#controller.api?.setValue('');
    }

    #orientation(): 'horizontal' | 'vertical' {
        return this.getAttribute('orientation') === 'vertical' ? 'vertical' : 'horizontal';
    }

    #numberAttribute(name: string, fallback: number): number {
        const raw = this.getAttribute(name);
        if (raw === null) return fallback;
        const value = Number(raw);
        return Number.isFinite(value) && value >= 0 ? value : fallback;
    }

    #render(api: NavigationMenuApi): void {
        spreadProps(this, api.getRootProps());
        const list = this.querySelector<HTMLElement>('[data-part="list"]');
        if (list) spreadProps(list, api.getListProps());

        for (const item of this.querySelectorAll<HTMLElement>('[data-part="item"][data-value]')) {
            const value = item.dataset.value ?? '';
            const disabled = item.hasAttribute('data-disabled');
            spreadProps(item, api.getItemProps({ value, disabled }));

            const trigger = item.querySelector<HTMLElement>('[data-part="trigger"]');
            if (trigger) spreadProps(trigger, api.getTriggerProps({ value, disabled }));

            const content = item.querySelector<HTMLElement>('[data-part="content"]');
            if (content) spreadProps(content, api.getContentProps({ value }));

            for (const link of item.querySelectorAll<HTMLElement>('[data-part="link"]')) {
                const current = link.hasAttribute('data-current') || link.getAttribute('aria-current') === 'page';
                spreadProps(link, api.getLinkProps({ value, current }));
            }
        }
    }
}

defineElement('nd-navigation-menu', NdNavigationMenu);
