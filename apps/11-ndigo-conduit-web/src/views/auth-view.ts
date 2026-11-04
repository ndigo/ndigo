/**
 * `conduit-auth` — the sign-in (`#/login`) and sign-up (`#/register`) forms.
 *
 * The API's `{"errors":{…}}` envelope is rendered where it belongs: each key
 * that names a field (`email`, `username`, `password`) appears under that field,
 * and anything else (`credentials` for a wrong password, `body` for a shape the
 * binder rejected) appears as a form-level message — so a credential failure is
 * never shown as "email is invalid".
 *
 * Draft values are held per element instance and restored on every render, so
 * the refresh that follows a failed submit (which re-renders the page from the
 * new model) does not clear what the visitor typed.
 *
 * @module ndigo-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AbstractWebComponent, TagMapping } from '@ndigo/view-webcomponent';
import { ACTIONS } from '../app/conduit-events';
import { create, link, textField } from '../lib/dom';
import { formErrors, navFor, type ViewContext } from './shell';
import type { AuthModel } from './models';

/** The field keys each form renders under an input. */
const FIELD_KEYS = {
    login: ['email', 'password'],
    register: ['username', 'email', 'password'],
} as const;

/** One page's heading and footer copy. */
const COPY = {
    login: { title: 'Sign in', action: 'Sign in', switch: 'Need an account?', href: '#/register', label: 'Sign up' },
    register: { title: 'Sign up', action: 'Sign up', switch: 'Have an account?', href: '#/login', label: 'Sign in' },
} as const;

@TagMapping('conduit-auth')
export default class AuthView extends AbstractWebComponent {
    #model: AuthModel | null = null;
    #page: AuthModel['page'] | null = null;
    #draft = { username: '', email: '', password: '' };

    set model(model: AuthModel) {
        if (model.page !== this.#page) {
            // A different form: nothing typed here belongs to it.
            this.#page = model.page;
            this.#draft = { username: '', email: '', password: '' };
        }
        this.#model = model;
        this.render();
    }

    protected override handleConnect(): void {
        this.render();
    }

    render(): void {
        const model = this.#model;
        if (!model) {
            return;
        }

        const ctx: ViewContext = { session: model.session, emit: (type, detail) => void this.emit(type, detail) };
        const copy = COPY[model.page];
        const fieldKeys = FIELD_KEYS[model.page];

        const form = create('form', {
            on: {
                submit: (event: Event) => {
                    event.preventDefault();
                    if (model.page === 'login') {
                        ctx.emit(ACTIONS.authLogin, { email: this.#draft.email, password: this.#draft.password });
                    } else {
                        ctx.emit(ACTIONS.authRegister, {
                            username: this.#draft.username,
                            email: this.#draft.email,
                            password: this.#draft.password,
                        });
                    }
                },
            },
            children: [
                formErrors(model.errors, fieldKeys),
                ...(model.page === 'register'
                    ? [
                          textField({
                              name: 'username',
                              label: 'Username',
                              value: this.#draft.username,
                              errors: model.errors,
                              onInput: (value) => {
                                  this.#draft.username = value;
                              },
                          }),
                      ]
                    : []),
                textField({
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    value: this.#draft.email,
                    errors: model.errors,
                    onInput: (value) => {
                        this.#draft.email = value;
                    },
                }),
                textField({
                    name: 'password',
                    label: 'Password',
                    type: 'password',
                    value: this.#draft.password,
                    errors: model.errors,
                    onInput: (value) => {
                        this.#draft.password = value;
                    },
                }),
                create('div', {
                    className: 'card-actions',
                    children: [
                        create('button', { className: 'primary', text: copy.action, attrs: { type: 'submit' } }),
                    ],
                }),
            ],
        });

        this.replaceChildren(
            create('div', {
                children: [
                    navFor(model.session, model.page),
                    create('div', {
                        className: 'card',
                        children: [
                            create('h1', { className: 'page-title', text: copy.title }),
                            form,
                            create('p', {
                                className: 'muted',
                                children: [create('span', { text: `${copy.switch} ` }), link(copy.href, copy.label)],
                            }),
                        ],
                    }),
                ],
            })
        );
    }
}
