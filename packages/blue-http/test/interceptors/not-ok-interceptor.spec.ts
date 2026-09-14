/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { server } from '../_worker';
import { HTTP } from '../../src/http';
import { NotOKInterceptor } from '../../src/interceptors/not-ok-interceptor';
import ResponseError from '../../src/response-error';

describe('NotOKInterceptor', () => {
    let http: HTTP | undefined;

    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

    beforeEach(() => {
        http = new HTTP([new NotOKInterceptor()]);
    });

    afterEach(() => {
        http = undefined;
        server.resetHandlers();
    });

    afterAll(() => server.close());

    test('it should reject when response is not okay', async () => {
        let response: unknown;

        expect(http).toBeDefined();
        try {
            response = await http?.request('http://localhost/notOK');
        } catch (error) {
            response = error;
        }

        expect(response).toBeInstanceOf(ResponseError);
        expect(response).toHaveProperty('message', 'Status Code is not 200-299');
        expect(response).toHaveProperty('type', 'error');
        expect(response).toHaveProperty('ok', false);
    });
});
