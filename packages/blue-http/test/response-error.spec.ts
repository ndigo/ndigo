/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import ResponseError from '../src/response-error';

describe('ResponseError', () => {
    test('it should create empty response errors', async () => {
        const response = new ResponseError();
        expect(response).toHaveProperty('message', 'Invalid response');
        expect(response.body).toBeInstanceOf(ReadableStream);
        expect(response).toHaveProperty('bodyUsed', false);
        expect(response.headers).toBeDefined();
        expect(response).toHaveProperty('ok', false);
        expect(response).toHaveProperty('redirected', false);
        expect(response).toHaveProperty('status', 418);
        expect(response).toHaveProperty('statusText', "I'm a teapot");
        // trailer property may or may not exist, skip checking it
        expect(response).toHaveProperty('type', 'error');
        expect(response).toHaveProperty('url', '');
        expect(response.clone()).toBeInstanceOf(ResponseError);
        expect((await response.arrayBuffer()).byteLength).toBe(0);
        expect((await response.blob()).size).toBe(0);
        expect(await response.text()).toBe('');
        expect(Object.prototype.toString.call(response)).toBe('[object ResponseError]');
    });

    test('formData() reads through the cached buffer after another read (HTT-REV-016)', async () => {
        const boundary = '----blueFormDataProbe';
        const body = [
            `--${boundary}`,
            'Content-Disposition: form-data; name="field"',
            '',
            'value',
            `--${boundary}--`,
            '',
        ].join('\r\n');
        const response = new Response(body, {
            headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
        });
        const error = new ResponseError(response, 'bad form');

        // First read caches the body buffer...
        expect(await error.text()).toContain('value');

        // ...so formData() still works instead of throwing on a consumed body.
        const form = await error.formData();
        expect(form.get('field')).toBe('value');
    });
});
