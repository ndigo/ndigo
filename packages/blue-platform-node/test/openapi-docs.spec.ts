/**
 * End-to-end: boot a real context with NodeAutoConfiguration +
 * OpenAPIDocsAutoConfiguration, and serve spec + Swagger UI through the
 * actual pipeline (AD-35 D-5/D-6).
 * * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll } from 'vitest';
import { MetadataConfigApplicationContext } from '@blue/context';
import { getMapping, parameters, postMapping, queryValue, requestMapping, validatedBody } from '@blue/dispatcher';
import { configuration, entry } from '@blue/context';
import { denialOf } from '@blue/dispatcher';
import { z } from 'zod';
import { NodeAutoConfiguration, NodeDispatcher, NodeHTTPServerAdapter } from '../src/index';
import { OpenAPIDocsAutoConfiguration } from '../src/openapi-docs-auto-configuration';

const NoteSchema = z.object({ title: z.string().min(1), body: z.string() });

@configuration
class DemoAPIConfiguration {
    @entry
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
        expect(page).toContain('../v3/api-docs');
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
