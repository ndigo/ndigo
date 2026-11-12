/**
 * The container configuration: what the app registers as entries.
 *
 * One instance owns the whole object graph (`ConduitServices`) and exposes each
 * service under its token plus the assembled graph under
 * {@link CONDUIT_SERVICES}, so the composition root can reach the services
 * without re-deriving them. Controllers and the handler mapping are entries too
 * — the dispatcher discovers `@routeMapping` handlers by scanning the context,
 * which is why they must be entries rather than module-level instances.
 */
import { configuration, entry } from '@ndigo/context';
import { LoggingRouteHandlerInterceptor, RadixMetadataHandlerMapping } from '@ndigo/dispatcher';
import { getLogger } from '@ndigo/log';
import ArticleController from '../controllers/article-controller';
import { LoginController, RegisterController } from '../controllers/auth-controller';
import EditorController from '../controllers/editor-controller';
import HomeController from '../controllers/home-controller';
import ProfileController from '../controllers/profile-controller';
import SettingsController from '../controllers/settings-controller';
import { createConduitServices, type ConduitServices } from './conduit-services';
import {
    ARTICLE_SERVICE,
    COMMENT_SERVICE,
    CONDUIT_API,
    CONDUIT_SERVICES,
    PROFILE_SERVICE,
    SESSION_SERVICE,
    TAG_SERVICE,
} from './conduit-tokens';

@configuration
export class ConduitWebConfiguration {
    readonly #services: ConduitServices = createConduitServices();

    /** The assembled service graph (for the composition root and specs). */
    get services(): ConduitServices {
        return this.#services;
    }

    @entry(CONDUIT_SERVICES)
    conduitServices() {
        return this.#services;
    }

    @entry(CONDUIT_API)
    conduitApi() {
        return this.#services.api;
    }

    @entry(SESSION_SERVICE)
    sessionService() {
        return this.#services.session;
    }

    @entry(ARTICLE_SERVICE)
    articleService() {
        return this.#services.articles;
    }

    @entry(TAG_SERVICE)
    tagService() {
        return this.#services.tags;
    }

    @entry(PROFILE_SERVICE)
    profileService() {
        return this.#services.profiles;
    }

    @entry(COMMENT_SERVICE)
    commentService() {
        return this.#services.comments;
    }

    @entry()
    homeController() {
        return new HomeController();
    }

    @entry()
    loginController() {
        return new LoginController();
    }

    @entry()
    registerController() {
        return new RegisterController();
    }

    @entry()
    settingsController() {
        return new SettingsController();
    }

    @entry()
    editorController() {
        return new EditorController();
    }

    @entry()
    articleController() {
        return new ArticleController();
    }

    @entry()
    profileController() {
        return new ProfileController();
    }

    /**
     * The browser handler mapping, with request coverage logged in dev. It
     * deliberately overrides the platform default so the app can see which
     * route each interaction dispatched.
     */
    @entry()
    handlerMapping() {
        const mapping = new RadixMetadataHandlerMapping();
        mapping.interceptors.push(new LoggingRouteHandlerInterceptor(getLogger('ndigo-conduit-web:dispatcher')));
        return mapping;
    }
}
