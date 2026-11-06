/**
 * `@ndigo/http`-backed implementation of the {@link ConduitApi} port.
 *
 * Every endpoint collapses to one `#send` path: dispatch through the
 * interceptor chain, decode the body, translate a non-2xx status into a
 * {@link ConduitApiError} carrying the RealWorld `{"errors":{…}}` envelope.
 * Services therefore never look at a status code — they catch one typed error
 * whose `errors` member already maps onto the form fields that caused it.
 *
 * A response that never became a `Response` (transport failure: offline, DNS,
 * abort) arrives as `@ndigo/http`'s `ResponseError`, which exposes the same
 * `status`/`ok`/`text()` surface but a synthetic `418`; the client reports it as
 * status `0` with a single `body` message so a caller cannot mistake it for an
 * API answer.
 *
 * @module ndigo-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { HTTP } from '@ndigo/http';
import { buildQuery } from './conduit-http';
import {
    ConduitApiError,
    type ConduitAccountPatch,
    type ConduitApi,
    type ConduitArticle,
    type ConduitArticleDraft,
    type ConduitArticlePage,
    type ConduitArticleQuery,
    type ConduitComment,
    type ConduitProfile,
    type ConduitSession,
    type ConduitUserPayload,
} from './conduit-types';

/** The API prefix every route is mounted under. */
const API_PREFIX = '/api';

/** Status `@ndigo/http` synthesizes for a response that never arrived. */
const SYNTHETIC_TRANSPORT_STATUS = 418;

/** HTTP verbs this client uses. */
type Verb = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Reads and decodes a response body once, tolerating an empty or non-JSON body.
 *
 * @param response - The response (or `ResponseError`) to decode.
 * @returns The decoded JSON value, or `null` when the body is empty or not JSON.
 */
async function readJson(response: Response): Promise<unknown> {
    const text = await response.text();
    if (text.length === 0) {
        return null;
    }
    try {
        return JSON.parse(text) as unknown;
    } catch {
        return null;
    }
}

/**
 * The HTTP-backed Conduit API client.
 */
export class ConduitApiClient implements ConduitApi {
    readonly #http: HTTP;

    /**
     * Creates the client.
     *
     * @param http - The app's configured HTTP client (auth + 401 interceptors).
     */
    constructor(http: HTTP) {
        this.#http = http;
    }

    /**
     * Dispatches one request and unwraps its payload.
     *
     * @param verb - The HTTP method.
     * @param path - API-relative path, e.g. `/articles` (the prefix is added).
     * @param body - Optional JSON body.
     * @returns The decoded payload (`null` for `204`).
     * @throws {ConduitApiError} When the response is not 2xx.
     */
    async #send(verb: Verb, path: string, body?: unknown): Promise<unknown> {
        const response = await this.#http.request(`${API_PREFIX}${path}`, {
            method: verb,
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });

        if (response.status === SYNTHETIC_TRANSPORT_STATUS && !response.ok) {
            throw new ConduitApiError(0, { body: ['The API could not be reached.'] }, 'Conduit API unreachable');
        }

        const payload = response.status === 204 ? null : await readJson(response);

        if (!response.ok) {
            throw new ConduitApiError(response.status, ConduitApiError.envelopeOf(response.status, payload));
        }
        if (response.status !== 204 && payload === null) {
            throw new ConduitApiError(response.status, { body: ['The API returned an unreadable body.'] });
        }
        return payload;
    }

    /**
     * Dispatches one request and narrows the payload through a member accessor.
     *
     * The wire shapes wrap their subject (`{user}`, `{article}`, …); this
     * applies the unwrapping so each method below stays one statement.
     *
     * @param verb - The HTTP method.
     * @param path - API-relative path.
     * @param member - The envelope member carrying the payload.
     * @param body - Optional JSON body.
     * @returns The unwrapped member.
     */
    async #sendFor<T>(verb: Verb, path: string, member: string, body?: unknown): Promise<T> {
        const payload = await this.#send(verb, path, body);
        const wrapped = payload as Record<string, T> | null;
        const value = wrapped?.[member];
        if (value === undefined) {
            throw new ConduitApiError(200, { body: [`The API response carried no "${member}" member.`] });
        }
        return value;
    }

    /**
     * Reads the wire `{user}` member and splits the JWT out of it.
     *
     * @param verb - The HTTP method.
     * @param path - API-relative path.
     * @param body - Optional JSON body.
     * @returns The session: the account plus its credential.
     */
    async #session(verb: Verb, path: string, body?: unknown): Promise<ConduitSession> {
        const payload = await this.#sendFor<ConduitUserPayload>(verb, path, 'user', body);
        const { token, ...user } = payload;
        return { token, user };
    }

    /** @inheritdoc */
    register(input: { username: string; email: string; password: string }): Promise<ConduitSession> {
        return this.#session('POST', '/users', { user: input });
    }

    /** @inheritdoc */
    login(input: { email: string; password: string }): Promise<ConduitSession> {
        return this.#session('POST', '/users/login', { user: input });
    }

    /** @inheritdoc */
    currentUser(): Promise<ConduitSession> {
        return this.#session('GET', '/user');
    }

    /** @inheritdoc */
    updateUser(patch: ConduitAccountPatch): Promise<ConduitSession> {
        return this.#session('PUT', '/user', { user: patch });
    }

    /** @inheritdoc */
    async listArticles(query: ConduitArticleQuery): Promise<ConduitArticlePage> {
        const filter = {
            tag: query.tag,
            author: query.author,
            favorited: query.favorited,
            limit: query.limit,
            offset: query.offset,
        };
        const payload = await this.#send('GET', `/articles${buildQuery(filter)}`);
        return payload as ConduitArticlePage;
    }

    /** @inheritdoc */
    async getFeed(query: { limit?: number; offset?: number }): Promise<ConduitArticlePage> {
        const payload = await this.#send('GET', `/articles/feed${buildQuery(query)}`);
        return payload as ConduitArticlePage;
    }

    /** @inheritdoc */
    getArticle(slug: string): Promise<ConduitArticle> {
        return this.#sendFor<ConduitArticle>('GET', `/articles/${encodeURIComponent(slug)}`, 'article');
    }

    /** @inheritdoc */
    createArticle(draft: ConduitArticleDraft): Promise<ConduitArticle> {
        return this.#sendFor<ConduitArticle>('POST', '/articles', 'article', { article: draft });
    }

    /** @inheritdoc */
    updateArticle(slug: string, draft: Partial<ConduitArticleDraft>): Promise<ConduitArticle> {
        return this.#sendFor<ConduitArticle>(
            'PUT',
            `/articles/${encodeURIComponent(slug)}`,
            'article',
            { article: draft }
        );
    }

    /** @inheritdoc */
    async deleteArticle(slug: string): Promise<void> {
        await this.#send('DELETE', `/articles/${encodeURIComponent(slug)}`);
    }

    /** @inheritdoc */
    favoriteArticle(slug: string): Promise<ConduitArticle> {
        return this.#sendFor<ConduitArticle>('POST', `/articles/${encodeURIComponent(slug)}/favorite`, 'article');
    }

    /** @inheritdoc */
    unfavoriteArticle(slug: string): Promise<ConduitArticle> {
        return this.#sendFor<ConduitArticle>('DELETE', `/articles/${encodeURIComponent(slug)}/favorite`, 'article');
    }

    /** @inheritdoc */
    getProfile(username: string): Promise<ConduitProfile> {
        return this.#sendFor<ConduitProfile>('GET', `/profiles/${encodeURIComponent(username)}`, 'profile');
    }

    /** @inheritdoc */
    follow(username: string): Promise<ConduitProfile> {
        return this.#sendFor<ConduitProfile>('POST', `/profiles/${encodeURIComponent(username)}/follow`, 'profile');
    }

    /** @inheritdoc */
    unfollow(username: string): Promise<ConduitProfile> {
        return this.#sendFor<ConduitProfile>('DELETE', `/profiles/${encodeURIComponent(username)}/follow`, 'profile');
    }

    /** @inheritdoc */
    listComments(slug: string): Promise<ConduitComment[]> {
        return this.#sendFor<ConduitComment[]>('GET', `/articles/${encodeURIComponent(slug)}/comments`, 'comments');
    }

    /** @inheritdoc */
    addComment(slug: string, body: string): Promise<ConduitComment> {
        return this.#sendFor<ConduitComment>(
            'POST',
            `/articles/${encodeURIComponent(slug)}/comments`,
            'comment',
            { comment: { body } }
        );
    }

    /** @inheritdoc */
    async deleteComment(slug: string, id: number): Promise<void> {
        await this.#send('DELETE', `/articles/${encodeURIComponent(slug)}/comments/${id}`);
    }

    /** @inheritdoc */
    listTags(): Promise<string[]> {
        return this.#sendFor<string[]>('GET', '/tags', 'tags');
    }
}
