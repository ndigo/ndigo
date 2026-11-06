/**
 * The app's object graph, wired once and registered as container beans.
 *
 * The only non-obvious edge is the cycle between the session and the HTTP
 * client: the client needs the session's token (outgoing) *and* must drop the
 * session on a `401` (incoming), while the session needs a client to call the
 * API. It is broken with a late-bound reference — the `401` hook reads
 * `services.session` when a response arrives, long after construction — which
 * keeps both objects constructor-complete and free of setters.
 *
 * Everything is constructed here and nowhere else, so a spec can build the same
 * graph against a stub {@link ConduitApi} or a `fetch` double.
 */
import type { HTTP } from '@ndigo/http';
import { ConduitApiClient } from '../lib/api/conduit-api-client';
import { createConduitHttp } from '../lib/api/conduit-http';
import type { ConduitApi } from '../lib/api/conduit-types';
import { ArticleService } from '../services/article-service';
import { CommentService } from '../services/comment-service';
import { ProfileService } from '../services/profile-service';
import { ConduitTokenStorage, SessionService } from '../services/session-service';
import { TagService } from '../services/tag-service';

/** The assembled service graph. */
export interface ConduitServices {
    /** The token store shared by the session and the auth interceptor. */
    storage: ConduitTokenStorage;
    /** The HTTP client (auth + 401 interceptors installed). */
    http: HTTP;
    /** The API port bound to the app's client. */
    api: ConduitApi;
    /** The authenticated-session service. */
    session: SessionService;
    /** The article/feed service. */
    articles: ArticleService;
    /** The popular-tags service. */
    tags: TagService;
    /** The profile service. */
    profiles: ProfileService;
    /** The comment service. */
    comments: CommentService;
}

/**
 * Builds the app's service graph.
 *
 * @returns The wired services.
 */
export function createConduitServices(): ConduitServices {
    const storage = new ConduitTokenStorage();

    // `services` is referenced by the 401 hook below before its declaration
    // completes; the hook only runs once a response arrives, long after.
    const http = createConduitHttp({
        getToken: () => storage.token,
        onUnauthorized: () => {
            services.session.dropSession();
            // The visitor is no longer signed in; the login page is the only
            // page that can establish a session. Writing the hash triggers a
            // real navigation, and is a no-op when already there.
            globalThis.location.hash = '#/login';
        },
    });
    const api = new ConduitApiClient(http);
    const session = new SessionService(api, storage);

    const services: ConduitServices = {
        storage,
        http,
        api,
        session,
        articles: new ArticleService(api, session),
        tags: new TagService(api),
        profiles: new ProfileService(api),
        comments: new CommentService(api),
    };
    return services;
}
