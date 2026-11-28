/**
 * Secure static-resource resolution shared by `StaticFileView` and any.
 */
import { readdir, realpath, stat } from 'node:fs/promises';
import { sep, resolve, isAbsolute } from 'node:path';
import { MediaTypes, stringComparator } from '@ndigo/core';
import {
    COMPRESSIBLE_EXTENSIONS,
    MIME_BY_EXTENSION,
    buildEtag,
    escapeHtml,
    isDotfilePath,
    utf8,
} from './_static-resource-media.js';
import { negotiateEncoding } from './static-resource-resolver-support.js';
import type { StaticEncoding, StaticResourceResult, StaticResolveOptions } from './static-resource-resolver-types.js';

export * from './static-resource-resolver-types.js';
export { negotiateEncoding, statusForKind } from './static-resource-resolver-support.js';

/**
 * Resolves static files strictly inside a canonical base directory.
 *
 * @example
 * ```ts
 * const instance = new StaticResourceResolver();
 * ```
 */
export class StaticResourceResolver {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "StaticResourceResolver".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object StaticResourceResolver]"
     */
    get [Symbol.toStringTag](): string {
        return 'StaticResourceResolver';
    }

    #base: string | null = null;
    readonly #rawBase: string;

    /**
     * @param basePath - The directory to serve files from. Canonicalized on
     * first use; must exist and be readable.
     */
    constructor(basePath: string) {
        this.#rawBase = basePath;
    }

    /**
     * Canonical base directory (resolved lazily, cached).
     *
     * @returns The canonical base path.
     */
    async base(): Promise<string> {
        this.#base ??= await realpath(this.#rawBase);
        return this.#base;
    }

    /**
     * Resolves a request-relative path to a servable file (absolute `path`
     * plus MIME/validator metadata) or a classified failure. Never throws for
     * expected failure modes. Payload bytes are never read here — callers
     * open `path` (the handler streams it).
     *
     * Without options this is the plain-file resolution (directories are
     * not-found, no variants). With options, directories resolve through
     * `indexNames` and may render a listing, and precompressed variants
     * (`<file>.br` / `<file>.gz`) are selected via `Accept-Encoding` for
     * compressible types.
     *
     * @param requestPath - The raw, undecoded path relative to the base root
     *   (leading `/` allowed and ignored). The serving pipeline never
     *   percent-decodes request paths: encoded sequences (`%2e%2e`, `%20`, …)
     *   are literal filename characters, so only files whose on-disk names
     *   literally contain them can be served — encoded traversal is inert,
     *   and encoded spaces/unicode filenames are not servable (TST-3).
     * @param options - Optional resolution controls (D-6/D-7).
     * @returns The resolved resource or a classified failure.
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
            // Explicit dotfile policy (PLN-F9): dotfiles are refused unless
            // opted in, so a hidden file with an *allowlisted* extension
            // (`.env.json`, `.vite/manifest.json`) is no longer served. The
            // `.well-known` namespace is the conventional opt-in exception.
            if (!options?.serveDotfiles && isDotfilePath(relative)) {
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

            return this._resolveFile(base, real, stats, options);
        } catch (error) {
            // Unexpected filesystem failure (permissions, I/O): classified,
            // never leaked.
            void error;
            return { kind: 'internal-error' };
        }
    }

    /** Serves a plain file, optionally through a precompressed variant. */
    private async _resolveFile(
        base: string,
        real: string,
        stats: { size: number; mtimeMs: number },
        options?: StaticResolveOptions
    ): Promise<StaticResourceResult> {
        const extension = real.slice(real.lastIndexOf('.')).toLowerCase();
        const mediaType = MIME_BY_EXTENSION[extension];
        if (!mediaType) {
            // Serving unknown types risks content-type confusion; deny.
            return { kind: 'forbidden' };
        }
        const contentType = String(mediaType);
        // Size cap enforced from stat alone, before any open or read.
        const maxFileSizeBytes = options?.maxFileSizeBytes;
        if (maxFileSizeBytes !== undefined && maxFileSizeBytes > 0 && stats.size > maxFileSizeBytes) {
            return { kind: 'forbidden' };
        }
        const variantAware = COMPRESSIBLE_EXTENSIONS.has(extension);
        const encoding = variantAware ? negotiateEncoding(options?.acceptEncoding) : null;
        if (encoding) {
            const variant = await this._statVariant(base, real, encoding);
            // An existing-but-escaping variant forbids the request outright —
            // never fall back to (or serve) the target outside the root.
            if (variant === 'forbidden') {
                return { kind: 'forbidden' };
            }
            if (variant) {
                if (maxFileSizeBytes !== undefined && maxFileSizeBytes > 0 && variant.stats.size > maxFileSizeBytes) {
                    return { kind: 'forbidden' };
                }
                return {
                    kind: 'ok',
                    path: variant.path,
                    contentType,
                    size: variant.stats.size,
                    mtimeMs: variant.stats.mtimeMs,
                    etag: buildEtag(variant.stats.size, variant.stats.mtimeMs, encoding),
                    encoding,
                    variantAware,
                };
            }
        }
        return {
            kind: 'ok',
            path: real,
            contentType,
            size: stats.size,
            mtimeMs: stats.mtimeMs,
            etag: buildEtag(stats.size, stats.mtimeMs),
            encoding: undefined,
            variantAware,
        };
    }

    /**
     * Resolves `<file>.<codec>` (`.gz`, not `.gzip`) when it exists inside the
     * base root — null when absent or not a file (serve the original) — and
     * `'forbidden'` when its real path escapes the root through a symlink. The
     * same realpath + `base + sep` containment the main path enforces is
     * applied here; an escaping variant must never be served.
     */
    private async _statVariant(
        base: string,
        real: string,
        encoding: StaticEncoding
    ): Promise<{ path: string; stats: { size: number; mtimeMs: number } } | 'forbidden' | null> {
        const variantPath = `${real}.${encoding === 'br' ? 'br' : 'gz'}`;
        let resolved: string;
        try {
            resolved = await realpath(variantPath);
        } catch {
            // Missing variant (or a broken symlink): nothing to serve.
            return null;
        }
        if (resolved !== base && !resolved.startsWith(base + sep)) {
            return 'forbidden';
        }
        try {
            const stats = await stat(resolved);
            return stats.isFile() ? { path: resolved, stats } : null;
        } catch {
            return null;
        }
    }

    /**
     * Resolves a directory request: `indexNames` first (each tried as a
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

    /** Generates an HTML directory listing — names escaped, hrefs relative. */
    private async _listing(real: string, relative: string): Promise<StaticResourceResult> {
        let names: string[];
        try {
            names = await readdir(real);
        } catch {
            return { kind: 'internal-error' };
        }
        names.sort(stringComparator.compare);
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
            contentType: String(utf8(MediaTypes.TEXT_HTML)),
            size: data.length,
            // Generated payloads have no file validator — no ETag/Last-Modified.
            encoding: undefined,
            variantAware: false,
        };
    }
}
