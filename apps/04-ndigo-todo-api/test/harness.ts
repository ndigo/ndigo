/**
 * Shared MockHTTP harness for the Todo-Backend app lanes.
 */
import type { ApplicationContext } from '@ndigo/context';
import { bootApp, MockHTTP } from '@ndigo/test';
import { applyHttpInterceptors } from '../src/todo-http-interceptors';
import { TodoConfiguration } from '../src/todo-configuration';

/** A booted todo-api app wired exactly like the running server. */
export interface TodoAPIHarness {
    /** The application context (store + controller beans). */
    context: ApplicationContext;
    /** The in-process HTTP client. */
    mockHTTP: MockHTTP;
    /** Close the context and release resources. */
    close(): void;
}

/**
 * Boots the real composition (`bootApp` registers `NodeAutoConfiguration` plus
 * `TodoConfiguration`), applies the pipeline interceptors `src/index.ts`
 * applies at boot (CORS + the JSON-body gate), and wraps the dispatcher in
 * MockHTTP — so the lanes below exercise the same interceptor chain and routes
 * the server serves.
 *
 * @returns The harness (context, client, teardown).
 */
export function bootTodoApi(): TodoAPIHarness {
    const app = bootApp([TodoConfiguration]);
    applyHttpInterceptors(app.context);
    return { context: app.context, mockHTTP: new MockHTTP(app), close: app.close };
}
