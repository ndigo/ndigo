/**
 * The one place a view's intent becomes a service call.
 *
 * `DOMElementViewTarget` forwards the {@link CONDUIT_EVENT_MAP} bridged events
 * onto the application context; this module subscribes to them and dispatches
 * each to the service that owns it. Controllers stay thin (they only build
 * models), views stay pure (they only render models and emit intents), and the
 * whole interaction surface is readable in one file.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { ApplicationContext } from '@ndigo/context';
import type { ConduitServices } from './conduit-services';
import {
    CONDUIT_EVENTS,
    type ArticleFavoritePayload,
    type ArticleRefPayload,
    type ArticleSavePayload,
    type AuthorFollowPayload,
    type AuthLoginPayload,
    type AuthRegisterPayload,
    type CommentAddPayload,
    type CommentRefPayload,
    type FeedTabPayload,
    type FeedTagPayload,
    type PagePayload,
    type SettingsSavePayload,
} from './conduit-events';

/**
 * Subscribes the service layer to the view-facing events.
 *
 * @param context - The application context carrying the events.
 * @param services - The wired services.
 */
export function wireConduitActions(context: ApplicationContext, services: ConduitServices): void {
    const { session, articles, comments, profiles, tags } = services;

    context.on(CONDUIT_EVENTS.authLogin, (payload: AuthLoginPayload) => {
        void session.login(payload).then(() => articles.invalidate());
    });

    context.on(CONDUIT_EVENTS.authRegister, (payload: AuthRegisterPayload) => {
        void session.register(payload).then(() => articles.invalidate());
    });

    context.on(CONDUIT_EVENTS.authLogout, () => {
        session.logout();
        articles.invalidate();
    });

    context.on(CONDUIT_EVENTS.settingsSave, (payload: SettingsSavePayload) => {
        void session.update({
            username: payload.username,
            email: payload.email,
            // An empty password field means "leave the password alone"; the API
            // treats an absent member as unchanged and an empty string as blank.
            ...(payload.password.length > 0 ? { password: payload.password } : {}),
            bio: payload.bio,
            image: payload.image,
        });
    });

    context.on(CONDUIT_EVENTS.feedTab, (payload: FeedTabPayload) => articles.setTab(payload.tab));
    context.on(CONDUIT_EVENTS.feedTag, (payload: FeedTagPayload) => articles.setTag(payload.tag));
    context.on(CONDUIT_EVENTS.feedPage, (payload: PagePayload) => articles.setPage(payload.page));

    context.on(CONDUIT_EVENTS.articleFavorite, (payload: ArticleFavoritePayload) => {
        void articles.setFavorited(payload.slug, payload.favorited);
    });

    context.on(CONDUIT_EVENTS.articleSave, (payload: ArticleSavePayload) => {
        const { slug, ...draft } = payload;
        void articles.save(draft, slug).then((errors) => {
            // Publishing can introduce a new tag; the sidebar is a page-load
            // cache, so refresh it only when the write actually succeeded.
            if (errors === null) {
                void tags.reload();
            }
        });
    });

    context.on(CONDUIT_EVENTS.articleDelete, (payload: ArticleRefPayload) => {
        void articles.remove(payload.slug).then(() => articles.invalidate());
    });

    context.on(CONDUIT_EVENTS.commentAdd, (payload: CommentAddPayload) => {
        void comments.add(payload.slug, payload.body);
    });
    context.on(CONDUIT_EVENTS.commentRemove, (payload: CommentRefPayload) => {
        void comments.remove(payload.slug, payload.id);
    });

    context.on(CONDUIT_EVENTS.authorFollow, (payload: AuthorFollowPayload) => {
        // The by-line the visitor pressed is article state; flip it in place
        // first, then let the profile service own the write.
        articles.setAuthorFollowing(payload.username, payload.following);
        // Following also changes *whose* articles the followed-authors feed
        // contains, so the cached feed window belongs to the previous
        // relationship and must be re-read at the next visit.
        void profiles.setFollowing(payload.username, payload.following).then(() => articles.invalidate());
    });
    context.on(CONDUIT_EVENTS.profilePage, (payload: PagePayload) => profiles.setPage(payload.page));
}
