/**
 * OpenAPI docs auto-configuration for Node applications (AD-35 D-5/D-6).
 *
 * Registers:
 * - `GET {path}` — the OpenAPI 3.0.3 spec document, derived at runtime from
 *   the dispatcher's route tables (never from source comments).
 * - `GET {uiPath}` — Swagger UI (assets served from `swagger-ui-dist`, no
 *   CDN), wired to the spec URL.
 *
 * Register alongside `NodeAutoConfiguration`:
 *
 * ```ts
 * const app = new ApplicationBuilder([
 *     NodeAutoConfiguration,
 *     ManagementAutoConfiguration,
 *     OpenAPIDocsAutoConfiguration,
 *     AppConfiguration,
 * ]);
 * ```
 *
 * The endpoints are **open by default** (the `ManagementAutoConfiguration`
 * posture); on an untrusted network pass a guard
 * (`OpenAPIDocsAutoConfiguration({ accessGuard })`) scoped to the docs
 * paths, and/or firewall the routes at the network boundary.
 * * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { configuration, entry } from '@blue/context';
import {
    AccessControlCondition,
    HTTPMethodCondition,
    MatrixParamCondition,
    QueryParamCondition,
    PatternsRouteCondition,
    RadixMetadataHandlerMapping,
    RouteMappingInfo,
    type RouteHandlerInterceptor,
} from '@blue/dispatcher';
import { type OpenAPIGeneratorOptions } from '@blue/openapi';
import { OpenAPIDocsController } from './openapi-docs-controller';
import { SwaggerUIController } from './swagger-ui-controller';
import { SecurityHeadersInterceptor } from './security-headers-interceptor';

/**
 * Options for {@link OpenAPIDocsAutoConfiguration}.
 */
export interface OpenAPIDocsAutoConfigurationOptions extends OpenAPIGeneratorOptions {
    /** Kill switch for serving (generation stays usable via the library). */
    enabled?: boolean;
    /** Spec document URL; defaults to `/v3/api-docs`. */
    path?: string;
    /** Swagger UI URL; defaults to `/swagger-ui/`. */
    uiPath?: string;
    /**
     * Interceptor applying only to the docs endpoints (spec, UI page and
     * assets) — the `ManagementAutoConfiguration` guard pattern.
     *
     * The docs controllers carry no `@authenticated`/`@authorized` metadata,
     * so a metadata-driven guard (e.g. the auth-server's `AuthRouteGuard`,
     * which derives every requirement from handler metadata) would always
     * permit these endpoints. Use an **unconditional** guard that checks the
     * request itself — a token-presence or token-adapter guard.
     */
    accessGuard?: RouteHandlerInterceptor;
}

/**
 * Resolved docs options (defaults applied). `uiPath` is normalized to a
 * trailing-slash form so `{uiPath}{*file}` concatenation is clean.
 */
export interface ResolvedOpenAPIDocsOptions extends OpenAPIGeneratorOptions {
    enabled: boolean;
    path: string;
    uiPath: string;
    accessGuard: RouteHandlerInterceptor | undefined;
}

/**
 * Builds resolved options from caller options, applying defaults and the
 * UI-path normalization.
 *
 * @param options - The caller options.
 * @returns The resolved options.
 */
export function resolveOpenAPIDocsOptions(options: OpenAPIDocsAutoConfigurationOptions): ResolvedOpenAPIDocsOptions {
    const uiRaw = options.uiPath ?? '/swagger-ui/';
    return {
        enabled: options.enabled ?? true,
        path: options.path ?? '/v3/api-docs',
        uiPath: uiRaw.endsWith('/') ? uiRaw : `${uiRaw}/`,
        accessGuard: options.accessGuard,
        title: options.title,
        version: options.version,
        description: options.description,
        servers: options.servers,
        excludePaths: options.excludePaths,
        include: options.include,
    };
}

/**
 * Scopes a guard to the docs endpoints so it never denies (or rewrites)
 * non-docs routes — this mapping shares the platform's dispatch chain via
 * handler detection, and the guard must not leak outside the docs paths.
 */
function scopedToDocsPaths(
    guard: RouteHandlerInterceptor,
    options: ResolvedOpenAPIDocsOptions
): RouteHandlerInterceptor {
    const prefixes = [options.path, options.uiPath].map((candidate) =>
        candidate.endsWith('/') ? candidate : `${candidate}/`
    );
    const isDocsPath = (route: Route) =>
        prefixes.some((prefix) => route.path === prefix.slice(0, -1) || route.path.startsWith(prefix));
    return {
        async preHandle(route, handler) {
            if (!isDocsPath(route)) return true;
            return guard.preHandle(route, handler);
        },
        async postHandle(route, handler, modelAndView) {
            if (!isDocsPath(route)) return;
            await guard.postHandle?.(route, handler, modelAndView);
        },
        async completeHandle(route, handler, error) {
            if (!isDocsPath(route)) return;
            await guard.completeHandle?.(route, handler, error);
        },
    };
}

import type { Route } from '@blue/router';

/**
 * Auto-configuration serving the generated OpenAPI spec + Swagger UI.
 *
 * The docs endpoints are registered **at construction** (per-instance
 * paths — decorators cannot carry instance options), carrying a private
 * access condition so the spec never self-references (dispatch never reads
 * the access condition).
 */
@configuration
export class OpenAPIDocsAutoConfiguration {
    readonly #options: ResolvedOpenAPIDocsOptions;
    readonly #docs: OpenAPIDocsController;
    readonly #ui: SwaggerUIController;

    constructor(options: OpenAPIDocsAutoConfigurationOptions = {}) {
        this.#options = resolveOpenAPIDocsOptions(options);
        // Single instances: the entry beans (context-aware injection) and
        // the mapping registration must address the same controllers.
        this.#docs = new OpenAPIDocsController(this.#options);
        this.#ui = new SwaggerUIController(this.#options);
    }

    /**
     * The spec controller bean (context-aware: reads the dispatcher at
     * request time; generation is lazy + memoized).
     *
     * @returns The docs controller.
     */
    @entry
    docsController(): OpenAPIDocsController {
        return this.#docs;
    }

    /**
     * The Swagger UI controller bean (page + assets).
     *
     * @returns The UI controller.
     */
    @entry
    swaggerUiController(): SwaggerUIController {
        return this.#ui;
    }

    /**
     * The mapping serving the spec and UI, with the configured guard.
     *
     * Declared as the `handlerMappings` collection entry (the resolution
     * the strategy checks first), immune to registration-order clobbering.
     *
     * @returns The docs mapping.
     */
    @entry
    handlerMappings(): RadixMetadataHandlerMapping[] {
        if (!this.#options.enabled) return [];
        const mapping = new RadixMetadataHandlerMapping();
        // SEC-2: the default-on security-header set for every Node response
        // (same instance shape as the main mapping in NodeAutoConfiguration) —
        // /v3/api-docs, the UI page and its assets otherwise bypass the
        // interceptor attached to the *platform* mapping.
        mapping.interceptors.unshift(new SecurityHeadersInterceptor());
        if (this.#options.accessGuard) {
            mapping.interceptors.push(scopedToDocsPaths(this.#options.accessGuard, this.#options));
        }
        const { path, uiPath } = this.#options;

        // Runtime registration: decorator routes cannot carry instance
        // options, and `private` access excludes these endpoints from the
        // generated spec (dispatch never reads the access condition).
        this.#register(mapping, this.#docs, 'spec', `${path}/`);
        this.#register(mapping, this.#ui, 'page', `${uiPath}`);
        this.#register(mapping, this.#ui, 'asset', `${uiPath}{*file}`);
        return [mapping];
    }

    #register(mapping: RadixMetadataHandlerMapping, handler: object, method: string, pattern: string): void {
        mapping.registerMapping(
            new RouteMappingInfo(
                `blue-openapi:${method}`,
                new PatternsRouteCondition(new Set([pattern])),
                new QueryParamCondition(),
                new MatrixParamCondition(),
                null,
                new AccessControlCondition('private'),
                new HTTPMethodCondition('GET')
            ),
            handler,
            method
        );
    }
}
