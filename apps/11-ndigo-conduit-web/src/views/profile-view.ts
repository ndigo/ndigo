/**
 * `conduit-profile` — a user's page (`#/profile/:username`), with their
 * authored and favorited article tabs, a follow control, and pagination.
 *
 * The tab is part of the route (`#/profile/:username/favorited`), so a profile
 * tab is a real, linkable location; the loaded window is cached in
 * `ProfileService` under the username + tab + page key.
 *
 * @module ndigo-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AbstractWebComponent, TagMapping } from '@ndigo/view-webcomponent';
import { ACTIONS } from '../app/conduit-events';
import { avatar, create, link } from '../lib/dom';
import { articleList, navFor, pagination, type ViewContext } from './shell';
import { followButton } from './article-byline';
import type { ProfileModel } from './models';

@TagMapping('conduit-profile')
export default class ProfileView extends AbstractWebComponent {
    #model: ProfileModel | null = null;

    set model(model: ProfileModel) {
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
        const profile = model.profile;

        this.replaceChildren(
            create('div', {
                children: [
                    navFor(model.session, 'profile'),
                    create('div', {
                        className: 'profile-header',
                        children: profile
                            ? [
                                  avatar(profile.image, profile.username),
                                  create('h1', { text: profile.username }),
                                  create('p', { text: profile.bio ?? '' }),
                                  followButton(profile, ctx),
                              ]
                            : [
                                  create('p', {
                                      className: 'form-error',
                                      text: model.error ?? 'That user does not exist.',
                                  }),
                              ],
                    }),
                    create('div', {
                        children: [
                            ...(profile ? [this.#tabs(model, profile.username)] : []),
                            articleList(model.articles, ctx),
                            pagination(model.page, model.pageCount, ctx, ACTIONS.profilePage),
                        ],
                    }),
                ],
            })
        );
    }

    /**
     * Builds the authored / favorited tab strip as real links, because each tab
     * is a route (`#/profile/:username` and `#/profile/:username/favorited`) —
     * a profile tab can be bookmarked and shared.
     *
     * @param model - The page model.
     * @param username - The profile's username.
     * @returns The tab strip.
     */
    #tabs(model: ProfileModel, username: string): HTMLElement {
        const tab = (label: string, href: string, selected: boolean): HTMLElement =>
            create('li', {
                children: [link(href, label, selected ? 'selected tab-link' : 'tab-link')],
            });

        return create('ul', {
            className: 'tabs',
            children: [
                tab('My Articles', `#/profile/${username}`, model.tab === 'author'),
                tab('Favorited Articles', `#/profile/${username}/favorited`, model.tab === 'favorited'),
            ],
        });
    }
}
