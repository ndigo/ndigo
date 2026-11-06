/**
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { describe, expect, test } from 'vitest';

/**
 * Regression guard for HI-1: `vite dev` must lower TC39 decorators exactly as
 * `vite build` does. Vite 8's oxc transform passes `@decorator` syntax through
 * unchanged, so the dev server used to serve `@routeMapping('/') class …`
 * verbatim and the browser raised a `SyntaxError`. This boots Vite
 * programmatically in middleware mode (no listening socket) with the app's real
 * `vite.config.ts`, requests the controller module and asserts no decorator
 * token survives.
 */
const appRoot = fileURLToPath(new URL('..', import.meta.url));

describe('ndigo-todo-web dev transform', () => {
    test('serves lowered decorators for /src/index-controller.ts', async () => {
        const server = await createServer({
            root: appRoot,
            configFile: resolve(appRoot, 'vite.config.ts'),
            server: { middlewareMode: true },
            appType: 'custom',
        });
        try {
            const result = await server.transformRequest('/src/index-controller.ts');
            expect(result).not.toBeNull();
            const code = result?.code ?? '';
            expect(code).not.toContain('@routeMapping(');
            expect(code).not.toContain('@signal');
            expect(code).not.toContain('@reactive');
        } finally {
            await server.close();
        }
    });
});
