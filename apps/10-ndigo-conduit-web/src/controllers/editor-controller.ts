/**
 * The editor routes (`#/editor`, `#/editor/:slug`).
 *
 * Both are behind the auth guard. The slug form loads the article through
 * `ArticleService.ensureArticle` (the same keyed load the article page uses), so
 * the editor prefills from the API rather than from any cached list entry — a
 * list summary has no `body` to edit.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AsApplicationContextAware, type ApplicationContext } from '@ndigo/context';
import { Null } from '@ndigo/core';
import { ModelAndView, parameters, pathValue, pathVariable, routeMapping } from '@ndigo/dispatcher';
import { ARTICLE_SERVICE, SESSION_SERVICE } from '../app/conduit-tokens';
import type { EditorModel } from '../views/models';

@routeMapping('/editor')
export default class EditorController extends AsApplicationContextAware(Null) {
    /** Injected by the container (`ApplicationContextAware`). */
    declare readonly applicationContext: ApplicationContext;

    /**
     * Serves the empty editor for a new article.
     *
     * @param path - The matched route path.
     * @returns The editor model with no article.
     */
    @routeMapping('/')
    @parameters({ path: pathValue() })
    handleNew(path: string): ModelAndView {
        void path;
        const session = this.applicationContext.getValue(SESSION_SERVICE);
        const model: EditorModel = {
            session: session.toModel(),
            slug: null,
            article: null,
            notFound: false,
            errors: null,
        };
        return new ModelAndView('conduit-editor', model);
    }

    /**
     * Serves the editor prefilled with an existing article.
     *
     * @param slug - The article slug from the route.
     * @returns The editor model for that article.
     */
    @routeMapping('/:slug')
    @parameters({ slug: pathVariable('slug') })
    async handleEdit(slug: string): Promise<ModelAndView> {
        const articles = this.applicationContext.getValue(ARTICLE_SERVICE);
        const session = this.applicationContext.getValue(SESSION_SERVICE);

        await articles.ensureArticle(slug);

        const model: EditorModel = {
            session: session.toModel(),
            slug,
            article: articles.articleState.article,
            notFound: articles.articleState.notFound,
            errors: articles.editorErrors(),
        };
        return new ModelAndView('conduit-editor', model);
    }
}
