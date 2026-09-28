/**
 * OpenAPI 3.0 spec generation from dispatch metadata (AD-35, D-2/D-3/D-4).
 * The fixture controllers exercise translation, exclusions, parameter
 * mapping and the zod schema seam — all through the real mapping
 * registration path.
 * * @module blue-openapi
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, it, expect } from 'vitest';
import { GenericApplicationContext } from '@blue/context';
import { RadixMetadataHandlerMapping } from '@blue/dispatcher';
import {
    cookieValue,
    getMapping,
    headerValue,
    parameters,
    pathVariable,
    postMapping,
    privateMapping,
    queryValue,
    requestMapping,
    routeMapping,
    validatedBody,
} from '@blue/dispatcher';
import { z } from 'zod';
import { apiDocs } from '../src/api-docs';
import { OpenAPISpecGenerator } from '../src/spec';

const EchoSchema = z.object({
    message: z.string().min(1),
    count: z.coerce.number().int(),
});

/** Register a controller class into a fresh radix mapping, exactly like dispatch. */
function register(controller: object): RadixMetadataHandlerMapping {
    const ctx = new GenericApplicationContext('openapi-fixture');
    ctx.setValue('fixtureController', controller);
    const mapping = new RadixMetadataHandlerMapping();
    mapping.setApplicationContext(ctx);
    mapping.init();
    return mapping;
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
        const hello = doc.paths['/api/hello'].get;
        expect(hello.parameters).toEqual([{ name: 'name', in: 'query', required: false, schema: { type: 'string' } }]);
        const greet = doc.paths['/api/greet/{name}'].get;
        expect(greet.parameters).toEqual([{ name: 'name', in: 'path', required: true, schema: { type: 'string' } }]);
        const echo = doc.paths['/api/echo'].post;
        expect(echo.parameters).toEqual([
            { name: 'x-trace', in: 'header', required: false, schema: { type: 'string' } },
        ]);
        const filtered = doc.paths['/api/filtered'].get;
        expect(filtered.parameters).toEqual([
            { name: 'lang', in: 'cookie', required: false, schema: { type: 'string' } },
        ]);
    });

    it('derives requestBody schemas from the zod seam', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping]);
        const echo = doc.paths['/api/echo'].post;
        // bodyValue() defaults to optional — the spec mirrors the framework
        // contract (validation runs whenever a body is present).
        expect(echo.requestBody.required).toBe(false);
        const schema = echo.requestBody.content['application/json'].schema;
        expect(schema.$schema).toBeUndefined();
        expect(schema.type).toBe('object');
        expect(schema.required).toEqual(['message', 'count']);
        expect(schema.properties.message.minLength).toBe(1);
        expect(schema.properties.count.type).toBe('integer');
    });

    it('honors @apiDocs metadata and hidden exclusion', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping]);
        const filtered = doc.paths['/api/filtered'].get;
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

    it('records framework matrix/query conditions as x-blue extensions', () => {
        const mapping = register(new APIController());
        const doc = new OpenAPISpecGenerator().generate([mapping]);
        const update = doc.paths['/api/products/{id}'].post;
        expect(update['x-blue-matrixParams']).toEqual(['color=red', 'size']);
    });

    it('deduplicates operations across overlapping mappings, first mapping wins', () => {
        const doc = new OpenAPISpecGenerator().generate([register(new APIController()), register(new APIController())]);
        expect(Object.keys(doc.paths['/api/hello'])).toEqual(['get']);
        expect(doc.paths['/api/echo'].post.requestBody.required).toBe(false);
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
});
