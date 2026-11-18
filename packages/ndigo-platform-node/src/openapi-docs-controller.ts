/**
 * Serves the generated OpenAPI specification document.
 *
 * Registered **without** decorator metadata: the docs auto-configuration
 * registers the route at construction with per-instance paths. Dispatch
 * never reads the access condition; it exists so the spec generator
 * excludes these endpoints from the document.
 */
import { toError } from '@ndigo/util';
import '@tsmetadata/polyfill';
import { type ApplicationContext, AsApplicationContextAware } from '@ndigo/context';
import { DISPATCHER, type AbstractDispatcher, parameters, routeValue } from '@ndigo/dispatcher';
import { HTTPHeaders } from '@ndigo/http';
import { Null } from '@ndigo/core';
import { OpenAPISpecGenerator, type OpenAPIDocument, type RouteMappingTable } from '@ndigo/openapi';
import type { Route } from '@ndigo/router';
import { getNodeResponse } from './node-request';
import { ProblemTypes, writeProblem } from './problem-details';
import { type ResolvedOpenAPIDocsOptions } from './openapi-docs-auto-configuration';
import { getLogger } from '@ndigo/log';

const logger = getLogger('ndigo-platform-node:openapi-docs-controller');

/**
 * The spec controller: self-documenting, cache-free, JSON.
 *
 * The document is generated lazily on first request and memoized — the
 * route table is stable after context refresh, so the document cannot go
 * stale within a running application (a `config:refresh`-time invalidation
 * is a recorded follow-up). A failed generation (see {@link OpenAPIDocsController.spec})
 * writes a 500 problem document; only successful documents are memoized.
 */
export class OpenAPIDocsController extends AsApplicationContextAware(Null) {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "OpenAPIDocsController".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object OpenAPIDocsController]"
     */
    get [Symbol.toStringTag](): string {
        return 'OpenAPIDocsController';
    }

    /** The application context injected by the aware mixin. */
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
     * Generation runs zod's `toJSONSchema` over every documented schema, so a
     * dev-supplied non-serializable schema (cyclic `z.lazy`, `z.custom`)
     * fails deterministically per request; the failure is written as an RFC
     * 9457 `urn:ndigo:internal-error` problem document and logged server-side
     * (internals never reach the wire). Only successful documents are
     * memoized — a failed (or fixed) schema is retried on the next request.
     *
     * @param route - The current route (carries the Node response).
     */
    @parameters({ route: routeValue() })
    async spec(route: Route): Promise<void> {
        const res = getNodeResponse(route);
        if (!res || res.headersSent) return;
        if (this.#cached === null) {
            try {
                this.#cached = this.#generate();
            } catch (error) {
                const message = toError(error).stack ?? toError(error).message;
                logger.error('[OpenAPIDocsController] spec generation failed:', message);
                writeProblem(res, {
                    type: ProblemTypes.internalError,
                    title: 'Internal Server Error',
                    status: 500,
                });
                return;
            }
        }
        const body = JSON.stringify(this.#cached);
        res.writeHead(200, {
            [HTTPHeaders.CONTENT_TYPE.name]: 'application/json; charset=utf-8',
            [HTTPHeaders.CACHE_CONTROL.name]: 'no-cache',
        });
        res.end(body);
    }

    #generate(): OpenAPIDocument {
        const dispatcher = this.applicationContext?.getValue<AbstractDispatcher>(DISPATCHER);
        if (dispatcher === undefined || dispatcher === null) {
            throw new Error(
                '[ndigo-openapi] no dispatcher wired — register OpenAPIDocsAutoConfiguration alongside NodeAutoConfiguration'
            );
        }
        // The dispatcher's strategy collection mixes mapping types; only
        // method mappings carry a route table (the docs + platform radix
        // mappings do; name-path mappings resolve context names instead).
        const tables = dispatcher.handlerMappings.filter((mapping) => 'getHandlerMethods' in mapping) as
            | RouteMappingTable[]
            | [];
        const { title, version, description, servers, securitySchemes, security, excludePaths, include } =
            this.#options;
        return new OpenAPISpecGenerator().generate(tables, {
            title,
            version,
            description,
            servers,
            securitySchemes,
            security,
            excludePaths,
            include,
        });
    }
}
