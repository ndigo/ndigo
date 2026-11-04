/**
 * @module ndigo-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import '@tsmetadata/polyfill';
import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest';
import { ACTIONS } from '../src/app/conduit-events';
// Side-effect imports: `@TagMapping` performs the `customElements.define` at
// module load, so the module must be evaluated for `createElement` to upgrade
// the tag into the component under test.
import '../src/views/article-view';
import '../src/views/auth-view';
import '../src/views/editor-view';
import '../src/views/home-view';
import '../src/views/profile-view';
import '../src/views/settings-view';
import type { ArticleModel, AuthModel, EditorModel, HomeModel, ProfileModel, SettingsModel } from '../src/views/models';
import { articleFixture, commentFixture, profileFixture, sessionFixture, summaryOf } from './support/fixtures';

/**
 * A component element carrying the model its render pass consumes.
 *
 * The element is created by tag name (exercising the real registration) rather
 * than instantiated from the class, so the type is asserted here.
 */
type ModelAware<T> = HTMLElement & { model: T };

/** The anonymous session slice. */
const anonymous = { isAuthenticated: false, user: null };

/** The signed-in session slice. */
const signedIn = { isAuthenticated: true, user: sessionFixture().user };

/**
 * Finds the first button whose label matches.
 *
 * @param root - The subtree to search.
 * @param label - The exact label.
 * @returns The button, or `null`.
 */
function buttonByText(root: ParentNode, label: string): HTMLButtonElement | null {
    return [...root.querySelectorAll('button')].find((button) => button.textContent === label) ?? null;
}

/**
 * Reacts to a view event with a spy.
 *
 * @param element - The component element.
 * @param action - The action name.
 * @returns The spy, which receives the DOM event.
 */
function spyOnAction(element: HTMLElement, action: string): Mock {
    const spy = vi.fn();
    element.addEventListener(action, spy);
    return spy;
}

/**
 * Reads the payload of a captured custom event.
 *
 * @param spy - The spy registered through {@link spyOnAction}.
 * @param call - The call index.
 * @returns The event detail.
 */
function detailOf(spy: Mock, call = 0): unknown {
    const event = spy.mock.calls[call]?.[0] as CustomEvent | undefined;
    if (!event) {
        throw new Error(`no captured call at index ${call}`);
    }
    return event.detail;
}

describe('conduit-home', () => {
    let view: ModelAware<HomeModel>;

    beforeEach(() => {
        document.body.innerHTML = '';
        view = document.createElement('conduit-home') as ModelAware<HomeModel>;
        document.body.appendChild(view);
    });

    function model(overrides: Partial<HomeModel> = {}): HomeModel {
        return {
            session: anonymous,
            tab: 'global',
            tag: null,
            page: 1,
            pageCount: 2,
            articles: [summaryOf(articleFixture())],
            tags: ['realworld', 'ndigo'],
            error: null,
            ...overrides,
        };
    }

    test('renders the global tab, the tag sidebar, and pagination', () => {
        view.model = model();

        expect(view.querySelector('.article-preview h2 a')?.textContent).toBe('How to conform');
        expect([...view.querySelectorAll('.sidebar .tag-list button')].map((tag) => tag.textContent)).toEqual([
            'realworld',
            'ndigo',
        ]);
        expect(view.querySelectorAll('.pagination button')).toHaveLength(2);
        // Anonymous visitors have no "Your Feed" tab.
        expect(buttonByText(view, 'Your Feed')).toBeNull();
    });

    test('shows the tag tab and highlights the selected tag', () => {
        view.model = model({ tag: 'realworld' });

        expect(buttonByText(view, '#realworld')).not.toBeNull();
        expect(view.querySelector('.sidebar button.selected')?.textContent).toBe('realworld');
    });

    test('emits a feed tab intent', () => {
        const spy = spyOnAction(view, ACTIONS.feedTab);
        view.model = model({ session: signedIn });

        buttonByText(view, 'Your Feed')?.click();
        expect(detailOf(spy)).toEqual({ tab: 'feed' });

        buttonByText(view, 'Global Feed')?.click();
        expect(detailOf(spy, 1)).toEqual({ tab: 'global' });
    });

    test('emits a tag intent and a page intent', () => {
        const tagSpy = spyOnAction(view, ACTIONS.feedTag);
        const pageSpy = spyOnAction(view, ACTIONS.feedPage);
        view.model = model();

        view.querySelector<HTMLButtonElement>('.sidebar .tag-list button')?.click();
        expect(detailOf(tagSpy)).toEqual({ tag: 'realworld' });

        view.querySelectorAll<HTMLButtonElement>('.pagination button')[1]?.click();
        expect(detailOf(pageSpy)).toEqual({ page: 2 });
    });

    test('emits a favorite intent with the target state', () => {
        const spy = spyOnAction(view, ACTIONS.articleFavorite);
        view.model = model();

        buttonByText(view, 'Favorite (2)')?.click();

        expect(detailOf(spy)).toEqual({ slug: 'how-to-conform', favorited: true });
    });

    test('renders a feed failure as a message', () => {
        view.model = model({ articles: [], error: 'boom' });
        expect(view.querySelector('.form-error')?.textContent).toBe('boom');
    });
});

describe('conduit-auth', () => {
    let view: ModelAware<AuthModel>;

    beforeEach(() => {
        document.body.innerHTML = '';
        view = document.createElement('conduit-auth') as ModelAware<AuthModel>;
        document.body.appendChild(view);
    });

    function model(overrides: Partial<AuthModel> = {}): AuthModel {
        return { page: 'login', session: anonymous, errors: null, ...overrides };
    }

    test('renders the login form without a username field', () => {
        view.model = model();

        expect(view.querySelector('#email')).not.toBeNull();
        expect(view.querySelector('#password')).not.toBeNull();
        expect(view.querySelector('#username')).toBeNull();
    });

    test('renders the register form with a username field', () => {
        view.model = model({ page: 'register' });

        expect(view.querySelector('#username')).not.toBeNull();
        expect(buttonByText(view, 'Sign up')).not.toBeNull();
    });

    test('maps the envelope onto fields and form-level messages', () => {
        view.model = model({ errors: { email: ['is invalid'], credentials: ['invalid'] } });

        expect(view.querySelector('.field-error')?.textContent).toBe('is invalid');
        expect(view.querySelector('.errors')?.textContent).toContain('credentials invalid');
    });

    test('emits the credentials typed into the form', () => {
        const spy = spyOnAction(view, ACTIONS.authLogin);
        view.model = model();

        const email = view.querySelector<HTMLInputElement>('#email');
        const password = view.querySelector<HTMLInputElement>('#password');
        if (email) {
            email.value = 'alice@example.com';
            email.dispatchEvent(new Event('input'));
        }
        if (password) {
            password.value = 'secret';
            password.dispatchEvent(new Event('input'));
        }
        view.querySelector('form')?.dispatchEvent(new Event('submit'));

        expect(detailOf(spy)).toEqual({ email: 'alice@example.com', password: 'secret' });
    });

    test('keeps the typed credentials across a re-render (the failed-submit refresh)', () => {
        view.model = model();
        const email = view.querySelector<HTMLInputElement>('#email');
        if (email) {
            email.value = 'alice@example.com';
            email.dispatchEvent(new Event('input'));
        }

        view.model = model({ errors: { credentials: ['invalid'] } });

        expect(view.querySelector<HTMLInputElement>('#email')?.value).toBe('alice@example.com');
    });
});

describe('conduit-settings', () => {
    let view: ModelAware<SettingsModel>;

    beforeEach(() => {
        document.body.innerHTML = '';
        view = document.createElement('conduit-settings') as ModelAware<SettingsModel>;
        document.body.appendChild(view);
    });

    function model(overrides: Partial<SettingsModel> = {}): SettingsModel {
        return { session: signedIn, errors: null, ...overrides };
    }

    test('seeds the form from the account and emits the patch on submit', () => {
        const spy = spyOnAction(view, ACTIONS.settingsSave);
        view.model = model();

        expect(view.querySelector<HTMLInputElement>('#username')?.value).toBe('alice');
        expect(view.querySelector<HTMLInputElement>('#password')?.value).toBe('');

        view.querySelector('form')?.dispatchEvent(new Event('submit'));

        expect(detailOf(spy)).toMatchObject({ username: 'alice', password: '' });
    });

    test('renders a per-field envelope under the offending input', () => {
        view.model = model({ errors: { email: ['has already been taken'] } });

        expect(view.querySelector('.field-error')?.textContent).toBe('has already been taken');
    });

    test('emits a sign-out intent', () => {
        const spy = spyOnAction(view, ACTIONS.authLogout);
        view.model = model();

        buttonByText(view, 'Sign out')?.click();
        expect(spy).toHaveBeenCalledTimes(1);
    });
});

describe('conduit-editor', () => {
    let view: ModelAware<EditorModel>;

    beforeEach(() => {
        document.body.innerHTML = '';
        view = document.createElement('conduit-editor') as ModelAware<EditorModel>;
        document.body.appendChild(view);
    });

    function model(overrides: Partial<EditorModel> = {}): EditorModel {
        return { session: signedIn, slug: null, article: null, notFound: false, errors: null, ...overrides };
    }

    test('seeds an existing article and offers update plus delete', () => {
        view.model = model({ slug: 'how-to-conform', article: articleFixture() });

        expect(view.querySelector<HTMLInputElement>('#title')?.value).toBe('How to conform');
        expect(view.querySelector<HTMLInputElement>('#tagList')?.value).toBe('realworld');
        expect(buttonByText(view, 'Update article')).not.toBeNull();
        expect(buttonByText(view, 'Delete article')).not.toBeNull();
    });

    test('splits the tag input before emitting', () => {
        const spy = spyOnAction(view, ACTIONS.articleSave);
        view.model = model();

        const title = view.querySelector<HTMLInputElement>('#title');
        const body = view.querySelector<HTMLTextAreaElement>('#body');
        const tags = view.querySelector<HTMLInputElement>('#tagList');
        if (title) {
            title.value = 'T';
            title.dispatchEvent(new Event('input'));
        }
        if (body) {
            body.value = 'B';
            body.dispatchEvent(new Event('input'));
        }
        if (tags) {
            tags.value = ' realworld , ndigo ,realworld,';
            tags.dispatchEvent(new Event('input'));
        }
        view.querySelector('form')?.dispatchEvent(new Event('submit'));

        expect(detailOf(spy)).toMatchObject({ slug: null, title: 'T', body: 'B', tagList: ['realworld', 'ndigo'] });
    });

    test('renders the editor envelope under the field that failed', () => {
        view.model = model({ errors: { title: ["can't be blank"] } });
        expect(view.querySelector('.field-error')?.textContent).toBe("can't be blank");
    });

    test('reports an unknown slug instead of seeding a blank draft', () => {
        view.model = model({ slug: 'missing', article: null, notFound: true });
        expect(view.textContent).toContain('That article does not exist');
    });
});

describe('conduit-article', () => {
    let view: ModelAware<ArticleModel>;

    beforeEach(() => {
        document.body.innerHTML = '';
        view = document.createElement('conduit-article') as ModelAware<ArticleModel>;
        document.body.appendChild(view);
    });

    function model(overrides: Partial<ArticleModel> = {}): ArticleModel {
        return {
            session: anonymous,
            article: articleFixture({ body: '# Title\n\n<script>alert(1)</script>' }),
            notFound: false,
            comments: [commentFixture()],
            commentErrors: null,
            ...overrides,
        };
    }

    test('renders the title, description, and body of the article', () => {
        view.model = model();

        expect(view.querySelector('h1.page-title')?.textContent).toBe('How to conform');
        expect(view.querySelector('p.muted')?.textContent).toBe('A description');

        const body = view.querySelector('.article-text');
        expect(body?.querySelector('h1')?.textContent).toBe('Title');
        expect(body?.querySelector('script')).toBeNull();
        expect(body?.textContent).toContain('<script>alert(1)</script>');
    });

    test('shows the author controls only to the author', () => {
        view.model = model();
        expect(buttonByText(view, 'Delete article')).toBeNull();

        view.model = model({
            session: signedIn,
            article: articleFixture({ author: profileFixture({ username: 'alice' }) }),
        });
        expect(buttonByText(view, 'Delete article')).not.toBeNull();
        expect(view.querySelector('a[href="#/editor/how-to-conform"]')).not.toBeNull();
    });

    test('shows the comment delete control only on your own comment', () => {
        view.model = model();
        expect(buttonByText(view, 'Delete')).toBeNull();

        view.model = model({
            session: signedIn,
            comments: [commentFixture({ author: profileFixture({ username: 'alice' }) })],
        });
        expect(buttonByText(view, 'Delete')).not.toBeNull();
    });

    test('emits a favorite intent from the by-line', () => {
        const spy = spyOnAction(view, ACTIONS.articleFavorite);
        view.model = model();

        buttonByText(view, 'Favorite (2)')?.click();
        expect(detailOf(spy)).toEqual({ slug: 'how-to-conform', favorited: true });
    });

    test('emits a comment intent and renders a comment envelope', () => {
        const spy = spyOnAction(view, ACTIONS.commentAdd);
        view.model = model({ session: signedIn });

        const input = view.querySelector<HTMLTextAreaElement>('#body');
        if (input) {
            input.value = 'Nice write-up';
            input.dispatchEvent(new Event('input'));
        }
        view.querySelector('form')?.dispatchEvent(new Event('submit'));
        expect(detailOf(spy)).toEqual({ slug: 'how-to-conform', body: 'Nice write-up' });

        view.model = model({ session: signedIn, commentErrors: { body: ["can't be blank"] } });
        expect(view.querySelector('.field-error')?.textContent).toBe("can't be blank");
    });

    test('prompts an anonymous visitor to sign in instead of showing the form', () => {
        view.model = model();
        expect(view.querySelector('a[href="#/login"]')).not.toBeNull();
        expect(view.querySelector('form')).toBeNull();
    });
});

describe('conduit-profile', () => {
    let view: ModelAware<ProfileModel>;

    beforeEach(() => {
        document.body.innerHTML = '';
        view = document.createElement('conduit-profile') as ModelAware<ProfileModel>;
        document.body.appendChild(view);
    });

    function model(overrides: Partial<ProfileModel> = {}): ProfileModel {
        return {
            session: anonymous,
            profile: profileFixture(),
            tab: 'author',
            page: 1,
            pageCount: 1,
            articles: [summaryOf(articleFixture())],
            notFound: false,
            error: null,
            ...overrides,
        };
    }

    test('renders tab links for both lists', () => {
        view.model = model();

        expect(view.querySelector('a[href="#/profile/alice"]')?.classList.contains('selected')).toBe(true);
        expect(view.querySelector('a[href="#/profile/alice/favorited"]')).not.toBeNull();
    });

    test('hides the follow control on your own profile', () => {
        view.model = model();
        expect(buttonByText(view, 'Follow')).toBeNull();

        view.model = model({ session: signedIn, profile: profileFixture({ username: 'bob' }) });
        expect(buttonByText(view, 'Follow')).not.toBeNull();
    });

    test('emits a follow intent with the target state', () => {
        const spy = spyOnAction(view, ACTIONS.authorFollow);
        view.model = model({ session: signedIn, profile: profileFixture({ username: 'bob' }) });

        buttonByText(view, 'Follow')?.click();
        expect(detailOf(spy)).toEqual({ username: 'bob', following: true });
    });

    test('reports an unknown profile', () => {
        view.model = model({ profile: null, articles: [], notFound: true, error: null });
        expect(view.textContent).toContain('That user does not exist');
    });
});
