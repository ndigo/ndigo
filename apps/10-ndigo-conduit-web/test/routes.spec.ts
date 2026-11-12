// @vitest-environment jsdom
import '@tsmetadata/polyfill';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { configuration, entry } from '@ndigo/context';
import { bootWebApp, MockWebClient } from '@ndigo/test';
import ArticleController from '../src/controllers/article-controller';
import { LoginController, RegisterController } from '../src/controllers/auth-controller';
import EditorController from '../src/controllers/editor-controller';
import HomeController from '../src/controllers/home-controller';
import ProfileController from '../src/controllers/profile-controller';
import SettingsController from '../src/controllers/settings-controller';
import {
    ARTICLE_SERVICE,
    COMMENT_SERVICE,
    PROFILE_SERVICE,
    ROUTER,
    SESSION_SERVICE,
    TAG_SERVICE,
} from '../src/app/conduit-tokens';
import { ConduitApiError } from '../src/lib/api/conduit-types';
import { ArticleService } from '../src/services/article-service';
import { CommentService } from '../src/services/comment-service';
import { ProfileService } from '../src/services/profile-service';
import { ConduitTokenStorage, SessionService } from '../src/services/session-service';
import { TagService } from '../src/services/tag-service';
import type { ArticleModel, AuthModel, EditorModel, HomeModel, ProfileModel } from '../src/views/models';
import {
    articleFixture,
    commentFixture,
    createRouterDouble,
    createStubApi,
    pageFixture,
    profileFixture,
    sessionFixture,
} from './support/fixtures';

/**
 * The real controllers and the real services over a stub API — the whole route
 * pipeline (`BrowserDispatcher` → handler mapping → argument binding → view
 * resolution) with only the network replaced.
 */
const stubApi = createStubApi({
    listArticles: async () => pageFixture([articleFixture()], 25),
    getFeed: async () => pageFixture([articleFixture()]),
    getArticle: async (slug: string) =>
        slug === 'missing'
            ? Promise.reject(new ConduitApiError(404, { article: ['not found'] }))
            : articleFixture({ slug }),
    listComments: async () => [commentFixture()],
    listTags: async () => ['realworld', 'ndigo'],
    getProfile: async (username: string) =>
        username === 'ghost'
            ? Promise.reject(new ConduitApiError(404, { profile: ['not found'] }))
            : profileFixture({ username }),
    login: async () => sessionFixture(),
    register: async () => sessionFixture(),
});

const router = createRouterDouble();
const storage = new ConduitTokenStorage('routes.spec.jwt');
const session = new SessionService(stubApi, storage);
const articles = new ArticleService(stubApi, session);
const tags = new TagService(stubApi);
const profiles = new ProfileService(stubApi);
const comments = new CommentService(stubApi);

@configuration
class RoutesTestConfiguration {
    @entry(ROUTER)
    router() {
        return router;
    }

    @entry(SESSION_SERVICE)
    sessionService() {
        return session;
    }

    @entry(ARTICLE_SERVICE)
    articleService() {
        return articles;
    }

    @entry(TAG_SERVICE)
    tagService() {
        return tags;
    }

    @entry(PROFILE_SERVICE)
    profileService() {
        return profiles;
    }

    @entry(COMMENT_SERVICE)
    commentService() {
        return comments;
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
}

describe('route wiring through MockWebClient', () => {
    let browser: MockWebClient;
    let close: () => void;

    beforeAll(async () => {
        const app = await bootWebApp([RoutesTestConfiguration]);
        browser = new MockWebClient(app);
        close = app.close;
    });

    afterAll(() => {
        close();
    });

    beforeEach(() => {
        localStorage.clear();
        router.refresh.mockClear();
        router.navigate.mockClear();
    });

    test('#/ serves the global feed with tags, articles, and pagination', async () => {
        const { model } = await browser.dispatch('/');
        const home = model as HomeModel;

        expect(home.tab).toBe('global');
        expect(home.tag).toBeNull();
        expect(home.page).toBe(1);
        expect(home.pageCount).toBe(2);
        expect(home.articles).toHaveLength(1);
        expect(home.tags).toEqual(['realworld', 'ndigo']);
        expect(home.error).toBeNull();
        expect(home.session.isAuthenticated).toBe(false);
    });

    test('#/ carries the pagination state the service holds', async () => {
        articles.setPage(2);
        const { model } = await browser.dispatch('/');
        const home = model as HomeModel;

        expect(home.page).toBe(2);
        expect(home.pageCount).toBe(2);
        expect(router.refresh).toHaveBeenCalledTimes(1);
    });

    test('#/login, #/register, and #/settings resolve their views', async () => {
        const login = await browser.dispatch('/login');
        expect((login.model as AuthModel).page).toBe('login');
        expect((login.model as AuthModel).errors).toBeNull();

        const register = await browser.dispatch('/register');
        expect((register.model as AuthModel).page).toBe('register');

        const settings = await browser.dispatch('/settings');
        expect(settings.model).toMatchObject({ session: { isAuthenticated: false } });
    });

    test('a failed login reaches the login model as per-field errors', async () => {
        const resolving = stubApi.login;
        stubApi.login = () => Promise.reject(new ConduitApiError(401, { credentials: ['invalid'] }));
        try {
            await session.login({ email: 'a@example.com', password: 'wrong' });
            const { model } = await browser.dispatch('/login');
            const auth = model as AuthModel;

            expect(auth.errors).toEqual({ credentials: ['invalid'] });
            expect(auth.session.isAuthenticated).toBe(false);
        } finally {
            stubApi.login = resolving;
        }
    });

    test('#/editor/:slug binds the slug and prefills the article', async () => {
        const { model } = await browser.dispatch('/editor/how-to-conform');
        const editor = model as EditorModel;

        expect(editor.slug).toBe('how-to-conform');
        expect(editor.article?.title).toBe('How to conform');
        expect(editor.notFound).toBe(false);

        const empty = await browser.dispatch('/editor');
        expect((empty.model as EditorModel).slug).toBeNull();
        expect((empty.model as EditorModel).article).toBeNull();
    });

    test('#/article/:slug binds the slug and loads the comments', async () => {
        const { model } = await browser.dispatch('/article/how-to-conform');
        const article = model as ArticleModel;

        expect(article.article?.slug).toBe('how-to-conform');
        expect(article.comments).toHaveLength(1);
        expect(article.notFound).toBe(false);
    });

    test('#/article/:slug flags an unknown slug as notFound', async () => {
        const { model } = await browser.dispatch('/article/missing');
        expect((model as ArticleModel).notFound).toBe(true);
        expect((model as ArticleModel).article).toBeNull();
    });

    test('#/profile/:username binds the username and the authored tab', async () => {
        const { model } = await browser.dispatch('/profile/alice');
        const profile = model as ProfileModel;

        expect(profile.profile?.username).toBe('alice');
        expect(profile.tab).toBe('author');
        expect(profile.articles).toHaveLength(1);
        expect(profile.notFound).toBe(false);
    });

    test('#/profile/:username/favorited loads the favorited tab', async () => {
        const { model } = await browser.dispatch('/profile/alice/favorited');
        const profile = model as ProfileModel;

        expect(profile.tab).toBe('favorited');
        expect(profile.page).toBe(1);
    });

    test('#/profile/:username flags an unknown user', async () => {
        const { model } = await browser.dispatch('/profile/ghost');
        expect((model as ProfileModel).notFound).toBe(true);
    });
});
