/**
 * Shared MockHTTP harness for the Todo-Backend app lanes.
 * @module blue-todobackend
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { ApplicationContext } from '@blue/context';
import { bootApp, MockHTTP } from '@blue/test';
import { applyHttpInterceptors } from '../src/interceptors';
import { TodoBackendConfiguration } from '../src/todobackend-configuration';

/** A booted Todo-Backend app wired exactly like the running server. */
export interface TodoBackendHarness {
    /** The application context (store + controller beans). */
    context: ApplicationContext;
    /** The in-process HTTP client. */
    mockHTTP: MockHTTP;
    /** Close the context and release resources. */
    close(): void;
}

/**
 * Boots the real composition (`bootApp` registers `NodeAutoConfiguration` plus
 * `TodoBackendConfiguration`), applies the pipeline interceptors `src/index.ts`
 * applies at boot (CORS + the JSON-body gate), and wraps the dispatcher in
 * MockHTTP — so the lanes below exercise the same interceptor chain and routes
 * the server serves.
 *
 * @returns The harness (context, client, teardown).
 */
export function bootTodoBackend(): TodoBackendHarness {
    const app = bootApp([TodoBackendConfiguration]);
    applyHttpInterceptors(app.context);
    return { context: app.context, mockHTTP: new MockHTTP(app), close: app.close };
}
