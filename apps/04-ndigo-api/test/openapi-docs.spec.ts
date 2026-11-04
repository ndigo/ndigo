/**
 * @module ndigo-api
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { bootApp, MockHTTP } from '@ndigo/test';
import { ManagementAutoConfiguration } from '@ndigo/management';
import { NodeAppConfiguration } from '../src/node-app-configuration';
import { SecureDocsConfiguration } from '../src/secure-docs-configuration';
import { initAuth } from '../src/auth-store';

/**
 * End-to-end API docs (AD-35): the real demo app serves the generated spec
 * (derived from the live route tables) and the Swagger UI page + assets —
 * gated behind the demo's Bearer guard (SEC-4): anonymous callers are
 * denied 401, the demo token (login `admin`/`demo` via `/auth/login`, the
 * established fixture) is admitted.
 */

describe('ndigo-api OpenAPI docs (AD-35)', () => {
    let mockHTTP: MockHTTP;
    let close: () => void;
    let token: string;

    beforeAll(async () => {
        initAuth();
        const app = bootApp([ManagementAutoConfiguration, SecureDocsConfiguration, NodeAppConfiguration]);
        mockHTTP = new MockHTTP(app);
        close = app.close;
        // The same demo-login fixture the auth spec uses.
        const login = await mockHTTP
            .post('/auth/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username: 'admin', password: 'demo' })
            .exec();
        expect(login.response.status).toBe(200);
        token = (login.json() as { token: string }).token;
    });

    afterAll(() => {
        close();
    });

    test('anonymous GET /v3/api-docs is denied 401 (SEC-4)', async () => {
        const res = await mockHTTP.get('/v3/api-docs').exec();
        expect(res.response.status).toBe(401);
        expect(res.json()).toMatchObject({ title: 'Unauthorized', status: 401 });
        expect(res.response.headers['www-authenticate']).toBe('Bearer');
    });

    test('anonymous GET /swagger-ui/ is denied 401 (SEC-4)', async () => {
        const res = await mockHTTP.get('/swagger-ui/').exec();
        expect(res.response.status).toBe(401);
    });

    test('GET /v3/api-docs with a demo token serves a parseable spec with the demo operations', async () => {
        const res = await mockHTTP
            .get('/v3/api-docs')
            .headers({ Authorization: `Bearer ${token}` })
            .exec();
        expect(res.response.status).toBe(200);
        const doc = res.json() as {
            openapi: string;
            paths: Record<
                string,
                {
                    post?: {
                        requestBody?: { content: Record<string, { schema: { properties?: Record<string, unknown> } }> };
                    };
                    get?: {
                        responses?: Record<
                            string,
                            { content?: Record<string, { schema?: { properties?: Record<string, unknown> } }> }
                        >;
                    };
                }
            >;
        };
        expect(doc.openapi).toBe('3.0.3');
        // The validated note contract is documented from its zod schema
        // (`validatedBody(insertSchemaForEntity(Note))`).
        const create = doc.paths['/notes']?.post;
        expect(create).toBeDefined();
        const schema = create?.requestBody?.content['application/json'].schema as
            | { type?: string; properties?: Record<string, unknown>; required?: unknown[] }
            | undefined;
        expect(schema?.type).toBe('object');
        expect(schema?.properties).toHaveProperty('title');
        expect(schema?.required).toContain('title');
        // The GET response is documented from the same DTO schema the mapper
        // projects with (AD-38 D-4) — handler output and spec cannot drift.
        const list = doc.paths['/notes']?.get;
        expect(list).toBeDefined();
        const responseSchema = list?.responses?.['200']?.content?.['application/json']?.schema;
        expect(responseSchema?.properties).toHaveProperty('summary');
        expect(responseSchema?.properties).toHaveProperty('title');
        // Framework-internal routes never leak into the spec.
        expect(doc.paths['/error']).toBeUndefined();
        expect(doc.paths['/v3/api-docs']).toBeUndefined();
        expect(doc.paths['/swagger-ui/']).toBeUndefined();
    });

    test('GET /swagger-ui/ with a demo token renders the UI page wired to the spec', async () => {
        const res = await mockHTTP
            .get('/swagger-ui/')
            .headers({ Authorization: `Bearer ${token}` })
            .exec();
        expect(res.response.status).toBe(200);
        const page = res.text();
        // SEC-2: the spec-wiring bootstrap is a same-origin asset (CSP
        // `script-src 'self'` admits no inline script), not inline HTML.
        expect(page).toContain('swagger-ui-bundle.js');
        expect(page).toContain('swagger-ui-init.js');
    });

    test('GET /swagger-ui/swagger-ui-bundle.js with a demo token serves the UI bundle', async () => {
        const res = await mockHTTP
            .get('/swagger-ui/swagger-ui-bundle.js')
            .headers({ Authorization: `Bearer ${token}` })
            .exec();
        expect(res.response.status).toBe(200);
        expect(res.text().length).toBeGreaterThan(100_000);
    });
});
