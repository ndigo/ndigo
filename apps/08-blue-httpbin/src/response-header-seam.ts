/**
 * Response-header seam for handlers that must attach headers the
 * `ResponseEntityView` does not carry through — a 4xx/5xx `ResponseEntity`
 * renders as a problem+json document and drops its own header record, so a
 * `WWW-Authenticate` challenge (RFC 9110 §15.5.2) and multi-valued
 * `Set-Cookie` records are written onto the underlying response instead.
 *
 * The sink is the same `NODE_RESPONSE_ATTRIBUTE` the platform's own
 * `setSessionCookie` uses, so the call works identically over a real socket
 * and through the `@blue/test` mock sink (both merge headers set this way
 * into the later `writeHead`).
 *
 * @module blue-httpbin
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Route } from '@blue/router';
import { NODE_RESPONSE_ATTRIBUTE } from '@blue/platform-node';

/** The subset of `ServerResponse` this seam needs. */
interface HeaderSink {
    setHeader(name: string, value: string | string[]): void;
}

/**
 * Sets a response header on the dispatch route's response, if one is present.
 *
 * @param route - The dispatch route.
 * @param name - The header name.
 * @param value - The header value (an array emits repeated header lines).
 */
export function setResponseHeader(route: Route, name: string, value: string | string[]): void {
    const sink = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as HeaderSink | undefined;
    sink?.setHeader?.(name, value);
}
