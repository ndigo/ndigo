/**
 * The five Todo-Backend operations, plus the OPTIONS/collection-reset extras.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import {
    deleteMapping,
    getMapping,
    parameters,
    patchMapping,
    pathVariable,
    postMapping,
    putMapping,
    requestMapping,
    routeValue,
    validatedBody,
} from '@ndigo/dispatcher';
import { HTTPHeaders, ResponseStatuses } from '@ndigo/http';
import { getNodeRequest, ResponseEntity } from '@ndigo/platform-node';
import type { Route } from '@ndigo/router';
import { createTodoSchema, toWireTodo, updateTodoSchema } from './todo.dto';
import type { CreateTodoInput, TodoJSON, UpdateTodoInput } from './todo.dto';
import type { TodoStore } from './todo-store';

/** Methods the collection answers — also the collection's OPTIONS `Allow` value. */
const COLLECTION_ALLOW = 'GET, HEAD, POST, DELETE, OPTIONS';

/** Methods a single todo answers — also the item's OPTIONS `Allow` value. */
const ITEM_ALLOW = 'GET, HEAD, PUT, PATCH, DELETE, OPTIONS';

/**
 * The request's absolute origin — `X-Forwarded-Proto` (when a proxy set it)
 * plus `Host` — or the configured fallback for in-process dispatches (MockHTTP)
 * that carry no `Host` header. Building urls per request is what lets the
 * public spec runner, which loads the page from `todobackend.com`, receive
 * todo urls it can actually fetch.
 *
 * @param route - The dispatched route (carries the node request).
 * @param fallback - Origin to use when the request has no usable `Host`.
 * @returns An origin like `http://localhost:3030`, never with a trailing slash.
 */
function requestOrigin(route: Route, fallback: string): string {
    const headers = getNodeRequest(route)?.headers;
    const host = headers?.['host'];
    if (typeof host !== 'string' || host === '') {
        return fallback;
    }
    const forwardedProto = headers?.['x-forwarded-proto'];
    const protocol =
        typeof forwardedProto === 'string' && forwardedProto !== '' ? forwardedProto.split(',')[0].trim() : 'http';
    return `${protocol}://${host}`;
}

/**
 * Todo-Backend controller.
 *
 * Every route answers under `/todos` and ids are the url's trailing segment.
 * Bodies are JSON in and JSON out: a non-JSON `Content-Type` on a write verb is
 * `415` (the pipeline's `JSONBodyInterceptor`), an unparseable JSON body is the
 * platform's `400` malformed-body problem, and a body that parses but violates
 * the schema is `422`. `HEAD` needs no mapping of its own: the dispatcher falls
 * back from `HEAD` to the `GET` handler and Node suppresses the body while
 * keeping the headers.
 */
@requestMapping('/todos')
export class TodoController {
    readonly #store: TodoStore;
    readonly #fallbackOrigin: string;

    /**
     * @param store - The todo store (persistence seam).
     * @param fallbackOrigin - Absolute origin used when a request carries no `Host`.
     */
    constructor(store: TodoStore, fallbackOrigin: string) {
        this.#store = store;
        this.#fallbackOrigin = fallbackOrigin;
    }

    /** `GET /todos` — the whole list. */
    @getMapping('/')
    @parameters({ route: routeValue() })
    list(route: Route): TodoJSON[] {
        const origin = requestOrigin(route, this.#fallbackOrigin);
        return this.#store.list().map((todo) => toWireTodo(todo, origin));
    }

    /**
     * `POST /todos` — create. Responds `201` with a `Location` header naming
     * the new resource (the spec asserts the url in the body; exposing
     * `Location` costs nothing and is what a 201 should carry).
     */
    @postMapping('/')
    @parameters({
        todo: validatedBody(createTodoSchema),
        route: routeValue(),
    })
    create(todo: CreateTodoInput, route: Route) {
        const created = toWireTodo(this.#store.create(todo), requestOrigin(route, this.#fallbackOrigin));
        return new ResponseEntity(created, ResponseStatuses.CREATED, { [HTTPHeaders.LOCATION.name]: created.url });
    }

    /** `GET /todos/:id` — one todo, or `404`. */
    @getMapping('/:id')
    @parameters({ id: pathVariable('id'), route: routeValue() })
    get(id: string, route: Route) {
        const todo = this.#store.find(id);
        return todo === undefined
            ? ResponseEntity.notFound()
            : toWireTodo(todo, requestOrigin(route, this.#fallbackOrigin));
    }

    /** `PUT /todos/:id` — update (merge semantics; see `updateTodoSchema`). */
    @putMapping('/:id')
    @parameters({
        id: pathVariable('id'),
        patch: validatedBody(updateTodoSchema),
        route: routeValue(),
    })
    replace(id: string, patch: UpdateTodoInput, route: Route) {
        return this.#applyUpdate(id, patch, route);
    }

    /** `PATCH /todos/:id` — partial update. */
    @patchMapping('/:id')
    @parameters({
        id: pathVariable('id'),
        patch: validatedBody(updateTodoSchema),
        route: routeValue(),
    })
    modify(id: string, patch: UpdateTodoInput, route: Route) {
        return this.#applyUpdate(id, patch, route);
    }

    /** `DELETE /todos/:id` — remove one todo (`204`), or `404`. */
    @deleteMapping('/:id')
    @parameters({ id: pathVariable('id') })
    remove(id: string) {
        return this.#store.remove(id) ? ResponseEntity.noContent() : ResponseEntity.notFound();
    }

    /** `DELETE /todos` — the spec's collection reset. */
    @deleteMapping('/')
    reset() {
        this.#store.removeAll();
        return ResponseEntity.noContent();
    }

    /** `OPTIONS /todos` — advertise the collection's methods (no CORS preflight). */
    @requestMapping({ value: '/', method: 'OPTIONS', private: false })
    optionsCollection() {
        return new ResponseEntity(undefined, ResponseStatuses.NO_CONTENT, {
            [HTTPHeaders.ALLOW.name]: COLLECTION_ALLOW,
        });
    }

    /** `OPTIONS /todos/:id` — advertise a todo's methods (no CORS preflight). */
    @requestMapping({ value: '/:id', method: 'OPTIONS', private: false })
    optionsItem() {
        return new ResponseEntity(undefined, ResponseStatuses.NO_CONTENT, { [HTTPHeaders.ALLOW.name]: ITEM_ALLOW });
    }

    /** Shared body of the two update verbs. */
    #applyUpdate(id: string, patch: UpdateTodoInput, route: Route) {
        const todo = this.#store.update(id, patch);
        return todo === undefined
            ? ResponseEntity.notFound()
            : toWireTodo(todo, requestOrigin(route, this.#fallbackOrigin));
    }
}
