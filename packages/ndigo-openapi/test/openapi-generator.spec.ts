/**
 * OpenAPI 3.0 spec generation from dispatch metadata (AD-35, D-2/D-3/D-4).
 * The fixture controllers exercise translation, exclusions, parameter
 * mapping and the zod schema seam — all through the real mapping
 * registration path.
 */
import { describe, it, expect } from 'vitest';
import { GenericApplicationContext } from '@ndigo/context';
import { RadixMetadataHandlerMapping } from '@ndigo/dispatcher';
import {
    cookieValue,
    fileValue,
    getMapping,
    headerValue,
    parameters,
    pathVariable,
    postMapping,
    privateMapping,
    queryValue,
    requestMapping,
    requestPart,
    routeMapping,
    validatedBody,
} from '@ndigo/dispatcher';
import { z } from 'zod';
import { apiDocs } from '../src/api-docs';
import { OpenAPISpecGenerator, type OpenAPIOperation } from '../src/spec';

const EchoSchema = z.object({
    message: z.string().min(1),
    count: z.coerce.number().int(),
});

const ShapeSchema = z.object({
    label: z.string().nullable(),
    kind: z.literal('circle'),
    point: z.tuple([z.number(), z.number()]),
});

/** Self-recursive DTO: zod converts the cycle to a root-relative `$ref: '#'`. */
interface Category {
    name: string;
    children?: Category[];
}

const CategorySchema: z.ZodType<Category> = z.object({
    name: z.string(),
    children: z.array(z.lazy(() => CategorySchema)).optional(),
});

/** Self-recursive DTO registered with an `id`: zod bundles it as `definitions`. */
interface Folder {
    name: string;
    children?: Folder[];
}

const FolderSchema: z.ZodType<Folder> = z
    .object({
        name: z.string(),
        children: z.array(z.lazy(() => FolderSchema)).optional(),
    })
    .meta({ id: 'Folder' });

/** Register a controller class into a fresh radix mapping, exactly like dispatch. */
function register(controller: object): RadixMetadataHandlerMapping {
    const ctx = new GenericApplicationContext('openapi-fixture');
    ctx.setValue('fixtureController', controller);
    const mapping = new RadixMetadataHandlerMapping();
    mapping.setApplicationContext(ctx);
    mapping.init();
    return mapping;
}

/** Every `$ref` string in a document, for pointer-resolution assertions. */
function collectRefs(node: unknown, found: string[] = []): string[] {
    if (Array.isArray(node)) {
        for (const item of node) collectRefs(item, found);
        return found;
    }
    if (node === null || typeof node !== 'object') return found;
    for (const [key, value] of Object.entries(node)) {
        if (key === '$ref' && typeof value === 'string') found.push(value);
        else collectRefs(value, found);
    }
    return found;
}

/** Resolve a `#/…` JSON pointer inside `document` (test-side resolver, PR-9). */
function resolvePointer(document: unknown, ref: string): unknown {
    const path = ref.startsWith('#/') ? ref.slice(2).split('/') : [];
    return path.reduce<unknown>((node, segment) => {
        if (node === null || typeof node !== 'object') return undefined;
        return (node as Record<string, unknown>)[segment.replaceAll('~1', '/').replaceAll('~0', '~')];
    }, document);
}

@requestMapping('/api')
class APIController {
    @getMapping('/hello')
    @parameters({ name: queryValue('name') })
    hello(name?: string) {
        return { message: `Hello, ${name ?? 'World'}!` };
    }

    @getMapping('/greet/:name')
    @parameters({ name: pathVariable('name') })
    greet(name: string) {
        return { greeting: `Greetings, ${name}!` };
    }

    @postMapping('/echo')
    @parameters({ data: validatedBody(EchoSchema), trace: headerValue('x-trace') })
    echo(data: z.infer<typeof EchoSchema>, trace: string | undefined) {
        return { data, trace };
    }

    @postMapping('/shapes')
    @parameters({ data: validatedBody(ShapeSchema) })
    shapes(data: z.infer<typeof ShapeSchema>) {
        return { data };
    }

    @getMapping('/filtered')
    @parameters({ lang: cookieValue('lang') })
    @apiDocs({ summary: 'Filtered list', tags: ['reports'], deprecated: true, operationId: 'listFiltered' })
    filtered(lang: string | undefined) {
        return { lang };
    }

    @postMapping({ value: '/products/:id', matrixParams: 'color=red, size', private: false })
    @parameters({ id: pathVariable('id') })
    updateProduct(id: string) {
        return { id };
    }

    @getMapping('/raw/:id')
    @parameters({ id: pathVariable('id') })
    raw(id: string) {
        return { id };
    }

    @privateMapping('/internal')
    @parameters({ token: queryValue('token') })
    internal(token: string) {
        return { token };
    }

    @routeMapping('/methodless')
    methodless() {
        return 'ok';
    }

    @postMapping('/hidden')
    @parameters({ data: validatedBody(EchoSchema) })
    @apiDocs({ hidden: true })
    hidden(data: z.infer<typeof EchoSchema>) {
        return { data };
    }

    @getMapping('/docs-response')
    @apiDocs({ responses: { '200': EchoSchema, '404': { description: 'Not found' } } })
    docsResponse() {
        return { ok: true };
    }

    @getMapping('/accepted')
    @apiDocs({ responses: { '202': { description: 'Accepted' } } })
    accepted() {
        return { ok: true };
    }

    @getMapping('/secure')
    @apiDocs({ security: ['bearerAuth'] })
    secure() {
        return { ok: true };
    }

    @getMapping('/open')
    @apiDocs({ security: [] })
    open() {
        return { ok: true };
    }

    @getMapping('/categories')
    @apiDocs({ responses: { '200': CategorySchema } })
    categories() {
        return [];
    }

    @getMapping('/folders')
    @apiDocs({ responses: { '200': FolderSchema } })
    folders() {
        return [];
    }

    @getMapping('/files/:id/download')
    download() {
        return 'ok';
    }

    @getMapping('/files/:id/versions/:version/content')
    @parameters({ id: pathVariable('id') })
    content(id: string) {
        return { id };
    }

    @postMapping('/uploads')
    @parameters({ file: fileValue('file'), meta: requestPart('meta', undefined, { required: true }) })
    upload(file: unknown, meta: unknown) {
        return { file, meta };
    }

    @postMapping('/uploads-mixed')
    @parameters({ data: validatedBody(EchoSchema), file: fileValue('file', { required: true }) })
    uploadMixed(data: z.infer<typeof EchoSchema>, file: unknown) {
        return { data, file };
    }
}

describe('OpenAPISpecGenerator (AD-35)', () => {
    it('builds the document envelope', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping], { title: 'Demo API', version: '1.2.3' });
        expect(doc.openapi).toBe('3.0.3');
        expect(doc.info).toEqual({ title: 'Demo API', version: '1.2.3' });
        expect(doc.paths).toBeTypeOf('object');
    });

    it('translates framework path templates to OpenAPI paths', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping]);
        expect(doc.paths['/api/greet/{name}']).toBeDefined();
        expect(doc.paths['/api/hello'].get).toBeDefined();
        expect(doc.paths['/api/echo'].post).toBeDefined();
    });

    it('maps query/path/header/cookie parameters with location and required', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping]);
        const hello = doc.paths['/api/hello'].get as OpenAPIOperation;
        expect(hello.parameters).toEqual([{ name: 'name', in: 'query', required: false, schema: { type: 'string' } }]);
        const greet = doc.paths['/api/greet/{name}'].get as OpenAPIOperation;
        expect(greet.parameters).toEqual([{ name: 'name', in: 'path', required: true, schema: { type: 'string' } }]);
        const echo = doc.paths['/api/echo'].post as OpenAPIOperation;
        expect(echo.parameters).toEqual([
            { name: 'x-trace', in: 'header', required: false, schema: { type: 'string' } },
        ]);
        const filtered = doc.paths['/api/filtered'].get as OpenAPIOperation;
        expect(filtered.parameters).toEqual([
            { name: 'lang', in: 'cookie', required: false, schema: { type: 'string' } },
        ]);
    });

    it('derives requestBody schemas from the zod seam', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping]);
        const echo = doc.paths['/api/echo'].post as OpenAPIOperation;
        // bodyValue() defaults to optional — the spec mirrors the framework
        // contract (validation runs whenever a body is present).
        expect(echo.requestBody?.required).toBe(false);
        const schema = echo.requestBody?.content['application/json'].schema as {
            $schema?: unknown;
            type?: string;
            required?: string[];
            properties: Record<string, Record<string, unknown>>;
        };
        expect(schema.$schema).toBeUndefined();
        expect(schema.type).toBe('object');
        expect(schema.required).toEqual(['message', 'count']);
        expect(schema.properties.message.minLength).toBe(1);
        expect(schema.properties.count.type).toBe('integer');
    });

    it('emits OpenAPI 3.0 schema keywords for nullable/literal/tuple fields', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping]);
        const operation = doc.paths['/api/shapes'].post;
        const schema = operation?.requestBody?.content['application/json']?.schema as {
            $schema?: unknown;
            properties: Record<string, Record<string, unknown>>;
        };
        expect(schema.$schema).toBeUndefined();
        // Draft 2020-12 (zod's default) would emit type: ['string','null'],
        // const and prefixItems — none valid in OpenAPI 3.0.3.
        expect(schema.properties.label).toEqual({ type: 'string', nullable: true });
        expect(schema.properties.kind).toEqual({ type: 'string', enum: ['circle'] });
        expect(schema.properties.point).toEqual({
            type: 'array',
            items: { anyOf: [{ type: 'number' }, { type: 'number' }] },
            minItems: 2,
            maxItems: 2,
        });
    });

    it('embeds @apiDocs response schemas via the zod seam (AD-38 D-4)', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping]);
        const op = doc.paths['/api/docs-response'].get as OpenAPIOperation;
        const response = op.responses['200'];
        expect(response.description).toBe('OK');
        const schema = response.content?.['application/json']?.schema as {
            $schema?: unknown;
            type?: string;
            required?: string[];
            properties: Record<string, Record<string, unknown>>;
        };
        expect(schema?.type).toBe('object');
        expect(schema?.required).toEqual(['message', 'count']);
        expect(schema?.properties?.message?.minLength).toBe(1);
        // Object-form statuses pass their description through without content.
        expect(op.responses['404']).toEqual({ description: 'Not found' });
        // Handlers without declared responses keep the default.
        const hello = doc.paths['/api/hello'].get as OpenAPIOperation;
        expect(hello.responses['200']).toEqual({ description: 'OK' });
    });

    it('declared @apiDocs responses replace the implicit 200 (DAT-F11)', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping]);
        const accepted = doc.paths['/api/accepted'].get as OpenAPIOperation;
        // Pre-fix the implicit `200 OK` merged with the declared set, so a
        // handler documenting only 202 still advertised a 200 it never returns.
        expect(accepted.responses).toEqual({ '202': { description: 'Accepted' } });
        expect(accepted.responses['200']).toBeUndefined();
    });

    it('emits declared securitySchemes and per-operation security (DAT-F12)', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping], {
            securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } },
        });
        expect(doc.components?.securitySchemes).toEqual({ bearerAuth: { type: 'http', scheme: 'bearer' } });
        // @apiDocs({ security }) becomes the operation's requirement list…
        expect(doc.paths['/api/secure'].get?.security).toEqual([{ bearerAuth: [] }]);
        // …an empty list documents an explicitly anonymous operation…
        expect(doc.paths['/api/open'].get?.security).toEqual([]);
        // …and an operation without it inherits the (absent) document default.
        expect(doc.paths['/api/hello'].get?.security).toBeUndefined();
    });

    it('applies the document-level security default with per-operation override (DAT-F12)', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping], {
            securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } },
            security: ['bearerAuth'],
        });
        expect(doc.security).toEqual([{ bearerAuth: [] }]);
        // No operation-level `security` → inherits the document default.
        expect(doc.paths['/api/hello'].get?.security).toBeUndefined();
        // Per-operation `@apiDocs({ security: [] })` overrides the default.
        expect(doc.paths['/api/open'].get?.security).toEqual([]);
    });

    it('emits components when only security schemes are declared (DAT-F12)', () => {
        @requestMapping('/plain')
        class PlainController {
            @getMapping('/ping')
            ping() {
                return 'pong';
            }
        }
        const doc = new OpenAPISpecGenerator().generate([register(new PlainController())], {
            securitySchemes: { apiKey: { type: 'apiKey', name: 'x-api-key', in: 'header' } },
        });
        expect(doc.components).toEqual({
            schemas: {},
            securitySchemes: { apiKey: { type: 'apiKey', name: 'x-api-key', in: 'header' } },
        });
    });

    it('honors @apiDocs metadata and hidden exclusion', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping]);
        const filtered = doc.paths['/api/filtered'].get as OpenAPIOperation;
        expect(filtered.summary).toBe('Filtered list');
        expect(filtered.tags).toEqual(['reports']);
        expect(filtered.deprecated).toBe(true);
        expect(filtered.operationId).toBe('listFiltered');
        expect(doc.paths['/api/hidden']).toBeUndefined();
    });

    it('excludes private and methodless mappings', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping]);
        expect(doc.paths['/api/internal']).toBeUndefined();
        expect(doc.paths['/api/methodless']).toBeUndefined();
    });

    it('records framework matrix/query conditions as x-ndigo extensions', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping]);
        const update = doc.paths['/api/products/{id}'].post as OpenAPIOperation;
        expect(update['x-ndigo-matrixParams']).toEqual(['color=red', 'size']);
    });

    it('deduplicates operations across overlapping mappings, first mapping wins', () => {
        const doc = new OpenAPISpecGenerator().generate([register(new APIController()), register(new APIController())]);
        expect(Object.keys(doc.paths['/api/hello'])).toEqual(['get']);
        expect(doc.paths['/api/echo'].post?.requestBody?.required).toBe(false);
    });

    it('applies the include filter and excludePaths', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping], {
            excludePaths: ['/api/hello'],
            include: (_mapping, handlerMethod) => handlerMethod.method !== 'updateProduct',
        });
        expect(doc.paths['/api/hello']).toBeUndefined();
        expect(doc.paths['/api/products/{id}']).toBeUndefined();
        expect(doc.paths['/api/echo']).toBeDefined();
    });

    it('hoists recursive response schemas into components.schemas and rewrites $ref pointers (PR-9 regression)', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping]);
        const categorySchema = doc.paths['/api/categories'].get?.responses['200'].content?.['application/json']?.schema;
        expect(categorySchema).toEqual({ $ref: '#/components/schemas/get-api-categories-200' });
        expect(doc.components?.schemas['get-api-categories-200']).toMatchObject({
            type: 'object',
            properties: {
                name: { type: 'string' },
                children: {
                    type: 'array',
                    items: { allOf: [{ $ref: '#/components/schemas/get-api-categories-200' }] },
                },
            },
            required: ['name'],
        });
        // Every pointer must resolve inside the document — previously the
        // cycle embedded `$ref: '#'`, which pointed at the document root.
        const refs = collectRefs(doc);
        expect(refs.length).toBeGreaterThan(0);
        expect(refs).not.toContain('#');
        for (const ref of refs) expect(resolvePointer(doc, ref), ref).toBeDefined();
    });

    it('promotes id-registered schema bundles to their own components (PR-9 regression)', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping]);
        const folderSchema = doc.paths['/api/folders'].get?.responses['200'].content?.['application/json']?.schema;
        expect(folderSchema).toEqual({ $ref: '#/components/schemas/Folder' });
        expect(doc.components?.schemas['Folder']).toMatchObject({
            type: 'object',
            properties: {
                name: { type: 'string' },
                children: { type: 'array', items: { allOf: [{ $ref: '#/components/schemas/Folder' }] } },
            },
            required: ['name'],
        });
    });

    it('synthesizes path parameters for template variables without a declared extractor (PR-11 regression)', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping]);
        // `/files/:id/download` declares no extractor at all — the spec must
        // still declare the template variable as a required path parameter.
        const download = doc.paths['/api/files/{id}/download'].get as OpenAPIOperation;
        expect(download.parameters).toEqual([{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }]);
        // Only the uncovered variable is synthesized; declared ones pass through.
        const content = doc.paths['/api/files/{id}/versions/{version}/content'].get as OpenAPIOperation;
        expect(content.parameters).toEqual([
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'version', in: 'path', required: true, schema: { type: 'string' } },
        ]);
    });

    it('builds multipart/form-data schemas from fileValue and requestPart parts (PR-12 regression)', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping]);
        const upload = doc.paths['/api/uploads'].post as OpenAPIOperation;
        expect(upload.requestBody?.required).toBe(true);
        expect(upload.requestBody?.content['multipart/form-data']?.schema).toEqual({
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                meta: { type: 'string' },
            },
            required: ['meta'],
        });
    });

    it('merges multipart parts into a request body that also carries JSON (PR-12 regression)', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping]);
        const mixed = doc.paths['/api/uploads-mixed'].post as OpenAPIOperation;
        expect(mixed.requestBody?.required).toBe(true);
        expect(mixed.requestBody?.content['application/json']?.schema?.type).toBe('object');
        expect(mixed.requestBody?.content['multipart/form-data']?.schema).toEqual({
            type: 'object',
            properties: { file: { type: 'string', format: 'binary' } },
            required: ['file'],
        });
    });
});
