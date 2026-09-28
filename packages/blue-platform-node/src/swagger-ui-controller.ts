/**
 * Serves the Swagger UI page + assets (AD-35 D-6).
 *
 * The page is a framework-rendered template wiring `swagger-ui-dist`'s
 * bundle to the spec URL; the assets are served by {@link StaticResourceHandler}
 * straight from the installed package — ETag/conditional GET, cache headers
 * and Range included (AD-28 machinery), no CDN, offline-friendly.
 * * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import type { ServerResponse } from 'node:http';
import '@tsmetadata/polyfill';
import { parameters, pathVariable, routeValue } from '@blue/dispatcher';
import type { Route } from '@blue/router';
import { NODE_RESPONSE_ATTRIBUTE } from './node-request';
import { StaticResourceHandler } from './static-resource-handler';
import { type ResolvedOpenAPIDocsOptions } from './openapi-docs-auto-configuration';

/** Asset file names served from `swagger-ui-dist`. */
const ASSET_NAMES = ['swagger-ui.css', 'swagger-ui-bundle.js', 'swagger-ui-standalone-preset.js', 'favicon-32x32.png'];

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
 * Renders the Swagger UI page for the given spec URL + title.
 *
 * @param specUrl - The relative spec URL the UI fetches.
 * @param title - The documented API title.
 * @returns The HTML page.
 */
export function renderSwaggerUiPage(specUrl: string, title: string): string {
    const safe = (value: string) =>
        value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const safeSpecUrl = safe(specUrl);
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
<script>
window.addEventListener('load', () => {
  window.ui = SwaggerUIBundle({
    url: '${safeSpecUrl}',
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: 'StandaloneLayout'
  });
});
</script>
</body>
</html>
`;
}

/**
 * The UI controller. Registered without decorator metadata by
 * {@link OpenAPIDocsAutoConfiguration} (per-instance paths).
 */
export class SwaggerUIController {
    readonly #assets: StaticResourceHandler;
    readonly #page: string;

    constructor(options: ResolvedOpenAPIDocsOptions) {
        const dist = dirname(createRequire(import.meta.url).resolve('swagger-ui-dist'));
        this.#assets = new StaticResourceHandler(dist);
        const specUrl = relativeSpecUrl(options.uiPath, options.path);
        this.#page = renderSwaggerUiPage(specUrl, options.title ?? 'API');
    }

    /**
     * Writes the UI page (no-cache: the page is the wiring point).
     *
     * @param route - The current route (carries the Node response).
     */
    @parameters({ route: routeValue() })
    async page(route: Route): Promise<void> {
        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as unknown as ServerResponse | undefined;
        if (!res || res.headersSent) return;
        res.writeHead(200, {
            'content-type': 'text/html; charset=utf-8',
            'cache-control': 'no-cache',
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
                res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
                res.end('Not Found');
            }
            return;
        }
        await this.#assets.handle(route, name);
    }
}
