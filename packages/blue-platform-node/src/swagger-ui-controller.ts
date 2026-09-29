/**
 * Serves the Swagger UI page + assets (AD-35 D-6).
 *
 * The page is a framework-rendered template over `swagger-ui-dist`'s
 * bundle; the dist assets are served by {@link StaticResourceHandler}
 * straight from the installed package — ETag/conditional GET, cache headers
 * and Range included (AD-28 machinery), no CDN, offline-friendly. The
 * spec-wiring bootstrap (`swagger-ui-init.js`) is rendered server-side and
 * served by this controller (SEC-2): external, so the default-on CSP
 * (`script-src 'self'`) needs no `'unsafe-inline'`.
 * * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import type { ServerResponse } from 'node:http';
import '@tsmetadata/polyfill';
import { HTTPHeaders } from '@blue/http';
import { parameters, pathVariable, routeValue } from '@blue/dispatcher';
import type { Route } from '@blue/router';
import { NODE_RESPONSE_ATTRIBUTE } from './node-request';
import { StaticResourceHandler } from './static-resource-handler';
import { writeProblem } from './problem-details';
import { type ResolvedOpenAPIDocsOptions } from './openapi-docs-auto-configuration';

/**
 * Asset file names served by the UI — `swagger-ui-dist` files plus the
 * framework-rendered bootstrap (`swagger-ui-init.js`, SEC-2): the init
 * script is generated (not a dist file) and carries the instance spec URL.
 */
const ASSET_NAMES = [
    'swagger-ui.css',
    'swagger-ui-bundle.js',
    'swagger-ui-standalone-preset.js',
    'favicon-32x32.png',
    'swagger-ui-init.js',
];

/**
 * Relative URL from the UI page's directory to the spec endpoint.
 *
 * @param uiPath - The UI mount path (trailing slash).
 * @param path - The spec mount path.
 * @returns A relative URL (e.g. `../v3/api-docs`).
 */
export function relativeSpecUrl(uiPath: string, path: string): string {
    const from = uiPath.replace(/\/+$/, '').split('/').filter(Boolean);
    const to = path.split('/').filter(Boolean);
    let shared = 0;
    while (shared < from.length && shared < to.length && from[shared] === to[shared]) shared++;
    const ups = from.length - shared;
    const rest = to.slice(shared);
    const parts = [...Array.from({ length: ups }, () => '..'), ...rest];
    return parts.length > 0 ? parts.join('/') : '.';
}

/**
 * Renders the Swagger UI page for the given title.
 *
 * No inline script (SEC-2): the default-on CSP (`script-src 'self'`, see
 * {@link SecurityHeadersInterceptor}) blocks inline `<script>` blocks, so
 * the spec-wiring bootstrap is served as the `swagger-ui-init.js` asset
 * next to the `swagger-ui-dist` bundle — all same-origin, all CSP-clean.
 *
 * @param title - The documented API title.
 * @returns The HTML page.
 */
export function renderSwaggerUiPage(title: string): string {
    const safe = (value: string) =>
        value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const safeTitle = safe(title);
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${safeTitle} — API Docs</title>
<link rel="stylesheet" href="./swagger-ui.css"/>
</head>
<body>
<div id="swagger-ui"></div>
<script src="./swagger-ui-bundle.js"></script>
<script src="./swagger-ui-standalone-preset.js"></script>
<script src="./swagger-ui-init.js"></script>
</body>
</html>
`;
}

/**
 * Renders the Swagger UI bootstrap as a served asset (SEC-2).
 *
 * Loaded after the bundle + preset, so `SwaggerUIBundle` and
 * `SwaggerUIStandalonePreset` exist when it runs. It is server-rendered
 * because the spec URL is instance configuration, and externalized so the
 * default-on CSP never has to admit `'unsafe-inline'`.
 *
 * @param specUrl - The relative spec URL the UI fetches.
 * @returns The bootstrap JavaScript.
 */
export function renderSwaggerUiInitScript(specUrl: string): string {
    return `window.addEventListener('load', () => {
  window.ui = SwaggerUIBundle({
    url: ${JSON.stringify(specUrl)},
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: 'StandaloneLayout'
  });
});
`;
}

/**
 * The UI controller. Registered without decorator metadata by
 * {@link OpenAPIDocsAutoConfiguration} (per-instance paths).
 *
 * `swagger-ui-dist` is a peer dependency resolved lazily: a missing or
 * unresolvable peer fails only the docs endpoints (500 problem document),
 * never boot of the whole docs auto-configuration (SEC-3).
 */
export class SwaggerUIController {
    #assets: StaticResourceHandler | null = null;
    #page: string | null = null;
    #initScript: string | null = null;
    readonly #options: ResolvedOpenAPIDocsOptions;
    #distPath: string | null = null;
    #attempted = false;

    constructor(options: ResolvedOpenAPIDocsOptions) {
        this.#options = options;
    }

    /**
     * Resolves the `swagger-ui-dist` peer on first use. Returns `false`
     * when the peer cannot be resolved.
     */
    #resolveDist(): boolean {
        if (this.#attempted) {
            return this.#distPath !== null;
        }
        this.#attempted = true;
        try {
            const dist = dirname(createRequire(import.meta.url).resolve('swagger-ui-dist'));
            this.#distPath = dist;
            this.#assets = new StaticResourceHandler(dist);
            const specUrl = relativeSpecUrl(this.#options.uiPath, this.#options.path);
            this.#page = renderSwaggerUiPage(this.#options.title ?? 'API');
            this.#initScript = renderSwaggerUiInitScript(specUrl);
            return true;
        } catch {
            this.#distPath = null;
            return false;
        }
    }

    /**
     * Writes a problem document for a failed peer resolution.
     *
     * @param route - The current route (carries the Node response).
     */
    #writeDistFailure(route: Route): void {
        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as unknown as ServerResponse | undefined;
        if (!res || res.headersSent) return;
        writeProblem(res, {
            status: 500,
            type: 'urn:blue:internal-error',
            title: 'swagger-ui-dist is not installed',
            detail:
                'The @blue/platform-node peer dependency "swagger-ui-dist" could not be resolved; ' +
                'install it to serve the Swagger UI (the OpenAPI spec document remains available).',
        });
    }

    /**
     * Writes the UI page (no-cache: the page is the wiring point).
     *
     * @param route - The current route (carries the Node response).
     */
    @parameters({ route: routeValue() })
    async page(route: Route): Promise<void> {
        if (!this.#resolveDist()) {
            this.#writeDistFailure(route);
            return;
        }
        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as unknown as ServerResponse | undefined;
        if (!res || res.headersSent) return;
        res.writeHead(200, {
            [HTTPHeaders.CONTENT_TYPE.name]: 'text/html; charset=utf-8',
            [HTTPHeaders.CACHE_CONTROL.name]: 'no-cache',
        });
        res.end(this.#page);
    }

    /**
     * Serves a Swagger UI asset from `swagger-ui-dist` with full HTTP
     * semantics (ETag/conditional GET, cache headers, single-range).
     *
     * @param file - The asset path (e.g. `swagger-ui-bundle.js`).
     * @param route - The current route.
     */
    @parameters({ file: pathVariable('file'), route: routeValue() })
    async asset(file: string | undefined, route: Route): Promise<void> {
        const name = file ?? '';
        if (!ASSET_NAMES.includes(name)) {
            const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as unknown as ServerResponse | undefined;
            if (res && !res.headersSent) {
                res.writeHead(404, { [HTTPHeaders.CONTENT_TYPE.name]: 'text/plain; charset=utf-8' });
                res.end('Not Found');
            }
            return;
        }
        if (!this.#resolveDist()) {
            this.#writeDistFailure(route);
            return;
        }
        if (name === 'swagger-ui-init.js') {
            // Generated wiring asset (not in swagger-ui-dist): it pins the
            // instance spec URL, so it shares the page's freshness contract.
            const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as unknown as ServerResponse | undefined;
            if (!res || res.headersSent) return;
            res.writeHead(200, {
                [HTTPHeaders.CONTENT_TYPE.name]: 'text/javascript; charset=utf-8',
                [HTTPHeaders.CACHE_CONTROL.name]: 'no-cache',
            });
            res.end(this.#initScript);
            return;
        }
        // oxlint-disable-next-line no-non-null-assertion -- `#resolveDist` succeeded above, so the handler exists.
        await this.#assets!.handle(route, name);
    }
}
