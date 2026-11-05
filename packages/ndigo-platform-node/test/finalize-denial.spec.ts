/**
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect, vi } from 'vitest';
import { finalizeInterceptorDenial, type DenialResponseWriter } from '../src/finalize-denial';

/**
 * PLN-F5: a denial finalized after headers were flushed cannot write a status
 * line — `writeHead` would throw `ERR_HTTP_HEADERS_SENT`. The socket must be
 * destroyed instead.
 */
describe('finalizeInterceptorDenial', () => {
    test('writes the problem document when headers have not been sent', () => {
        const res: DenialResponseWriter = {
            writableEnded: false,
            destroyed: false,
            writeHead: vi.fn(),
            end: vi.fn(),
        };

        finalizeInterceptorDenial(res, { statusCode: 403 });

        expect(res.writeHead).toHaveBeenCalledWith(
            403,
            expect.objectContaining({ 'Content-Type': 'application/problem+json' })
        );
        expect(res.end).toHaveBeenCalled();
    });

    test('destroys an already-streaming response instead of throwing after headers', () => {
        const destroy = vi.fn();
        const res: DenialResponseWriter = {
            writableEnded: false,
            destroyed: false,
            headersSent: true,
            writeHead: vi.fn(),
            end: vi.fn(),
            destroy,
        };

        finalizeInterceptorDenial(res, { statusCode: 403 });

        expect(destroy).toHaveBeenCalledTimes(1);
        expect(res.writeHead).not.toHaveBeenCalled();
        expect(res.end).not.toHaveBeenCalled();
    });

    test('leaves an already-ended response alone', () => {
        const destroy = vi.fn();
        const res: DenialResponseWriter = {
            writableEnded: true,
            destroyed: false,
            writeHead: vi.fn(),
            end: vi.fn(),
            destroy,
        };

        finalizeInterceptorDenial(res, { statusCode: 403 });

        expect(destroy).not.toHaveBeenCalled();
        expect(res.writeHead).not.toHaveBeenCalled();
    });
});
