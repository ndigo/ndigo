/**
 * MCP Apps UI resources: a `ui://` document served as
 * `text/html;profile=mcp-app` and linked to tools via
 * `_meta.ui.resourceUri`.
 *
 * The helper produces one self-contained HTML document (CSS and module script
 * inlined) — the `vite-plugin-singlefile` shape. The host renders it in a
 * sandboxed iframe and enforces the declared CSP; this module never emits a
 * wildcard origin.
 */

/** The MCP Apps HTML resource media type. */
export const MCP_APP_MIME_TYPE = 'text/html;profile=mcp-app';

/** Tool visibility inside an MCP App. */
export type UiVisibility = 'model' | 'app';

/** Domains the host adds to the app's Content-Security-Policy. */
export interface UiCspConfig {
    /** `connect-src` targets (fetch, XHR, WebSocket). */
    readonly connectDomains?: readonly string[];
    /** `script-src` / `style-src` / `img-src` / `font-src` / `media-src` targets. */
    readonly resourceDomains?: readonly string[];
    /** `frame-src` targets (nested iframes). */
    readonly frameDomains?: readonly string[];
    /** `base-uri` targets. */
    readonly baseUriDomains?: readonly string[];
}

/** `_meta.ui` metadata for a tool or resource. */
export interface UiMetadata {
    /** The `ui://` resource the host renders. */
    readonly resourceUri: string;
    /** Who may call the tool (defaults to the host's policy). */
    readonly visibility?: readonly UiVisibility[];
    /** External domains the host should allow. */
    readonly csp?: UiCspConfig;
    /** Browser capabilities the app requests (`camera`, `clipboardWrite`, …). */
    readonly permissions?: readonly string[];
    /** Ask the host to draw a border. */
    readonly prefersBorder?: boolean;
    /** Request a dedicated sandbox origin (host-dependent). */
    readonly domain?: string;
}

/** A `ui://` resource with its self-contained HTML. */
export interface UiResource {
    /** Resource URI (`ui://…`). */
    readonly uri: string;
    /** Human-readable resource name. */
    readonly name: string;
    /** Optional description shown by the host. */
    readonly description?: string;
    /** The complete HTML document. */
    readonly html: string;
    /** Presentation metadata, excluding the resource URI (added by the server). */
    readonly ui?: Omit<UiMetadata, 'resourceUri'>;
}

/** Inputs for {@link createUiResource}. */
export interface UiResourceInput {
    /** Resource URI (`ui://…`). */
    readonly uri: string;
    /** Resource name. */
    readonly name: string;
    /** Optional description. */
    readonly description?: string;
    /** Document title (escaped). */
    readonly title?: string;
    /** Markup placed inside `<body>`. */
    readonly body: string;
    /** CSS inlined in a `<style>` element. */
    readonly css?: string;
    /** JavaScript inlined in a `<script>` element. */
    readonly script?: string;
    /** Script type (default `module`). */
    readonly scriptType?: 'module' | 'classic';
    /** Document language (default `en`). */
    readonly lang?: string;
    /** Content-Security-Policy domains declared to the host. */
    readonly csp?: UiCspConfig;
    /** Requested browser capabilities. */
    readonly permissions?: readonly string[];
    /** Ask the host for a border. */
    readonly prefersBorder?: boolean;
    /** Requested sandbox domain. */
    readonly domain?: string;
    /** Tool visibility metadata. */
    readonly visibility?: readonly UiVisibility[];
}

/**
 * Builds one self-contained MCP App document.
 *
 * @param input - Markup, inlined assets, and presentation metadata.
 * @returns The resource served by `resources/read`.
 * @throws When the URI is not `ui://` or inlined CSS/JS would break out of its
 *   element.
 */
export function createUiResource(input: UiResourceInput): UiResource {
    if (!input.uri.startsWith('ui://') || /\s/u.test(input.uri)) {
        throw new TypeError(`createUiResource uri must be a ui:// resource URI — received '${input.uri}'.`);
    }
    if (input.css !== undefined && /<\/style/iu.test(input.css)) {
        throw new TypeError(`createUiResource css for '${input.uri}' must not close its <style> element.`);
    }
    if (input.script !== undefined && /<\/script/iu.test(input.script)) {
        throw new TypeError(`createUiResource script for '${input.uri}' must not close its <script> element.`);
    }
    const title = escapeHtml(input.title ?? input.name);
    const style = input.css === undefined ? '' : `        <style>\n${input.css}\n        </style>\n`;
    const script =
        input.script === undefined
            ? ''
            : `        <script type="${input.scriptType ?? 'module'}">\n${input.script}\n        </script>\n`;
    const html = `<!doctype html>
<html lang="${escapeHtml(input.lang ?? 'en')}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${title}</title>
${style}    </head>
    <body>
${input.body}
${script}    </body>
</html>
`;
    const ui: Omit<UiMetadata, 'resourceUri'> = {
        ...(input.visibility === undefined ? {} : { visibility: input.visibility }),
        ...(input.csp === undefined ? {} : { csp: input.csp }),
        ...(input.permissions === undefined ? {} : { permissions: input.permissions }),
        ...(input.prefersBorder === undefined ? {} : { prefersBorder: input.prefersBorder }),
        ...(input.domain === undefined ? {} : { domain: input.domain }),
    };
    return {
        uri: input.uri,
        name: input.name,
        ...(input.description === undefined ? {} : { description: input.description }),
        html,
        ...(Object.keys(ui).length === 0 ? {} : { ui }),
    };
}

function escapeHtml(value: string): string {
    return value.replace(/&/gu, '&amp;').replace(/</gu, '&lt;').replace(/>/gu, '&gt;').replace(/"/gu, '&quot;');
}
