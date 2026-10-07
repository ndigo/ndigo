/**
 * `conduit-settings` — the profile editor (`#/settings`), plus sign-out.
 *
 * The form is seeded once from the account the model carries and then owns its
 * draft, so the re-render that follows a rejected save shows the API's per-field
 * messages without losing the edits. The password field starts empty and is
 * omitted from the patch when left empty (`PUT /api/user` treats an absent
 * member as unchanged).
 *
 * @module blue-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AbstractWebComponent, TagMapping } from '@blue/view-webcomponent';
import { ACTIONS } from '../app/conduit-events';
import { create, textField } from '../lib/dom';
import { formErrors, navFor, notFound, type ViewContext } from './shell';
import type { SettingsModel } from './models';

/** The envelope keys this form renders under an input. */
const FIELD_KEYS = ['image', 'username', 'bio', 'email', 'password'] as const;

/** The settings form's draft fields. */
type DraftKey = (typeof FIELD_KEYS)[number];

@TagMapping('conduit-settings')
export default class SettingsView extends AbstractWebComponent {
    #model: SettingsModel | null = null;
    #seeded = false;
    #draft = { image: '', username: '', bio: '', email: '', password: '' };

    set model(model: SettingsModel) {
        if (!this.#seeded && model.session.user) {
            this.#seeded = true;
            this.#draft = {
                image: model.session.user.image ?? '',
                username: model.session.user.username,
                bio: model.session.user.bio ?? '',
                email: model.session.user.email,
                password: '',
            };
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
        if (!model.session.isAuthenticated) {
            this.replaceChildren(navFor(model.session, 'settings'), notFound('Sign in to change your settings.'));
            return;
        }

        const ctx: ViewContext = { session: model.session, emit: (type, detail) => void this.emit(type, detail) };
        const bind = (key: DraftKey) => (value: string) => {
            this.#draft[key] = value;
        };

        const form = create('form', {
            on: {
                submit: (event: Event) => {
                    event.preventDefault();
                    ctx.emit(ACTIONS.settingsSave, { ...this.#draft });
                },
            },
            children: [
                formErrors(model.errors, FIELD_KEYS),
                textField({
                    name: 'image',
                    label: 'Profile image URL',
                    value: this.#draft.image,
                    errors: model.errors,
                    onInput: bind('image'),
                }),
                textField({
                    name: 'username',
                    label: 'Username',
                    value: this.#draft.username,
                    errors: model.errors,
                    onInput: bind('username'),
                }),
                textField({
                    name: 'bio',
                    label: 'Short bio',
                    value: this.#draft.bio,
                    multiline: true,
                    errors: model.errors,
                    onInput: bind('bio'),
                }),
                textField({
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    value: this.#draft.email,
                    errors: model.errors,
                    onInput: bind('email'),
                }),
                textField({
                    name: 'password',
                    label: 'New password (leave empty to keep the current one)',
                    type: 'password',
                    value: this.#draft.password,
                    errors: model.errors,
                    onInput: bind('password'),
                }),
                create('div', {
                    className: 'card-actions',
                    children: [
                        create('button', { className: 'primary', text: 'Save settings', attrs: { type: 'submit' } }),
                    ],
                }),
            ],
        });

        this.replaceChildren(
            create('div', {
                children: [
                    navFor(model.session, 'settings'),
                    create('div', {
                        className: 'card wide',
                        children: [
                            create('h1', { className: 'page-title', text: 'Your settings' }),
                            form,
                            create('div', {
                                className: 'card-actions',
                                children: [
                                    create('button', {
                                        className: 'danger',
                                        text: 'Sign out',
                                        on: { click: () => ctx.emit(ACTIONS.authLogout) },
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            })
        );
    }
}
