/**
 * The profile routes (`#/profile/:username`, `#/profile/:username/favorited`).
 *
 * The favorited tab is its own route rather than page state, so a profile tab
 * is linkable and shareable; `ProfileService` keys its loaded window by
 * username + tab + page, so switching tabs (a navigation) loads the other list.
 *
 * @module blue-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AsApplicationContextAware, type ApplicationContext } from '@blue/context';
import { Null } from '@blue/core';
import { ModelAndView, parameters, pathVariable, routeMapping } from '@blue/dispatcher';
import { PROFILE_SERVICE, SESSION_SERVICE } from '../app/conduit-tokens';
import type { ConduitProfileTab } from '../services';
import type { ProfileModel } from '../views/models';

@routeMapping('/profile')
export default class ProfileController extends AsApplicationContextAware(Null) {
    /** Injected by the container (`ApplicationContextAware`). */
    declare readonly applicationContext: ApplicationContext;

    /**
     * Serves a profile with its authored articles.
     *
     * @param username - The profile's username.
     * @returns The profile model.
     */
    @routeMapping('/:username')
    @parameters({ username: pathVariable('username') })
    async handleProfile(username: string): Promise<ModelAndView> {
        return this.#profile(username, 'author');
    }

    /**
     * Serves a profile with the articles it favorited.
     *
     * @param username - The profile's username.
     * @returns The profile model.
     */
    @routeMapping('/:username/favorited')
    @parameters({ username: pathVariable('username') })
    async handleFavorited(username: string): Promise<ModelAndView> {
        return this.#profile(username, 'favorited');
    }

    /**
     * Builds the profile model. The tab is the route's, so both routes share
     * one projection and the service window is always keyed to what the URL says.
     *
     * @param username - The profile's username.
     * @param tab - The tab this route selects.
     * @returns The profile model.
     */
    async #profile(username: string, tab: ConduitProfileTab): Promise<ModelAndView> {
        const profiles = this.applicationContext.getValue(PROFILE_SERVICE);
        const session = this.applicationContext.getValue(SESSION_SERVICE);

        profiles.setRouteTarget(username, tab);
        await profiles.ensureProfile(username);

        const state = profiles.profileState;
        const model: ProfileModel = {
            session: session.toModel(),
            profile: state.profile,
            tab: state.tab,
            page: state.page,
            pageCount: profiles.pageCount,
            articles: state.articles,
            notFound: state.notFound,
            error: state.error,
        };
        return new ModelAndView('conduit-profile', model);
    }
}
