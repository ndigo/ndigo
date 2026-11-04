/**
 * `conduit-nav` — the site header shown on every page.
 *
 * It renders the session-aware navigation (sign-in/register for an anonymous
 * visitor; new-article/settings/username/logout for a signed-in one) and emits
 * the sign-out intent as a DOM event. It has no container access of its own,
 * so the event bubbles to the view target's bridge like any other view action.
 *
 * @module ndigo-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AbstractWebComponent, TagMapping } from '@ndigo/view-webcomponent';
import { ACTIONS } from '../app/conduit-events';
import { avatar, create, link } from '../lib/dom';
import type { ConduitSessionModel } from '../services';

/** Which nav entry is current (used for the active style). */
export type NavSection = 'home' | 'login' | 'register' | 'settings' | 'editor' | 'article' | 'profile';

/** The nav's model. */
export interface NavModel {
    session: ConduitSessionModel;
    active: NavSection;
}

/** The nav element contract used by the page layout helper. */
export interface ConduitNavElement extends HTMLElement {
    model: NavModel;
}

@TagMapping('conduit-nav')
export default class ConduitNav extends AbstractWebComponent {
    #model: NavModel = { session: { isAuthenticated: false, user: null }, active: 'home' };

    set model(model: NavModel) {
        this.#model = model;
        this.render();
    }

    protected override handleConnect(): void {
        this.render();
    }

    render(): void {
        const { session, active } = this.#model;
        const nodes: Node[] = [link('#/', 'conduit', 'brand')];

        const entry = (href: string, label: string, id: NavSection): HTMLAnchorElement =>
            link(href, label, active === id ? 'active' : undefined);
        nodes.push(
            create('span', {
                className: 'nav-links',
                children: [
                    entry('#/', 'Home', 'home'),
                    ...(session.isAuthenticated
                        ? [entry('#/editor', 'New Article', 'editor'), entry('#/settings', 'Settings', 'settings')]
                        : [entry('#/login', 'Sign in', 'login'), entry('#/register', 'Sign up', 'register')]),
                ],
            })
        );
        nodes.push(create('span', { className: 'spacer' }));

        if (session.isAuthenticated && session.user) {
            const user = session.user;
            nodes.push(
                avatar(user.image, user.username),
                link(`#/profile/${user.username}`, user.username, active === 'profile' ? 'active' : undefined),
                create('button', {
                    className: 'sign-out',
                    text: 'Sign out',
                    on: { click: () => this.emit(ACTIONS.authLogout) },
                })
            );
        }

        this.replaceChildren(create('nav', { className: 'nav', children: nodes }));
    }
}
