/**
 * @module blue-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
export interface ShellNavItem {
    href: string;
    label: string;
    selected?: boolean;
    linkClass?: string;
}

export interface ShellNavModel {
    items?: readonly ShellNavItem[];
    mode?: 'inline' | 'list';
    containerClass?: string;
}

const shellNavTemplate = document.createElement('template');
shellNavTemplate.innerHTML = '<div class="shell-nav"></div>';

class ShellNav extends HTMLElement {
    #items: readonly ShellNavItem[];
    #mode: 'inline' | 'list';
    #containerClass: string;

    $container: HTMLElement | null = null;

    set model(model: ShellNavModel) {
        this.#items = model?.items ?? [];
        this.#mode = model?.mode ?? 'inline';
        this.#containerClass = model?.containerClass ?? 'shell-nav';
        this._render();
    }

    constructor() {
        super();
        this.#items = [];
        this.#mode = 'inline';
        this.#containerClass = 'shell-nav';
    }

    connectedCallback() {
        this.appendChild(shellNavTemplate.content.cloneNode(true));
        this.$container = this.querySelector('.shell-nav');
        this._render();
    }

    _render() {
        if (!this.$container) {
            return;
        }

        this.$container.innerHTML = '';

        if (this.#mode === 'list') {
            const list = document.createElement('ul');
            list.className = this.#containerClass;

            this.#items.forEach((item) => {
                const listItem = document.createElement('li');
                const link = this.#createLink(item);
                listItem.appendChild(link);
                list.appendChild(listItem);
            });

            this.$container.appendChild(list);

            return;
        }

        const nav = document.createElement('nav');
        nav.className = this.#containerClass;

        this.#items.forEach((item) => {
            const link = this.#createLink(item);
            nav.appendChild(link);
        });

        this.$container.appendChild(nav);
    }

    #createLink(item: ShellNavItem): HTMLAnchorElement {
        const link = document.createElement('a');
        link.href = item.href;
        link.textContent = item.label;

        if (item.linkClass) {
            link.classList.add(item.linkClass);
        }

        link.classList.toggle('selected', Boolean(item.selected));

        return link;
    }
}

window.customElements.define('shell-nav', ShellNav);

export default ShellNav;
