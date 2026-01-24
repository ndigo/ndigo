import { worker } from '../_worker';
import { HTTP } from '../../src/http';
import { DataParameterInterceptor } from '../../src/interceptors/data-parameter-interceptor';

class TestDataParameterInterceptor extends DataParameterInterceptor {
    preInit(url, settings) {
        const proceed = super.preInit(url, settings);
        expect(proceed).toBe(true);
        expect(settings).to.have.ownProperty('data');
        return proceed;
    }
}

describe('DataParameterInterceptor', function () {
    let http;

    before(() => worker.start({ quiet: true }));

    afterEach(function () {
        http = void 0;
        worker.resetHandlers();
    });

    after(() => worker.stop());

    context('Body methods', function () {
        class JSONDataParameterInterceptor extends TestDataParameterInterceptor {
            preInit(url, settings) {
                const proceed = super.preInit(url, settings);
                expect(settings.body).toEqual('{"foo":"bar","qux":"baz"}');
                return proceed;
            }
        }

        class BodyInitDataParameterInterceptor extends TestDataParameterInterceptor {
            preInit(url, settings) {
                const proceed = super.preInit(url, settings);
                expect(settings.body).toEqual(settings.data);
                return proceed;
            }
        }

        test('it should handle JSON data', async function () {
            http = new HTTP([new JSONDataParameterInterceptor()]);
            const response = await http.post('/dataParameter', {
                    data: { foo: 'bar', qux: 'baz' },
                }),
                text = await response.text();
            expect(text).toBe('');
        });

        test('it should handle BodyInit data', async function () {
            http = new HTTP([new BodyInitDataParameterInterceptor()]);
            const response = await http.post('/dataParameter', {
                    data: 'foo=bar&qux=baz ',
                }),
                text = await response.text();
            expect(text).toBe('');
        });
    });

    context('Bodyless methods', function () {
        class BodylessInterceptor extends TestDataParameterInterceptor {
            preInit(url, settings) {
                const proceed = super.preInit(url, settings);
                expect(url.searchParams.get('foo')).toBe('bar');
                expect(url.toString()).to.match(/foo=bar/);
                return proceed;
            }
        }

        test('it should handle JSON data', async function () {
            http = new HTTP([new BodylessInterceptor()]);
            const response = await http.get('/dataParameter', {
                    data: { foo: 'bar' },
                }),
                text = await response.text();
            expect(text).toBe('');
        });
    });
});
