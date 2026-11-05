/**
 * Application composition for the Todo-Backend demo.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { configuration, entry, getEnv } from '@ndigo/context';
import { TodoController } from './todo-controller';
import { TodoStore } from './todo-store';

/**
 * The Todo-Backend composition root: one store instance (the app's whole
 * persistence surface) and one controller.
 *
 * The controller's fallback origin — the origin used for todo urls only when a
 * request carries no `Host` header (in-process MockHTTP dispatches) — is read
 * at refresh time from `TODO_BASE_URL`, defaulting to `http://localhost:$PORT`
 * so it names the same socket the server binds.
 */
@configuration
export class TodoBackendConfiguration {
    /** The in-memory `@ndigo/orm` store, shared by every request. */
    @entry()
    todoStore() {
        return new TodoStore();
    }

    /** The `/todos` controller. */
    @entry()
    todoController() {
        const port = getEnv('PORT') ?? '3030';
        const fallbackOrigin = getEnv('TODO_BASE_URL') ?? `http://localhost:${port}`;
        return new TodoController(this.todoStore(), fallbackOrigin);
    }
}
