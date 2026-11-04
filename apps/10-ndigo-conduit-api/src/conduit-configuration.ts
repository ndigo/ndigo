/**
 * The Conduit application assembly.
 *
 * Registered **after** `NodeAutoConfiguration`, so the two entries it
 * redeclares — `httpServer` and `errorResolvers` — replace the platform
 * defaults (the registry is last-write-wins):
 *
 * - `httpServer` binds the app's own port (`getEnv('PORT', '3040')`) instead
 *   of the platform's 3000 fallback. The server resolves its dispatcher and
 *   socket registry from the context at start, so no wiring is lost.
 * - `errorResolvers` puts {@link ConduitValidationErrorResolver} first in the
 *   chain: schema failures become the RealWorld `{errors:{…}}` envelope before
 *   the platform's problem+json resolver can claim them. The remaining links
 *   are the platform's own, in their original order.
 *
 * @module ndigo-conduit-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { configuration, entry, getEnv } from '@ndigo/context';
import { MetadataErrorResolver } from '@ndigo/dispatcher';
import {
    HTTP_SERVER,
    HTTPServer,
    NodeLastResortErrorResolver,
    NodeParameterBindingErrorResolver,
} from '@ndigo/platform-node';
import { ArticleController } from './article-controller';
import { ConduitAuth, DEV_JWT_SECRET } from './auth';
import { CommentController } from './comment-controller';
import { ConduitValidationErrorResolver } from './errors';
import { ProfileController } from './profile-controller';
import { ConduitStore } from './store';
import { TagController } from './tag-controller';
import { UserController } from './user-controller';

/** The app's dev port (the reserved 3040 slot in `apps/README.md`). */
export const DEFAULT_PORT = 3040;

/** The Conduit app's beans. */
@configuration
export class ConduitConfiguration {
    readonly #store = new ConduitStore();
    readonly #auth = new ConduitAuth(getEnv('NDIGO_CONDUIT_JWT_SECRET', DEV_JWT_SECRET));

    /**
     * The managed HTTP server, bound to the app's port.
     *
     * @returns The server (dispatcher and socket registry resolve from the
     *   context when it starts).
     */
    @entry(HTTP_SERVER)
    httpServer() {
        return new HTTPServer(null, { port: Number(getEnv('PORT', String(DEFAULT_PORT))) });
    }

    /**
     * The error-resolver chain: the RealWorld envelope first, then the
     * platform's binding → `@errorMapping` → last-resort links.
     *
     * @returns The ordered resolver chain.
     */
    @entry()
    errorResolvers() {
        return [
            new ConduitValidationErrorResolver(),
            new NodeParameterBindingErrorResolver(),
            new MetadataErrorResolver(),
            new NodeLastResortErrorResolver(),
        ];
    }

    /**
     * The users/auth endpoints.
     *
     * @returns The controller.
     */
    @entry()
    userController() {
        return new UserController(this.#store, this.#auth);
    }

    /**
     * The profiles/follow endpoints.
     *
     * @returns The controller.
     */
    @entry()
    profileController() {
        return new ProfileController(this.#store, this.#auth);
    }

    /**
     * The articles/feed/favorites endpoints.
     *
     * @returns The controller.
     */
    @entry()
    articleController() {
        return new ArticleController(this.#store, this.#auth);
    }

    /**
     * The comments endpoints.
     *
     * @returns The controller.
     */
    @entry()
    commentController() {
        return new CommentController(this.#store, this.#auth);
    }

    /**
     * The tags endpoint.
     *
     * @returns The controller.
     */
    @entry()
    tagController() {
        return new TagController(this.#store);
    }
}
