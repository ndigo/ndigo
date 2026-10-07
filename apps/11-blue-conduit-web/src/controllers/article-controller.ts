/**
 * The article route (`#/article/:slug`).
 *
 * Loads the article and its comments through the services that own them — both
 * are keyed by slug, so a route refresh (favorite, follow, comment) re-renders
 * the cached state instead of re-fetching it.
 *
 * @module blue-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AsApplicationContextAware, type ApplicationContext } from '@blue/context';
import { Null } from '@blue/core';
import { ModelAndView, parameters, pathVariable, routeMapping } from '@blue/dispatcher';
import { ARTICLE_SERVICE, COMMENT_SERVICE, SESSION_SERVICE } from '../app/conduit-tokens';
import type { ArticleModel } from '../views/models';

@routeMapping('/article')
export default class ArticleController extends AsApplicationContextAware(Null) {
    /** Injected by the container (`ApplicationContextAware`). */
    declare readonly applicationContext: ApplicationContext;

    /**
     * Serves one article with its comments.
     *
     * @param slug - The article slug from the route.
     * @returns The article model.
     */
    @routeMapping('/:slug')
    @parameters({ slug: pathVariable('slug') })
    async handleArticle(slug: string): Promise<ModelAndView> {
        const articles = this.applicationContext.getValue(ARTICLE_SERVICE);
        const comments = this.applicationContext.getValue(COMMENT_SERVICE);
        const session = this.applicationContext.getValue(SESSION_SERVICE);

        await articles.ensureArticle(slug);
        // An unknown slug simply yields an empty comment list (the API answers
        // 404 for it too) — the article's own `notFound` flag is what the view
        // renders, so the two loads stay independent.
        await comments.ensure(slug);

        const model: ArticleModel = {
            session: session.toModel(),
            article: articles.articleState.article,
            notFound: articles.articleState.notFound,
            comments: comments.comments,
            commentErrors: comments.commentErrors(),
        };
        return new ModelAndView('conduit-article', model);
    }
}
