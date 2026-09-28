/**
 * Serves the generated OpenAPI specification document (AD-35 D-5).
 *
 * Registered **without** decorator metadata: the docs auto-configuration
 * registers the route at construction with per-instance paths. Dispatch
 * never reads the access condition; it exists so the spec generator
 * excludes these endpoints from the document.
 * * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { ServerResponse } from 'node:http';
import '@tsmetadata/polyfill';
import { type ApplicationContext, AsApplicationContextAware } from '@blue/context';
import { DISPATCHER, type AbstractDispatcher, parameters, routeValue } from '@blue/dispatcher';
import { Null } from '@blue/core';
import { OpenAPISpecGenerator, type OpenAPIDocument, type RouteMappingTable } from '@blue/openapi';
import type { Route } from '@blue/router';
import { NODE_RESPONSE_ATTRIBUTE } from './node-request';
import { type ResolvedOpenAPIDocsOptions } from './openapi-docs-auto-configuration';

/**
 * The spec controller: self-documenting, cache-free, JSON.
 *
 * The document is generated lazily on first request and memoized — the
 * route table is stable after context refresh, so the document cannot go
 * stale within a running application (a `config:refresh`-time invalidation
 * is a recorded follow-up).
 */
export class OpenAPIDocsController extends AsApplicationContextAware(Null) {
    readonly applicationContext!: ApplicationContext;

    readonly #options: ResolvedOpenAPIDocsOptions;

    /** Memoized document; `null` until the first request. */
    #cached: OpenAPIDocument | null = null;

    constructor(options: ResolvedOpenAPIDocsOptions) {
        super();
        this.#options = options;
    }

    /**
     * Writes the spec document with `application/json` content type.
     *
     * @param route - The current route (carries the Node response).
     */
    @parameters({ route: routeValue() })
    async spec(route: Route): Promise<void> {
        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as unknown as ServerResponse | undefined;
        if (!res || res.headersSent) return;
        if (this.#cached === null) this.#cached = this.#generate();
        const body = JSON.stringify(this.#cached);
        res.writeHead(200, {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-cache',
        });
        res.end(body);
    }

    #generate(): OpenAPIDocument {
        const dispatcher = this.applicationContext?.getValue<AbstractDispatcher>(DISPATCHER);
        if (dispatcher === undefined || dispatcher === null) {
            throw new Error(
                '[blue-openapi] no dispatcher wired — register OpenAPIDocsAutoConfiguration alongside NodeAutoConfiguration'
            );
        }
        // The dispatcher's strategy collection mixes mapping types; only
        // method mappings carry a route table (the docs + platform radix
        // mappings do; name-path mappings resolve context names instead).
        const tables = dispatcher.handlerMappings.filter((mapping) => 'getHandlerMethods' in mapping) as
            | RouteMappingTable[]
            | [];
        const { title, version, description, servers, excludePaths, include } = this.#options;
        return new OpenAPISpecGenerator().generate(tables, {
            title,
            version,
            description,
            servers,
            excludePaths,
            include,
        });
    }
}
