/**
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { bootApp, MockHTTP } from '@blue/test';
import { ManagementAutoConfiguration } from '@blue/management';
import { OpenAPIDocsAutoConfiguration } from '@blue/platform-node';
import { NodeAppConfiguration } from '../src/node-app-configuration';
import { initAuth } from '../src/auth-store';

/**
 * End-to-end API docs (AD-35): the real demo app serves the generated spec
 * (derived from the live route tables) and the Swagger UI page + assets.
 */

describe('blue-api OpenAPI docs (AD-35)', () => {
    let mockHTTP: MockHTTP;
    let close: () => void;

    beforeAll(() => {
        initAuth();
        const app = bootApp([ManagementAutoConfiguration, OpenAPIDocsAutoConfiguration, NodeAppConfiguration]);
        mockHTTP = new MockHTTP(app);
        close = app.close;
    });

    afterAll(() => {
        close();
    });

    test('GET /v3/api-docs serves a parseable spec with the demo operations', async () => {
        const res = await mockHTTP.get('/v3/api-docs').exec();
        expect(res.response.status).toBe(200);
        const doc = res.json() as {
            openapi: string;
            paths: Record<
                string,
                {
                    post?: {
                        requestBody?: { content: Record<string, { schema: { properties?: Record<string, unknown> } }> };
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
        // Framework-internal routes never leak into the spec.
        expect(doc.paths['/error']).toBeUndefined();
        expect(doc.paths['/v3/api-docs']).toBeUndefined();
        expect(doc.paths['/swagger-ui/']).toBeUndefined();
    });

    test('GET /swagger-ui/ renders the UI page wired to the spec', async () => {
        const res = await mockHTTP.get('/swagger-ui/').exec();
        expect(res.response.status).toBe(200);
        const page = res.text();
        expect(page).toContain('swagger-ui-bundle.js');
        expect(page).toContain('/v3/api-docs');
    });

    test('GET /swagger-ui/swagger-ui-bundle.js serves the UI bundle', async () => {
        const res = await mockHTTP.get('/swagger-ui/swagger-ui-bundle.js').exec();
        expect(res.response.status).toBe(200);
        expect(res.text().length).toBeGreaterThan(100_000);
    });
});
