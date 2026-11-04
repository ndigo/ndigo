/**
 * The home route (`#/`) — builds the feed model from the article and tag
 * services.
 *
 * Controllers are deliberately thin: they await the service that owns the data
 * (`ensureFeed` fetches only when the query changed), then project the signals
 * into the view model. No filtering, paging arithmetic or formatting happens
 * here — those live in the service (state) and the view (presentation).
 *
 * @module ndigo-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AsApplicationContextAware, type ApplicationContext } from '@ndigo/context';
import { Null } from '@ndigo/core';
import { ModelAndView, parameters, pathValue, routeMapping } from '@ndigo/dispatcher';
import { ARTICLE_SERVICE, SESSION_SERVICE, TAG_SERVICE } from '../app/conduit-tokens';
import type { HomeModel } from '../views/models';

@routeMapping('/')
export default class HomeController extends AsApplicationContextAware(Null) {
    /** Injected by the container (`ApplicationContextAware`). */
    declare readonly applicationContext: ApplicationContext;

    /**
     * Serves the home feed for the current tab / tag / page.
     *
     * @param path - The matched route path (bound so the mapping sees a
     *   parameter, matching the other controllers' shape).
     * @returns The home model and its view name.
     */
    @routeMapping('/')
    @parameters({ path: pathValue() })
    async handleHome(path: string): Promise<ModelAndView> {
        void path;
        const articles = this.applicationContext.getValue(ARTICLE_SERVICE);
        const tags = this.applicationContext.getValue(TAG_SERVICE);
        const session = this.applicationContext.getValue(SESSION_SERVICE);

        await articles.ensureFeed();
        await tags.ensure();

        const model: HomeModel = {
            session: session.toModel(),
            tab: articles.feed.tab,
            tag: articles.feed.tag,
            page: articles.feed.page,
            pageCount: articles.pageCount,
            articles: articles.feed.articles,
            tags: tags.tags,
            error: articles.feed.error,
        };
        return new ModelAndView('conduit-home', model);
    }
}
