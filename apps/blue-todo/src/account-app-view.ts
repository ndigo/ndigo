import { routes } from './shell-composition';
import './shell-nav-view';

const accountTemplate = document.createElement('template');
accountTemplate.innerHTML = `
    <section class="accountapp">
        <header class="header">
            <h1 class="title">Account</h1>
        </header>
        <shell-nav></shell-nav>
        <main class="account-content"></main>
        <signals-counter></signals-counter>
    </section>
`;

interface AccountModel {
    section?: 'overview' | 'settings';
    title?: string;
}

interface ShellNavElement extends HTMLElement {
    model: unknown;
}

class AccountApp extends HTMLElement {
    #section: 'overview' | 'settings';
    #title: string;
    $shellNav: HTMLElement | null = null;

    set model(model: AccountModel) {
        this.#section = model?.section ?? 'overview';
        this.#title = model?.title ?? 'Account Overview';
        this._render();
    }

    constructor() {
        super();
        this.#section = 'overview';
        this.#title = 'Account Overview';
    }

    connectedCallback() {
        this.appendChild(accountTemplate.content.cloneNode(true));
        this.$shellNav = this.querySelector('shell-nav');
        this._render();
    }

    _render() {
        const title = this.querySelector('.title'),
            content = this.querySelector('.account-content');

        if (!title || !content || !this.$shellNav) {
            return;
        }

        title.textContent = this.#title;
        content.textContent =
            this.#section === 'settings'
                ? 'Manage your account preferences and profile settings.'
                : 'Welcome to your account overview.';

        (this.$shellNav as ShellNavElement).model = {
            containerClass: 'account-nav',
            items: [
                {
                    href: routes.accountOverview?.href?.() ?? '#/account',
                    label: 'Overview',
                    linkClass: 'overview-link',
                    selected: this.#section === 'overview',
                },
                {
                    href: routes.accountSettings?.href?.() ?? '#/account/settings',
                    label: 'Settings',
                    linkClass: 'settings-link',
                    selected: this.#section === 'settings',
                },
                {
                    href: routes.todoAll?.href?.() ?? '#/todo',
                    label: 'Back to Todos',
                    linkClass: 'todo-link',
                },
            ],
            mode: 'inline',
        };
    }
}

window.customElements.define('account-app', AccountApp);

export default AccountApp;
