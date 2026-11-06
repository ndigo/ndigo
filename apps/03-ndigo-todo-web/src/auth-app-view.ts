/**
 */
import { TagMapping } from '@ndigo/view-webcomponent';
import { authClient, login } from './auth-store';

type AuthPage = 'login' | 'profile' | 'admin' | 'forbidden';

export interface AuthAppModel {
    page?: AuthPage;
}

const PAGE_TITLES: Record<AuthPage, string> = {
    login: 'Sign in',
    profile: 'Profile',
    admin: 'Admin Panel',
    forbidden: 'Forbidden',
};

const CONTAINER_CLASSES: Record<AuthPage, string> = {
    login: 'login-container',
    profile: 'profile-container',
    admin: 'admin-container',
    forbidden: 'forbidden-container',
};

function element<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    text?: string
): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    if (className) {
        node.className = className;
    }
    if (text !== undefined) {
        node.textContent = text;
    }
    return node;
}

/**
 * `auth-app` renders the demo's four `/auth/*` pages. The shell router guards
 * profile/admin before navigation reaches this view; login performs the demo
 * credential check and sends the user on to the profile page.
 */
@TagMapping('auth-app')
class AuthApp extends HTMLElement {
    #page: AuthPage = 'login';

    set model(model: AuthAppModel) {
        this.#page = model?.page ?? 'login';
        this._render();
    }

    connectedCallback() {
        this._render();
    }

    _render() {
        const container = element('section', CONTAINER_CLASSES[this.#page]);
        container.append(element('h1', 'title', PAGE_TITLES[this.#page]));

        if (this.#page === 'login') {
            this.#renderLogin(container);
        } else if (this.#page === 'profile') {
            this.#renderProfile(container);
        } else if (this.#page === 'admin') {
            this.#renderAdmin(container);
        } else {
            this.#renderForbidden(container);
        }

        this.replaceChildren(container);
    }

    #renderLogin(container: HTMLElement): void {
        const form = element('form');
        const error = element('p', 'error', '');
        error.hidden = true;

        const username = element('input');
        username.type = 'text';
        username.id = 'auth-username';
        username.name = 'username';
        username.autocomplete = 'username';
        username.required = true;

        const password = element('input');
        password.type = 'password';
        password.id = 'auth-password';
        password.name = 'password';
        password.autocomplete = 'current-password';
        password.required = true;

        const usernameGroup = element('div', 'form-group');
        const usernameLabel = element('label', undefined, 'Username');
        usernameLabel.htmlFor = 'auth-username';
        usernameGroup.append(usernameLabel, username);

        const passwordGroup = element('div', 'form-group');
        const passwordLabel = element('label', undefined, 'Password');
        passwordLabel.htmlFor = 'auth-password';
        passwordGroup.append(passwordLabel, password);

        const submit = element('button', undefined, 'Sign in');
        submit.type = 'submit';

        form.append(error, usernameGroup, passwordGroup, submit);
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const result = await login(username.value, password.value);

            if (result) {
                window.location.hash = '#/auth/profile';
                return;
            }

            error.textContent = 'Invalid username or password.';
            error.hidden = false;
        });

        container.append(
            form,
            element('p', 'demo-notice', 'Demo credentials: admin / demo (admin) or alice / demo (user).')
        );
    }

    #renderProfile(container: HTMLElement): void {
        const principal = authClient.principal;

        if (!principal) {
            container.append(element('p', 'error', 'You are not signed in.'), this.#link('#/auth/login', 'Sign in'));
            return;
        }

        const info = element('div', 'profile-info');
        info.append(
            element('p', undefined, `Signed in as: ${principal.name}`),
            element('p', undefined, `Roles: ${principal.roles.join(', ') || 'none'}`)
        );

        container.append(info, this.#link('#/auth/admin', 'Admin panel'));
    }

    #renderAdmin(container: HTMLElement): void {
        const principal = authClient.principal;
        container.append(
            element('p', undefined, `Admin area — welcome, ${principal?.name ?? 'administrator'}.`),
            element('p', undefined, 'Only principals with the `admin` role reach this page.'),
            this.#link('#/auth/profile', 'Back to profile')
        );
    }

    #renderForbidden(container: HTMLElement): void {
        container.append(
            element('p', 'error', 'Your account does not have the required role for that page.'),
            this.#link('#/todo', 'Back to todos')
        );
    }

    #link(href: string, label: string): HTMLAnchorElement {
        const anchor = element('a', undefined, label);
        anchor.href = href;
        return anchor;
    }
}

export default AuthApp;
