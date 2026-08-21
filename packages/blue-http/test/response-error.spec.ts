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
});
