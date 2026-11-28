/**
 * OpenAPI 3.0.3 spec generation from dispatch metadata.
 *
 * The generator walks `RouteHandlerMapping.getHandlerMethods()` — the exact
 * table dispatch uses — so the document cannot drift from behavior. Nothing
 * is parsed: patterns, method conditions, resolved `MethodParameter`s and
 * the zod schemas `validatedBy` carries are all runtime metadata the
 * framework already holds.
 */

import type { HTTPMethod } from '@ndigo/http';
import {
    type RouteHandlerMethod,
    type RouteMappingInfo,
    MethodParameterType,
    type MethodParameter,
} from '@ndigo/dispatcher';
import { getApiDocs, type APIDocsMetadata } from './api-docs';
import type {
    OpenAPIDocument,
    OpenAPIGeneratorOptions,
    OpenAPIOperation,
    OpenAPIParameter,
    OpenAPIPathItem,
    OpenAPIResponse,
    OpenAPISchemaObject,
    RouteMappingTable,
} from './spec-types.js';
import { SchemaComponents } from './_schema-components.js';
import { responseDocsOf, translatePath, typeSchemaOf } from './_spec-helpers.js';

/**
 * Builds OpenAPI documents from the framework's route tables.
 *
 * Thread-safe and pure: `generate` reads dispatch metadata and returns a
 * fresh document; nothing is cached on the instance.
 *
 * @example
 * ```ts
 * const instance = new OpenAPISpecGenerator();
 * ```
 */
export class OpenAPISpecGenerator {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "OpenAPISpecGenerator".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object OpenAPISpecGenerator]"
     */
    get [Symbol.toStringTag](): string {
        return 'OpenAPISpecGenerator';
    }

    /**
     * Generate the API document for the given handler mappings.
     *
     * @param mappings - The registered mappings, in dispatch order (first
     *   mapping wins, mirroring the strategy's precedence).
     * @param options - Document options + filters.
     * @returns The OpenAPI 3.0.3 document.
     *
     * @example
     * ```ts
     * const generator = new OpenAPISpecGenerator();
     * const document = generator.generate(mappings, { title: 'My API' });
     * ```
     */
    generate(mappings: readonly RouteMappingTable[], options: OpenAPIGeneratorOptions = {}): OpenAPIDocument {
        const paths: Record<string, OpenAPIPathItem> = {};
        const seen = new Set<string>();
        const components = new SchemaComponents();

        for (const mapping of mappings) {
            for (const [info, handlerMethod] of mapping.getHandlerMethods()) {
                const httpMethod = info.methodCondition.method;
                if (httpMethod === undefined) continue; // methodless catch-alls
                if (info.accessCondition?.access === 'private') continue;

                const docs = getApiDocs(handlerMethod.handler, handlerMethod.method);
                if (docs?.hidden) continue;
                if (options.include !== undefined && !options.include(mapping, handlerMethod)) continue;

                for (const pattern of info.patternsCondition.patterns) {
                    const path = translatePath(pattern);
                    if (path === null) continue;
                    if (options.excludePaths?.includes(path)) continue;
                    const key = `${httpMethod} ${path}`;
                    if (seen.has(key)) continue; // dedup: dispatch precedence wins
                    seen.add(key);
                    paths[path] ??= {};
                    paths[path][httpMethod.toLowerCase()] = this.#buildOperation(
                        info,
                        handlerMethod,
                        httpMethod,
                        path,
                        docs,
                        components
                    );
                }
            }
        }

        const document: OpenAPIDocument = {
            openapi: '3.0.3',
            info: {
                title: options.title ?? 'API',
                version: options.version ?? '0.0.0',
            },
            paths,
        };
        if (options.description !== undefined) document.info.description = options.description;
        if (options.servers !== undefined && options.servers.length > 0) {
            document.servers = options.servers.map((url) => ({ url }));
        }
        if (options.security !== undefined && options.security.length > 0) {
            document.security = options.security.map((name) => ({ [name]: [] }));
        }
        const securitySchemes = options.securitySchemes;
        const hasSecuritySchemes = securitySchemes !== undefined && Object.keys(securitySchemes).length > 0;
        if (components.size > 0 || hasSecuritySchemes) {
            document.components = { schemas: components.schemas };
            if (hasSecuritySchemes) document.components.securitySchemes = securitySchemes;
        }
        return document;
    }

    #buildOperation(
        info: RouteMappingInfo,
        handlerMethod: RouteHandlerMethod,
        method: HTTPMethod,
        path: string,
        docs: APIDocsMetadata | undefined,
        components: SchemaComponents
    ): OpenAPIOperation {
        const operation: OpenAPIOperation = { responses: {} };
        if (docs !== undefined) {
            if (docs.operationId !== undefined) operation.operationId = docs.operationId;
            if (docs.summary !== undefined) operation.summary = docs.summary;
            if (docs.description !== undefined) operation.description = docs.description;
            if (docs.tags !== undefined && docs.tags.length > 0) operation.tags = docs.tags;
            if (docs.deprecated !== undefined) operation.deprecated = docs.deprecated;
            if (docs.security !== undefined) {
                operation.security = docs.security.map((name) => ({ [name]: [] }));
            }
        }
        if (operation.operationId === undefined) operation.operationId = `${method.toLowerCase()}-${path}`;
        const operationId = operation.operationId;
        if (docs?.responses !== undefined && Object.keys(docs.responses).length > 0) {
            // Declared responses REPLACE the implicit `200 OK` — the handler's
            // own set is authoritative.
            for (const [status, entry] of Object.entries(docs.responses)) {
                const { description, schema } = responseDocsOf(entry);
                const response: OpenAPIResponse = { description };
                if (schema !== undefined) {
                    response.content = {
                        'application/json': { schema: components.embed(schema, `${operationId}-${status}`) },
                    };
                }
                operation.responses[status] = response;
            }
        } else {
            operation.responses['200'] = { description: 'OK' };
        }

        // Framework conditions the OpenAPI model cannot express are carried
        // as x-ndigo extensions instead of silently dropped.
        const matrixParams = [...info.matrixCondition.expressions].map((expression) => expression.toString());
        if (matrixParams.length > 0) operation['x-ndigo-matrixParams'] = matrixParams;
        const queryParams = [...info.queryCondition.expressions].map((expression) => expression.toString());
        if (queryParams.length > 0) operation['x-ndigo-queryParams'] = queryParams;

        const parameters: OpenAPIParameter[] = [];
        for (const parameter of handlerMethod.parameters) {
            const location = this.#locationOf(parameter);
            if (location !== null) {
                parameters.push(this.#parameterOf(parameter, location, components, operationId));
                continue;
            }
            if (MethodParameterType.BODY.equals(parameter.type)) {
                operation.requestBody = {
                    required: parameter.required,
                    content: {
                        'application/json': {
                            schema: this.#schemaOf(parameter, components, `${operationId}-body`),
                        },
                    },
                };
                continue;
            }
            if (
                MethodParameterType.MULTIPART_FILE.equals(parameter.type) ||
                MethodParameterType.REQUEST_PART.equals(parameter.type)
            ) {
                this.#addMultipartPart(operation, parameter, components, operationId);
            }
        }

        // OpenAPI 3.0 requires every path template variable to be declared as
        // a `path` parameter; a route need not extract every variable the
        // router matches on (`/files/:id/download` with no `pathVariable`).
        const pathNames = new Set(
            parameters.filter((parameter) => parameter.in === 'path').map((parameter) => parameter.name)
        );
        for (const match of path.matchAll(/\{([^{}]+)\}/g)) {
            if (pathNames.has(match[1])) continue;
            pathNames.add(match[1]);
            parameters.push({ name: match[1], in: 'path', required: true, schema: { type: 'string' } });
        }

        if (parameters.length > 0) operation.parameters = parameters;
        return operation;
    }

    #locationOf(parameter: MethodParameter): OpenAPIParameter['in'] | null {
        if (MethodParameterType.QUERY.equals(parameter.type)) return 'query';
        if (MethodParameterType.PATH.equals(parameter.type)) return 'path';
        if (MethodParameterType.HEADER.equals(parameter.type)) return 'header';
        if (MethodParameterType.COOKIE.equals(parameter.type)) return 'cookie';
        // Whole-source binding into query/cookie — represented at the bound
        // parameter's location with the zod schema when available.
        if (MethodParameterType.data('query').equals(parameter.type)) return 'query';
        if (MethodParameterType.data('cookie').equals(parameter.type)) return 'cookie';
        return null;
    }

    #parameterOf(
        parameter: MethodParameter,
        location: OpenAPIParameter['in'],
        components: SchemaComponents,
        operationId: string
    ): OpenAPIParameter {
        const name = parameter.name === '' ? parameter.parameterName : parameter.name;
        return {
            name,
            in: location,
            required: location === 'path' ? true : parameter.required,
            schema: this.#schemaOf(parameter, components, `${operationId}-${location}-${name}`),
        };
    }

    #schemaOf(parameter: MethodParameter, components: SchemaComponents, hint: string): OpenAPISchemaObject {
        if (parameter.schema !== undefined) return components.embed(parameter.schema, hint);
        const schema = typeSchemaOf(parameter);
        if (parameter.defaultValue !== null && schema.default === undefined) {
            schema.default = parameter.defaultValue;
        }
        return schema;
    }

    #addMultipartPart(
        operation: OpenAPIOperation,
        parameter: MethodParameter,
        components: SchemaComponents,
        operationId: string
    ): void {
        const body = (operation.requestBody ??= { required: parameter.required, content: {} });
        body.required ||= parameter.required;
        const media = (body.content['multipart/form-data'] ??= { schema: { type: 'object', properties: {} } });
        const schema = media.schema as OpenAPISchemaObject;
        const properties = ((schema.properties as Record<string, OpenAPISchemaObject>) ??= {});
        properties[parameter.name] = MethodParameterType.MULTIPART_FILE.equals(parameter.type)
            ? { type: 'string', format: 'binary' }
            : this.#schemaOf(parameter, components, `${operationId}-part-${parameter.name}`);
        if (parameter.required) {
            const required = ((schema.required as string[] | undefined) ??= []);
            required.push(parameter.name);
        }
    }
}

export * from './spec-types.js';
