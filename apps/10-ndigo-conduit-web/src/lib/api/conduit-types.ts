/**
 * The RealWorld (Conduit) wire contract this app consumes, plus the typed
 * error the API's `{"errors":{…}}` envelope becomes at the service boundary.
 *
 * These are hand-written projections of the payloads `@ndigo/conduit-api`
 * documents in its README (`{user}`, `{profile}`, `{article}`,
 * `{articles,articlesCount}`, `{comments}`, `{tags}`). Nothing here validates
 * at runtime: the API is an in-repo sibling whose shapes are pinned by its own
 * conformance suite, so the client trusts the contract and surfaces transport
 * failures as {@link ConduitApiError}.
 *
 * @module ndigo-conduit-web
 */

/** The RealWorld `errors` member: field name → failure messages. */
export interface ConduitErrors {
    [field: string]: string[];
}

/** A user profile as it appears on articles, comments and `/api/profiles/:username`. */
export interface ConduitProfile {
    username: string;
    bio: string | null;
    image: string | null;
    following: boolean;
}

/** The authenticated account (`{user}`), without the token. */
export interface ConduitUser {
    email: string;
    username: string;
    bio: string | null;
    image: string | null;
}

/**
 * The `{user}` member exactly as the API serializes it.
 *
 * RealWorld puts the JWT *inside* the user object
 * (`{"user":{"email":…,"token":…,"username":…}}`), while the app's session
 * keeps the credential beside the account. This is the wire shape; the client
 * splits it into a {@link ConduitSession}.
 */
export interface ConduitUserPayload extends ConduitUser {
    token: string;
}

/** An authenticated session: the account plus its `Token <jwt>` credential. */
export interface ConduitSession {
    token: string;
    user: ConduitUser;
}

/** A single article (`GET /api/articles/:slug`), carrying its markdown `body`. */
export interface ConduitArticle {
    slug: string;
    title: string;
    description: string;
    body: string;
    tagList: string[];
    createdAt: string;
    updatedAt: string;
    favorited: boolean;
    favoritesCount: number;
    author: ConduitProfile;
}

/**
 * An article as it appears in a list. The RealWorld list schema carries no
 * `body` (the official collection asserts its absence), so summaries are
 * modelled as theirs — no field is invented to fill the hole.
 */
export type ConduitArticleSummary = Omit<ConduitArticle, 'body'>;

/** A comment on an article. */
export interface ConduitComment {
    id: number;
    createdAt: string;
    updatedAt: string;
    body: string;
    author: ConduitProfile;
}

/** The `tag`/`author`/`favorited` filters plus the paging window. */
export interface ConduitArticleQuery {
    tag?: string;
    author?: string;
    favorited?: string;
    limit?: number;
    offset?: number;
}

/** A page of articles: the window's items and the total match count. */
export interface ConduitArticlePage {
    articles: ConduitArticleSummary[];
    articlesCount: number;
}

/** Credentials for `PUT /api/user`; an absent field is left unchanged. */
export interface ConduitAccountPatch {
    email?: string;
    username?: string;
    password?: string;
    bio?: string;
    image?: string;
}

/** The `POST /api/articles` payload. */
export interface ConduitArticleDraft {
    title: string;
    description: string;
    body: string;
    tagList: string[];
}

/**
 * A failed Conduit call.
 *
 * `status` is the HTTP status (`0` when the request never reached the API);
 * `errors` is the RealWorld envelope, or a single `body` entry when the
 * response carried no parseable envelope. Views read `errors` field-by-field,
 * so a per-field message lands on the field that caused it.
 */
export class ConduitApiError extends Error {
    /** The HTTP status of the failed response (`0` for a transport failure). */
    readonly status: number;

    /** The RealWorld error envelope. */
    readonly errors: ConduitErrors;

    /**
     * Creates an API error.
     *
     * @param status - The HTTP status (`0` for a transport failure).
     * @param errors - The RealWorld envelope.
     * @param message - The `Error.message` text.
     */
    constructor(status: number, errors: ConduitErrors, message?: string) {
        super(message ?? `Conduit request failed with status ${status}`);
        this.name = 'ConduitApiError';
        this.status = status;
        this.errors = errors;
    }

    /**
     * Narrows a thrown value to a {@link ConduitApiError}.
     *
     * @param error - The thrown value.
     * @returns The error when it is a {@link ConduitApiError}, otherwise `null`.
     */
    static from(error: unknown): ConduitApiError | null {
        return error instanceof ConduitApiError ? error : null;
    }

    /**
     * Reads the RealWorld envelope out of a decoded response body.
     *
     * @param status - The HTTP status the body arrived with.
     * @param payload - The decoded JSON body, if any.
     * @returns The envelope, with a `body` fallback when no envelope is present.
     */
    static envelopeOf(status: number, payload: unknown): ConduitErrors {
        if (payload && typeof payload === 'object' && 'errors' in payload) {
            const { errors } = payload as { errors: unknown };
            if (errors && typeof errors === 'object') {
                return errors as ConduitErrors;
            }
        }
        return { body: [`Request failed with status ${status}`] };
    }
}

/**
 * The service-layer seam onto the Conduit backend.
 *
 * Services depend on this interface rather than on the HTTP-backed
 * implementation, so a spec drives them with a hand-written stub (AD-34-style
 * token discipline does not apply: this is a plain, replaceable port).
 */
export interface ConduitApi {
    /** `POST /api/users` — registers an account. */
    register(input: { username: string; email: string; password: string }): Promise<ConduitSession>;

    /** `POST /api/users/login` — exchanges credentials for a token. */
    login(input: { email: string; password: string }): Promise<ConduitSession>;

    /** `GET /api/user` — the current account for the stored token. */
    currentUser(): Promise<ConduitSession>;

    /** `PUT /api/user` — patches the current account. */
    updateUser(patch: ConduitAccountPatch): Promise<ConduitSession>;

    /** `GET /api/articles` — global list with tag/author/favorited filters. */
    listArticles(query: ConduitArticleQuery): Promise<ConduitArticlePage>;

    /** `GET /api/articles/feed` — the followed-authors feed. */
    getFeed(query: { limit?: number; offset?: number }): Promise<ConduitArticlePage>;

    /** `GET /api/articles/:slug` — a single article. */
    getArticle(slug: string): Promise<ConduitArticle>;

    /** `POST /api/articles` — publishes an article. */
    createArticle(draft: ConduitArticleDraft): Promise<ConduitArticle>;

    /** `PUT /api/articles/:slug` — updates an article. */
    updateArticle(slug: string, draft: Partial<ConduitArticleDraft>): Promise<ConduitArticle>;

    /** `DELETE /api/articles/:slug` — deletes an article. */
    deleteArticle(slug: string): Promise<void>;

    /** `POST /api/articles/:slug/favorite` — favorites an article. */
    favoriteArticle(slug: string): Promise<ConduitArticle>;

    /** `DELETE /api/articles/:slug/favorite` — unfavorites an article. */
    unfavoriteArticle(slug: string): Promise<ConduitArticle>;

    /** `GET /api/profiles/:username` — a profile. */
    getProfile(username: string): Promise<ConduitProfile>;

    /** `POST /api/profiles/:username/follow` — follows a profile. */
    follow(username: string): Promise<ConduitProfile>;

    /** `DELETE /api/profiles/:username/follow` — unfollows a profile. */
    unfollow(username: string): Promise<ConduitProfile>;

    /** `GET /api/articles/:slug/comments` — an article's comments, oldest first. */
    listComments(slug: string): Promise<ConduitComment[]>;

    /** `POST /api/articles/:slug/comments` — adds a comment. */
    addComment(slug: string, body: string): Promise<ConduitComment>;

    /** `DELETE /api/articles/:slug/comments/:id` — deletes a comment. */
    deleteComment(slug: string, id: number): Promise<void>;

    /** `GET /api/tags` — the popular tags. */
    listTags(): Promise<string[]>;
}
