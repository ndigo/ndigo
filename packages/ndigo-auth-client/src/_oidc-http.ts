/**
 * Hardened JSON fetching for OIDC discovery and token endpoints.
 */
import { HTTPHeaders } from '@ndigo/http';
import { OIDCError, type OIDCAdapterConfig } from './oidc-types.js';
import { assertTrustedUrl } from './_oidc-helpers.js';
import { DEFAULT_FETCH_TIMEOUT_MS, DEFAULT_MAX_RESPONSE_BYTES } from './_oidc-constants.js';

/**
 * Fetches a JSON document with a timeout, HTTPS enforcement, a size cap, and
 * `redirect: 'error'` (a redirect must never carry a POST body such as
 * `client_secret` to an arbitrary URL). `init` adds method/body/headers on
 * top of those invariants.
 *
 * @param config - The adapter configuration (timeouts and size cap).
 * @param url - The trusted endpoint URL.
 * @param label - The diagnostic label prefixed to failures.
 * @param init - Extra request options.
 * @returns The parsed JSON body.
 */
export async function fetchOidcJson(
    config: OIDCAdapterConfig,
    url: URL,
    label: string,
    init: { method?: string; body?: BodyInit; headers?: Record<string, string> } = {}
): Promise<unknown> {
    assertTrustedUrl(url, label);
    const maxBytes = config.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES;
    const timeoutMs = config.fetchTimeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new OIDCError('network', `${label} fetch timed out`)), timeoutMs);
    try {
        const response = await fetch(url, { ...init, signal: controller.signal, redirect: 'error' });
        if (!response.ok) {
            let oauthError: string | undefined;
            try {
                const text = await response.text();
                const parsed = JSON.parse(text) as { error?: unknown };
                if (typeof parsed?.error === 'string') oauthError = parsed.error;
            } catch {
                // Body is not JSON (or empty); keep httpStatus only.
            }
            throw new OIDCError('network', `${label} fetch failed with status ${response.status}`, {
                httpStatus: response.status,
                oauthError,
            });
        }
        const contentLength = Number(HTTPHeaders.CONTENT_LENGTH.get(response.headers));
        if (Number.isFinite(contentLength) && contentLength > maxBytes) {
            throw new OIDCError('network', `${label} exceeds the ${maxBytes}-byte limit`);
        }
        if (!response.body) {
            try {
                return JSON.parse(await response.text());
            } catch (error) {
                throw new OIDCError('malformed_response', `${label} is not valid JSON`, { cause: error });
            }
        }
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;
        for (;;) {
            // oxlint-disable-next-line no-await-in-loop -- a ReadableStream must be consumed sequentially; chunks are validated and accumulated in order.
            const { done, value } = await reader.read();
            if (done) break;
            received += value.byteLength;
            if (received > maxBytes) {
                void reader.cancel();
                throw new OIDCError('network', `${label} exceeds the ${maxBytes}-byte limit`);
            }
            chunks.push(value);
        }
        const body = new Uint8Array(received);
        let offset = 0;
        for (const chunk of chunks) {
            body.set(chunk, offset);
            offset += chunk.byteLength;
        }
        try {
            return JSON.parse(new TextDecoder().decode(body));
        } catch (error) {
            throw new OIDCError('malformed_response', `${label} is not valid JSON`, { cause: error });
        }
    } catch (error) {
        if (error instanceof OIDCError) throw error;
        throw new OIDCError('network', `${label} fetch failed`, { cause: error });
    } finally {
        clearTimeout(timer);
    }
}
