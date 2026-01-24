import { describe, test, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '../_worker';
import { HTTP } from '../../src/http';
import { DataParameterInterceptor } from '../../src/interceptors/data-parameter-interceptor';

class TestDataParameterInterceptor extends DataParameterInterceptor {
    preInit(url: URL, settings?: any) {
        const proceed = super.preInit(url, settings);
        expect(proceed).toBe(true);
        expect(settings).toHaveProperty('data');
        return proceed;
    }
}

describe('DataParameterInterceptor', () => {
    let http: HTTP | undefined;

    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

    afterEach(() => {
        http = undefined;
        server.resetHandlers();
    });

    afterAll(() => server.close());

    describe('Body methods', () => {
        class JSONDataParameterInterceptor extends TestDataParameterInterceptor {
            preInit(url: URL, settings?: any) {
                const proceed = super.preInit(url, settings);
                expect(settings.body).toBe('{"foo":"bar","qux":"baz"}');
                return proceed;
            }
        }

        class BodyInitDataParameterInterceptor extends TestDataParameterInterceptor {
            preInit(url: URL, settings?: any) {
                const proceed = super.preInit(url, settings);
                expect(settings.body).toBe(settings.data);
                return proceed;
            }
        }

        test('it should handle JSON data', async () => {
            http = new HTTP([new JSONDataParameterInterceptor() as any]);
            const response = await http.post('http://localhost/dataParameter', {
                data: { foo: 'bar', qux: 'baz' },
            } as any);
            const text = await response.text();
            expect(text).toBe('');
        });

        test('it should handle BodyInit data', async () => {
            http = new HTTP([new BodyInitDataParameterInterceptor() as any]);
            const response = await http.post('http://localhost/dataParameter', {
                data: 'foo=bar&qux=baz ',
            } as any);
            const text = await response.text();
            expect(text).toBe('');
        });
    });

    describe('Bodyless methods', () => {
        class BodylessInterceptor extends TestDataParameterInterceptor {
            preInit(url: URL, settings?: any) {
                const proceed = super.preInit(url, settings);
                expect(url.searchParams.get('foo')).toBe('bar');
                expect(url.toString()).toMatch(/foo=bar/);
                return proceed;
            }
        }

        test('it should handle JSON data', async () => {
            http = new HTTP([new BodylessInterceptor() as any]);
            const response = await http.get('http://localhost/dataParameter', {
                data: { foo: 'bar' },
            } as any);
            const text = await response.text();
            expect(text).toBe('');
        });
    });
});
