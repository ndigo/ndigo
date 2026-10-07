/**
 * @module blue-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
// Node environment: the client is isomorphic, and the API base falls back to
// the platform default (`http://localhost/`) with no `location` present.
import { describe, expect, test, vi } from 'vitest';
import type { Fetch } from '@blue/http';
import { ConduitApiClient } from '../src/lib/api/conduit-api-client';
import { createConduitHttp } from '../src/lib/api/conduit-http';
import { ConduitApiError, type ConduitArticle } from '../src/lib/api/conduit-types';

/**
 * A fetch double that records the requests it saw and answers from a queue.
 */
function createFetchDouble(responses: (request: Request) => Response) {
    const requests: Request[] = [];
    const fetchDouble: Fetch = async (input) => {
        const request = input as Request;
        requests.push(request);
        return responses(request);
    };
    return { requests, fetchDouble };
}

function jsonResponse(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('ConduitApiClient over @blue/http', () => {
    test('stamps the session token onto every outgoing request', async () => {
        const { requests, fetchDouble } = createFetchDouble(() => jsonResponse(200, { tags: ['realworld'] }));
        const api = new ConduitApiClient(
            createConduitHttp({ getToken: () => 'jwt-123', onUnauthorized: () => undefined, fetch: fetchDouble })
        );

        expect(await api.listTags()).toEqual(['realworld']);
        expect(requests).toHaveLength(1);
        expect(requests[0]?.headers.get('Authorization')).toBe('Token jwt-123');
        expect(requests[0]?.url).toBe('http://localhost/api/tags');
    });

    test('sends no Authorization header for an anonymous visitor', async () => {
        const { requests, fetchDouble } = createFetchDouble(() => jsonResponse(200, { tags: [] }));
        const api = new ConduitApiClient(
            createConduitHttp({ getToken: () => null, onUnauthorized: () => undefined, fetch: fetchDouble })
        );

        await api.listTags();
        expect(requests[0]?.headers.get('Authorization')).toBeNull();
    });

    test('maps a 422 envelope into a ConduitApiError with its field messages', async () => {
        const { fetchDouble } = createFetchDouble(() => jsonResponse(422, { errors: { title: ["can't be blank"] } }));
        const api = new ConduitApiClient(
            createConduitHttp({ getToken: () => null, onUnauthorized: () => undefined, fetch: fetchDouble })
        );

        const failure = await api
            .createArticle({ title: '', description: 'd', body: 'b', tagList: [] })
            .catch((error: unknown) => error);

        expect(failure).toBeInstanceOf(ConduitApiError);
        expect((failure as ConduitApiError).status).toBe(422);
        expect((failure as ConduitApiError).errors).toEqual({ title: ["can't be blank"] });
    });

    test('invokes the unauthorized hook on a 401 and still surfaces the envelope', async () => {
        const onUnauthorized = vi.fn();
        const { fetchDouble } = createFetchDouble(() => jsonResponse(401, { errors: { credentials: ['invalid'] } }));
        const api = new ConduitApiClient(
            createConduitHttp({ getToken: () => 'stale', onUnauthorized, fetch: fetchDouble })
        );

        const failure = await api.login({ email: 'a@example.com', password: 'nope' }).catch((error: unknown) => error);

        expect(onUnauthorized).toHaveBeenCalledTimes(1);
        expect((failure as ConduitApiError).errors).toEqual({ credentials: ['invalid'] });
    });

    test('splits the JWT out of the wire {user} payload', async () => {
        // RealWorld nests the token inside the user object; the app's session
        // keeps it beside the account.
        const { fetchDouble } = createFetchDouble(() =>
            jsonResponse(201, {
                user: { email: 'alice@example.com', token: 'jwt-abc', username: 'alice', bio: null, image: null },
            })
        );
        const api = new ConduitApiClient(
            createConduitHttp({ getToken: () => null, onUnauthorized: () => undefined, fetch: fetchDouble })
        );

        await expect(api.register({ username: 'alice', email: 'alice@example.com', password: 's' })).resolves.toEqual({
            token: 'jwt-abc',
            user: { email: 'alice@example.com', username: 'alice', bio: null, image: null },
        });
    });

    test('does not invoke the unauthorized hook for a successful call', async () => {
        const onUnauthorized = vi.fn();
        const { fetchDouble } = createFetchDouble(() => jsonResponse(200, { articles: [], articlesCount: 0 }));
        const api = new ConduitApiClient(
            createConduitHttp({ getToken: () => 'jwt', onUnauthorized, fetch: fetchDouble })
        );

        await api.listArticles({});
        expect(onUnauthorized).not.toHaveBeenCalled();
    });

    test('unwraps a 204 delete without reading a body', async () => {
        const { fetchDouble } = createFetchDouble(() => new Response(null, { status: 204 }));
        const api = new ConduitApiClient(
            createConduitHttp({ getToken: () => 'jwt', onUnauthorized: () => undefined, fetch: fetchDouble })
        );

        await expect(api.deleteArticle('how-to-conform')).resolves.toBeUndefined();
    });

    test('reports an unreachable API as status 0 rather than a 418 response', async () => {
        const fetchDouble: Fetch = async () => {
            throw new TypeError('Failed to fetch');
        };
        const api = new ConduitApiClient(
            createConduitHttp({ getToken: () => null, onUnauthorized: () => undefined, fetch: fetchDouble })
        );

        const failure = await api.getArticle('x').catch((error: unknown) => error);
        expect((failure as ConduitApiError).status).toBe(0);
        expect((failure as ConduitApiError).errors.body?.[0]).toContain('could not be reached');
    });

    test('serializes only the query members that are present', async () => {
        const { requests, fetchDouble } = createFetchDouble(() =>
            jsonResponse(200, { articles: [], articlesCount: 0 })
        );
        const api = new ConduitApiClient(
            createConduitHttp({ getToken: () => null, onUnauthorized: () => undefined, fetch: fetchDouble })
        );

        await api.listArticles({ tag: 'realworld', limit: 20, offset: 0 });
        expect(requests[0]?.url).toBe('http://localhost/api/articles?tag=realworld&limit=20&offset=0');
    });

    test('returns the article payload of a favorite write', async () => {
        const article = {
            slug: 'a',
            title: 'A',
            description: '',
            body: '',
            tagList: [],
            createdAt: '',
            updatedAt: '',
            favorited: true,
            favoritesCount: 3,
            author: { username: 'alice', bio: null, image: null, following: false },
        } satisfies ConduitArticle;
        const { requests, fetchDouble } = createFetchDouble(() => jsonResponse(200, { article }));
        const api = new ConduitApiClient(
            createConduitHttp({ getToken: () => 'jwt', onUnauthorized: () => undefined, fetch: fetchDouble })
        );

        await expect(api.favoriteArticle('a')).resolves.toMatchObject({ favorited: true, favoritesCount: 3 });
        expect(requests[0]?.method).toBe('POST');
        expect(requests[0]?.url).toBe('http://localhost/api/articles/a/favorite');
    });
});
