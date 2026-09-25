/**
 * Secure static-resource resolution shared by `StaticFileView` and any.
 * * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { readdir, realpath, stat, readFile } from 'node:fs/promises';
import { sep, resolve, isAbsolute } from 'node:path';

/** Outcome kinds for a static-resource lookup. */
export type StaticResourceKind = 'forbidden' | 'not-found' | 'internal-error' | 'ok';

/** Content-Encoding of a precompressed variant (D-3). */
export type StaticEncoding = 'br' | 'gzip';

/** The result of resolving a static resource. */
export interface StaticResourceResult {
    readonly kind: StaticResourceKind;
    /** Raw file bytes (only for `ok`). */
    readonly data?: Buffer;
    /** MIME type from the allowlist (only for `ok`). */
    readonly contentType?: string;
    /** Byte size of the served payload (only for `ok`; the variant's when encoded). */
    readonly size?: number;
    /** Last-modified time (ms epoch) of the served payload (only for `ok`). */
    readonly mtimeMs?: number;
    /**
     * Strong validator of the served payload (D-2): `"<hex size>-<hex mtime>"`
     * for originals, `"<hex size>-<hex mtime>-<encoding>"` for variants so the
     * two never collide under one URL. Absent for generated listings (D-7),
     * which are not cacheable validators.
     */
    readonly etag?: string;
    /** `Content-Encoding` of the served variant (D-3), when precompressed. */
    readonly encoding?: StaticEncoding;
    /** True when the payload could have been served encoded (compressible MIME) — handlers add `Vary: Accept-Encoding`. */
    readonly variantAware?: boolean;
}

/** MIME allowlist — extensions outside this map are not served. */
const MIME_BY_EXTENSION: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml',
    '.pdf': 'application/pdf',
    '.wasm': 'application/wasm',
};

/**
 * Extensions eligible for precompressed variants (D-3). Only text-ish payloads
 * compress meaningfully; image/font/binary types are served as-is even when a
 * `.br`/`.gz` twin exists.
 */
const COMPRESSIBLE_EXTENSIONS: ReadonlySet<string> = new Set([
    '.html',
    '.htm',
    '.css',
    '.js',
    '.mjs',
    '.json',
    '.svg',
    '.xml',
    '.txt',
]);

/** Response header that forbids MIME sniffing. */
export const NOSNIFF_HEADER = 'X-Content-Type-Options: nosniff';

/** Options controlling resolution beyond the plain file (D-6/D-7). */
export interface StaticResolveOptions {
    /** Directory index files, tried in order for a directory path. */
    indexNames?: readonly string[];
    /** Generate an HTML listing for directories with no index match. */
    listDirectories?: boolean;
    /** Client `Accept-Encoding` header — drives precompressed variant selection (D-3). */
    acceptEncoding?: string;
}

/**
 * Parses an `Accept-Encoding` header into the preferred supported encoding.
 *
 * q-values respected; ties prefer `br` (smaller payloads). `*` accepts any
 * encoding but only wins when it beats every explicit codec's q (explicit
 * beats wildcard on ties). `identity`, and q=0 exclusions fall through
 * correctly. Returns `null` when no supported encoding is acceptable (serve
 * the original).
 */
export function negotiateEncoding(header: string | undefined): StaticEncoding | null {
    if (!header) {
        return null;
    }
    let best: StaticEncoding | null = null;
    let bestQ = 0;
    let wildcardQ = 0;
    for (const part of header.split(',')) {
        const [token, ...params] = part.trim().split(/;\s*/);
        const q = params[0]?.trim().startsWith('q=') ? Number(params[0].trim().slice(2)) : 1;
        if (!Number.isFinite(q) || q <= 0) {
            continue;
        }
        if (token === 'br' || token === 'gzip') {
            if (q > bestQ || (q === bestQ && token === 'br')) {
                best = token as StaticEncoding;
                bestQ = q;
            }
        } else if (token === '*') {
            // Wildcard: acceptable, but never on a tie with an explicit codec.
            wildcardQ = q;
        }
    }
    return best ?? (wildcardQ > 0 ? 'br' : null);
}

/** Builds the strong ETag for a payload (D-2); variant encoding disambiguates. */
function buildEtag(size: number, mtimeMs: number, encoding?: StaticEncoding): string {
    const base = `${size.toString(16)}-${Math.round(mtimeMs).toString(16)}`;
    return `"${encoding ? `${base}-${encoding}` : base}"`;
}

/**
 * Resolves static files strictly inside a canonical base directory.
 */
export class StaticResourceResolver {
    #base: string | null = null;
    readonly #rawBase: string;

    /**
     * @param basePath - The directory to serve files from. Canonicalized on
     * first use; must exist and be readable.
     */
    constructor(basePath: string) {
        this.#rawBase = basePath;
    }

    /** Canonical base directory (resolved lazily, cached). */
    async base(): Promise<string> {
        this.#base ??= await realpath(this.#rawBase);
        return this.#base;
    }

    /**
     * Resolves a request-relative path to file bytes + MIME type, or a
     * classified failure. Never throws for expected failure modes.
     *
     * Without options this is the plain-file resolution (directories are
     * not-found, no variants). With options, directories resolve through
     * `indexNames` and may render a listing, and precompressed variants
     * (`<file>.br` / `<file>.gz`) are selected via `Accept-Encoding` for
     * compressible types.
     *
     * @param requestPath - The URL-decoded path relative to the base root
     *   (leading `/` allowed and ignored).
     * @param options - Optional resolution controls (D-6/D-7).
     */
    async resolve(requestPath: string, options?: StaticResolveOptions): Promise<StaticResourceResult> {
        try {
            const base = await this.base();
            // URL-style request paths carry a leading `/` that means "from
            // the base root" — strip it, then reject true filesystem-absolute
            // paths (e.g. `/etc/passwd` on a Linux base, or any path that
            // path algebra could launder against the base).
            const relative = requestPath.replace(/^\/+/, '');
            if (isAbsolute(relative)) {
                return { kind: 'forbidden' };
            }
            const candidate = resolve(base, relative);

            // Containment by prefix-with-separator, not bare startsWith.
            if (candidate !== base && !candidate.startsWith(base + sep)) {
                return { kind: 'forbidden' };
            }

            // Resolve symlinks; the real path must remain inside the base.
            let real: string;
            try {
                real = await realpath(candidate);
            } catch {
                return { kind: 'not-found' };
            }
            if (real !== base && !real.startsWith(base + sep)) {
                return { kind: 'forbidden' };
            }

            let stats;
            try {
                stats = await stat(real);
            } catch {
                return { kind: 'not-found' };
            }
            if (!stats.isFile()) {
                return this._resolveDirectory(base, real, relative, options);
            }

            return this._resolveFile(real, stats, options);
        } catch (error) {
            // Unexpected filesystem failure (permissions, I/O): classified,
            // never leaked.
            void error;
            return { kind: 'internal-error' };
        }
    }

    /** Serves a plain file, optionally through a precompressed variant. */
    private async _resolveFile(
        real: string,
        stats: { size: number; mtimeMs: number },
        options?: StaticResolveOptions
    ): Promise<StaticResourceResult> {
        const extension = real.slice(real.lastIndexOf('.')).toLowerCase();
        const contentType = MIME_BY_EXTENSION[extension];
        if (!contentType) {
            // Serving unknown types risks content-type confusion; deny.
            return { kind: 'forbidden' };
        }
        const variantAware = COMPRESSIBLE_EXTENSIONS.has(extension);
        const encoding = variantAware ? negotiateEncoding(options?.acceptEncoding) : null;
        if (encoding) {
            const variant = await this._statVariant(real, encoding);
            if (variant) {
                const data = await readFile(variant.path);
                return {
                    kind: 'ok',
                    data,
                    contentType,
                    size: variant.stats.size,
                    mtimeMs: variant.stats.mtimeMs,
                    etag: buildEtag(variant.stats.size, variant.stats.mtimeMs, encoding),
                    encoding,
                    variantAware,
                };
            }
        }
        const data = await readFile(real);
        return {
            kind: 'ok',
            data,
            contentType,
            size: stats.size,
            mtimeMs: stats.mtimeMs,
            etag: buildEtag(stats.size, stats.mtimeMs),
            encoding: undefined,
            variantAware,
        };
    }

    /** Stats `<file>.<codec>` when it exists; null otherwise (`.gz`, not `.gzip`). */
    private async _statVariant(
        real: string,
        encoding: StaticEncoding
    ): Promise<{ path: string; stats: { size: number; mtimeMs: number } } | null> {
        const variantPath = `${real}.${encoding === 'br' ? 'br' : 'gz'}`;
        try {
            const stats = await stat(variantPath);
            return stats.isFile() ? { path: variantPath, stats } : null;
        } catch {
            return null;
        }
    }

    /**
     * Resolves a directory request (D-7): `indexNames` first (each tried as a
     * plain file beneath the directory), then an opt-in generated listing, then
     * not-found. File containment is re-verified per index by recursion.
     */
    private async _resolveDirectory(
        base: string,
        real: string,
        relative: string,
        options?: StaticResolveOptions
    ): Promise<StaticResourceResult> {
        const indexNames = options?.indexNames;
        if (indexNames && indexNames.length > 0) {
            // Try every index in parallel (bounded by the option list); the
            // first hit wins, containment is re-verified per index.
            const attempts = await Promise.all(
                indexNames.map((indexName) => {
                    const indexPath = relative ? `${relative}/${indexName}` : indexName;
                    return this.resolve(indexPath, { ...options, indexNames: undefined });
                })
            );
            const hit = attempts.find((result) => result.kind === 'ok');
            if (hit) {
                return hit;
            }
        }
        if (options?.listDirectories) {
            return this._listing(real, relative);
        }
        return { kind: 'not-found' };
    }

    /** Generates an HTML directory listing (D-7) — names escaped, hrefs relative. */
    private async _listing(real: string, relative: string): Promise<StaticResourceResult> {
        let names: string[];
        try {
            names = await readdir(real);
        } catch {
            return { kind: 'internal-error' };
        }
        names.sort((a, b) => a.localeCompare(b));
        const displayPath = `/${relative}`;
        const items = names
            .map((name) => `      <li><a href="${escapeHtml(name)}">${escapeHtml(name)}</a></li>`)
            .join('\n');
        const parent = relative ? `      <li><a href="..">Parent Directory</a></li>\n` : '';
        const html =
            `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n` +
            `<title>Index of ${escapeHtml(displayPath)}</title>\n</head>\n<body>\n` +
            `<h1>Index of ${escapeHtml(displayPath)}</h1>\n<ul>\n${parent}${items}\n    </ul>\n</body>\n</html>\n`;
        const data = Buffer.from(html, 'utf-8');
        return {
            kind: 'ok',
            data,
            contentType: 'text/html; charset=utf-8',
            size: data.length,
            // Generated payloads have no file validator — no ETag/Last-Modified.
            encoding: undefined,
            variantAware: false,
        };
    }
}

/** HTML-escapes a directory entry name (D-7; listing must never trust names). */
function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (char) => {
        switch (char) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            default:
                return '&#39;';
        }
    });
}

/**
 * Maps a resolution kind to an HTTP status.
 */
export function statusForKind(kind: StaticResourceKind): number {
    switch (kind) {
        case 'ok':
            return 200;
        case 'not-found':
            return 404;
        case 'forbidden':
            return 403;
        default:
            return 500;
    }
}
