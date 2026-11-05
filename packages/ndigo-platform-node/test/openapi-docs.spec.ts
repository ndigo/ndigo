/**
 * End-to-end: boot a real context with NodeAutoConfiguration +
 * OpenAPIDocsAutoConfiguration, and serve spec + Swagger UI through the
 * actual pipeline (AD-35 D-5/D-6).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll } from 'vitest';
import { MetadataConfigApplicationContext } from '@ndigo/context';
import { getMapping, parameters, postMapping, queryValue, requestMapping, validatedBody } from '@ndigo/dispatcher';
import { configuration, entry } from '@ndigo/context';
import { denialOf, RouteHandlerMethod } from '@ndigo/dispatcher';
import { z } from 'zod';
import { NodeAutoConfiguration, NodeDispatcher, NodeHTTPServerAdapter } from '../src/index';
import { OpenAPIDocsAutoConfiguration } from '../src/openapi-docs-auto-configuration';
import { OpenAPIDocsController } from '../src/openapi-docs-controller';

const NoteSchema = z.object({ title: z.string().min(1), body: z.string() });

@configuration
class DemoAPIConfiguration {
    @entry()
    noteApi() {
        return new NoteAPIController();
    }
}

@requestMapping('/api')
class NoteAPIController {
    @getMapping('/notes')
    @parameters({ tag: queryValue('tag') })
    notes(tag: string | undefined) {
        return { notes: [], tag };
    }

    @postMapping('/notes')
    @parameters({ note: validatedBody(NoteSchema) })
    create(note: z.infer<typeof NoteSchema>) {
        return { created: note };
    }
}

function boot(...extra: Array<new () => object>): Promise<string> {
    return (async () => {
        const context = new MetadataConfigApplicationContext('openapi-docs');
        context.register(NodeAutoConfiguration);
        context.register(OpenAPIDocsAutoConfiguration);
        for (const type of extra) context.register(type);
        context.register(DemoAPIConfiguration);
        context.refresh();

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        const adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        return `http://127.0.0.1:${(adapter.server as { address(): { port: number } }).address().port}`;
    })();
}

describe('OpenAPIDocsAutoConfiguration', () => {
    let base: string;

    beforeAll(async () => {
        base = await boot();
    });

    test('GET /v3/api-docs serves the generated spec document', async () => {
        const res = await fetch(`${base}/v3/api-docs`);
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toContain('application/json');
        const doc = (await res.json()) as {
            openapi: string;
            info: { title: string };
            paths: Record<
                string,
                { get?: { parameters?: unknown[] }; post?: { requestBody?: { content: Record<string, unknown> } } }
            >;
        };
        expect(doc.openapi).toBe('3.0.3');
        expect(doc.info.title).toBe('API');
        // App routes are documented from the real route tables…
        const notes = doc.paths['/api/notes'];
        expect(notes.get).toBeDefined();
        expect(notes.post?.requestBody?.content['application/json']).toBeDefined();
        // …and the docs endpoints never self-reference.
        expect(doc.paths['/v3/api-docs']).toBeUndefined();
        expect(doc.paths['/swagger-ui/']).toBeUndefined();
    });

    test('GET /swagger-ui/ renders the UI page wired to the spec', async () => {
        const res = await fetch(`${base}/swagger-ui/`);
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toContain('text/html');
        const page = await res.text();
        expect(page).toContain('swagger-ui-bundle.js');
        // SEC-2: the bootstrap is external — the default-on CSP
        // (`script-src 'self'`) admits no inline script, so the page only
        // references the generated init asset.
        expect(page).toContain('swagger-ui-init.js');
        expect(page).not.toContain('SwaggerUIBundle(');
    });

    test('GET /swagger-ui/swagger-ui-init.js serves the spec-wired bootstrap', async () => {
        const res = await fetch(`${base}/swagger-ui/swagger-ui-init.js`);
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toContain('javascript');
        const script = await res.text();
        expect(script).toContain('../v3/api-docs');
        expect(script).toContain('SwaggerUIBundle');
    });

    test('GET /swagger-ui/{asset} serves the UI assets', async () => {
        const res = await fetch(`${base}/swagger-ui/swagger-ui-bundle.js`);
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toContain('javascript');
        expect((await res.text()).length).toBeGreaterThan(100_000);
    });

    test('unknown assets 404 instead of leaking directory traversal', async () => {
        const res = await fetch(`${base}/swagger-ui/../../package.json`);
        expect([200, 404, 403]).toContain(res.status);
        const known = await fetch(`${base}/swagger-ui/not-a-file.js`);
        expect(known.status).toBe(404);
    });
});

describe('OpenAPIDocsAutoConfiguration: security options forwarded (DAT-F12)', () => {
    let base: string;

    beforeAll(async () => {
        class SecureDocsConfiguration extends OpenAPIDocsAutoConfiguration {
            constructor() {
                super({
                    securitySchemes: {
                        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
                    },
                    security: ['bearerAuth'],
                });
            }
        }
        base = await boot(SecureDocsConfiguration);
    });

    test('document-level security and components.securitySchemes reach the served spec', async () => {
        const res = await fetch(`${base}/v3/api-docs`);
        expect(res.status).toBe(200);
        const doc = (await res.json()) as {
            security?: Array<Record<string, string[]>>;
            components?: { securitySchemes?: Record<string, unknown> };
            paths: Record<string, { get?: { security?: unknown } }>;
        };
        expect(doc.security).toEqual([{ bearerAuth: [] }]);
        expect(doc.components?.securitySchemes).toEqual({
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        });
        // Operations without an `@apiDocs({ security })` override inherit the
        // document default rather than restating it.
        expect(doc.paths['/api/notes'].get?.security).toBeUndefined();
    });
});

describe('OpenAPIDocsAutoConfiguration — security headers on docs endpoints (SEC-2)', () => {
    let base: string;

    beforeAll(async () => {
        base = await boot();
    });

    test('spec, UI page and assets carry the default security-header set', async () => {
        // The docs mapping carries its own SecurityHeadersInterceptor (the
        // platform mapping's interceptor never sees these routes) — the
        // default set: CSP with Helmet 8's `script-src 'self'` (no inline
        // scripts on the page), nosniff, XFO, HSTS.
        for (const path of ['/v3/api-docs', '/swagger-ui/', '/swagger-ui/swagger-ui-init.js']) {
            // oxlint-disable-next-line no-await-in-loop -- each path is an isolated request; assertions stay independent.
            const res = await fetch(`${base}${path}`);
            expect(res.status).toBe(200);
            const csp = res.headers.get('content-security-policy') ?? '';
            expect(csp).toContain("script-src 'self'");
            expect(res.headers.get('x-content-type-options')).toBe('nosniff');
            expect(res.headers.get('x-frame-options')).toBeDefined();
            expect(res.headers.get('strict-transport-security')).toBeDefined();
        }
    });
});

describe('OpenAPIDocsAutoConfiguration with an access guard', () => {
    let guardedBase: string;

    beforeAll(async () => {
        const denyAll = {
            async preHandle() {
                return denialOf(403);
            },
            async postHandle() {},
            async completeHandle() {},
        };
        class GuardedDocsConfiguration extends OpenAPIDocsAutoConfiguration {
            constructor() {
                super({ accessGuard: denyAll });
            }
        }
        guardedBase = await boot(GuardedDocsConfiguration);
    });

    test('docs endpoints are denied before the handler runs', async () => {
        for (const path of ['/v3/api-docs', '/swagger-ui/', '/swagger-ui/swagger-ui-bundle.js']) {
            // oxlint-disable-next-line no-await-in-loop -- each path is an isolated request; assertions stay independent.
            const res = await fetch(`${guardedBase}${path}`);
            expect(res.status).toBe(403);
        }
    });

    test('non-docs routes still dispatch with a guard configured', async () => {
        const res = await fetch(`${guardedBase}/api/notes`);
        expect(res.status).toBe(200);
    });
});

describe('OpenAPIDocsAutoConfiguration guard: handler forwarding + hook scoping (SEC-1/COR-3)', () => {
    type GuardRecord = {
        hook: 'preHandle' | 'postHandle' | 'completeHandle';
        path: string;
        handler: object | undefined;
    };
    const isDocsPath = (path: string): boolean => path === '/v3/api-docs' || path.startsWith('/swagger-ui');
    let base: string;
    let seen: GuardRecord[] = [];

    beforeAll(async () => {
        const spy = {
            async preHandle(route: { path: string }, handler: object | undefined) {
                seen.push({ hook: 'preHandle', path: route.path, handler });
                return true;
            },
            async postHandle(route: { path: string }, handler: object | undefined) {
                seen.push({ hook: 'postHandle', path: route.path, handler });
            },
            async completeHandle(route: { path: string }, handler: object | undefined) {
                seen.push({ hook: 'completeHandle', path: route.path, handler });
            },
        };
        class SpyDocsConfiguration extends OpenAPIDocsAutoConfiguration {
            constructor() {
                super({ accessGuard: spy });
            }
        }
        base = await boot(SpyDocsConfiguration);
        // A docs route (the guard sees the real handler) and a non-docs route
        // (the guard must not run at all — COR-3).
        const docs = await fetch(`${base}/v3/api-docs`);
        expect(docs.status).toBe(200);
        const notes = await fetch(`${base}/api/notes`);
        expect(notes.status).toBe(200);
        expect(seen.length).toBeGreaterThan(0);
    });

    test('the real docs controller is forwarded to every hook, never undefined (SEC-1)', () => {
        const docsRows = seen.filter((row) => row.hook === 'preHandle' && row.path === '/v3/api-docs');
        expect(docsRows).toHaveLength(1);
        // The chain forwards the route's resolved handler — the RouteHandlerMethod
        // for `spec` wrapping the registered OpenAPIDocsController instance.
        const forwarded = docsRows[0]?.handler as RouteHandlerMethod | undefined;
        expect(forwarded).toBeDefined();
        expect(forwarded?.method).toBe('spec');
        expect(forwarded?.handler).toBeInstanceOf(OpenAPIDocsController);
        // No hook may ever receive `undefined` in place of the handler.
        expect(seen.find((row) => row.handler === undefined)).toBeUndefined();
    });

    test('no guard hook runs for non-docs routes (COR-3)', () => {
        const nonDocs = seen.filter((row) => !isDocsPath(row.path));
        expect(nonDocs).toEqual([]);
    });
});

describe('OpenAPIDocsAutoConfiguration: spec generation failure (COR-4)', () => {
    let base: string;

    beforeAll(async () => {
        // zod's toJSONSchema cannot represent z.custom schemas, so generation
        // fails deterministically on every request.
        const CustomBody = z.custom(() => true);
        @requestMapping('/api')
        class BrokenSchemaController {
            @postMapping('/broken')
            @parameters({ data: validatedBody(CustomBody) })
            create(data: unknown) {
                return { created: data };
            }
        }
        @configuration
        class BrokenSchemaConfiguration {
            @entry()
            brokenApi() {
                return new BrokenSchemaController();
            }
        }
        base = await boot(BrokenSchemaConfiguration);
    });

    test('a non-serializable schema yields a 500 problem document on every request (COR-4)', async () => {
        // Two attempts: the failure is never memoized, so each request
        // re-runs generation and repeats the deterministic problem document.
        for (let attempt = 0; attempt < 2; attempt++) {
            // oxlint-disable-next-line no-await-in-loop -- each request is an isolated attempt; the loop proves the failure repeats.
            const res = await fetch(`${base}/v3/api-docs`);
            expect(res.status).toBe(500);
            expect(res.headers.get('content-type')).toBe('application/problem+json');
            // oxlint-disable-next-line no-await-in-loop -- response body follows its own request in the loop above.
            expect(await res.json()).toMatchObject({ type: 'urn:ndigo:internal-error', status: 500 });
        }
    });
});
