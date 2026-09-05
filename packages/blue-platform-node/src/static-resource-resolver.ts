/**
 * Secure static-resource resolution shared by `StaticFileView` and any
 * controller serving files from a configured root.
 *
 * Security model (fail-closed):
 * 1. The base directory is canonicalized once (`realpath`) at construction.
 * 2. A candidate is joined onto the base and canonicalized; containment
 *    requires `candidate === base` or `candidate` starting with `base + sep`
 *    — never a bare prefix (defeats sibling-prefix escapes).
 * 3. Filesystem symlinks are resolved (`realpath` of the candidate) and the
 *    real path must still be inside the canonical base.
 * 4. Only regular files are served; MIME comes from a maintained allowlist
 *    with `X-Content-Type-Options: nosniff`.
 * 5. Errors are classified as forbidden/not-found/internal without leaking
 *    filesystem paths.
 *
 * @module
 * @since 1.0.0
 */

import { realpath, stat, readFile } from 'node:fs/promises';
import { sep, resolve, isAbsolute } from 'node:path';

/** Outcome kinds for a static-resource lookup. */
export type StaticResourceKind = 'forbidden' | 'not-found' | 'internal-error' | 'ok';

/** The result of resolving a static resource. */
export interface StaticResourceResult {
    readonly kind: StaticResourceKind;
    /** Raw file bytes (only for `ok`). */
    readonly data?: Buffer;
    /** MIME type from the allowlist (only for `ok`). */
    readonly contentType?: string;
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

/** Response header that forbids MIME sniffing. */
export const NOSNIFF_HEADER = 'X-Content-Type-Options: nosniff';

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
     * @param requestPath - The URL-decoded path relative to the base root
     *   (leading `/` allowed and ignored).
     */
    async resolve(requestPath: string): Promise<StaticResourceResult> {
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
                return { kind: 'not-found' };
            }

            const extension = real.slice(real.lastIndexOf('.')).toLowerCase();
            const contentType = MIME_BY_EXTENSION[extension];
            if (!contentType) {
                // Serving unknown types risks content-type confusion; deny.
                return { kind: 'forbidden' };
            }

            const data = await readFile(real);
            return { kind: 'ok', data, contentType };
        } catch (error) {
            // Unexpected filesystem failure (permissions, I/O): classified,
            // never leaked.
            void error;
            return { kind: 'internal-error' };
        }
    }
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
