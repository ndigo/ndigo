/**
 * The Todo-Backend REST surface through `@ndigo/test` MockHTTP.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { bootTodoApi } from './harness';
import type { TodoAPIHarness } from './harness';
import type { TodoJSON } from '../src/todo.dto';

/** The origin MockHTTP requests report, since they carry no `Host` header. */
const ORIGIN = 'http://localhost:3030';

describe('@ndigo/todo-api — REST surface', () => {
    let harness: TodoAPIHarness;

    beforeAll(() => {
        harness = bootTodoApi();
    });

    afterAll(() => {
        harness.close();
    });

    // The public spec's own isolation primitive: DELETE on the collection root.
    beforeEach(async () => {
        const reset = await harness.mockHTTP.delete('/todos').exec();
        expect(reset.response.status).toBe(204);
    });

    /** Create a todo and return its wire shape. */
    async function create(body: Record<string, unknown>): Promise<TodoJSON> {
        const res = await harness.mockHTTP.post('/todos').body(body).exec();
        expect(res.response.status).toBe(201);
        return res.json() as TodoJSON;
    }

    describe('create / read', () => {
        test('POST /todos answers 201 with the created todo and a Location header', async () => {
            const res = await harness.mockHTTP.post('/todos').body({ title: 'walk the dog' }).exec();

            expect(res.response.status).toBe(201);
            const todo = res.json() as TodoJSON;
            expect(todo).toEqual({
                id: expect.any(Number),
                title: 'walk the dog',
                order: 1,
                completed: false,
                url: `${ORIGIN}/todos/${todo.id}`,
            });
            expect(res.response.headers['location']).toBe(todo.url);
            expect(String(res.response.headers['content-type'])).toContain('application/json');
        });

        test('GET /todos lists the created todos in insertion order', async () => {
            await create({ title: 'first' });
            await create({ title: 'second' });

            const res = await harness.mockHTTP.get('/todos').exec();

            expect(res.response.status).toBe(200);
            const todos = res.json() as TodoJSON[];
            expect(todos.map((todo) => todo.title)).toEqual(['first', 'second']);
            // Server-assigned order appends: 1, 2 — never re-sorting the list.
            expect(todos.map((todo) => todo.order)).toEqual([1, 2]);
        });

        test('GET /todos/:id returns the todo its url names', async () => {
            const created = await create({ title: 'read me' });

            const res = await harness.mockHTTP.get(`/todos/${created.id}`).exec();

            expect(res.response.status).toBe(200);
            expect(res.json()).toEqual(created);
        });

        test('GET /todos/:id answers 404 for an unknown id', async () => {
            const res = await harness.mockHTTP.get('/todos/987654').exec();

            expect(res.response.status).toBe(404);
            expect(String(res.response.headers['content-type'])).toContain('application/problem+json');
            expect(res.json()).toMatchObject({ status: 404, title: 'Not Found' });
        });

        test('a client-supplied url and id round-trip through create and read', async () => {
            const created = await create({ title: 'client owned', id: 4242, url: 'http://example.test/todos/4242' });

            expect(created.id).toBe(4242);
            expect(created.url).toBe('http://example.test/todos/4242');

            const read = await harness.mockHTTP.get('/todos/4242').exec();
            expect(read.response.status).toBe(200);
            expect(read.json()).toEqual(created);

            const list = await harness.mockHTTP.get('/todos').exec();
            expect(list.json()).toEqual([created]);
        });

        test('a todo created without an order gets the next append position', async () => {
            await create({ title: 'a', order: 523 });
            const appended = await create({ title: 'b' });

            expect(appended.order).toBe(524);
        });
    });

    describe('update', () => {
        test('PATCH applies only the fields the request carries', async () => {
            const created = await create({ title: 'initial title', order: 10 });

            const res = await harness.mockHTTP.patch(`/todos/${created.id}`).body({ title: 'bathe the cat' }).exec();

            expect(res.response.status).toBe(200);
            expect(res.json()).toMatchObject({
                id: created.id,
                title: 'bathe the cat',
                order: 10,
                completed: false,
            });
        });

        test('PATCH remembers an order change when the todo is re-fetched', async () => {
            const created = await create({ title: 'ordered', order: 10 });

            const patched = await harness.mockHTTP.patch(`/todos/${created.id}`).body({ order: 95 }).exec();
            expect(patched.json()).toMatchObject({ order: 95 });

            const refetched = await harness.mockHTTP.get(`/todos/${created.id}`).exec();
            expect(refetched.json()).toMatchObject({ order: 95 });
            const list = await harness.mockHTTP.get('/todos').exec();
            expect(list.json()).toMatchObject([{ order: 95 }]);
        });

        test('PATCH toggles completed without touching the title', async () => {
            const created = await create({ title: 'toggle me' });

            const res = await harness.mockHTTP.patch(`/todos/${created.id}`).body({ completed: true }).exec();

            expect(res.json()).toMatchObject({ title: 'toggle me', completed: true });
        });

        test('PUT updates title, order and completed', async () => {
            const created = await create({ title: 'before' });

            const res = await harness.mockHTTP
                .put(`/todos/${created.id}`)
                .body({ title: 'after', order: 7, completed: true })
                .exec();

            expect(res.response.status).toBe(200);
            expect(res.json()).toEqual({ id: created.id, title: 'after', order: 7, completed: true, url: created.url });
        });

        test('PUT and PATCH answer 404 for an unknown id', async () => {
            const put = await harness.mockHTTP.put('/todos/424242').body({ title: 'ghost' }).exec();
            const patch = await harness.mockHTTP.patch('/todos/424242').body({ title: 'ghost' }).exec();

            expect(put.response.status).toBe(404);
            expect(patch.response.status).toBe(404);
        });
    });

    describe('delete', () => {
        test('DELETE /todos/:id answers 204 and the todo is gone', async () => {
            const created = await create({ title: 'temporary' });

            const res = await harness.mockHTTP.delete(`/todos/${created.id}`).exec();

            expect(res.response.status).toBe(204);
            expect((await harness.mockHTTP.get(`/todos/${created.id}`).exec()).response.status).toBe(404);
            expect((await harness.mockHTTP.get('/todos').exec()).json()).toEqual([]);
        });

        test('DELETE /todos/:id answers 404 for an unknown id', async () => {
            const res = await harness.mockHTTP.delete('/todos/424242').exec();

            expect(res.response.status).toBe(404);
        });

        test('DELETE /todos resets the collection', async () => {
            await create({ title: 'a' });
            await create({ title: 'b' });

            const res = await harness.mockHTTP.delete('/todos').exec();

            expect(res.response.status).toBe(204);
            expect((await harness.mockHTTP.get('/todos').exec()).json()).toEqual([]);
        });
    });

    describe('JSON strictness', () => {
        test('malformed JSON is a 400 problem document', async () => {
            const res = await harness.mockHTTP
                .post('/todos')
                .headers({ 'content-type': 'application/json' })
                .rawBody('{"title": "unterminated')
                .exec();

            expect(res.response.status).toBe(400);
            expect(String(res.response.headers['content-type'])).toContain('application/problem+json');
            expect(res.json()).toMatchObject({ status: 400, type: 'urn:ndigo:malformed-body' });
        });

        test('a missing or empty title is a 422 (schema validation)', async () => {
            const missing = await harness.mockHTTP.post('/todos').body({ completed: true }).exec();
            const empty = await harness.mockHTTP.post('/todos').body({ title: '' }).exec();

            expect(missing.response.status).toBe(422);
            expect(empty.response.status).toBe(422);
            expect(String(missing.response.headers['content-type'])).toContain('application/problem+json');
            expect(missing.json()).toMatchObject({ status: 422 });
        });

        test('a wrong field type is a 422', async () => {
            const res = await harness.mockHTTP.post('/todos').body({ title: 'typed', completed: 'yes' }).exec();

            expect(res.response.status).toBe(422);
        });

        test('a stub update body is a no-op update, not a validation error', async () => {
            const created = await create({ title: 'untouched' });

            const res = await harness.mockHTTP.patch(`/todos/${created.id}`).body({}).exec();

            expect(res.response.status).toBe(200);
            expect(res.json()).toEqual(created);
        });

        test('a non-JSON Content-Type on a write verb is a 415, whatever the body holds', async () => {
            const form = await harness.mockHTTP
                .post('/todos')
                .headers({ 'content-type': 'application/x-www-form-urlencoded' })
                .rawBody('title=form-encoded')
                .exec();
            const text = await harness.mockHTTP
                .post('/todos')
                .headers({ 'content-type': 'text/plain' })
                .rawBody('{"title":"typed"}')
                .exec();
            // No Content-Type at all: a body-bearing write must declare JSON.
            const undeclared = await harness.mockHTTP.post('/todos').rawBody('{"title":"bare"}').exec();

            for (const res of [form, text, undeclared]) {
                expect(res.response.status).toBe(415);
                expect(String(res.response.headers['content-type'])).toContain('application/problem+json');
                expect(res.json()).toMatchObject({ status: 415, title: 'Unsupported Media Type' });
            }
        });

        test('the media-type gate covers updates and leaves bodyless verbs alone', async () => {
            const created = await create({ title: 'gated' });

            const patch = await harness.mockHTTP
                .patch(`/todos/${created.id}`)
                .headers({ 'content-type': 'text/plain' })
                .rawBody('{"completed":true}')
                .exec();
            const removed = await harness.mockHTTP.delete(`/todos/${created.id}`).exec();

            expect(patch.response.status).toBe(415);
            expect(removed.response.status).toBe(204);
        });

        test('a rejected cross-origin write still carries the CORS allowance', async () => {
            const res = await harness.mockHTTP
                .post('/todos')
                .headers({ origin: 'https://www.todobackend.com', 'content-type': 'text/plain' })
                .rawBody('title=x')
                .exec();

            expect(res.response.status).toBe(415);
            expect(res.response.headers['access-control-allow-origin']).toBe('*');
        });
    });

    describe('HEAD, OPTIONS and method semantics', () => {
        test('HEAD /todos answers like the GET without a body', async () => {
            await create({ title: 'head me' });

            const res = await harness.mockHTTP.request({ method: 'HEAD', path: '/todos' });

            expect(res.response.status).toBe(200);
            expect(String(res.response.headers['content-type'])).toContain('application/json');
        });

        test('HEAD /todos/:id falls back to the GET handler (and 404s for unknown ids)', async () => {
            const created = await create({ title: 'head me too' });

            const found = await harness.mockHTTP.request({ method: 'HEAD', path: `/todos/${created.id}` });
            const missing = await harness.mockHTTP.request({ method: 'HEAD', path: '/todos/424242' });

            expect(found.response.status).toBe(200);
            expect(missing.response.status).toBe(404);
        });

        test('OPTIONS /todos advertises the collection methods', async () => {
            const res = await harness.mockHTTP.request({ method: 'OPTIONS', path: '/todos' });

            expect(res.response.status).toBe(204);
            expect(String(res.response.headers['allow'])).toBe('GET, HEAD, POST, DELETE, OPTIONS');
        });

        test('OPTIONS /todos/:id advertises the item methods', async () => {
            const res = await harness.mockHTTP.request({ method: 'OPTIONS', path: '/todos/1' });

            expect(res.response.status).toBe(204);
            expect(String(res.response.headers['allow'])).toBe('GET, HEAD, PUT, PATCH, DELETE, OPTIONS');
        });

        test('an unsupported method on a known path is a 405 with Allow', async () => {
            const res = await harness.mockHTTP.put('/todos').body({ title: 'not here' }).exec();

            expect(res.response.status).toBe(405);
            expect(String(res.response.headers['allow'])).toContain('POST');
        });
    });

    describe('CORS', () => {
        test('a JSON preflight is short-circuited with the allow headers', async () => {
            const res = await harness.mockHTTP.request({
                method: 'OPTIONS',
                path: '/todos',
                headers: {
                    origin: 'https://www.todobackend.com',
                    'access-control-request-method': 'POST',
                    'access-control-request-headers': 'content-type',
                },
            });

            expect(res.response.status).toBe(204);
            expect(res.response.headers['access-control-allow-origin']).toBe('*');
            expect(String(res.response.headers['access-control-allow-methods'])).toContain('POST');
            expect(String(res.response.headers['access-control-allow-headers'])).toContain('Content-Type');
            expect(String(res.response.headers['vary'])).toContain('Origin');
        });

        test('a preflight for PATCH /todos/:id is allowed too', async () => {
            const res = await harness.mockHTTP.request({
                method: 'OPTIONS',
                path: '/todos/1',
                headers: {
                    origin: 'https://www.todobackend.com',
                    'access-control-request-method': 'PATCH',
                    'access-control-request-headers': 'content-type',
                },
            });

            expect(res.response.status).toBe(204);
            expect(String(res.response.headers['access-control-allow-methods'])).toContain('PATCH');
        });

        test('actual requests carry the origin allowance, Location exposure and Vary', async () => {
            const res = await harness.mockHTTP
                .post('/todos')
                .headers({ origin: 'https://www.todobackend.com' })
                .body({ title: 'cross origin' })
                .exec();

            expect(res.response.status).toBe(201);
            expect(res.response.headers['access-control-allow-origin']).toBe('*');
            expect(String(res.response.headers['access-control-expose-headers'])).toContain('Location');
            expect(String(res.response.headers['vary'])).toContain('Origin');
        });

        test('same-origin requests are left untouched', async () => {
            const res = await harness.mockHTTP.get('/todos').exec();

            expect(res.response.status).toBe(200);
            expect(res.response.headers['access-control-allow-origin']).toBeUndefined();
        });
    });
});
