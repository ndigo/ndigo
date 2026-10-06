/**
 * Interceptor-denial finalization shared by the live Node adapter and the
 * in-process MockHTTP client (IN-1): a denial recorded on the route by a
 * guard's `preHandle` produces the identical deterministic response whether
 * the request arrives over a socket or through the mock dispatcher.
 *
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { InterceptorDenial } from '@blue/dispatcher';
import { HTTPHeaders, ResponseStatus } from '@blue/http';
import { ProblemTypes, writeProblem, type ProblemResponseWriter } from './problem-details';

/**
 * Minimal response writer accepted by {@link finalizeInterceptorDenial} —
 * compatible with Node's `ServerResponse` and the in-memory MockHTTP sink.
 * `writableEnded`/`destroyed` are optional so a sink that models its own
 * completion (MockHTTP's `ResponseSink`) is still accepted.
 */
export interface DenialResponseWriter extends ProblemResponseWriter {
    /** `ServerResponse`: the response was fully finalized. */
    readonly writableEnded?: boolean;
    /** `ServerResponse`: the socket was destroyed. */
    readonly destroyed?: boolean;
}

/**
 * Finalizes an interceptor denial. A `401` denial carries
 * `WWW-Authenticate: Bearer` (RFC 9110 §15.5.2); `401`/`403` are problem
 * documents with registered types; other `4xx/5xx` denials are an
 * about:blank problem at the given status; a status `<= 399` (CORS
 * preflight `204`, browser redirects) writes headers with no body.
 * An already-finalized response (`writableEnded`/`destroyed`) is left alone.
 *
 * @param res - The response writer (ServerResponse or MockHTTP sink).
 * @param denial - The denial recorded on the route.
 */
export function finalizeInterceptorDenial(res: DenialResponseWriter, denial: InterceptorDenial): void {
    if (res.writableEnded || res.destroyed) return;
    const statusCode = denial.statusCode ?? 403;
    if (denial.redirect) {
        res.writeHead(statusCode <= 399 ? 302 : statusCode, { [HTTPHeaders.LOCATION.name]: denial.redirect });
        res.end();
        return;
    }
    if (statusCode <= 399) {
        // CORS preflight (204): headers were set by the interceptor; no body.
        res.writeHead(statusCode, {});
        res.end();
        return;
    }
    if (statusCode === 401) {
        writeProblem(
            res,
            {
                type: ProblemTypes.unauthorized,
                title: 'Unauthorized',
                status: 401,
            },
            { [HTTPHeaders.WWW_AUTHENTICATE.name]: 'Bearer' }
        );
        return;
    }
    if (statusCode === 403) {
        writeProblem(res, {
            type: ProblemTypes.forbidden,
            title: 'Forbidden',
            status: 403,
        });
        return;
    }
    const statusText = ResponseStatus.for(statusCode)?.text;
    writeProblem(res, {
        status: statusCode,
        title: statusText,
    });
}
