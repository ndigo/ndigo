/**
 * Repo-local mirror of the public Todo-Backend spec runner's checklist.
 *
 * The published runner (https://www.todobackend.com/specs/index.html) drives
 * `TodoBackend/todo-backend-js-spec/js/specs.js` from a browser against a
 * user-supplied root url; it cannot run in CI (network + browser). Every
 * `specify` in that file is reproduced here against this app's MockHTTP
 * pipeline, so a regression in any documented behavior fails a local lane
 * instead of surfacing only in the manual runner.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { bootTodoApi } from './harness';
import type { TodoAPIHarness } from './harness';
import type { TodoJSON } from '../src/todo.dto';

describe('Todo-Backend public spec checklist', () => {
    const apiRoot = '/todos';
    let harness: TodoAPIHarness;

    beforeAll(() => {
        harness = bootTodoApi();
    });

    afterAll(() => {
        harness.close();
    });

    /** `postRoot` in the runner: POST a todo to the collection and parse it. */
    async function postRoot(body: Record<string, unknown>): Promise<TodoJSON> {
        const res = await harness.mockHTTP.post(apiRoot).body(body).exec();
        expect(res.response.status).toBe(201);
        return res.json() as TodoJSON;
    }

    /** `getRoot` in the runner: the whole list. */
    async function getRoot(): Promise<TodoJSON[]> {
        const res = await harness.mockHTTP.get(apiRoot).exec();
        expect(res.response.status).toBe(200);
        return res.json() as TodoJSON[];
    }

    /** `createFreshTodoAndGetItsUrl` in the runner. */
    async function createFreshTodoAndGetItsUrl(params: Record<string, unknown> = {}): Promise<string> {
        const todo = await postRoot({ title: 'blah', ...params });
        return todo.url;
    }

    /** MockHTTP paths are relative, so the runner's absolute urls are trimmed. */
    function pathOf(url: string): string {
        const match = /^https?:\/\/[^/]+(.+)$/.exec(url);
        return match === null ? url : match[1];
    }

    describe('the pre-requisites', () => {
        test('the api root responds to a GET (the server is up and accessible)', async () => {
            const res = await harness.mockHTTP.get(apiRoot).exec();
            expect(res.response.status).toBe(200);
        });

        test('the api root responds to a POST with the todo which was posted to it', async () => {
            await expect(postRoot({ title: 'a todo' })).resolves.toMatchObject({ title: 'a todo' });
        });

        test('the api root responds successfully to a DELETE', async () => {
            const res = await harness.mockHTTP.delete(apiRoot).exec();
            expect(res.response.status).toBe(204);
        });

        test('after a DELETE the api root responds to a GET with an empty array', async () => {
            await harness.mockHTTP.delete(apiRoot).exec();
            await expect(getRoot()).resolves.toEqual([]);
        });
    });

    describe('storing new todos by posting to the root url', () => {
        beforeEach(async () => {
            await harness.mockHTTP.delete(apiRoot).exec();
        });

        test('adds a new todo to the list of todos at the root url', async () => {
            await postRoot({ title: 'walk the dog' });
            const todos = await getRoot();
            expect(todos).toHaveLength(1);
            expect(todos[0]).toMatchObject({ title: 'walk the dog' });
        });

        test('sets up a new todo as initially not completed', async () => {
            const posted = await postRoot({ title: 'blah' });
            expect(posted).toMatchObject({ completed: false });
            const todos = await getRoot();
            expect(todos[0]).toMatchObject({ completed: false });
        });

        test('each new todo has a url', async () => {
            const posted = await postRoot({ title: 'blah' });
            expect(typeof posted.url).toBe('string');
            const todos = await getRoot();
            expect(typeof todos[0].url).toBe('string');
        });

        test('each new todo has a url, which returns a todo', async () => {
            const posted = await postRoot({ title: 'my todo' });
            const res = await harness.mockHTTP.get(pathOf(posted.url)).exec();
            expect(res.response.status).toBe(200);
            expect(res.json()).toMatchObject({ title: 'my todo' });
        });
    });

    describe('working with an existing todo', () => {
        beforeEach(async () => {
            await harness.mockHTTP.delete(apiRoot).exec();
        });

        test('can navigate from a list of todos to an individual todo via urls', async () => {
            await postRoot({ title: 'todo the first' });
            await postRoot({ title: 'todo the second' });
            const todos = await getRoot();
            expect(todos).toHaveLength(2);

            const res = await harness.mockHTTP.get(pathOf(todos[0].url)).exec();
            expect(res.response.status).toBe(200);
            expect(res.json()).toHaveProperty('title');
        });

        test("can change the todo's title by PATCHing to the todo's url", async () => {
            const url = await createFreshTodoAndGetItsUrl({ title: 'initial title' });

            const res = await harness.mockHTTP.patch(pathOf(url)).body({ title: 'bathe the cat' }).exec();

            expect(res.response.status).toBe(200);
            expect(res.json()).toMatchObject({ title: 'bathe the cat' });
        });

        test("can change the todo's completedness by PATCHing to the todo's url", async () => {
            const url = await createFreshTodoAndGetItsUrl();

            const res = await harness.mockHTTP.patch(pathOf(url)).body({ completed: true }).exec();

            expect(res.json()).toMatchObject({ completed: true });
        });

        test('changes to a todo are persisted and show up when re-fetching the todo', async () => {
            const url = await createFreshTodoAndGetItsUrl();
            const patched = await harness.mockHTTP
                .patch(pathOf(url))
                .body({ title: 'changed title', completed: true })
                .exec();
            expect(patched.response.status).toBe(200);

            const refetched = await harness.mockHTTP.get(pathOf(url)).exec();
            expect(refetched.json()).toMatchObject({ title: 'changed title', completed: true });

            const todos = await getRoot();
            expect(todos).toHaveLength(1);
            expect(todos[0]).toMatchObject({ title: 'changed title', completed: true });
        });

        test("can delete a todo making a DELETE request to the todo's url", async () => {
            const url = await createFreshTodoAndGetItsUrl();

            const res = await harness.mockHTTP.delete(pathOf(url)).exec();

            expect(res.response.status).toBe(204);
            await expect(getRoot()).resolves.toEqual([]);
        });
    });

    describe('tracking todo order', () => {
        beforeEach(async () => {
            await harness.mockHTTP.delete(apiRoot).exec();
        });

        test('can create a todo with an order field', async () => {
            await expect(postRoot({ title: 'blah', order: 523 })).resolves.toMatchObject({ order: 523 });
        });

        test('can PATCH a todo to change its order', async () => {
            const url = await createFreshTodoAndGetItsUrl({ order: 10 });

            const res = await harness.mockHTTP.patch(pathOf(url)).body({ order: 95 }).exec();

            expect(res.json()).toMatchObject({ order: 95 });
        });

        test("remembers changes to a todo's order", async () => {
            const url = await createFreshTodoAndGetItsUrl({ order: 10 });
            await harness.mockHTTP.patch(pathOf(url)).body({ order: 95 }).exec();

            const refetched = await harness.mockHTTP.get(pathOf(url)).exec();

            expect(refetched.json()).toMatchObject({ order: 95 });
        });
    });
});
