/**
 * @module ndigo-view
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it } from 'vitest';
import type { Route } from '@ndigo/router';
import { OctetStreamView } from '../src/octet-stream-view';

const route: Route = {} as Route;

describe('OctetStreamView', () => {
    it('passes through Uint8Array models as octet-stream', async () => {
        const view = new OctetStreamView();
        const bytes = new Uint8Array([1, 2, 3]);

        const result = await view.renderTo(bytes, route);

        expect(result.body).toBe(bytes);
        expect(result.mediaType?.baseType).toBe('application/octet-stream');
    });

    it('converts ArrayBuffer models', async () => {
        const view = new OctetStreamView();
        const buffer = Uint8Array.from([9, 8]).buffer;

        const result = await view.renderTo(buffer, route);

        expect(result.body).toEqual(new Uint8Array([9, 8]));
    });

    it('UTF-8 encodes string models', async () => {
        const view = new OctetStreamView();
        const body = (await view.renderTo('hi', route)).body as Uint8Array;
        expect(Array.from(body)).toEqual([104, 105]);
    });

    it('throws for unsupported models', async () => {
        const view = new OctetStreamView();
        await expect(view.renderTo({}, route)).rejects.toThrow(/requires a Uint8Array, ArrayBuffer, or string/);
    });
});
