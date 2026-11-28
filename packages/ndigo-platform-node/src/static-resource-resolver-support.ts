/**
 * Public static-resource helpers: encoding negotiation and status mapping.
 */
import type { StaticEncoding, StaticResourceKind } from './static-resource-resolver-types.js';

/**
 * Parses an `Accept-Encoding` header into the preferred supported encoding.
 *
 * q-values respected; ties prefer `br` (smaller payloads). `*` accepts any
 * encoding but only wins when it beats every explicit codec's q (explicit
 * beats wildcard on ties). `identity`, and q=0 exclusions fall through
 * correctly. Returns `null` when no supported encoding is acceptable (serve
 * the original).
 *
 * @param header - The `Accept-Encoding` header.
 * @returns The chosen encoding, or `null`.
 *
 * @example
 * ```ts
 * negotiateEncoding();
 * ```
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

/**
 * Maps a resolution kind to an HTTP status.
 *
 * @param kind - The resolution kind.
 * @returns The HTTP status code.
 *
 * @example
 * ```ts
 * statusForKind();
 * ```
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
