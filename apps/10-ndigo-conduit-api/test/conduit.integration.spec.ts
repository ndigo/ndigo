/**
 * Integration suite for the RealWorld (Conduit) API through `@ndigo/test`.
 *
 * Boots the real `ConduitConfiguration` assembly and dispatches against the
 * real pipeline (argument resolution → Zod → handler → view), so the suite
 * asserts the wire contract end to end: status codes, payload keys, the
 * `{errors:{…}}` envelope, JWT auth, ownership, filtering and paging.
 *
 * @module ndigo-conduit-api
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { MockHTTP, bootApp } from '@ndigo/test';
import { ConduitConfiguration } from '../src/conduit-configuration';

/** The dispatch result returned by `MockHTTP#exec()` (its `MockResult` type
 * is internal to `@ndigo/test`); reverse `json()` into the payload here. */
interface MockResult {
    json(): unknown;
    text(): string;
}

/** The `{user}` payload the API returns. */
interface UserPayload {
    email: string;
    username: string;
    token: string;
    bio: string | null;
    image: string | null;
}

/** The profile payload embedded in articles and comments. */
interface ProfilePayload {
    username: string;
    bio: string | null;
    image: string | null;
    following: boolean;
}

/** The article payload. */
interface ArticlePayload {
    slug: string;
    title: string;
    description: string;
    body: string;
    tagList: string[];
    createdAt: string;
    updatedAt: string;
    favorited: boolean;
    favoritesCount: number;
    author: ProfilePayload;
}

/** The comment payload. */
interface CommentPayload {
    id: number;
    createdAt: string;
    updatedAt: string;
    body: string;
    author: ProfilePayload;
}

interface UserResponse {
    user: UserPayload;
}

interface ProfileResponse {
    profile: ProfilePayload;
}

interface ArticleResponse {
    article: ArticlePayload;
}

interface ArticlesResponse {
    articles: ArticlePayload[];
    articlesCount: number;
}

interface CommentResponse {
    comment: CommentPayload;
}

interface CommentsResponse {
    comments: CommentPayload[];
}

interface TagsResponse {
    tags: string[];
}

/** A registered test account plus its bearer header value. */
interface Account {
    username: string;
    email: string;
    password: string;
    token: string;
    header: string;
}

/**
 * Reads a MockHTTP JSON body as the expected response shape.
 *
 * These payloads are this app's own wire contract — asserted key-by-key below
 * — so the boundary read is one documented cast rather than a schema parse per
 * call.
 *
 * @param res - The mock result to decode.
 * @returns The decoded body.
 */
function readBody<T>(res: MockResult): T {
    return res.json() as T;
}

describe('RealWorld Conduit API through @ndigo/test', () => {
    let mockHTTP: MockHTTP;
    let close: () => void;
    let sequence = 0;

    beforeAll(() => {
        // Cheap scrypt cost keeps the lane fast; the production default (17)
        // stays untouched. Read when the configuration is constructed below.
        process.env.NDIGO_CONDUIT_SCRYPT_LN = '14';
        const app = bootApp([ConduitConfiguration]);
        mockHTTP = new MockHTTP(app);
        close = app.close;
    });

    afterAll(() => {
        close();
        delete process.env.NDIGO_CONDUIT_SCRYPT_LN;
    });

    /** A per-test unique suffix, so shared in-memory state never collides. */
    function unique(base: string): string {
        sequence += 1;
        return `${base}-${sequence}`;
    }

    /** Registers a fresh account and returns it with its `Token …` header. */
    async function registerAccount(base = 'alice'): Promise<Account> {
        const username = unique(base);
        const email = `${username}@example.com`;
        const password = 'conduit-password';
        const res = await mockHTTP.post('/api/users').body({ user: { username, email, password } }).exec();
        expect(res.response.status).toBe(201);
        const { user } = readBody<UserResponse>(res);
        return { username, email, password, token: user.token, header: `Token ${user.token}` };
    }

    /** Publishes an article for the given account. */
    async function publishArticle(
        account: Account,
        article: { title: string; description: string; body: string; tagList?: string[] }
    ): Promise<ArticlePayload> {
        const res = await mockHTTP
            .post('/api/articles')
            .headers({ authorization: account.header })
            .body({ article })
            .exec();
        expect(res.response.status).toBe(201);
        return readBody<ArticleResponse>(res).article;
    }

    test('GET /api/tags answers 200 with an empty tag list on a fresh server', async () => {
        const res = await mockHTTP.get('/api/tags').exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ tags: [] });
    });

    test('POST /api/users registers an account and returns a token', async () => {
        const username = unique('newcomer');
        const res = await mockHTTP
            .post('/api/users')
            .body({ user: { username, email: `${username}@example.com`, password: 'conduit-password' } })
            .exec();

        expect(res.response.status).toBe(201);
        const { user } = readBody<UserResponse>(res);
        expect(Object.keys(user).sort()).toEqual(['bio', 'email', 'image', 'token', 'username']);
        expect(user.username).toBe(username);
        expect(user.email).toBe(`${username}@example.com`);
        expect(user.token.split('.')).toHaveLength(3);
        expect(user.bio).toBeNull();
        expect(user.image).toBeNull();
    });

    test('POST /api/users rejects a duplicate username with 422 and the RealWorld envelope', async () => {
        const account = await registerAccount('duplicate');
        const res = await mockHTTP
            .post('/api/users')
            .body({ user: { username: account.username, email: `other-${account.email}`, password: 'pw-12345' } })
            .exec();

        expect(res.response.status).toBe(422);
        expect(res.json()).toEqual({ errors: { username: ['has already been taken'] } });
    });

    test('POST /api/users rejects a duplicate email with 422 and the RealWorld envelope', async () => {
        const account = await registerAccount('duplicate-email');
        const res = await mockHTTP
            .post('/api/users')
            .body({ user: { username: unique('other'), email: account.email, password: 'pw-12345' } })
            .exec();

        expect(res.response.status).toBe(422);
        expect(res.json()).toEqual({ errors: { email: ['has already been taken'] } });
    });

    test('POST /api/users reports each blank field and a bad email in the envelope', async () => {
        const missing = await mockHTTP.post('/api/users').body({ user: {} }).exec();
        expect(missing.response.status).toBe(422);
        expect(missing.json()).toEqual({
            errors: {
                username: ["can't be blank"],
                email: ["can't be blank"],
                password: ["can't be blank"],
            },
        });

        const malformed = await mockHTTP
            .post('/api/users')
            .body({ user: { username: unique('bad-email'), email: 'not-an-email', password: 'pw-12345' } })
            .exec();
        expect(malformed.response.status).toBe(422);
        expect(malformed.json()).toEqual({ errors: { email: ['is invalid'] } });

        const noWrapper = await mockHTTP.post('/api/users').body({}).exec();
        expect(noWrapper.response.status).toBe(422);
        expect(noWrapper.json()).toEqual({ errors: { user: ["can't be blank"] } });
    });

    test('POST /api/users/login exchanges credentials for a usable token', async () => {
        const account = await registerAccount('login');
        const res = await mockHTTP
            .post('/api/users/login')
            .body({ user: { email: account.email, password: account.password } })
            .exec();

        expect(res.response.status).toBe(200);
        const { user } = readBody<UserResponse>(res);
        expect(user.username).toBe(account.username);
        expect(user.token.split('.')).toHaveLength(3);

        // The login token authenticates like the registration one.
        const me = await mockHTTP
            .get('/api/user')
            .headers({ authorization: `Token ${user.token}` })
            .exec();
        expect(me.response.status).toBe(200);
        expect(readBody<UserResponse>(me).user.email).toBe(account.email);
    });

    test('POST /api/users/login answers 401 for a wrong password or unknown email', async () => {
        const account = await registerAccount('badlogin');
        const wrongPassword = await mockHTTP
            .post('/api/users/login')
            .body({ user: { email: account.email, password: 'not-the-password' } })
            .exec();
        expect(wrongPassword.response.status).toBe(401);
        expect(wrongPassword.json()).toEqual({ errors: { credentials: ['invalid'] } });

        const unknownEmail = await mockHTTP
            .post('/api/users/login')
            .body({ user: { email: `${unique('ghost')}@example.com`, password: 'whatever' } })
            .exec();
        expect(unknownEmail.response.status).toBe(401);
        expect(unknownEmail.json()).toEqual({ errors: { credentials: ['invalid'] } });
    });

    test('GET /api/user returns the caller; /api/user 401s distinguish missing from invalid tokens', async () => {
        const account = await registerAccount('me');
        const ok = await mockHTTP.get('/api/user').headers({ authorization: account.header }).exec();
        expect(ok.response.status).toBe(200);
        expect(readBody<UserResponse>(ok).user.username).toBe(account.username);

        const missing = await mockHTTP.get('/api/user').exec();
        expect(missing.response.status).toBe(401);
        expect(missing.json()).toEqual({ errors: { token: ['is missing'] } });

        const missingOnWrite = await mockHTTP
            .put('/api/user')
            .body({ user: { bio: 'x' } })
            .exec();
        expect(missingOnWrite.response.status).toBe(401);
        expect(missingOnWrite.json()).toEqual({ errors: { token: ['is missing'] } });

        const invalid = await mockHTTP.get('/api/user').headers({ authorization: 'Token not-a-jwt' }).exec();
        expect(invalid.response.status).toBe(401);
        expect(invalid.json()).toEqual({ errors: { token: ['is invalid'] } });

        const wrongScheme = await mockHTTP
            .get('/api/user')
            .headers({ authorization: `Bearer ${account.token}` })
            .exec();
        expect(wrongScheme.response.status).toBe(401);
        expect(wrongScheme.json()).toEqual({ errors: { token: ['is invalid'] } });
    });

    test('PUT /api/user updates the profile fields and rotates the password', async () => {
        const account = await registerAccount('updater');
        const res = await mockHTTP
            .put('/api/user')
            .headers({ authorization: account.header })
            .body({ user: { bio: 'writes about conformance', image: 'https://example.com/me.png' } })
            .exec();
        expect(res.response.status).toBe(200);
        const updated = readBody<UserResponse>(res).user;
        expect(updated.bio).toBe('writes about conformance');
        expect(updated.image).toBe('https://example.com/me.png');

        // The JWT carries only the account id, so the previous token stays
        // usable while the rotated password is the one that now logs in.
        await mockHTTP
            .put('/api/user')
            .headers({ authorization: account.header })
            .body({ user: { password: 'rotated-password' } })
            .exec();
        const oldPassword = await mockHTTP
            .post('/api/users/login')
            .body({ user: { email: account.email, password: account.password } })
            .exec();
        expect(oldPassword.response.status).toBe(401);
        const newPassword = await mockHTTP
            .post('/api/users/login')
            .body({ user: { email: account.email, password: 'rotated-password' } })
            .exec();
        expect(newPassword.response.status).toBe(200);
    });

    test('PUT /api/user normalizes an empty bio/image to null and accepts an explicit null', async () => {
        const account = await registerAccount('normalizer');
        const empty = await mockHTTP
            .put('/api/user')
            .headers({ authorization: account.header })
            .body({ user: { bio: '', image: '   ' } })
            .exec();
        expect(empty.response.status).toBe(200);
        const cleared = readBody<UserResponse>(empty).user;
        expect(cleared.bio).toBeNull();
        expect(cleared.image).toBeNull();

        const restored = await mockHTTP
            .put('/api/user')
            .headers({ authorization: account.header })
            .body({ user: { bio: 'a bio', image: 'https://example.com/a.png' } })
            .exec();
        const set = readBody<UserResponse>(restored).user;
        expect(set.bio).toBe('a bio');
        expect(set.image).toBe('https://example.com/a.png');

        const explicitNull = await mockHTTP
            .put('/api/user')
            .headers({ authorization: account.header })
            .body({ user: { bio: null, image: null } })
            .exec();
        expect(explicitNull.response.status).toBe(200);
        const nulled = readBody<UserResponse>(explicitNull).user;
        expect(nulled.bio).toBeNull();
        expect(nulled.image).toBeNull();

        // A blank username/email is still rejected — the spec's collection
        // pins `422` for both the empty-string and the null form.
        const blankEmail = await mockHTTP
            .put('/api/user')
            .headers({ authorization: account.header })
            .body({ user: { email: '' } })
            .exec();
        expect(blankEmail.response.status).toBe(422);
        const nullUsername = await mockHTTP
            .put('/api/user')
            .headers({ authorization: account.header })
            .body({ user: { username: null } })
            .exec();
        expect(nullUsername.response.status).toBe(422);
    });

    test("PUT /api/user rejects taking another account's email or username", async () => {
        const first = await registerAccount('owner');
        const second = await registerAccount('claimant');
        const res = await mockHTTP
            .put('/api/user')
            .headers({ authorization: second.header })
            .body({ user: { email: first.email, username: first.username } })
            .exec();
        expect(res.response.status).toBe(422);
        expect(res.json()).toEqual({
            errors: { username: ['has already been taken'], email: ['has already been taken'] },
        });
    });

    test('GET /api/profiles/:username is optional-auth and 404s unknown users', async () => {
        const account = await registerAccount('profile');
        const anonymous = await mockHTTP.get(`/api/profiles/${account.username}`).exec();
        expect(anonymous.response.status).toBe(200);
        expect(anonymous.json()).toEqual({
            profile: { username: account.username, bio: null, image: null, following: false },
        });

        const missing = await mockHTTP.get(`/api/profiles/${unique('nobody')}`).exec();
        expect(missing.response.status).toBe(404);
        expect(missing.json()).toEqual({ errors: { profile: ['not found'] } });
    });

    test('follow/unfollow is idempotent and view-relative', async () => {
        const reader = await registerAccount('reader');
        const author = await registerAccount('author');

        const unauthenticated = await mockHTTP.post(`/api/profiles/${author.username}/follow`).exec();
        expect(unauthenticated.response.status).toBe(401);
        expect(unauthenticated.json()).toEqual({ errors: { token: ['is missing'] } });

        const followed = await mockHTTP
            .post(`/api/profiles/${author.username}/follow`)
            .headers({ authorization: reader.header })
            .exec();
        expect(followed.response.status).toBe(200);
        expect(readBody<ProfileResponse>(followed).profile.following).toBe(true);

        const again = await mockHTTP
            .post(`/api/profiles/${author.username}/follow`)
            .headers({ authorization: reader.header })
            .exec();
        expect(readBody<ProfileResponse>(again).profile.following).toBe(true);

        const asAuthor = await mockHTTP
            .get(`/api/profiles/${reader.username}`)
            .headers({ authorization: author.header })
            .exec();
        expect(readBody<ProfileResponse>(asAuthor).profile.following).toBe(false);

        const unfollowed = await mockHTTP
            .delete(`/api/profiles/${author.username}/follow`)
            .headers({ authorization: reader.header })
            .exec();
        expect(unfollowed.response.status).toBe(200);
        expect(readBody<ProfileResponse>(unfollowed).profile.following).toBe(false);

        const missingTarget = await mockHTTP
            .post(`/api/profiles/${unique('ghost')}/follow`)
            .headers({ authorization: reader.header })
            .exec();
        expect(missingTarget.response.status).toBe(404);
        expect(missingTarget.json()).toEqual({ errors: { profile: ['not found'] } });
    });

    test('POST /api/articles returns the full payload shape under a derived slug', async () => {
        const account = await registerAccount('publisher');
        const title = `A Title With Punctuation! ${unique('slug')}`;
        const article = await publishArticle(account, {
            title,
            description: 'the description',
            body: 'the body',
            tagList: ['conduit', 'conformance'],
        });

        expect(Object.keys(article).sort()).toEqual([
            'author',
            'body',
            'createdAt',
            'description',
            'favorited',
            'favoritesCount',
            'slug',
            'tagList',
            'title',
            'updatedAt',
        ]);
        expect(article.slug).toBe(article.slug.toLowerCase());
        expect(article.slug.startsWith('a-title-with-punctuation-slug-')).toBe(true);
        expect(article.tagList).toEqual(['conduit', 'conformance']);
        expect(article.favorited).toBe(false);
        expect(article.favoritesCount).toBe(0);
        expect(article.author).toEqual({ username: account.username, bio: null, image: null, following: false });
        expect(Number.isNaN(Date.parse(article.createdAt))).toBe(false);
        expect(article.updatedAt).toBe(article.createdAt);
    });

    test('POST /api/articles derives a unique slug when a title repeats', async () => {
        const account = await registerAccount('slugger');
        const title = `Repeated Title ${unique('slug')}`;
        const first = await publishArticle(account, { title, description: 'd', body: 'b' });
        const second = await publishArticle(account, { title, description: 'd', body: 'b' });
        expect(second.slug).toBe(`${first.slug}-1`);
    });

    test('POST /api/articles requires an author and reports blank fields in the envelope', async () => {
        const account = await registerAccount('validator');
        const unauthenticated = await mockHTTP
            .post('/api/articles')
            .body({ article: { title: 'x', description: 'y', body: 'z' } })
            .exec();
        expect(unauthenticated.response.status).toBe(401);

        const blank = await mockHTTP
            .post('/api/articles')
            .headers({ authorization: account.header })
            .body({ article: { title: '   ', description: '', body: '', tagList: [] } })
            .exec();
        expect(blank.response.status).toBe(422);
        expect(blank.json()).toEqual({
            errors: {
                title: ["can't be blank"],
                description: ["can't be blank"],
                body: ["can't be blank"],
            },
        });

        const missing = await mockHTTP
            .post('/api/articles')
            .headers({ authorization: account.header })
            .body({ article: {} })
            .exec();
        expect(missing.response.status).toBe(422);
        expect(missing.json()).toEqual({
            errors: {
                title: ["can't be blank"],
                description: ["can't be blank"],
                body: ["can't be blank"],
            },
        });
    });

    test('GET /api/articles filters by tag/author/favorited and pages with limit/offset', async () => {
        const alice = await registerAccount('list-alice');
        const bob = await registerAccount('list-bob');
        const marker = unique('filter');
        const first = await publishArticle(alice, {
            title: `First ${marker}`,
            description: 'd',
            body: 'b',
            tagList: [marker],
        });
        const second = await publishArticle(alice, {
            title: `Second ${marker}`,
            description: 'd',
            body: 'b',
            tagList: [marker, 'shared-tag'],
        });
        await mockHTTP.post(`/api/articles/${second.slug}/favorite`).headers({ authorization: bob.header }).exec();

        const byTag = await mockHTTP.get('/api/articles').query({ tag: marker }).exec();
        expect(byTag.response.status).toBe(200);
        const tagged = readBody<ArticlesResponse>(byTag);
        expect(tagged.articlesCount).toBe(2);
        // Newest first.
        expect(tagged.articles.map((article) => article.slug)).toEqual([second.slug, first.slug]);
        // The list schema carries no `body` — only the single-article response does.
        for (const item of tagged.articles) {
            expect('body' in item).toBe(false);
        }

        const byAuthor = await mockHTTP.get('/api/articles').query({ author: alice.username }).exec();
        const authored = readBody<ArticlesResponse>(byAuthor);
        expect(authored.articlesCount).toBe(2);
        expect(authored.articles.every((article) => article.author.username === alice.username)).toBe(true);

        const byUnknownAuthor = await mockHTTP
            .get('/api/articles')
            .query({ author: unique('ghost') })
            .exec();
        expect(readBody<ArticlesResponse>(byUnknownAuthor).articlesCount).toBe(0);

        // `favorited`/`favoritesCount` are view-relative: the filter selects by
        // username, but only a caller who *is* that user sees `favorited: true`.
        const favoritedByBob = await mockHTTP
            .get('/api/articles')
            .query({ favorited: bob.username })
            .headers({ authorization: bob.header })
            .exec();
        const bobFavorites = readBody<ArticlesResponse>(favoritedByBob);
        expect(bobFavorites.articlesCount).toBe(1);
        expect(bobFavorites.articles[0].slug).toBe(second.slug);
        expect(bobFavorites.articles[0].favorited).toBe(true);

        const sameFilterAnonymous = await mockHTTP.get('/api/articles').query({ favorited: bob.username }).exec();
        const anonymousFavorites = readBody<ArticlesResponse>(sameFilterAnonymous);
        expect(anonymousFavorites.articlesCount).toBe(1);
        expect(anonymousFavorites.articles[0].favorited).toBe(false);

        const seenByAnonymous = await mockHTTP.get(`/api/articles/${second.slug}`).exec();
        const anonymousView = readBody<ArticleResponse>(seenByAnonymous).article;
        expect(anonymousView.favorited).toBe(false);
        expect(anonymousView.favoritesCount).toBe(1);
        expect(anonymousView.body).toBe('b');

        const page = await mockHTTP.get('/api/articles').query({ tag: marker, limit: '1', offset: '1' }).exec();
        const paged = readBody<ArticlesResponse>(page);
        expect(paged.articlesCount).toBe(2);
        expect(paged.articles.map((article) => article.slug)).toEqual([first.slug]);

        const beyondEnd = await mockHTTP.get('/api/articles').query({ tag: marker, offset: '5' }).exec();
        expect(readBody<ArticlesResponse>(beyondEnd).articles).toEqual([]);
    });

    test('GET /api/articles rejects a malformed paging window with the envelope', async () => {
        const badLimit = await mockHTTP.get('/api/articles').query({ limit: 'lots' }).exec();
        expect(badLimit.response.status).toBe(422);
        expect(badLimit.json()).toEqual({ errors: { limit: ['is invalid'] } });

        const zeroLimit = await mockHTTP.get('/api/articles').query({ limit: '0' }).exec();
        expect(zeroLimit.response.status).toBe(422);
        expect(zeroLimit.json()).toEqual({ errors: { limit: ['is invalid'] } });

        const badOffset = await mockHTTP.get('/api/articles').query({ offset: '-1' }).exec();
        expect(badOffset.response.status).toBe(422);
        expect(badOffset.json()).toEqual({ errors: { offset: ['is invalid'] } });
    });

    test('an invalid token fails closed on optional-auth reads too', async () => {
        const res = await mockHTTP.get('/api/articles').headers({ authorization: 'Token nope' }).exec();
        expect(res.response.status).toBe(401);
        expect(res.json()).toEqual({ errors: { token: ['is invalid'] } });
    });

    test('GET /api/articles/:slug 404s an unknown slug', async () => {
        const res = await mockHTTP.get(`/api/articles/${unique('nothing')}`).exec();
        expect(res.response.status).toBe(404);
        expect(res.json()).toEqual({ errors: { article: ['not found'] } });
    });

    test('GET /api/articles/feed lists only followed authors and requires a token', async () => {
        const author = await registerAccount('feed-author');
        const reader = await registerAccount('feed-reader');
        const marker = unique('feed');
        const article = await publishArticle(author, {
            title: `Fed ${marker}`,
            description: 'd',
            body: 'b',
            tagList: [marker],
        });

        const unauthenticated = await mockHTTP.get('/api/articles/feed').exec();
        expect(unauthenticated.response.status).toBe(401);

        const before = await mockHTTP.get('/api/articles/feed').headers({ authorization: reader.header }).exec();
        expect(before.response.status).toBe(200);
        expect(readBody<ArticlesResponse>(before).articles).toEqual([]);

        await mockHTTP.post(`/api/profiles/${author.username}/follow`).headers({ authorization: reader.header }).exec();
        const after = await mockHTTP.get('/api/articles/feed').headers({ authorization: reader.header }).exec();
        const feed = readBody<ArticlesResponse>(after);
        expect(feed.articlesCount).toBe(1);
        expect(feed.articles[0].slug).toBe(article.slug);
        expect(feed.articles[0].author.following).toBe(true);
        expect('body' in feed.articles[0]).toBe(false);

        const limited = await mockHTTP
            .get('/api/articles/feed')
            .query({ limit: '1', offset: '0' })
            .headers({ authorization: reader.header })
            .exec();
        expect(readBody<ArticlesResponse>(limited).articlesCount).toBe(1);
    });

    test('PUT /api/articles/:slug is author-only and re-derives the slug on a retitle', async () => {
        const author = await registerAccount('editor');
        const intruder = await registerAccount('intruder');
        const original = await publishArticle(author, {
            title: `Original ${unique('edit')}`,
            description: 'd',
            body: 'b',
            tagList: ['before'],
        });

        const denied = await mockHTTP
            .put(`/api/articles/${original.slug}`)
            .headers({ authorization: intruder.header })
            .body({ article: { body: 'hijacked' } })
            .exec();
        expect(denied.response.status).toBe(403);
        expect(denied.json()).toEqual({ errors: { article: ['forbidden'] } });

        const unknown = await mockHTTP
            .put(`/api/articles/${unique('nothing')}`)
            .headers({ authorization: author.header })
            .body({ article: { body: 'x' } })
            .exec();
        expect(unknown.response.status).toBe(404);

        const newTitle = `Revised ${unique('edit')}`;
        const updated = await mockHTTP
            .put(`/api/articles/${original.slug}`)
            .headers({ authorization: author.header })
            .body({ article: { title: newTitle, body: 'revised body', tagList: ['after'] } })
            .exec();
        expect(updated.response.status).toBe(200);
        const article = readBody<ArticleResponse>(updated).article;
        expect(article.title).toBe(newTitle);
        expect(article.slug.startsWith('revised-edit-')).toBe(true);
        expect(article.body).toBe('revised body');
        expect(article.tagList).toEqual(['after']);
        expect(article.description).toBe('d');
        expect(Date.parse(article.updatedAt)).toBeGreaterThanOrEqual(Date.parse(article.createdAt));

        const oldSlug = await mockHTTP.get(`/api/articles/${original.slug}`).exec();
        expect(oldSlug.response.status).toBe(404);
        const newSlug = await mockHTTP.get(`/api/articles/${article.slug}`).exec();
        expect(newSlug.response.status).toBe(200);
    });

    test('a retitle that keeps the same slug does not self-collide', async () => {
        const author = await registerAccount('retitle');
        const title = `Stable ${unique('retitle')}`;
        const article = await publishArticle(author, { title, description: 'd', body: 'b' });
        const updated = await mockHTTP
            .put(`/api/articles/${article.slug}`)
            .headers({ authorization: author.header })
            .body({ article: { title } })
            .exec();
        expect(readBody<ArticleResponse>(updated).article.slug).toBe(article.slug);
    });

    test('PUT /api/articles/:slug keeps omitted fields, clears tags on [], rejects a null tagList', async () => {
        const author = await registerAccount('patcher');
        const article = await publishArticle(author, {
            title: `Patchable ${unique('patch')}`,
            description: 'the description',
            body: 'the body',
            tagList: ['one', 'two'],
        });

        const bodyOnly = await mockHTTP
            .put(`/api/articles/${article.slug}`)
            .headers({ authorization: author.header })
            .body({ article: { body: 'a new body' } })
            .exec();
        expect(bodyOnly.response.status).toBe(200);
        const patched = readBody<ArticleResponse>(bodyOnly).article;
        expect(patched.body).toBe('a new body');
        expect(patched.title).toBe(article.title);
        expect(patched.description).toBe('the description');
        expect(patched.tagList).toEqual(['one', 'two']);
        expect(patched.createdAt).toBe(article.createdAt);
        expect(Date.parse(patched.updatedAt)).toBeGreaterThanOrEqual(Date.parse(article.createdAt));

        const cleared = await mockHTTP
            .put(`/api/articles/${article.slug}`)
            .headers({ authorization: author.header })
            .body({ article: { tagList: [] } })
            .exec();
        expect(readBody<ArticleResponse>(cleared).article.tagList).toEqual([]);

        const nullTags = await mockHTTP
            .put(`/api/articles/${article.slug}`)
            .headers({ authorization: author.header })
            .body({ article: { tagList: null } })
            .exec();
        expect(nullTags.response.status).toBe(422);

        const unknownFieldOnly = await mockHTTP
            .put(`/api/articles/${article.slug}`)
            .headers({ authorization: author.header })
            .body({ article: { favorite: true } })
            .exec();
        expect(unknownFieldOnly.response.status).toBe(200);
        expect(readBody<ArticleResponse>(unknownFieldOnly).article.body).toBe('a new body');
    });

    test('DELETE /api/articles/:slug is author-only, cascades comments, and 204s', async () => {
        const author = await registerAccount('deleter');
        const intruder = await registerAccount('deleter-intruder');
        const article = await publishArticle(author, {
            title: `Doomed ${unique('delete')}`,
            description: 'd',
            body: 'b',
            tagList: [],
        });
        await mockHTTP
            .post(`/api/articles/${article.slug}/comments`)
            .headers({ authorization: intruder.header })
            .body({ comment: { body: 'will be cascaded' } })
            .exec();

        const denied = await mockHTTP
            .delete(`/api/articles/${article.slug}`)
            .headers({ authorization: intruder.header })
            .exec();
        expect(denied.response.status).toBe(403);
        expect(denied.json()).toEqual({ errors: { article: ['forbidden'] } });

        const deleted = await mockHTTP
            .delete(`/api/articles/${article.slug}`)
            .headers({ authorization: author.header })
            .exec();
        expect(deleted.response.status).toBe(204);
        expect(deleted.text()).toBe('');

        const gone = await mockHTTP.get(`/api/articles/${article.slug}`).exec();
        expect(gone.response.status).toBe(404);
        const comments = await mockHTTP.get(`/api/articles/${article.slug}/comments`).exec();
        expect(comments.response.status).toBe(404);

        const again = await mockHTTP
            .delete(`/api/articles/${article.slug}`)
            .headers({ authorization: author.header })
            .exec();
        expect(again.response.status).toBe(404);
    });

    test('favorite/unfavorite is idempotent and updates the count exactly once', async () => {
        const author = await registerAccount('fav-author');
        const fan = await registerAccount('fav-fan');
        const article = await publishArticle(author, { title: `Fav ${unique('fav')}`, description: 'd', body: 'b' });

        const unauthenticated = await mockHTTP.post(`/api/articles/${article.slug}/favorite`).exec();
        expect(unauthenticated.response.status).toBe(401);

        const first = await mockHTTP
            .post(`/api/articles/${article.slug}/favorite`)
            .headers({ authorization: fan.header })
            .exec();
        expect(first.response.status).toBe(200);
        const favorited = readBody<ArticleResponse>(first).article;
        expect(favorited.favorited).toBe(true);
        expect(favorited.favoritesCount).toBe(1);

        const repeat = await mockHTTP
            .post(`/api/articles/${article.slug}/favorite`)
            .headers({ authorization: fan.header })
            .exec();
        const repeated = readBody<ArticleResponse>(repeat).article;
        expect(repeated.favorited).toBe(true);
        expect(repeated.favoritesCount).toBe(1);

        const asAuthor = await mockHTTP
            .get(`/api/articles/${article.slug}`)
            .headers({ authorization: author.header })
            .exec();
        expect(readBody<ArticleResponse>(asAuthor).article.favorited).toBe(false);

        const removed = await mockHTTP
            .delete(`/api/articles/${article.slug}/favorite`)
            .headers({ authorization: fan.header })
            .exec();
        const unfavorited = readBody<ArticleResponse>(removed).article;
        expect(unfavorited.favorited).toBe(false);
        expect(unfavorited.favoritesCount).toBe(0);

        const removedAgain = await mockHTTP
            .delete(`/api/articles/${article.slug}/favorite`)
            .headers({ authorization: fan.header })
            .exec();
        expect(readBody<ArticleResponse>(removedAgain).article.favoritesCount).toBe(0);

        const unknown = await mockHTTP
            .post(`/api/articles/${unique('nothing')}/favorite`)
            .headers({ authorization: fan.header })
            .exec();
        expect(unknown.response.status).toBe(404);
    });

    test('comments: create, list oldest-first, reject blanks, and delete author-only', async () => {
        const author = await registerAccount('comment-author');
        const commenter = await registerAccount('commenter');
        const article = await publishArticle(author, {
            title: `Commented ${unique('comment')}`,
            description: 'd',
            body: 'b',
        });

        const blank = await mockHTTP
            .post(`/api/articles/${article.slug}/comments`)
            .headers({ authorization: commenter.header })
            .body({ comment: { body: '   ' } })
            .exec();
        expect(blank.response.status).toBe(422);
        expect(blank.json()).toEqual({ errors: { body: ["can't be blank"] } });

        const unauthenticated = await mockHTTP
            .post(`/api/articles/${article.slug}/comments`)
            .body({ comment: { body: 'nope' } })
            .exec();
        expect(unauthenticated.response.status).toBe(401);

        const created = await mockHTTP
            .post(`/api/articles/${article.slug}/comments`)
            .headers({ authorization: commenter.header })
            .body({ comment: { body: 'first remark' } })
            .exec();
        expect(created.response.status).toBe(201);
        const comment = readBody<CommentResponse>(created).comment;
        expect(Object.keys(comment).sort()).toEqual(['author', 'body', 'createdAt', 'id', 'updatedAt']);
        expect(comment.body).toBe('first remark');
        expect(comment.author).toEqual({ username: commenter.username, bio: null, image: null, following: false });

        await mockHTTP
            .post(`/api/articles/${article.slug}/comments`)
            .headers({ authorization: author.header })
            .body({ comment: { body: 'second remark' } })
            .exec();

        const listed = await mockHTTP.get(`/api/articles/${article.slug}/comments`).exec();
        expect(listed.response.status).toBe(200);
        const comments = readBody<CommentsResponse>(listed).comments;
        expect(comments.map((entry) => entry.body)).toEqual(['first remark', 'second remark']);

        const denied = await mockHTTP
            .delete(`/api/articles/${article.slug}/comments/${comment.id}`)
            .headers({ authorization: author.header })
            .exec();
        expect(denied.response.status).toBe(403);
        expect(denied.json()).toEqual({ errors: { comment: ['forbidden'] } });

        const deleted = await mockHTTP
            .delete(`/api/articles/${article.slug}/comments/${comment.id}`)
            .headers({ authorization: commenter.header })
            .exec();
        expect(deleted.response.status).toBe(204);

        const afterDelete = await mockHTTP.get(`/api/articles/${article.slug}/comments`).exec();
        expect(readBody<CommentsResponse>(afterDelete).comments.map((entry) => entry.body)).toEqual(['second remark']);

        const unknownId = await mockHTTP
            .delete(`/api/articles/${article.slug}/comments/999999`)
            .headers({ authorization: commenter.header })
            .exec();
        expect(unknownId.response.status).toBe(404);
        expect(unknownId.json()).toEqual({ errors: { comment: ['not found'] } });

        const nonNumericId = await mockHTTP
            .delete(`/api/articles/${article.slug}/comments/not-a-number`)
            .headers({ authorization: commenter.header })
            .exec();
        expect(nonNumericId.response.status).toBe(404);

        const unknownArticle = await mockHTTP
            .post(`/api/articles/${unique('nothing')}/comments`)
            .headers({ authorization: commenter.header })
            .body({ comment: { body: 'orphan' } })
            .exec();
        expect(unknownArticle.response.status).toBe(404);
        expect(unknownArticle.json()).toEqual({ errors: { article: ['not found'] } });
    });

    test('GET /api/tags returns the deduplicated tag set, sorted', async () => {
        const account = await registerAccount('tagger');
        const marker = unique('tag');
        await publishArticle(account, {
            title: `Tags ${marker}`,
            description: 'd',
            body: 'b',
            tagList: ['zeta', 'alpha', marker, 'zeta'],
        });

        const res = await mockHTTP.get('/api/tags').exec();
        expect(res.response.status).toBe(200);
        const { tags } = readBody<TagsResponse>(res);
        expect(tags).toContain('alpha');
        expect(tags).toContain('zeta');
        expect(tags).toContain(marker);
        expect(new Set(tags).size).toBe(tags.length);
        expect([...tags].sort()).toEqual(tags);
    });

    test('unknown routes answer the framework problem document, not the app envelope', async () => {
        const missingRoute = await mockHTTP.get('/api/does-not-exist').exec();
        expect(missingRoute.response.status).toBe(404);
        expect(missingRoute.response.headers['content-type']).toContain('application/problem+json');
    });
});
